import { z } from "zod";

export const adminRequestsParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.enum(["EN_ATTENTE", "EN_COURS", "EN_PAUSE", "PROBLEME", "TERMINE", "ANNULEE"]).optional(),
  search: z.string().optional(),
});

export const updateStatusInputSchema = z.object({
  requestId: z.string().min(1),
  status: z.enum(["EN_ATTENTE", "EN_COURS", "EN_PAUSE", "PROBLEME", "TERMINE", "ANNULEE"]),
  problemType: z.enum(["DOUANE", "POLICE", "DOCUMENTATION", "RETARD_LOGISTIQUE", "PAIEMENT", "AUTRE"]).optional(),
  title: z.string().min(2).max(160),
  message: z.string().min(3).max(1200),
});

export const saveTrajectoryInputSchema = z.object({
  requestId: z.string().min(1),
  steps: z.array(
    z.object({
      countryId: z.string().min(1).optional(),
      locationName: z.string().min(2).max(160),
      stepType: z.enum(["ORIGIN", "ESCALE", "DESTINATION"]),
      legMode: z.enum(["TRUCK", "PLANE", "BOAT"]).default("TRUCK"),
      sequence: z.number().int().nonnegative(),
      note: z.string().max(500).optional().or(z.literal("")),
      timerDurationHours: z.number().int().positive().max(240).default(4),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
    }),
  ).min(2),
});

export const updateRequestInputSchema = z.object({
  requestId: z.string().min(1),
  recipientName: z.string().min(1).optional(),
  recipientPhone: z.string().optional(),
  deliveryAddress: z.string().min(1).optional(),
  city: z.string().optional().nullable(),
  region: z.string().optional().nullable(),
  originCountryId: z.string().optional().nullable(),
  destinationCountryId: z.string().min(1).optional(),
  transportMode: z.enum(["AVION", "BATEAU"]).optional(),
  quantity: z.number().int().positive().optional(),
  totalCostUsd: z.number().nonnegative().optional(),
  adminNotes: z.string().optional().nullable(),
  productNameSnapshot: z.string().optional(),
  needsRectification: z.boolean().optional(),
  customProductName: z.string().optional().nullable(),
  customProductDesc: z.string().optional().nullable(),
  customWeight: z.number().nonnegative().optional().nullable(),
  customVolume: z.number().nonnegative().optional().nullable(),
});

export const definePaymentTermsInputSchema = z.object({
  requestId: z.string().min(1),
  paymentMethodIds: z.array(z.string().min(1)).min(1),
  termsCurrencyCode: z.string().min(3).max(6).optional(),
  termsTotalAmount: z.number().nonnegative().optional(),
  termsDepositAmount: z.number().nonnegative().optional(),
  termsInstructions: z.string().max(2000).optional(),
});

export const reviewPaymentInputSchema = z.object({
  paymentId: z.string().min(1),
  reviewNote: z.string().max(500).optional(),
});

export const toggleUserInputSchema = z.object({
  userId: z.string().min(1),
});

export const productImageSchema = z.object({
  url: z.string().min(1),
  altText: z.string().optional(),
  sortOrder: z.number().int().default(0),
  isPrimary: z.boolean().default(false),
});

export const productFreightRuleSchema = z.object({
  transportMode: z.enum(["AVION", "BATEAU"]),
  title: z.string().min(1).max(200),
  formulaExpression: z.string().min(1),
  formulaVariables: z.string().optional().nullable(),
  minimumChargeUsd: z.number().nonnegative().default(0),
  isActive: z.boolean().default(true),
});

export const createProductInputSchema = z.object({
  categoryId: z.string().min(1),
  originCountryId: z.string().optional().nullable(),
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(200),
  summary: z.string().min(1).max(500),
  description: z.string().min(1),
  heroTagline: z.string().optional().nullable(),
  basePriceUsd: z.number().nonnegative(),
  minimumOrderQuantity: z.number().int().positive().default(1),
  freightNotes: z.string().optional().nullable(),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  images: z.array(productImageSchema).default([]),
  freightRules: z.array(productFreightRuleSchema).optional(),
});

export const updateProductInputSchema = createProductInputSchema.partial().extend({
  id: z.string().min(1),
  images: z.array(productImageSchema).optional(),
  freightRules: z.array(productFreightRuleSchema).optional(),
});

