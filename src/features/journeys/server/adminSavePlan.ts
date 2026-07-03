import "server-only";

import { defineOperationFn } from "@/aura/server/operation";
import { requireAdmin } from "@/features/admin/server/common";
import { saveJourneyPlanSchema } from "../shared/schemas";
import {
  createJourneyNotification,
  createJourneyPublicToken,
  journeyInclude,
  serializeJourney,
} from "./helpers";

export const adminSaveJourneyPlan = defineOperationFn("journey.adminSavePlan")
  .mutate()
  .input(saveJourneyPlanSchema)
  .entities(["Journey", "JourneyStop", "JourneyEvent", "Request", "JcNotification"])
  .use(requireAdmin())
  .auth()
  .handler(async ({ ctx, input }) => {
    const request = await ctx.db.request.findUnique({
      where: { id: input.requestId },
      select: {
        id: true,
        userId: true,
        requestNumber: true,
        transportMode: true,
      },
    });

    if (!request) throw new Error("Demande introuvable.");
    const expectedTransportType = request.transportMode === "AVION" ? "AERIEN" : "MARITIME";
    if (input.transportType !== expectedTransportType) {
      throw new Error("Le trajet doit respecter le mode choisi pour le colis.");
    }

    const nodeTerms =
      input.transportType === "AERIEN"
        ? ["airport", "aeroport", "aéroport", "airfield", "aerodrome", "aérodrome"]
        : ["port", "harbor", "harbour", "seaport", "maritime", "terminal portuaire", "container terminal"];

    for (const stop of input.stops) {
      const label = `${stop.placeName} ${stop.placeLabel ?? ""}`.toLowerCase();
      if (!stop.mapboxPlaceId || !nodeTerms.some((term) => label.includes(term))) {
        throw new Error(
          input.transportType === "AERIEN"
            ? "Chaque étape doit être un aéroport sélectionné dans la liste."
            : "Chaque étape doit être un port sélectionné dans la liste.",
        );
      }
    }

    const existing = await ctx.db.journey.findUnique({
      where: { requestId: input.requestId },
      include: { stops: true },
    });

    if (existing && !["BROUILLON", "PLANIFIE"].includes(existing.status)) {
      throw new Error("Le trajet ne peut plus être restructuré après son démarrage.");
    }

    if (existing?.stops.some((stop) => stop.reachedAt)) {
      throw new Error("Le trajet contient déjà des étapes confirmées.");
    }

    const orderedStops = [...input.stops]
      .sort((a, b) => a.sequence - b.sequence)
      .map((stop, sequence) => ({ ...stop, sequence }));

    const journeyId = await ctx.db.$transaction(async (tx) => {
      let journey = existing;

      if (!journey) {
        journey = await tx.journey.create({
          data: {
            requestId: input.requestId,
            publicToken: createJourneyPublicToken(),
            vehicleName: input.vehicleName,
            transportType: input.transportType,
            averageSpeed: input.averageSpeed ?? null,
            speedUnit:
              input.speedUnit ?? (input.transportType === "MARITIME" ? "KNOTS" : "KMH"),
            status: "BROUILLON",
            latestMessage: "Le trajet est en cours de préparation.",
            events: {
              create: {
                eventType: "CREATED",
                title: "Voyage créé",
                message: "La configuration du voyage a été initialisée.",
                visibleToCustomer: false,
                createdByLabel: "Administrateur",
              },
            },
          },
          include: { stops: true },
        });
      } else {
        journey = await tx.journey.update({
          where: { id: journey.id },
          data: {
            vehicleName: input.vehicleName,
            transportType: input.transportType,
            averageSpeed: input.averageSpeed ?? null,
            speedUnit:
              input.speedUnit ?? (input.transportType === "MARITIME" ? "KNOTS" : "KMH"),
          },
          include: { stops: true },
        });
      }

      const existingIds = new Set(journey.stops.map((stop) => stop.id));
      const incomingExistingIds = new Set(
        orderedStops
          .map((stop) => stop.id)
          .filter((id): id is string => typeof id === "string" && existingIds.has(id)),
      );

      const removableIds = journey.stops
        .filter((stop) => !incomingExistingIds.has(stop.id))
        .map((stop) => stop.id);

      if (removableIds.length > 0) {
        await tx.journeyStop.deleteMany({ where: { id: { in: removableIds } } });
      }

      // Move existing rows outside the final sequence range before reordering.
      await Promise.all(
        journey.stops
          .filter((stop) => incomingExistingIds.has(stop.id))
          .map((stop, index) =>
            tx.journeyStop.update({
              where: { id: stop.id },
              data: { sequence: 1000 + index },
            }),
          ),
      );

      for (const stop of orderedStops) {
        const data = {
          placeName: stop.placeName,
          placeLabel: stop.placeLabel ?? null,
          mapboxPlaceId: stop.mapboxPlaceId ?? null,
          latitude: stop.latitude,
          longitude: stop.longitude,
          stopType: stop.stopType,
          sequence: stop.sequence,
          estimatedArrivalAt: stop.estimatedArrivalAt ?? null,
          note: stop.note ?? null,
        };

        if (stop.id && existingIds.has(stop.id)) {
          await tx.journeyStop.update({ where: { id: stop.id }, data });
        } else {
          await tx.journeyStop.create({
            data: {
              journeyId: journey.id,
              ...data,
            },
          });
        }
      }

      await tx.journeyEvent.create({
        data: {
          journeyId: journey.id,
          eventType: "PLAN_UPDATED",
          title: "Itinéraire mis à jour",
          message: `Le trajet comporte désormais ${orderedStops.length} étapes.`,
          visibleToCustomer: journey.status !== "BROUILLON",
          createdByLabel: "Administrateur",
        },
      });

      if (journey.status !== "BROUILLON") {
        await createJourneyNotification(tx, {
          request,
          publicToken: journey.publicToken,
          type: "TRAJECTORY_UPDATED",
          title: "Itinéraire actualisé",
          message: "Les escales de votre voyage ont été mises à jour.",
        });
      }

      return journey.id;
    });

    const saved = await ctx.db.journey.findUniqueOrThrow({
      where: { id: journeyId },
      include: journeyInclude,
    });

    return serializeJourney(saved, true);
  });
