import "server-only";

import { defineOperationFn } from "@/aura/server/operation";
import { requireAdmin } from "./common";

export const adminDashboard = defineOperationFn("admin.dashboard")
  .query()
  .entities(["Request", "AuraUser", "Country"])
  .use(requireAdmin())
  .auth()
  .handler(async ({ ctx }) => {
    const [
      totalRequests,
      pendingRequests,
      activeRequests,
      completedRequests,
      totalUsers,
      totalCountries,
      recentRequests,
    ] = await Promise.all([
      ctx.db.request.count(),
      ctx.db.request.count({ where: { status: "EN_ATTENTE" } }),
      ctx.db.request.count({ where: { status: "EN_COURS" } }),
      ctx.db.request.count({ where: { status: "TERMINE" } }),
      ctx.db.auraUser.count(),
      ctx.db.country.count(),
      ctx.db.request.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          user: { select: { displayName: true, phoneIdentities: { take: 1, select: { phoneE164: true } } } },
          destinationCountry: { select: { name: true } },
        },
      }),
    ]);

    return {
      stats: {
        totalRequests,
        pendingRequests,
        activeRequests,
        completedRequests,
        totalUsers,
        totalProducts: 0,
        totalCategories: 0,
        totalCountries,
        monthlyRevenue: 0,
        lastMonthRevenue: 0,
      },
      recentPayments: [],
      recentRequests: recentRequests.map((r) => ({
        id: r.id,
        requestNumber: r.requestNumber,
        status: r.status,
        userName: r.user?.displayName || r.user?.phoneIdentities[0]?.phoneE164,
        productName: r.productDescription || "Transit",
        destination: r.destinationCountry?.name,
        createdAt: r.createdAt,
      })),
    };
  });
