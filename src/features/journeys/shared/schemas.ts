import { z } from "zod";

export const journeyTransportTypeSchema = z.enum(["MARITIME", "AERIEN"]);
export const journeyStatusSchema = z.enum([
  "BROUILLON",
  "PLANIFIE",
  "EN_COURS",
  "EN_PAUSE",
  "PROBLEME",
  "TERMINE",
  "ANNULE",
]);
export const journeyStopTypeSchema = z.enum(["DEPART", "ESCALE", "DESTINATION"]);
export const journeySpeedUnitSchema = z.enum(["KNOTS", "KMH"]);

export const journeyPlaceSchema = z.object({
  id: z.string().optional(),
  placeName: z.string().trim().min(2).max(180),
  placeLabel: z.string().trim().max(300).nullable().optional(),
  mapboxPlaceId: z.string().trim().max(200).nullable().optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  stopType: journeyStopTypeSchema,
  sequence: z.number().int().nonnegative(),
  estimatedArrivalAt: z.coerce.date().nullable().optional(),
  note: z.string().trim().max(500).nullable().optional(),
});

export const saveJourneyPlanSchema = z
  .object({
    requestId: z.string().min(1),
    vehicleName: z.string().trim().min(2).max(120),
    transportType: journeyTransportTypeSchema,
    averageSpeed: z.number().positive().max(2000).nullable().optional(),
    speedUnit: journeySpeedUnitSchema.nullable().optional(),
    stops: z.array(journeyPlaceSchema).min(2).max(20),
  })
  .superRefine((value, ctx) => {
    const ordered = [...value.stops].sort((a, b) => a.sequence - b.sequence);

    if (ordered[0]?.stopType !== "DEPART") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["stops", 0, "stopType"],
        message: "La première étape doit être le point de départ.",
      });
    }

    if (ordered.at(-1)?.stopType !== "DESTINATION") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["stops", ordered.length - 1, "stopType"],
        message: "La dernière étape doit être la destination.",
      });
    }

    ordered.slice(1, -1).forEach((stop, index) => {
      if (stop.stopType !== "ESCALE") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["stops", index + 1, "stopType"],
          message: "Une étape intermédiaire doit être une escale.",
        });
      }
    });

    ordered.forEach((stop, index) => {
      if (stop.sequence !== index) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["stops", index, "sequence"],
          message: "Les séquences doivent être continues.",
        });
      }
    });

    for (let index = 1; index < ordered.length; index += 1) {
      const previousEta = ordered[index - 1].estimatedArrivalAt;
      const currentEta = ordered[index].estimatedArrivalAt;

      if (previousEta && currentEta && currentEta <= previousEta) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["stops", index, "estimatedArrivalAt"],
          message: "L’ETA doit être postérieure à celle de l’étape précédente.",
        });
      }
    }
  });

export const journeyRequestIdSchema = z.object({ requestId: z.string().min(1) });
export const journeyPublicTokenSchema = z.object({ token: z.string().min(16).max(120) });

export const confirmStopSchema = z.object({
  requestId: z.string().min(1),
  occurredAt: z.coerce.date().optional(),
  message: z.string().trim().max(500).optional(),
});

export const updateJourneyEtaSchema = z.object({
  requestId: z.string().min(1),
  stopId: z.string().min(1),
  estimatedArrivalAt: z.coerce.date(),
  reason: z.string().trim().min(2).max(300).optional(),
});

export const journeyIssueSchema = z.object({
  requestId: z.string().min(1),
  message: z.string().trim().min(3).max(500),
});

export const journeyGeocodeSchema = z.object({
  query: z.string().trim().min(2).max(160),
  transportType: journeyTransportTypeSchema.optional(),
});

export type SaveJourneyPlanInput = z.infer<typeof saveJourneyPlanSchema>;
export type JourneyPlaceInput = z.infer<typeof journeyPlaceSchema>;
