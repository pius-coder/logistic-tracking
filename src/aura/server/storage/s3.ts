import "server-only";

import https from "node:https";
import crypto from "node:crypto";
import {
  CreateBucketCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { NodeHttpHandler } from "@smithy/node-http-handler";
import { db } from "../db";
import { toPrismaJson } from "../json";
import type {
  AuraStorageDriver,
  AuraStorageUploadArgs,
  AuraStorageUploadResult,
} from "./types";

function generateShortUuid(length = 10): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = crypto.randomBytes(length);
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}

function parseBooleanEnv(rawValue: string | undefined) {
  return rawValue === "true" || rawValue === "1";
}

function getStorageEndpoint(): string {
  const endpoint = process.env.AURA_S3_INTERNAL_ENDPOINT || process.env.AURA_S3_ENDPOINT;
  if (!endpoint) {
    throw new Error("[aura] S3 endpoint not configured. Set AURA_S3_INTERNAL_ENDPOINT or AURA_S3_ENDPOINT.");
  }
  return endpoint;
}

function getPublicEndpoint(): string {
  const endpoint = process.env.AURA_S3_PUBLIC_ENDPOINT || process.env.AURA_S3_ENDPOINT;
  if (!endpoint) {
    throw new Error("[aura] S3 public endpoint not configured. Set AURA_S3_PUBLIC_ENDPOINT or AURA_S3_ENDPOINT.");
  }
  return endpoint;
}

function getBucketName() {
  return process.env.AURA_S3_BUCKET_NAME || "aura-media";
}

function createS3Client() {
  const endpoint = getStorageEndpoint();
  const accessKeyId = process.env.AURA_S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AURA_S3_SECRET_ACCESS_KEY;

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "[aura] S3 storage is not configured. Set AURA_S3_ENDPOINT, AURA_S3_ACCESS_KEY_ID and AURA_S3_SECRET_ACCESS_KEY.",
    );
  }

  const allowSelfSigned = parseBooleanEnv(process.env.AURA_S3_ALLOW_SELF_SIGNED);
  const httpsAgent = allowSelfSigned
    ? new https.Agent({ rejectUnauthorized: false })
    : undefined;

  return new S3Client({
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
    region: process.env.AURA_S3_REGION || "us-east-1",
    forcePathStyle: true,
    requestHandler: new NodeHttpHandler({
      connectionTimeout: 5_000,
      requestTimeout: 15_000,
      httpsAgent,
    }),
  });
}

let bucketEnsured = false;

async function ensureBucketExists(s3: S3Client) {
  if (bucketEnsured) return;
  const bucket = getBucketName();
  const endpoint = getStorageEndpoint();
  console.log(`[aura:s3] ensureBucket — endpoint=${endpoint} bucket=${bucket}`);
  try {
    await s3.send(new HeadBucketCommand({ Bucket: bucket }));
    console.log(`[aura:s3] HeadBucket OK — bucket exists`);
    bucketEnsured = true;
  } catch (headErr: unknown) {
    const headMsg = headErr instanceof Error ? headErr.message : String(headErr);
    console.warn(`[aura:s3] HeadBucket failed: ${headMsg}`);
    // If it's a 404 (NoSuchBucket), try to create it
    const is404 = headMsg.includes("404") || headMsg.includes("NoSuchBucket") || headMsg.includes("NotFound");
    if (is404) {
      try {
        await s3.send(new CreateBucketCommand({ Bucket: bucket }));
        console.log(`[aura:s3] CreateBucket OK`);
        bucketEnsured = true;
      } catch (createErr: unknown) {
        const createMsg = createErr instanceof Error ? createErr.message : String(createErr);
        console.error(`[aura:s3] CreateBucket failed: ${createMsg}`);
        // Bucket may already exist (race condition) — proceed anyway
        bucketEnsured = true;
      }
    } else {
      // Non-404 error (XML parse, network, auth) — bucket likely exists, proceed
      console.warn(`[aura:s3] HeadBucket non-404 error — assuming bucket exists, proceeding`);
      bucketEnsured = true;
    }
  }
}

