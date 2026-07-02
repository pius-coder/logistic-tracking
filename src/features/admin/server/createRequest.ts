import "server-only";

import { defineOperationFn } from "@/aura/server/operation";
import { z } from "zod";
import { requireAdmin } from "./common";

export const adminCreateRequest = defineOperationFn("admin.createRequest")
  .mutate()
  .input(z.object({
    userId: z.string().min(1),
    originCountryId: z.string().optional(),
    destinationCountryId: z.string().min(1),
    recipientName: z.string().min(1).max(100),
    recipientPhone: z.string().min(1).max(30),
    deliveryAddress: z.string().min(1).max(300),
    transportMode: z.enum(["AVION", "BATEAU"]),
    packageCount: z.number().int().positive().default(1),
  }))
  .entities(["Request", "AuraUser"])
  .use(requireAdmin())
  .auth()
  .handler(async ({ ctx, input }) => {
    const user = await ctx.db.auraUser.findUnique({ where: { id: input.userId } });
    if (!user) {
      throw new Error("Client introuvable.");
    }

    const count = await ctx.db.request.count();
    const requestNumber = `GI-${new Date().getFullYear().toString().slice(-2)}${String(count + 1).padStart(4, "0")}`;

    const request = await ctx.db.request.create({
      data: {
        requestNumber,
        type: "SHIPMENT",
        userId: input.userId,
        originCountryId: input.originCountryId ?? null,
        destinationCountryId: input.destinationCountryId,
        recipientName: input.recipientName,
        recipientPhone: input.recipientPhone,
        deliveryAddress: input.deliveryAddress,
        transportMode: input.transportMode,
        packageCount: input.packageCount,
        status: "EN_ATTENTE",
        statusEvents: {
          create: {
            status: "EN_ATTENTE",
            title: "Suivi créé",
            message: "Le suivi a été initialisé par l'équipe JC Import Express.",
            createdByLabel: "Administrateur",
          },
        },
      },
    });

    return { id: request.id, requestNumber: request.requestNumber };
  });
