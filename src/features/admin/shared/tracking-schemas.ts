import { z } from "zod";

export const trackingRequestStatusSchema = z.enum([
  "EN_ATTENTE",
  "EN_COURS",
  "EN_PAUSE",
  "PROBLEME",
  "TERMINE",
  "ANNULEE",
]);

export const trackingProblemTypeSchema = z.enum([
  "DOUANE",
  "POLICE",
  "DOCUMENTATION",
  "RETARD_LOGISTIQUE",
  "PAIEMENT",
  "AUTRE",
]);

export const trackingTransportModeSchema = z.enum(["AVION", "BATEAU"]);

const optionalString = (max = 500) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .nullable()
    .or(z.literal(""));

const optionalPositiveNumber = z
  .preprocess((value) => (value === "" || value == null ? null : value), z.coerce.number().positive().nullable())
  .optional();

export const trackingShipmentsParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(25),
  status: trackingRequestStatusSchema.optional(),
  transportMode: trackingTransportModeSchema.optional(),
  search: z.string().trim().max(120).optional().or(z.literal("")),
});

const clientInputSchema = z.object({
  clientName: z.string().trim().min(2).max(120),
  clientPhone: z.string().trim().min(5).max(40),
  clientEmail: optionalString(160),
  clientBusinessName: optionalString(160),
});

const shipmentDetailsInputSchema = z.object({
  originCountryId: optionalString(80),
  destinationCountryId: z.string().min(1),
  recipientName: z.string().trim().min(2).max(120),
  recipientPhone: z.string().trim().min(5).max(40),
  deliveryAddress: z.string().trim().min(5).max(400),
  city: optionalString(120),
  region: optionalString(120),
  packageWeightKg: optionalPositiveNumber,
  packageVolumeM3: optionalPositiveNumber,
  packageCount: z.coerce.number().int().positive().max(999).default(1),
  productDescription: z.string().trim().min(2).max(1200),
  transportMode: trackingTransportModeSchema,
  customerNotes: optionalString(1200),
  adminNotes: optionalString(2000),
});

export const createShipmentInputSchema = clientInputSchema.merge(shipmentDetailsInputSchema);

export const updateShipmentInputSchema = shipmentDetailsInputSchema
  .partial()
  .extend({
    requestId: z.string().min(1),
    status: trackingRequestStatusSchema.optional(),
    problemType: trackingProblemTypeSchema.optional().nullable(),
    needsRectification: z.boolean().optional(),
  });

export const addShipmentStatusNoteInputSchema = z
  .object({
    requestId: z.string().min(1),
    status: trackingRequestStatusSchema,
    problemType: trackingProblemTypeSchema.optional().nullable(),
    title: z.string().trim().min(2).max(160),
    message: z.string().trim().min(3).max(1200),
  })
  .superRefine((value, ctx) => {
    if (value.status === "PROBLEME" && !value.problemType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["problemType"],
        message: "Choisissez le type d'incident.",
      });
    }
  });

export type TrackingShipmentsParams = z.infer<typeof trackingShipmentsParamsSchema>;
export type CreateShipmentInput = z.infer<typeof createShipmentInputSchema>;
export type UpdateShipmentInput = z.infer<typeof updateShipmentInputSchema>;
export type AddShipmentStatusNoteInput = z.infer<typeof addShipmentStatusNoteInputSchema>;
