import "server-only";

import { defineOperationFn } from "@/aura/server/operation";
import { AuraError } from "@/aura/core/errors";
import { getByRequestParamsSchema } from "@/features/tracking/shared/schemas";

export const trackingGetByRequestPublic = defineOperationFn("tracking.getByRequestPublic")
  .query()
  .params(getByRequestParamsSchema)
  .entities(["Request", "TrajectoryStep", "RequestStatusEvent"])
  .public()
  .handler(async ({ ctx, params }) => {
    const request = await ctx.db.request.findUnique({
      where: { id: params.requestId },
      select: {
        id: true,
        requestNumber: true,
        status: true,
        problemType: true,
        latestStatusMessage: true,
        transportMode: true,
        trajectorySteps: {
          orderBy: { sequence: "asc" },
          select: {
            id: true,
            locationName: true,
            stepType: true,
            legMode: true,
            sequence: true,
            country: { select: { id: true, name: true } },
            reachedAt: true,
            timerDurationHours: true,
            timerStartedAt: true,
            timerEndsAt: true,
            isTimerPaused: true,
            pausedRemainingMinutes: true,
            latitude: true,
            longitude: true,
          },
        },
        statusEvents: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            status: true,
            problemType: true,
            title: true,
            message: true,
            createdAt: true,
            createdByLabel: true,
          },
        },
        destinationCountry: {
          select: { id: true, name: true },
        },
        originCountry: {
          select: { id: true, name: true },
        },
      },
    });

    if (!request) {
      throw new AuraError("NOT_FOUND", "Demande introuvable.");
    }

    return request;
  });
