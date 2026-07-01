import "server-only";

import { defineOperationFn } from "@/aura/server/operation";
import { AuraError } from "@/aura/core/errors";
import { updateRequestInputSchema } from "@/features/admin/shared/schemas";
import { requireAdmin } from "./common";

export const adminUpdateRequest = defineOperationFn("admin.updateRequest")
  .mutate()
  .input(updateRequestInputSchema)
  .entities(["Request", "JcNotification"])
  .use(requireAdmin())
  .auth()
  .handler(async ({ ctx, input }) => {
    const request = await ctx.db.request.findUnique({
      where: { id: input.requestId },
      include: { user: true },
    });

    if (!request) {
      throw new AuraError("NOT_FOUND", "Demande introuvable.");
    }

    const { requestId, ...data } = input;

    const updated = await ctx.db.request.update({
      where: { id: requestId },
      data,
    });

    const wasRectified = input.needsRectification === false && request.needsRectification === true;

    if (wasRectified) {
      const trackingUrl = `${process.env.AURA_APP_URL || "http://localhost:3000"}/tracking/${request.id}`;

      await ctx.db.jcNotification.create({
        data: {
          userId: request.userId,
          requestId: request.id,
          type: "REQUEST_CREATED",
          title: `Commande ${request.requestNumber} validee`,
          message: `Votre commande a ete validee par notre equipe. Consultez les details dans votre espace.`,
          deepLink: `/demande/${request.id}`,
        },
      });

      await ctx.notify.via("whatsapp.send").send({
        phoneNumber: request.recipientPhone,
        message: `✅ JC Import Express — Votre commande ${request.requestNumber} a ete validee par notre equipe.\n\nDestinataire: ${updated.recipientName}\nAdresse: ${updated.deliveryAddress}${updated.city ? `, ${updated.city}` : ""}\nTransport: ${updated.transportMode}\n\nSuivez votre expedition ici:\n${trackingUrl}`,
      });
    }

    return updated;
  });
