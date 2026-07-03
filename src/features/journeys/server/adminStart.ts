import "server-only";

import { defineOperationFn } from "@/aura/server/operation";
import { requireAdmin } from "@/features/admin/server/common";
import { confirmStopSchema } from "../shared/schemas";
import { createJourneyNotification } from "./helpers";

export const adminStartJourney = defineOperationFn("journey.adminStart")
  .mutate()
  .input(confirmStopSchema)
  .entities(["Journey", "JourneyStop", "JourneyEvent", "JcNotification"])
  .use(requireAdmin())
  .auth()
  .handler(async ({ ctx, input }) => {
    const journey = await ctx.db.journey.findUnique({
      where: { requestId: input.requestId },
      include: {
        request: { select: { id: true, userId: true, requestNumber: true } },
        stops: { orderBy: { sequence: "asc" } },
      },
    });

    if (!journey) throw new Error("Voyage introuvable.");
    if (journey.status !== "PLANIFIE") throw new Error("Le voyage doit être planifié avant son démarrage.");

    const departure = journey.stops[0];
    if (!departure) throw new Error("Le point de départ est absent.");

    const now = input.occurredAt ?? new Date();
    const nextStop = journey.stops[1];
    const message =
      input.message?.trim() ||
      (nextStop
        ? `${journey.vehicleName} a quitté ${departure.placeName} et se dirige vers ${nextStop.placeName}.`
        : `${journey.vehicleName} a démarré son voyage.`);

    await ctx.db.$transaction(async (tx) => {
      await tx.journeyStop.update({
        where: { id: departure.id },
        data: { reachedAt: now },
      });

      await tx.journey.update({
        where: { id: journey.id },
        data: {
          status: "EN_COURS",
          startedAt: now,
          latestMessage: message,
          problemMessage: null,
        },
      });
      await tx.request.update({
        where: { id: journey.requestId },
        data: {
          status: "EN_COURS",
          latestStatusMessage: message,
          problemType: null,
        },
      });

      await tx.journeyEvent.create({
        data: {
          journeyId: journey.id,
          stopId: departure.id,
          eventType: "STARTED",
          title: "Voyage démarré",
          message,
          visibleToCustomer: true,
          createdByLabel: "Administrateur",
        },
      });

      await createJourneyNotification(tx, {
        request: journey.request,
        publicToken: journey.publicToken,
        type: "REQUEST_STATUS_UPDATED",
        title: "Voyage démarré",
        message,
      });
    });

    return { success: true };
  });
