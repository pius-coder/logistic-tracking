import "server-only";

import { randomBytes } from "node:crypto";
import { AuraError } from "@/aura/core/errors";
import { hashPassword } from "@/aura/server/auth/password";
import { defineOperationFn } from "@/aura/server/operation";
import {
  addShipmentStatusNoteInputSchema,
  createShipmentInputSchema,
  trackingShipmentsParamsSchema,
  updateShipmentInputSchema,
} from "@/features/admin/shared/tracking-schemas";
import type { RequestUncheckedUpdateInput, RequestWhereInput } from "@/generated/prisma/models/Request";
import { requireAdmin } from "./common";

const shipmentInclude = {
  user: {
    select: {
      id: true,
      username: true,
      displayName: true,
      businessName: true,
      email: true,
      phone: true,
      country: { select: { name: true, iso2: true } },
    },
  },
  originCountry: { select: { id: true, name: true, iso2: true } },
  destinationCountry: { select: { id: true, name: true, iso2: true } },
  statusEvents: { orderBy: { createdAt: "desc" } },
  jcNotifications: { orderBy: { createdAt: "desc" }, take: 8 },
  journey: {
    include: {
      stops: { orderBy: { sequence: "asc" } },
      events: { orderBy: { createdAt: "desc" } },
    },
  },
} as const;

type ShipmentUser = {
  id: string;
  username: string;
  displayName: string | null;
  businessName: string | null;
  email: string | null;
  phone: string | null;
  country: { name: string; iso2: string } | null;
};

