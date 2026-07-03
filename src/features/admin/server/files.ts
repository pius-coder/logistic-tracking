import "server-only";

import { z } from "zod";
import { AuraError } from "@/aura/core/errors";
import { defineOperationFn } from "@/aura/server/operation";
import { requireAdmin } from "./common";

export const adminUploadFile = defineOperationFn("admin.uploadFile")
  .mutate()
  .input(
    z.object({
      dataUrl: z.string().min(1),
      fileName: z.string().min(1).max(255),
      prefix: z.string().min(1).max(100).default("uploads"),
    }),
  )
  .entities(["AuraFile"])
  .use(requireAdmin())
  .auth()
  .handler(async ({ ctx, input }) => {
    if (!input.dataUrl.startsWith("data:")) {
      throw new AuraError("BAD_REQUEST", "Invalid file data.");
    }

    const result = await ctx.storage.upload({
      data: input.dataUrl,
      fileName: input.fileName,
      prefix: input.prefix,
    });

    return {
      id: result.id,
      key: result.key,
      url: result.url,
      mimeType: result.mimeType,
      size: result.size,
    };
  });
