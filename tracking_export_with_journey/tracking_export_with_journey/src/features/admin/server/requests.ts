import "server-only";

import { defineOperationFn } from "@/aura/server/operation";
import { adminRequestsParamsSchema } from "@/features/admin/shared/schemas";
import { requireAdmin } from "./common";

export const adminRequests = defineOperationFn("admin.requests")
  .query()
  .params(adminRequestsParamsSchema)
  .entities(["Request", "AuraUser", "Country"])
  .use(requireAdmin())
  .auth()
  .handler(async ({ ctx, params }) => {
    const where: any = {};
    if (params.status) where.status = params.status;
    if (params.search) {
      where.OR = [
        { requestNumber: { contains: params.search, mode: "insensitive" } },
        { recipientName: { contains: params.search, mode: "insensitive" } },
        {
          user: {
            displayName: { contains: params.search, mode: "insensitive" },
          },
        },
      ];
    }

    const skip = (params.page - 1) * params.limit;

    const [requests, total] = await Promise.all([
      ctx.db.request.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              displayName: true,
            },
          },
          destinationCountry: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: params.limit,
      }),
      ctx.db.request.count({ where }),
    ]);

    return {
      requests,
      total,
      page: params.page,
      totalPages: Math.ceil(total / params.limit),
    };
  });
