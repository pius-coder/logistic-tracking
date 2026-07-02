import "server-only";

import { defineOperationFn } from "@/aura/server/operation";
import { AuraError } from "@/aura/core/errors";
import { updateStatusInputSchema } from "@/features/admin/shared/schemas";
import { requireAdmin } from "./common";

export const adminUpdateStatus = defineOperationFn("admin.updateStatus")
  .mutate()
  .input(updateStatusInputSchema)
  .entities(["Request", "RequestStatusEvent", "JcNotification"])
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

    await ctx.db.request.update({
      where: { id: request.id },
      data: {
        status: input.status,
        problemType: input.problemType || null,
        latestStatusMessage: input.message,
        statusEvents: {
          create: {
            status: input.status,
            problemType: input.problemType,
            title: input.title,
            message: input.message,
            createdByLabel: ctx.user.id,
          },
        },
      },
    });

    await ctx.db.jcNotification.create({
      data: {
        userId: request.userId,
        requestId: request.id,
        type: "REQUEST_STATUS_UPDATED",
        title: input.title,
        message: input.message,
        deepLink: `/demande/${request.id}`,
      },
    });

    const trackingUrl = `${process.env.AURA_APP_URL || "http://localhost:3000"}/tracking/${request.id}`;
    const problemLabel = input.problemType ? ` [${input.problemType}]` : "";

    return {
      success: true,
      copyMessage: `📦 JC Import Express — Mise à jour de votre expédition

N°: ${request.requestNumber}
Statut: ${input.status}${problemLabel}

${input.title}
${input.message}

Suivez votre expédition en temps réel:
${trackingUrl}`,
    };
  });
