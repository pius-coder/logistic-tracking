import "server-only";

import { defineOperationFn } from "@/aura/server/operation";
import { z } from "zod";
import { requireAdmin } from "./common";

export const adminUserById = defineOperationFn("admin.userById")
  .query()
  .params(z.object({ id: z.string().min(1) }))
  .entities(["AuraUser"])
  .use(requireAdmin())
  .auth()
  .handler(async ({ ctx, params }) => {
    const user = await ctx.db.auraUser.findUnique({
      where: { id: params.id },
      include: {
        country: true,
        requests: {
          orderBy: { createdAt: "desc" },
          include: {
            destinationCountry: { select: { name: true } },
          },
        },
        _count: { select: { requests: true } },
      },
    });

    if (!user) throw new Error("Utilisateur introuvable");

    return { user };
  });
