import "server-only";

import { defineOperationFn } from "@/aura/server/operation";
import { AuraError } from "@/aura/core/errors";
import { updateRequestInputSchema } from "@/features/admin/shared/schemas";
import { requireAdmin } from "./common";

export const adminUpdateRequest = defineOperationFn("admin.updateRequest")
  .mutate()
  .input(updateRequestInputSchema)
  .entities(["Request"])
  .use(requireAdmin())
  .auth()
  .handler(async ({ ctx, input }) => {
    const request = await ctx.db.request.findUnique({
      where: { id: input.requestId },
    });

    if (!request) {
      throw new AuraError("NOT_FOUND", "Demande introuvable.");
    }

    const { requestId, ...data } = input;

    await ctx.db.request.update({
      where: { id: requestId },
      data,
    });

    return { success: true };
  });