type ShipmentJourneyStop = {
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

type ShipmentJourneyEvent = {
  id: string;
  eventType: string;
  title: string;
  message: string;
  visibleToCustomer: boolean;
  createdByLabel: string | null;
  createdAt: Date;
};

type ShipmentJourney = {
  id: string;
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
  stops: ShipmentJourneyStop[];
  events: ShipmentJourneyEvent[];
} | null;

type ShipmentStatusEvent = {
  id: string;
  status: string;
  problemType: string | null;
  title: string;
  message: string;
  createdByLabel: string | null;
  createdAt: Date;
};

type ShipmentNotification = {
  id: string;
  type: string;
  title: string;
  message: string;
  deepLink: string;
  isRead: boolean;
  createdAt: Date;
};

type ShipmentRecord = {
  id: string;
  requestNumber: string;
  createdAt: Date;
  updatedAt: Date;
  status: string;
  problemType: string | null;
  latestStatusMessage: string | null;
  needsRectification: boolean;
  transportMode: "AVION" | "BATEAU";
  recipientName: string;
  recipientPhone: string;
  deliveryAddress: string;
  city: string | null;
  region: string | null;
  packageWeightKg: number | null;
  packageVolumeM3: number | null;
  packageCount: number;
  productDescription: string;
  customerNotes: string | null;
  adminNotes: string | null;
  whatsappDiscussionLink: string | null;
  user: ShipmentUser;
  originCountry: { id: string; name: string; iso2: string } | null;
  destinationCountry: { id: string; name: string; iso2: string };
  journey: ShipmentJourney;
  statusEvents: ShipmentStatusEvent[];
  jcNotifications: ShipmentNotification[];
};

function cleanNullableString(value: string | null | undefined) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function clientName(user: {
  displayName: string | null;
  businessName: string | null;
  username: string;
}) {
  return user.displayName || user.businessName || user.username;
}

function serializeJourney(journey: ShipmentJourney) {
  if (!journey) return null;
  return {
    id: journey.id,
    publicToken: journey.publicToken,
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
    stops: journey.stops.map((stop) => ({
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
    events: journey.events.map((event) => ({
      id: event.id,
      eventType: event.eventType,
      title: event.title,
      message: event.message,
      visibleToCustomer: event.visibleToCustomer,
      createdByLabel: event.createdByLabel,
      createdAt: event.createdAt.toISOString(),
    })),
  };
}

function serializeShipment(request: ShipmentRecord) {
  return {
    id: request.id,
    requestNumber: request.requestNumber,
    createdAt: request.createdAt.toISOString(),
    updatedAt: request.updatedAt.toISOString(),
    status: request.status,
    problemType: request.problemType,
    latestStatusMessage: request.latestStatusMessage,
    needsRectification: request.needsRectification,
    transportMode: request.transportMode,
    recipientName: request.recipientName,
    recipientPhone: request.recipientPhone,
    deliveryAddress: request.deliveryAddress,
    city: request.city,
    region: request.region,
    packageWeightKg: request.packageWeightKg,
    packageVolumeM3: request.packageVolumeM3,
    packageCount: request.packageCount,
    productDescription: request.productDescription,
    customerNotes: request.customerNotes,
    adminNotes: request.adminNotes,
    whatsappDiscussionLink: request.whatsappDiscussionLink,
    user: {
      id: request.user.id,
      username: request.user.username,
      displayName: request.user.displayName,
      businessName: request.user.businessName,
      email: request.user.email,
      phone: request.user.phone,
      country: request.user.country,
      label: clientName(request.user),
    },
    originCountry: request.originCountry,
    destinationCountry: request.destinationCountry,
    journey: serializeJourney(request.journey),
    statusEvents: request.statusEvents.map((event) => ({
      id: event.id,
      status: event.status,
      problemType: event.problemType,
      title: event.title,
      message: event.message,
      createdByLabel: event.createdByLabel,
      createdAt: event.createdAt.toISOString(),
    })),
    notifications: request.jcNotifications.map((notification) => ({
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      deepLink: notification.deepLink,
      isRead: notification.isRead,
      createdAt: notification.createdAt.toISOString(),
    })),
  };
}

function buildSearchWhere(search: string | undefined): RequestWhereInput["OR"] | undefined {
  const value = search?.trim();
  if (!value) return undefined;

  return [
    { requestNumber: { contains: value, mode: "insensitive" } },
    { recipientName: { contains: value, mode: "insensitive" } },
    { recipientPhone: { contains: value, mode: "insensitive" } },
    { productDescription: { contains: value, mode: "insensitive" } },
    { user: { displayName: { contains: value, mode: "insensitive" } } },
    { user: { businessName: { contains: value, mode: "insensitive" } } },
    { user: { phone: { contains: value, mode: "insensitive" } } },
    { user: { username: { contains: value, mode: "insensitive" } } },
  ];
}

function makeRequestNumber() {
  const year = new Date().getFullYear().toString().slice(-2);
  const stamp = Date.now().toString().slice(-7);
  return `JC-${year}-${stamp}`;
}

function makeTemporaryPassword() {
  return `JC-${randomBytes(8).toString("base64url").slice(0, 10)}`;
}

function makeUsernameBase(clientName: string, clientPhone: string) {
  const namePart =
    clientName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 24) || "client";
  const phonePart = clientPhone.replace(/\D/g, "").slice(-8);
  return `client-${namePart}${phonePart ? `-${phonePart}` : ""}`.slice(0, 48);
}

export const adminTrackingDashboard = defineOperationFn("admin.trackingDashboard")
  .query()
  .entities(["Request", "Journey", "AuraUser", "Country"])
  .use(requireAdmin())
  .auth()
  .handler(async ({ ctx }) => {
    const [
      totalShipments,
      waitingPlanning,
      inTransit,
      paused,
      issues,
      completed,
      totalClients,
      plannedJourneys,
      recentShipments,
      attentionShipments,
    ] = await Promise.all([
      ctx.db.request.count(),
      ctx.db.request.count({ where: { status: "EN_ATTENTE" } }),
      ctx.db.request.count({ where: { status: "EN_COURS" } }),
      ctx.db.request.count({ where: { status: "EN_PAUSE" } }),
      ctx.db.request.count({ where: { status: "PROBLEME" } }),
      ctx.db.request.count({ where: { status: "TERMINE" } }),
      ctx.db.auraUser.count({ where: { deletedAt: null, isAdmin: false } }),
      ctx.db.journey.count({ where: { status: { in: ["PLANIFIE", "EN_COURS", "EN_PAUSE", "PROBLEME"] } } }),
      ctx.db.request.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
        include: shipmentInclude,
      }),
      ctx.db.request.findMany({
        where: { status: { in: ["PROBLEME", "EN_PAUSE"] } },
        orderBy: { updatedAt: "desc" },
        take: 6,
        include: shipmentInclude,
      }),
    ]);

    return {
      stats: {
        totalShipments,
        waitingPlanning,
        inTransit,
        paused,
        issues,
        completed,
        totalClients,
        plannedJourneys,
      },
      recentShipments: recentShipments.map(serializeShipment),
      attentionShipments: attentionShipments.map(serializeShipment),
    };
  });

export const adminTrackingShipments = defineOperationFn("admin.trackingShipments")
  .query()
  .params(trackingShipmentsParamsSchema)
  .entities(["Request", "Journey", "AuraUser", "Country"])
  .use(requireAdmin())
  .auth()
  .handler(async ({ ctx, params }) => {
    const where: RequestWhereInput = {};
    if (params.status) where.status = params.status;
    if (params.transportMode) where.transportMode = params.transportMode;
    const OR = buildSearchWhere(params.search);
    if (OR) where.OR = OR;

    const skip = (params.page - 1) * params.limit;
    const [requests, total] = await Promise.all([
      ctx.db.request.findMany({
        where,
        include: shipmentInclude,
        orderBy: { updatedAt: "desc" },
        skip,
        take: params.limit,
      }),
      ctx.db.request.count({ where }),
    ]);

    return {
      shipments: requests.map(serializeShipment),
      total,
      page: params.page,
      totalPages: Math.max(1, Math.ceil(total / params.limit)),
    };
  });

export const adminTrackingShipment = defineOperationFn("admin.trackingShipment")
  .query()
  .params(updateShipmentInputSchema.pick({ requestId: true }))
  .entities(["Request", "Journey", "JourneyStop", "JourneyEvent", "AuraUser", "Country"])
  .use(requireAdmin())
  .auth()
  .handler(async ({ ctx, params }) => {
    const request = await ctx.db.request.findUnique({
      where: { id: params.requestId },
      include: shipmentInclude,
    });

    if (!request) throw new AuraError("NOT_FOUND", "Colis introuvable.");
    return serializeShipment(request);
  });

export const adminCreateShipment = defineOperationFn("admin.createShipment")
  .mutate()
  .input(createShipmentInputSchema)
  .entities(["Request", "RequestStatusEvent", "JcNotification", "AuraUser"])
  .use(requireAdmin())
  .auth()
  .handler(async ({ ctx, input }) => {
    const clientEmail = cleanNullableString(input.clientEmail);
    const clientBusinessName = cleanNullableString(input.clientBusinessName);
    const originCountryId = cleanNullableString(input.originCountryId);
    const clientCountryId = originCountryId ?? input.destinationCountryId;

    if (clientEmail) {
      const existingEmailUser = await ctx.db.auraUser.findUnique({
        where: { email: clientEmail },
        select: { id: true },
      });
      if (existingEmailUser) {
        throw new AuraError("BAD_REQUEST", "Un client utilise déjà cet email.");
      }
    }

    const usernameBase = makeUsernameBase(input.clientName, input.clientPhone);
    let username = usernameBase;
    for (let attempt = 0; attempt < 25; attempt += 1) {
      const existingUsername = await ctx.db.auraUser.findUnique({
        where: { username },
        select: { id: true },
      });
      if (!existingUsername) break;
      username = `${usernameBase.slice(0, 43)}-${attempt + 2}`;
    }

    const temporaryPassword = makeTemporaryPassword();
    const passwordHash = await hashPassword(temporaryPassword);

    const result = await ctx.db.$transaction(async (tx) => {
      const user = await tx.auraUser.create({
        data: {
          username,
          displayName: input.clientName,
          phone: input.clientPhone,
          email: clientEmail,
          businessName: clientBusinessName,
          countryId: clientCountryId,
          currencyCode: null,
          isAdmin: false,
          onboardingCompleted: true,
          passwordCredential: {
            create: { passwordHash },
          },
        },
        select: {
          id: true,
          username: true,
          displayName: true,
          phone: true,
          email: true,
        },
      });

      const request = await tx.request.create({
        data: {
          requestNumber: makeRequestNumber(),
          type: "SHIPMENT",
          userId: user.id,
          originCountryId,
          destinationCountryId: input.destinationCountryId,
          recipientName: input.recipientName,
          recipientPhone: input.recipientPhone,
          deliveryAddress: input.deliveryAddress,
          city: cleanNullableString(input.city),
          region: cleanNullableString(input.region),
          packageWeightKg: input.packageWeightKg ?? null,
          packageVolumeM3: input.packageVolumeM3 ?? null,
          packageCount: input.packageCount,
          productDescription: input.productDescription,
          transportMode: input.transportMode,
          customerNotes: cleanNullableString(input.customerNotes),
          adminNotes: cleanNullableString(input.adminNotes),
          status: "EN_ATTENTE",
          latestStatusMessage: "Colis créé. Le trajet doit être préparé par l'administrateur.",
          statusEvents: {
            create: {
              status: "EN_ATTENTE",
              title: "Colis créé",
              message: "Le colis a été enregistré et attend la configuration du trajet.",
              createdByLabel: "Administrateur",
            },
          },
          jcNotifications: {
            create: {
              userId: user.id,
              type: "REQUEST_CREATED",
              title: "Colis enregistré",
              message: "Votre colis a été créé. Le trajet sera disponible après planification.",
              deepLink: "/voyage",
            },
          },
        },
        select: {
          id: true,
          requestNumber: true,
        },
      });

      return { user, request };
    });

    return {
      id: result.request.id,
      requestNumber: result.request.requestNumber,
      client: {
        username: result.user.username,
        temporaryPassword,
        displayName: result.user.displayName,
        phone: result.user.phone,
        email: result.user.email,
      },
    };
  });

export const adminUpdateShipment = defineOperationFn("admin.updateShipment")
  .mutate()
  .input(updateShipmentInputSchema)
  .entities(["Request"])
  .use(requireAdmin())
  .auth()
  .handler(async ({ ctx, input }) => {
    const request = await ctx.db.request.findUnique({
      where: { id: input.requestId },
      include: { journey: true },
    });
    if (!request) throw new AuraError("NOT_FOUND", "Colis introuvable.");

    if (
      input.transportMode &&
      input.transportMode !== request.transportMode &&
      request.journey &&
      !["BROUILLON"].includes(request.journey.status)
    ) {
      throw new AuraError("BAD_REQUEST", "Le mode ne peut plus changer après publication du trajet.");
    }

    const data: RequestUncheckedUpdateInput = {};
    if (input.originCountryId !== undefined) data.originCountryId = cleanNullableString(input.originCountryId);
    if (input.destinationCountryId !== undefined) data.destinationCountryId = input.destinationCountryId;
    if (input.recipientName !== undefined) data.recipientName = input.recipientName;
    if (input.recipientPhone !== undefined) data.recipientPhone = input.recipientPhone;
    if (input.deliveryAddress !== undefined) data.deliveryAddress = input.deliveryAddress;
    if (input.city !== undefined) data.city = cleanNullableString(input.city);
    if (input.region !== undefined) data.region = cleanNullableString(input.region);
    if (input.packageWeightKg !== undefined) data.packageWeightKg = input.packageWeightKg ?? null;
    if (input.packageVolumeM3 !== undefined) data.packageVolumeM3 = input.packageVolumeM3 ?? null;
    if (input.packageCount !== undefined) data.packageCount = input.packageCount;
    if (input.productDescription !== undefined) data.productDescription = input.productDescription;
    if (input.transportMode !== undefined) data.transportMode = input.transportMode;
    if (input.customerNotes !== undefined) data.customerNotes = cleanNullableString(input.customerNotes);
    if (input.adminNotes !== undefined) data.adminNotes = cleanNullableString(input.adminNotes);
    if (input.status !== undefined) data.status = input.status;
    if (input.problemType !== undefined) data.problemType = input.problemType;
    if (input.needsRectification !== undefined) data.needsRectification = input.needsRectification;

    await ctx.db.request.update({
      where: { id: input.requestId },
      data,
    });

    return { success: true };
  });

export const adminAddShipmentStatusNote = defineOperationFn("admin.addShipmentStatusNote")
  .mutate()
  .input(addShipmentStatusNoteInputSchema)
  .entities(["Request", "RequestStatusEvent", "JcNotification"])
  .use(requireAdmin())
  .auth()
  .handler(async ({ ctx, input }) => {
    const request = await ctx.db.request.findUnique({
      where: { id: input.requestId },
      select: { id: true, userId: true, requestNumber: true },
    });

    if (!request) throw new AuraError("NOT_FOUND", "Colis introuvable.");

    await ctx.db.$transaction(async (tx) => {
      await tx.request.update({
        where: { id: input.requestId },
        data: {
          status: input.status,
          problemType: input.status === "PROBLEME" ? input.problemType : null,
          latestStatusMessage: input.message,
          statusEvents: {
            create: {
              status: input.status,
              problemType: input.status === "PROBLEME" ? input.problemType : null,
              title: input.title,
              message: input.message,
              createdByLabel: "Administrateur",
            },
          },
        },
      });

      await tx.jcNotification.create({
        data: {
          userId: request.userId,
          requestId: request.id,
          type: "REQUEST_STATUS_UPDATED",
          title: input.title,
          message: input.message,
          deepLink: "/voyage",
        },
      });
    });

    return { success: true };
  });
