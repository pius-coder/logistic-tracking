import "server-only";

import { defineOperationFn } from "@/aura/server/operation";
import { requireAdmin } from "@/features/admin/server/common";
import { confirmStopSchema } from "../shared/schemas";
import { createJourneyNotification } from "./helpers";

export const adminConfirmNextStop = defineOperationFn("journey.adminConfirmNextStop")
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
    if (!["EN_COURS", "PROBLEME", "EN_PAUSE"].includes(journey.status)) {
      throw new Error("Le voyage n’est pas en cours.");
    }

    const nextStop = journey.stops.find((stop) => !stop.reachedAt);
    if (!nextStop) throw new Error("Toutes les étapes sont déjà terminées.");

    const previousStop = journey.stops[nextStop.sequence - 1];
    if (nextStop.sequence > 0 && !previousStop?.reachedAt) {
      throw new Error("L’étape précédente doit d’abord être confirmée.");
    }

    const now = input.occurredAt ?? new Date();
    const isFinal = nextStop.stopType === "DESTINATION";
    const followingStop = journey.stops[nextStop.sequence + 1];
    const message =
      input.message?.trim() ||
      (isFinal
        ? `${journey.vehicleName} est arrivé à ${nextStop.placeName}. Le voyage est terminé.`
        : `${journey.vehicleName} a atteint ${nextStop.placeName}.${followingStop ? ` Prochaine escale : ${followingStop.placeName}.` : ""}`);

    await ctx.db.$transaction(async (tx) => {
      await tx.journeyStop.update({
        where: { id: nextStop.id },
        data: { reachedAt: now },
      });

      await tx.journey.update({
        where: { id: journey.id },
        data: {
          status: isFinal ? "TERMINE" : "EN_COURS",
          completedAt: isFinal ? now : null,
          latestMessage: message,
          problemMessage: null,
        },
      });
      await tx.request.update({
        where: { id: journey.requestId },
        data: {
          status: isFinal ? "TERMINE" : "EN_COURS",
          latestStatusMessage: message,
          problemType: null,
        },
      });

      await tx.journeyEvent.create({
        data: {
          journeyId: journey.id,
          stopId: nextStop.id,
          eventType: isFinal ? "COMPLETED" : "STOP_REACHED",
          title: isFinal ? "Voyage terminé" : `Arrivée à ${nextStop.placeName}`,
          message,
          visibleToCustomer: true,
          createdByLabel: "Administrateur",
        },
      });

      await createJourneyNotification(tx, {
        request: journey.request,
        publicToken: journey.publicToken,
        type: "REQUEST_STATUS_UPDATED",
        title: isFinal ? "Voyage terminé" : `Nouvelle escale : ${nextStop.placeName}`,
        message,
      });
    });

    return { success: true, completed: isFinal };
  });
