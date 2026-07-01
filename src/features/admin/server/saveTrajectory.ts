import "server-only";

import { defineOperationFn } from "@/aura/server/operation";
import { AuraError } from "@/aura/core/errors";
import { saveTrajectoryInputSchema } from "@/features/admin/shared/schemas";
import { requireAdmin } from "./common";

export const adminSaveTrajectory = defineOperationFn("admin.saveTrajectory")
  .mutate()
  .input(saveTrajectoryInputSchema)
  .entities(["Request", "TrajectoryStep", "JcNotification"])
  .use(requireAdmin())
  .auth()
  .handler(async ({ ctx, input }) => {
    const request = await ctx.db.request.findUnique({
      where: { id: input.requestId },
    });

    if (!request) {
      throw new AuraError("NOT_FOUND", "Demande introuvable.");
    }

    await ctx.db.$transaction([
      ctx.db.trajectoryStep.deleteMany({ where: { requestId: input.requestId } }),
      ctx.db.trajectoryStep.createMany({
        data: input.steps.map((step) => ({
          requestId: input.requestId,
          countryId: step.countryId || null,
          locationName: step.locationName,
          stepType: step.stepType,
          legMode: step.legMode,
          sequence: step.sequence,
          note: step.note || null,
          timerDurationHours: step.timerDurationHours,
          timerStartedAt: step.sequence === 0 ? new Date() : null,
          timerEndsAt: step.sequence === 0
            ? new Date(Date.now() + step.timerDurationHours * 60 * 60 * 1000)
            : null,
          latitude: step.latitude || null,
          longitude: step.longitude || null,
        })),
      }),
    ]);

    await ctx.db.jcNotification.create({
      data: {
        userId: request.userId,
        requestId: request.id,
        type: "TRAJECTORY_UPDATED",
        title: "Trajet mis a jour",
        message: "Le trajet logistique de votre marchandise vient d'etre configure.",
        deepLink: `/demande/${request.id}`,
      },
    });

    const trackingUrl = `${process.env.AURA_APP_URL || "http://localhost:3000"}/tracking/${request.id}`;
    const stepsList = input.steps.map((s, i) => `${i + 1}. ${s.locationName} (${s.stepType})`).join("\n");

    await ctx.notify.via("whatsapp.send").send({
      phoneNumber: request.recipientPhone,
      message: `🗺️ JC Import Express — Trajet logistique mis a jour\n\nN°: ${request.requestNumber}\n\nNouvelles etapes:\n${stepsList}\n\nSuivez votre expedition en temps reel:\n${trackingUrl}`,
    });

    return { success: true };
  });
