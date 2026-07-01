import { z } from "zod";

export const completeOnboardingInputSchema = z.object({
  countryId: z.string().min(1, "Choisissez votre pays pour continuer."),
  displayName: z.string().min(1, "Votre nom est requis.").max(100),
  businessName: z.string().max(100).optional(),
  skipWhatsapp: z.boolean().optional(),
});

export const updateWhatsappNumberInputSchema = z.object({
  phoneNumber: z.string().min(1, "Numero requis."),
});

export type CompleteOnboardingInput = z.infer<typeof completeOnboardingInputSchema>;
export type UpdateWhatsappNumberInput = z.infer<typeof updateWhatsappNumberInputSchema>;
