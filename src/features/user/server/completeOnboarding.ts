import "server-only";

import { defineOperationFn } from "@/aura/server/operation";
import { AuraError } from "@/aura/core/errors";
import { completeOnboardingInputSchema } from "@/features/user/shared/schemas";

export const userCompleteOnboarding = defineOperationFn("user.completeOnboarding")
  .mutate()
  .input(completeOnboardingInputSchema)
  .entities(["AuraUser", "Country"])
  .auth()
  .handler(async ({ ctx, input }) => {
    const country = await ctx.db.country.findUnique({
      where: { id: input.countryId },
    });

    if (!country || !country.isActive) {
      throw new AuraError("NOT_FOUND", "Pays introuvable.");
    }

    await ctx.db.auraUser.update({
      where: { id: ctx.user.id },
      data: {
        countryId: country.id,
        currencyCode: country.currencyCode,
        displayName: input.displayName,
        businessName: input.businessName || null,
        onboardingCompleted: true,
        ...(input.skipWhatsapp ? { whatsappChallenge: true, hadWhatsapp: false } : {}),
      },
    });

    ctx.bump.success("Bienvenue !", `Votre marche principal est ${country.name}.`);

    return { success: true, currencyCode: country.currencyCode };
  });
