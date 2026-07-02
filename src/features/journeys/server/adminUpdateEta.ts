import "server-only";

import { defineOperationFn } from "@/aura/server/operation";
import { requireAdmin } from "@/features/admin/server/common";
import { updateJourneyEtaSchema } from "../shared/schemas";
import { createJourneyNotification } from "./helpers";

export const adminUpdateJourneyEta = defineOperationFn("journey.adminUpdateEta")
  .mutate()
  .input(updateJourneyEtaSchema)
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

    const stop = journey.stops.find((item) => item.id === input.stopId);
    if (!stop) throw new Error("Escale introuvable.");
    if (stop.reachedAt) throw new Error("L’ETA d’une étape terminée ne peut plus être modifiée.");

    const previous = journey.stops[stop.sequence - 1];
    const next = journey.stops[stop.sequence + 1];
    if (previous?.estimatedArrivalAt && input.estimatedArrivalAt <= previous.estimatedArrivalAt) {
      throw new Error("La nouvelle ETA doit suivre celle de l’étape précédente.");
    }
    if (next?.estimatedArrivalAt && input.estimatedArrivalAt >= next.estimatedArrivalAt) {
      throw new Error("La nouvelle ETA doit précéder celle de l’étape suivante.");
    }

    const reason = input.reason?.trim();
    const message = reason
      ? `L’arrivée estimée à ${stop.placeName} a été actualisée. Motif : ${reason}`
      : `L’arrivée estimée à ${stop.placeName} a été actualisée.`;

    await ctx.db.$transaction(async (tx) => {
      await tx.journeyStop.update({
        where: { id: stop.id },
        data: { estimatedArrivalAt: input.estimatedArrivalAt },
      });
      await tx.journey.update({ where: { id: journey.id }, data: { latestMessage: message } });
      await tx.journeyEvent.create({
        data: {
          journeyId: journey.id,
          stopId: stop.id,
          eventType: "ETA_UPDATED",
          title: "ETA mise à jour",
          message,
          visibleToCustomer: true,
          createdByLabel: "Administrateur",
        },
      });
      await createJourneyNotification(tx, {
        request: journey.request,
        publicToken: journey.publicToken,
        type: "TRAJECTORY_UPDATED",
        title: "Nouvelle estimation d’arrivée",
        message,
      });
    });

    return { success: true };
  });
