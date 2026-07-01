import "server-only";

import { defineOperationFn } from "@/aura/server/operation";
import { AuraError } from "@/aura/core/errors";
import { enforceRateLimit } from "@/aura/server/rate-limit";
import { updateWhatsappNumberInputSchema } from "@/features/user/shared/schemas";

export const userUpdateWhatsappNumber = defineOperationFn("user.updateWhatsappNumber")
  .mutate()
  .input(updateWhatsappNumberInputSchema)
  .entities(["AuraUser", "AuraPhoneIdentity"])
  .auth()
  .handler(async ({ ctx, input }) => {
    await enforceRateLimit(ctx.db, {
      key: `user:updateWhatsappNumber:${ctx.user.id}`,
      limit: 3,
      windowSeconds: 300,
    });

    const cleaned = input.phoneNumber.replace(/[\s\+\-\(\)]/g, "");
    if (cleaned.length < 8) {
      throw new AuraError("BAD_REQUEST", "Numero WhatsApp invalide.");
    }

    const existingPhone = await ctx.db.auraPhoneIdentity.findFirst({
      where: { userId: ctx.user.id },
      orderBy: { createdAt: "asc" },
    });

    if (!existingPhone) {
      throw new AuraError("NOT_FOUND", "Aucun numero de telephone trouve sur votre compte.");
    }

    await ctx.db.auraPhoneIdentity.update({
      where: { id: existingPhone.id },
      data: { phoneE164: cleaned },
    });

    await ctx.db.auraUser.update({
      where: { id: ctx.user.id },
      data: { whatsappChallenge: false, hadWhatsapp: null },
    });

    ctx.notify.via("whatsapp.welcome").send({ phoneE164: cleaned }).catch(() => {});

    ctx.bump.success("WhatsApp mis a jour", "Un message de verification a ete envoye.");

    return { success: true };
  });
