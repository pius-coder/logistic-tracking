import "server-only";

import { defineOperationFn } from "@/aura/server/operation";
import { z } from "zod";
import { requireAdmin } from "./common";

export const adminUsers = defineOperationFn("admin.users")
  .query()
  .params(z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    search: z.string().optional(),
  }))
  .entities(["AuraUser"])
  .use(requireAdmin())
  .auth()
  .handler(async ({ ctx, params }) => {
    const where: any = { deletedAt: null };
    if (params.search) {
      where.OR = [
        { displayName: { contains: params.search, mode: "insensitive" } },
        { businessName: { contains: params.search, mode: "insensitive" } },
        { username: { contains: params.search, mode: "insensitive" } },
      ];
    }

    const skip = (params.page - 1) * params.limit;

    const [users, total] = await Promise.all([
      ctx.db.auraUser.findMany({
        where,
        include: {
          country: { select: { name: true, iso2: true } },
          _count: { select: { requests: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: params.limit,
      }),
      ctx.db.auraUser.count({ where }),
    ]);

    return {
      users,
      total,
      page: params.page,
      totalPages: Math.ceil(total / params.limit),
    };
  });
