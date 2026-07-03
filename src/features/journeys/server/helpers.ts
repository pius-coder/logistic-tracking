import "server-only";

import { randomBytes } from "node:crypto";

type SerializableJourneyStop = {
  id: string;
  placeName: string;
  placeLabel: string | null;
  mapboxPlaceId: string | null;
  latitude: number;
  longitude: number;
  stopType: string;
  sequence: number;
  estimatedArrivalAt: Date | null;
  reachedAt: Date | null;
  note: string | null;
};

type SerializableJourneyEvent = {
  id: string;
  eventType: string;
  title: string;
  message: string;
  visibleToCustomer: boolean;
  createdAt: Date;
};

type SerializableJourney = {
  id: string;
  requestId: string;
  publicToken: string;
  vehicleName: string;
  transportType: string;
  status: string;
  averageSpeed: number | null;
  speedUnit: string | null;
  publishedAt: Date | null;
  startedAt: Date | null;
  completedAt: Date | null;
  latestMessage: string | null;
  problemMessage: string | null;
  updatedAt: Date;
  request: {
    requestNumber: string;
    recipientName: string;
    recipientPhone: string;
    transportMode: "AVION" | "BATEAU";
    productDescription: string;
    packageWeightKg: number | null;
    packageVolumeM3: number | null;
    packageCount: number;
    user: {
      displayName: string | null;
      businessName: string | null;
      username: string;
    };
    originCountry: { id: string; name: string; iso2: string } | null;
    destinationCountry: { id: string; name: string; iso2: string } | null;
  };
  stops: SerializableJourneyStop[];
  events: SerializableJourneyEvent[];
};

type NotificationTransaction = {
  jcNotification: {
    create(args: {
      data: {
        userId: string;
        requestId: string;
        type: "GENERAL" | "TRAJECTORY_UPDATED" | "REQUEST_STATUS_UPDATED";
        title: string;
        message: string;
        deepLink: string;
        whatsappMessage: string;
      };
    }): Promise<unknown>;
  };
};

export function createJourneyPublicToken() {
  return randomBytes(24).toString("base64url");
}

export function serializeJourney(journey: SerializableJourney, includePrivateEvents = false) {
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
    recipientPhone: journey.request.recipientPhone,
    transportMode: journey.request.transportMode,
    productDescription: journey.request.productDescription,
    packageWeightKg: journey.request.packageWeightKg,
    packageVolumeM3: journey.request.packageVolumeM3,
    packageCount: journey.request.packageCount,
    originCountry: journey.request.originCountry
      ? {
          id: journey.request.originCountry.id,
          name: journey.request.originCountry.name,
          iso2: journey.request.originCountry.iso2,
        }
      : null,
    destinationCountry: journey.request.destinationCountry
      ? {
          id: journey.request.destinationCountry.id,
          name: journey.request.destinationCountry.name,
          iso2: journey.request.destinationCountry.iso2,
        }
      : null,
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
  tx: NotificationTransaction,
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
      originCountry: { select: { id: true, name: true, iso2: true } },
      destinationCountry: { select: { id: true, name: true, iso2: true } },
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
