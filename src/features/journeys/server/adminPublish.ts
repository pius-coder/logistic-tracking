import "server-only";

import { defineOperationFn } from "@/aura/server/operation";
import { requireAdmin } from "@/features/admin/server/common";
import { journeyRequestIdSchema } from "../shared/schemas";
import { createJourneyNotification } from "./helpers";

export const adminPublishJourney = defineOperationFn("journey.adminPublish")
  .mutate()
  .input(journeyRequestIdSchema)
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

    if (!journey) throw new Error("Configurez d’abord le voyage.");
    if (journey.stops.length < 2) throw new Error("Le trajet doit contenir au moins deux étapes.");
    if (journey.stops[0].stopType !== "DEPART" || journey.stops.at(-1)?.stopType !== "DESTINATION") {
      throw new Error("Le trajet doit commencer par un départ et se terminer par une destination.");
    }
    if (journey.status !== "BROUILLON") throw new Error("Ce voyage est déjà publié.");

    const now = new Date();
    await ctx.db.$transaction(async (tx) => {
      await tx.journey.update({
        where: { id: journey.id },
        data: {
          status: "PLANIFIE",
          publishedAt: now,
          latestMessage: "Le voyage est planifié et prêt à démarrer.",
        },
      });
      await tx.request.update({
        where: { id: journey.requestId },
        data: {
          latestStatusMessage: "Le trajet est planifié et prêt à démarrer.",
        },
      });

      await tx.journeyEvent.create({
        data: {
          journeyId: journey.id,
          eventType: "PUBLISHED",
          title: "Voyage planifié",
          message: `${journey.vehicleName} est prêt pour son départ.`,
          visibleToCustomer: true,
          createdByLabel: "Administrateur",
        },
      });

      await createJourneyNotification(tx, {
        request: journey.request,
        publicToken: journey.publicToken,
        type: "TRAJECTORY_UPDATED",
        title: "Votre voyage est planifié",
        message: "L’itinéraire et les escales sont maintenant disponibles.",
      });
    });

    return { success: true, publicToken: journey.publicToken };
  });
