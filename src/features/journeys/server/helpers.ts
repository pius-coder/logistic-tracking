import "server-only";

import { randomBytes } from "node:crypto";

export function createJourneyPublicToken() {
  return randomBytes(24).toString("base64url");
}

export function serializeJourney(journey: any, includePrivateEvents = false) {
  return {
    id: journey.id,
    requestId: journey.requestId,
    requestNumber: journey.request.requestNumber,
    publicToken: journey.publicToken,
    customerName:
      journey.request.user.displayName ??
      journey.request.user.businessName ??
      journey.request.user.username,
    recipientName: journey.request.recipientName,
    vehicleName: journey.vehicleName,
    transportType: journey.transportType,
    status: journey.status,
    averageSpeed: journey.averageSpeed,
    speedUnit: journey.speedUnit,
    publishedAt: journey.publishedAt?.toISOString() ?? null,
    startedAt: journey.startedAt?.toISOString() ?? null,
    completedAt: journey.completedAt?.toISOString() ?? null,
    latestMessage: journey.latestMessage,
    problemMessage: journey.problemMessage,
    updatedAt: journey.updatedAt.toISOString(),
    stops: [...journey.stops]
      .sort((a, b) => a.sequence - b.sequence)
      .map((stop) => ({
        id: stop.id,
        placeName: stop.placeName,
        placeLabel: stop.placeLabel,
        mapboxPlaceId: stop.mapboxPlaceId,
        latitude: stop.latitude,
        longitude: stop.longitude,
        stopType: stop.stopType,
        sequence: stop.sequence,
        estimatedArrivalAt: stop.estimatedArrivalAt?.toISOString() ?? null,
        reachedAt: stop.reachedAt?.toISOString() ?? null,
        note: stop.note,
      })),
    events: journey.events
      .filter((event) => includePrivateEvents || event.visibleToCustomer)
      .map((event) => ({
        id: event.id,
        eventType: event.eventType,
        title: event.title,
        message: event.message,
        createdAt: event.createdAt.toISOString(),
      })),
  };
}

export async function createJourneyNotification(
  tx: any,
  options: {
    request: { id: string; userId: string; requestNumber: string };
    type: "GENERAL" | "TRAJECTORY_UPDATED" | "REQUEST_STATUS_UPDATED";
    title: string;
    message: string;
    publicToken: string;
  },
) {
  await tx.jcNotification.create({
    data: {
      userId: options.request.userId,
      requestId: options.request.id,
      type: options.type,
      title: options.title,
      message: options.message,
      deepLink: `/voyage/${options.publicToken}`,
      whatsappMessage: `Suivi ${options.request.requestNumber}\n${options.title}\n${options.message}`,
    },
  });
}

export const journeyInclude = {
  request: {
    include: {
      user: true,
    },
  },
  stops: {
    orderBy: {
      sequence: "asc",
    },
  },
  events: {
    orderBy: {
      createdAt: "desc",
    },
  },
} as const;
