import "server-only";

import { defineOperationFn } from "@/aura/server/operation";
import type { CountryWhereInput } from "@/generated/prisma/models/Country";
import { z } from "zod";
import { requireAdmin } from "./common";

export const adminCountries = defineOperationFn("admin.countries")
  .query()
  .params(z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(50),
    search: z.string().optional(),
  }))
  .entities(["Country"])
  .use(requireAdmin())
  .auth()
  .handler(async ({ ctx, params }) => {
    const where: CountryWhereInput = {};
    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: "insensitive" } },
        { iso2: { contains: params.search, mode: "insensitive" } },
      ];
    }

    const skip = (params.page - 1) * params.limit;
    const [countries, total] = await Promise.all([
      ctx.db.country.findMany({
        where,
        orderBy: { name: "asc" },
        skip,
        take: params.limit,
      }),
      ctx.db.country.count({ where }),
    ]);

    return { countries, total, page: params.page, totalPages: Math.ceil(total / params.limit) };
  });
