import "server-only";

import crypto from "node:crypto";
import { v2 as cloudinary } from "cloudinary";
import { db } from "../db";
import { toPrismaJson } from "../json";
import type {
  AuraStorageDriver,
  AuraStorageUploadArgs,
  AuraStorageUploadResult,
} from "./types";

function configureCloudinary(): void {
  const url = process.env.CLOUDINARY_URL;
  if (url) {
    cloudinary.config({ cloudinary_url: url });
  } else {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }
}

function generateShortUuid(length = 10): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = crypto.randomBytes(length);
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}

function parseDataUrl(
  dataUrl: string,
): { mimeType: string; buffer: Buffer } {
  const match = dataUrl.match(
    /^data:(image\/(png|jpeg|jpg|webp|gif)|application\/pdf|text\/plain);base64,(.+)$/,
  );
  if (!match) {
    throw new Error("Format de fichier non supporté.");
  }
  return {
    mimeType: match[1],
    buffer: Buffer.from(match[3], "base64"),
  };
}

function extractPublicIdFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split("/");
    const uploadIndex = parts.indexOf("upload");
    if (uploadIndex === -1 || uploadIndex + 2 >= parts.length) return null;
    return parts.slice(uploadIndex + 2).join("/").replace(/\.[^/.]+$/, "");
  } catch {
    return null;
  }
}

export const cloudinaryDriver: AuraStorageDriver = {
  name: "cloudinary",

  async upload(args: AuraStorageUploadArgs): Promise<AuraStorageUploadResult> {
    configureCloudinary();

    let buffer: Buffer;
    let mimeType: string;

    if (typeof args.data === "string" && args.data.startsWith("data:")) {
      const parsed = parseDataUrl(args.data);
      buffer = parsed.buffer;
      mimeType = parsed.mimeType;
    } else if (Buffer.isBuffer(args.data)) {
      buffer = args.data;
      mimeType = "application/octet-stream";
    } else {
      throw new Error("Invalid data: expected Buffer or data URL string.");
    }

    const publicId = `${args.prefix}/${generateShortUuid(10)}-${Date.now()}`;
    const resourceType = mimeType.startsWith("image/") ? "image" : "raw";

    const result = await new Promise<{
      public_id: string;
      secure_url: string;
      bytes: number;
    }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_chunked_stream(
        {
          public_id: publicId,
          resource_type: resourceType,
          use_filename: true,
          unique_filename: false,
        },
        (error, uploadResult) => {
          if (error) reject(error);
          else
            resolve(
              uploadResult as {
                public_id: string;
                secure_url: string;
                bytes: number;
              },
            );
        },
      );
      stream.end(buffer);
    });

    const record = await db.auraFile.create({
      data: {
        name: args.fileName,
        key: result.public_id,
        url: result.secure_url,
        mimeType,
        size: result.bytes,
        prefix: args.prefix,
        storage: this.name,
        metadata: toPrismaJson(args.metadata),
      },
    });

    return {
      id: record.id,
      key: result.public_id,
      url: result.secure_url,
      mimeType,
      size: result.bytes,
    };
  },

  async delete(keyOrUrl: string): Promise<void> {
    configureCloudinary();

    const publicId = keyOrUrl.includes("/") && !keyOrUrl.startsWith("http")
      ? keyOrUrl
      : extractPublicIdFromUrl(keyOrUrl) || keyOrUrl;

    const record = await db.auraFile.findUnique({ where: { key: publicId } });
    if (!record) return;

    await cloudinary.uploader.destroy(publicId);
    await db.auraFile.delete({ where: { id: record.id } });
  },
};
