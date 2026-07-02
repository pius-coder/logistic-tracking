import "server-only";

import { z } from "zod";
import { defineOperationFn } from "@/aura/server/operation";
import { AuraError } from "@/aura/core/errors";
import { requireAdmin } from "./common";

const stepTimerControlSchema = z.object({
  stepId: z.string().min(1),
  action: z.enum(["start", "pause", "resume", "markReached"]),
});

export const adminControlStepTimer = defineOperationFn("admin.controlStepTimer")
  .mutate()
  .input(stepTimerControlSchema)
  .entities(["TrajectoryStep", "Request", "JcNotification"])
  .use(requireAdmin())
  .auth()
  .handler(async ({ ctx, input }) => {
    const step = await ctx.db.trajectoryStep.findUnique({
      where: { id: input.stepId },
      include: { request: true },
    });

    if (!step) {
      throw new AuraError("NOT_FOUND", "Etape introuvable.");
    }

    const now = new Date();
    let copyMessage: string | null = null;

    switch (input.action) {
      case "start": {
        const durationMs = (step.timerDurationHours || 4) * 60 * 60 * 1000;
        await ctx.db.trajectoryStep.update({
          where: { id: step.id },
          data: {
            timerStartedAt: now,
            timerEndsAt: new Date(now.getTime() + durationMs),
            isTimerPaused: false,
            pausedRemainingMinutes: null,
          },
        });
        break;
      }

      case "pause": {
        if (!step.timerEndsAt || step.isTimerPaused) {
          throw new AuraError("BAD_REQUEST", "Le timer n'est pas actif.");
        }
        const remainingMs = Math.max(0, step.timerEndsAt.getTime() - now.getTime());
        await ctx.db.trajectoryStep.update({
          where: { id: step.id },
          data: {
            isTimerPaused: true,
            pausedRemainingMinutes: Math.round(remainingMs / (60 * 1000)),
          },
        });
        break;
      }

      case "resume": {
        if (!step.isTimerPaused || step.pausedRemainingMinutes == null) {
          throw new AuraError("BAD_REQUEST", "Le timer n'est pas en pause.");
        }
        await ctx.db.trajectoryStep.update({
          where: { id: step.id },
          data: {
            timerStartedAt: now,
            timerEndsAt: new Date(now.getTime() + step.pausedRemainingMinutes * 60 * 1000),
            isTimerPaused: false,
            pausedRemainingMinutes: null,
          },
        });
        break;
      }

      case "markReached": {
        await ctx.db.trajectoryStep.update({
          where: { id: step.id },
          data: { reachedAt: now },
        });

        const nextStep = await ctx.db.trajectoryStep.findFirst({
          where: { requestId: step.requestId, sequence: step.sequence + 1 },
        });

        if (nextStep) {
          const durationMs = (nextStep.timerDurationHours || 4) * 60 * 60 * 1000;
          await ctx.db.trajectoryStep.update({
            where: { id: nextStep.id },
            data: {
              timerStartedAt: now,
              timerEndsAt: new Date(now.getTime() + durationMs),
              isTimerPaused: false,
              pausedRemainingMinutes: null,
            },
          });
        }

        await ctx.db.jcNotification.create({
          data: {
            userId: step.request.userId,
            requestId: step.requestId,
            type: "TRAJECTORY_UPDATED",
            title: `Étape atteinte : ${step.locationName}`,
            message: `Votre expédition a atteint ${step.locationName}.`,
            deepLink: `/tracking/${step.requestId}`,
          },
        });

        const trackingUrl = `${process.env.AURA_APP_URL || "http://localhost:3000"}/tracking/${step.requestId}`;
        copyMessage = `📍 JC Import Express — Étape atteinte

N°: ${step.request.requestNumber}
Lieu: ${step.locationName}

Suivez votre expédition:
${trackingUrl}`;

        break;
      }
    }

    return { success: true, copyMessage };
  });
