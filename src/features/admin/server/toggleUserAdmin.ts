import "server-only";

import { defineOperationFn } from "@/aura/server/operation";
import { z } from "zod";
import { requireAdmin } from "./common";

export const adminToggleUserAdmin = defineOperationFn("admin.toggleUserAdmin")
  .mutate()
  .input(z.object({ userId: z.string().min(1) }))
  .entities(["AuraUser"])
  .use(requireAdmin())
  .auth()
  .handler(async ({ ctx, input }) => {
    const user = await ctx.db.auraUser.findUnique({ where: { id: input.userId } });
    if (!user) throw new Error("Utilisateur introuvable");

    const updated = await ctx.db.auraUser.update({
      where: { id: input.userId },
      data: { isAdmin: !user.isAdmin },
    });

    return { success: true, isAdmin: updated.isAdmin };
  });
