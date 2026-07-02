import "server-only";
import { defineOperationFn } from "@/aura/server/operation";
import { AuraError } from "@/aura/core/errors";
import { z } from "zod";

export const requestsGetById = defineOperationFn("requests.getById")
  .query()
  .params(z.object({ id: z.string().min(1) }))
  .entities(["Request", "TrajectoryStep", "RequestStatusEvent", "Country", "JcNotification"])
  .auth()
  .handler(async ({ ctx, params }) => {
    const request = await ctx.db.request.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
          },
        },
        originCountry: true,
        destinationCountry: true,
        trajectorySteps: {
          orderBy: { sequence: "asc" },
          include: { country: true },
        },
        statusEvents: { orderBy: { createdAt: "desc" } },
        jcNotifications: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!request) {
      throw new AuraError("NOT_FOUND", "Demande introuvable.");
    }

    if (!ctx.user.isAdmin && request.userId !== ctx.user.id) {
      throw new AuraError("FORBIDDEN", "Accès refusé.");
    }

    return {
      id: request.id,
      requestNumber: request.requestNumber,
      status: request.status,
      problemType: request.problemType,
      type: request.type,
      createdAt: request.createdAt.toISOString(),
      recipientName: request.recipientName,
      recipientPhone: request.recipientPhone,
      deliveryAddress: request.deliveryAddress,
      city: request.city,
      region: request.region,
      quantity: request.packageCount,
      transportMode: request.transportMode,
      totalCostUsd: 0,
      customerNotes: request.customerNotes,
      latestStatusMessage: request.latestStatusMessage,
      whatsappDiscussionLink: request.whatsappDiscussionLink,
      adminNotes: request.adminNotes,
      needsRectification: request.needsRectification,
      productNameSnapshot: request.productDescription,
      customProductName: null,
      customProductDesc: null,
      customWeight: request.packageWeightKg,
      customVolume: request.packageVolumeM3,
      user: {
        id: request.user.id,
        displayName: request.user.displayName,
      },
      product: null,
      originCountry: request.originCountry ? { id: request.originCountry.id, name: request.originCountry.name } : null,
      destinationCountry: { id: request.destinationCountry.id, name: request.destinationCountry.name },
      originCountryId: request.originCountryId,
      destinationCountryId: request.destinationCountryId,
      trajectorySteps: request.trajectorySteps.map((s) => ({
        id: s.id,
        locationName: s.locationName,
        stepType: s.stepType,
        sequence: s.sequence,
        reachedAt: s.reachedAt?.toISOString() ?? null,
        country: s.country ? { id: s.country.id, name: s.country.name } : null,
        latitude: s.latitude,
        longitude: s.longitude,
        timerDurationHours: s.timerDurationHours,
        timerStartedAt: s.timerStartedAt?.toISOString() ?? null,
        timerEndsAt: s.timerEndsAt?.toISOString() ?? null,
        isTimerPaused: s.isTimerPaused,
        pausedRemainingMinutes: s.pausedRemainingMinutes,
        note: s.note,
      })),
      statusEvents: request.statusEvents.map((e) => ({
        id: e.id,
        status: e.status,
        title: e.title,
        message: e.message,
        createdAt: e.createdAt.toISOString(),
        createdByLabel: e.createdByLabel,
      })),
      payments: [],
      jcNotifications: request.jcNotifications.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        createdAt: n.createdAt.toISOString(),
        isRead: n.isRead,
      })),
      allowedPaymentMethods: [],
      termsCurrencyCode: null,
      termsTotalAmount: null,
      termsDepositAmount: null,
      termsInstructions: null,
      termsDefinedAt: null,
    };
  });