export const saveCategoryInputSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100),
  description: z.string().max(500).optional().or(z.literal("")),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export const saveCountryInputSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100).optional(),
  iso2: z.string().length(2).optional(),
  dialingCode: z.string().optional(),
  currencyCode: z.string().optional(),
  currencyName: z.string().optional(),
  currencySymbol: z.string().optional(),
  usdExchangeRate: z.number().nonnegative().optional(),
  continent: z.string().optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  isHub: z.boolean().optional(),
});

export const saveFreightRuleInputSchema = z.object({
  id: z.string().optional(),
  productId: z.string().min(1),
  transportMode: z.enum(["AVION", "BATEAU"]),
  title: z.string().min(1).max(200),
  formulaExpression: z.string().min(1),
  formulaVariables: z.string().optional().nullable(),
  minimumChargeUsd: z.number().nonnegative().default(0),
  isActive: z.boolean().default(true),
});

export const saveSiteContentInputSchema = z.object({
  items: z.array(z.object({
    section: z.string().min(1),
    key: z.string().min(1),
    draftContent: z.string(),
    type: z.string().optional(),
    sortOrder: z.number().int().optional(),
  })),
});

export const publishSiteContentInputSchema = z.object({
  ids: z.array(z.string().min(1)),
});

export const publishAllSiteContentInputSchema = z.object({
  section: z.string().optional(),
});

export const createPaymentMethodInputSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100),
  type: z.enum(["MOBILE_MONEY", "BANK_TRANSFER", "CASH_DEPOSIT", "OTHER"]),
  description: z.string().min(1),
  instructions: z.string().min(1),
  accountName: z.string().optional().nullable(),
  accountNumber: z.string().optional().nullable(),
  phoneNumber: z.string().optional().nullable(),
  currencyCode: z.string().min(1).max(10),
  imageUrl: z.string().optional().nullable(),
  accentColor: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export const updatePaymentMethodInputSchema = createPaymentMethodInputSchema.partial().extend({
  id: z.string().min(1),
});

export const saveBlogPostInputSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200),
  content: z.string().min(1),
  excerpt: z.string().max(500).optional().or(z.literal("")),
  imageUrl: z.string().optional().nullable(),
  author: z.string().max(100).optional(),
  published: z.boolean().optional(),
  tags: z.string().optional(),
  metaTitle: z.string().max(200).optional(),
  metaDesc: z.string().max(300).optional(),
  type: z.enum(["BLOG", "ADVICE"]).default("BLOG"),
});

export const updateSettingsInputSchema = z.object({
  adminWhatsAppNumber: z.string().optional().nullable(),
  evolutionInstanceId: z.string().optional().nullable(),
});

export type AdminRequestsParams = z.infer<typeof adminRequestsParamsSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusInputSchema>;
export type SaveTrajectoryInput = z.infer<typeof saveTrajectoryInputSchema>;
export type UpdateRequestInput = z.infer<typeof updateRequestInputSchema>;
export type DefinePaymentTermsInput = z.infer<typeof definePaymentTermsInputSchema>;
export type ReviewPaymentInput = z.infer<typeof reviewPaymentInputSchema>;
export type ToggleUserInput = z.infer<typeof toggleUserInputSchema>;
export type CreateProductInput = z.infer<typeof createProductInputSchema>;
export type UpdateProductInput = z.infer<typeof updateProductInputSchema>;
export type SaveCategoryInput = z.infer<typeof saveCategoryInputSchema>;
export type SaveCountryInput = z.infer<typeof saveCountryInputSchema>;
export type SaveFreightRuleInput = z.infer<typeof saveFreightRuleInputSchema>;
export type SaveSiteContentInput = z.infer<typeof saveSiteContentInputSchema>;
export type PublishSiteContentInput = z.infer<typeof publishSiteContentInputSchema>;
export type PublishAllSiteContentInput = z.infer<typeof publishAllSiteContentInputSchema>;
export type CreatePaymentMethodInput = z.infer<typeof createPaymentMethodInputSchema>;
export type UpdatePaymentMethodInput = z.infer<typeof updatePaymentMethodInputSchema>;
export type SaveBlogPostInput = z.infer<typeof saveBlogPostInputSchema>;
export type UpdateSettingsInput = z.infer<typeof updateSettingsInputSchema>;