function parseDataUrl(dataUrl: string): { mimeType: string; extension: string; buffer: Buffer } {
  const match = dataUrl.match(
    /^data:(image\/(png|jpeg|jpg|webp|gif)|application\/pdf|text\/plain);base64,(.+)$/,
  );
  if (!match) {
    throw new Error("Format de fichier non supporte.");
  }
  const mimeType = match[1];
  const ext = match[2] === "jpeg" ? "jpg" : match[2];
  return { mimeType, extension: ext || "bin", buffer: Buffer.from(match[3], "base64") };
}

function buildObjectKey(prefix: string, fileName: string, extension: string) {
  const safeBaseName = fileName
    .toLowerCase()
    .replace(/[^a-z0-9-_.]/g, "-")
    .replace(/\.+/g, ".");
  const shortUuid = generateShortUuid(10);
  return `${prefix}/${shortUuid}-${safeBaseName}.${extension}`;
}

function buildPublicUrl(key: string) {
  return `${getPublicEndpoint().replace(/\/$/, "")}/${getBucketName()}/${key}`;
}

function extractKeyFromUrl(url: string): string | null {
  const baseUrl = `${getPublicEndpoint().replace(/\/$/, "")}/${getBucketName()}/`;
  if (!url.startsWith(baseUrl)) return null;
  return url.slice(baseUrl.length);
}

export const s3Driver: AuraStorageDriver = {
  name: "s3",

  async upload(args: AuraStorageUploadArgs): Promise<AuraStorageUploadResult> {
    const s3 = createS3Client();

    let buffer: Buffer;
    let mimeType: string;
    let extension: string;

    if (typeof args.data === "string" && args.data.startsWith("data:")) {
      const parsed = parseDataUrl(args.data);
      buffer = parsed.buffer;
      mimeType = parsed.mimeType;
      extension = parsed.extension;
    } else if (Buffer.isBuffer(args.data)) {
      buffer = args.data;
      mimeType = "application/octet-stream";
      extension = "bin";
    } else {
      throw new Error("Invalid data: expected Buffer or data URL string.");
    }

    const key = buildObjectKey(args.prefix, args.fileName, extension);

    await ensureBucketExists(s3);

    const endpoint = getStorageEndpoint();
    const bucket = getBucketName();
    console.log(`[aura:s3] PutObject — endpoint=${endpoint} bucket=${bucket} key=${key} size=${buffer.byteLength}`);

    try {
      await s3.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: buffer,
          ContentType: mimeType,
          ACL: "public-read",
        }),
      );
      console.log(`[aura:s3] PutObject OK — key=${key}`);
    } catch (putErr: unknown) {
      const msg = putErr instanceof Error ? putErr.message : String(putErr);
      // Try to extract raw response body for diagnosis
      const raw = (putErr as any)?.$response?.body;
      let rawBody = "";
      if (raw?.transformToString) {
        try { rawBody = await raw.transformToString(); } catch { /* ignore */ }
      }
      console.error(`[aura:s3] PutObject FAILED: ${msg}${rawBody ? ` | response body: ${rawBody.slice(0, 500)}` : ""}`);
      throw putErr;
    }

    const url = buildPublicUrl(key);

    const record = await db.auraFile.create({
      data: {
        name: args.fileName,
        key,
        url,
        mimeType,
        size: buffer.byteLength,
        prefix: args.prefix,
        storage: this.name,
        metadata: toPrismaJson(args.metadata),
      },
    });

    return {
      id: record.id,
      key,
      url,
      mimeType,
      size: buffer.byteLength,
    };
  },

  async delete(keyOrUrl: string): Promise<void> {
    const s3 = createS3Client();
    const key = extractKeyFromUrl(keyOrUrl) || keyOrUrl;
    if (!key) return;

    const record = await db.auraFile.findUnique({ where: { key } });
    if (!record) return;

    await s3.send(
      new DeleteObjectCommand({
        Bucket: getBucketName(),
        Key: key,
      }),
    );

    await db.auraFile.delete({ where: { id: record.id } });
  },
};
