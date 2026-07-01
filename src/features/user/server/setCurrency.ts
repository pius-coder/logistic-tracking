import "server-only";

import { z } from "zod";
import { defineOperationFn } from "@/aura/server/operation";

export const userSetCurrency = defineOperationFn("user.setCurrency")
  .mutate()
  .input(z.object({ currencyCode: z.string().min(1) }))
  .entities(["AuraUser"])
  .auth()
  .handler(async ({ ctx, input }) => {
    await ctx.db.auraUser.update({
      where: { id: ctx.user.id },
      data: { currencyCode: input.currencyCode },
    });

    ctx.bump.success("Devise mise à jour", `Devise changée pour ${input.currencyCode}.`);

    return { success: true };
  });
