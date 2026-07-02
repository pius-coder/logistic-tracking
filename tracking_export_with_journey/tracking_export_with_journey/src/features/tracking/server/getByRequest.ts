import "server-only";

import { defineOperationFn } from "@/aura/server/operation";
import { AuraError } from "@/aura/core/errors";
import { getByRequestParamsSchema } from "@/features/tracking/shared/schemas";

export const trackingGetByRequest = defineOperationFn("tracking.getByRequest")
  .query()
  .params(getByRequestParamsSchema)
  .entities(["Request", "TrajectoryStep", "RequestStatusEvent"])
  .auth()
  .handler(async ({ ctx, params }) => {
    const request = await ctx.db.request.findUnique({
      where: { id: params.requestId },
      include: {
        originCountry: true,
        destinationCountry: true,
        trajectorySteps: {
          orderBy: { sequence: "asc" },
          include: { country: true },
        },
        statusEvents: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!request) {
      throw new AuraError("NOT_FOUND", "Demande introuvable.");
    }

    if (request.userId !== ctx.user.id && !ctx.user.isAdmin) {
      throw new AuraError("FORBIDDEN", "Acces refuse.");
    }

    return request;
  });
