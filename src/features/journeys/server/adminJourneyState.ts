import "server-only";

import { defineOperationFn } from "@/aura/server/operation";
import { requireAdmin } from "@/features/admin/server/common";
import { journeyIssueSchema, journeyRequestIdSchema } from "../shared/schemas";
import { createJourneyNotification } from "./helpers";

async function getJourney(ctx: any, requestId: string) {
  const journey = await ctx.db.journey.findUnique({
    where: { requestId },
    include: {
      request: { select: { id: true, userId: true, requestNumber: true } },
    },
  });
  if (!journey) throw new Error("Voyage introuvable.");
  return journey;
}

export const adminPauseJourney = defineOperationFn("journey.adminPause")
  .mutate()
  .input(journeyRequestIdSchema)
  .entities(["Journey", "JourneyEvent", "JcNotification"])
  .use(requireAdmin())
  .auth()
  .handler(async ({ ctx, input }) => {
    const journey = await getJourney(ctx, input.requestId);
    if (journey.status !== "EN_COURS") throw new Error("Seul un voyage en cours peut être mis en pause.");
    const message = "Le voyage a été temporairement mis en pause.";

    await ctx.db.$transaction(async (tx: any) => {
      await tx.journey.update({ where: { id: journey.id }, data: { status: "EN_PAUSE", latestMessage: message } });
      await tx.journeyEvent.create({
        data: { journeyId: journey.id, eventType: "PAUSED", title: "Voyage en pause", message, visibleToCustomer: true, createdByLabel: "Administrateur" },
      });
      await createJourneyNotification(tx, {
        request: journey.request,
        publicToken: journey.publicToken,
        type: "REQUEST_STATUS_UPDATED",
        title: "Voyage en pause",
        message,
      });
    });
    return { success: true };
  });

export const adminResumeJourney = defineOperationFn("journey.adminResume")
  .mutate()
  .input(journeyRequestIdSchema)
  .entities(["Journey", "JourneyEvent", "JcNotification"])
  .use(requireAdmin())
  .auth()
  .handler(async ({ ctx, input }) => {
    const journey = await getJourney(ctx, input.requestId);
    if (!["EN_PAUSE", "PROBLEME"].includes(journey.status)) throw new Error("Ce voyage n’est pas en pause.");
    const message = "Le voyage a repris normalement.";

    await ctx.db.$transaction(async (tx: any) => {
      await tx.journey.update({
        where: { id: journey.id },
        data: { status: "EN_COURS", latestMessage: message, problemMessage: null },
      });
      await tx.journeyEvent.create({
        data: { journeyId: journey.id, eventType: "RESUMED", title: "Voyage repris", message, visibleToCustomer: true, createdByLabel: "Administrateur" },
      });
      await createJourneyNotification(tx, {
        request: journey.request,
        publicToken: journey.publicToken,
        type: "REQUEST_STATUS_UPDATED",
        title: "Voyage repris",
        message,
      });
    });
    return { success: true };
  });

export const adminReportJourneyProblem = defineOperationFn("journey.adminReportProblem")
  .mutate()
  .input(journeyIssueSchema)
  .entities(["Journey", "JourneyEvent", "JcNotification"])
  .use(requireAdmin())
  .auth()
  .handler(async ({ ctx, input }) => {
    const journey = await getJourney(ctx, input.requestId);
    if (!["PLANIFIE", "EN_COURS", "EN_PAUSE"].includes(journey.status)) {
      throw new Error("Un problème ne peut pas être signalé dans l’état actuel.");
    }

    await ctx.db.$transaction(async (tx: any) => {
      await tx.journey.update({
        where: { id: journey.id },
        data: { status: "PROBLEME", latestMessage: input.message, problemMessage: input.message },
      });
      await tx.journeyEvent.create({
        data: {
          journeyId: journey.id,
          eventType: "PROBLEM_REPORTED",
          title: "Incident signalé",
          message: input.message,
          visibleToCustomer: true,
          createdByLabel: "Administrateur",
        },
      });
      await createJourneyNotification(tx, {
        request: journey.request,
        publicToken: journey.publicToken,
        type: "REQUEST_STATUS_UPDATED",
        title: "Incident sur le voyage",
        message: input.message,
      });
    });
    return { success: true };
  });
