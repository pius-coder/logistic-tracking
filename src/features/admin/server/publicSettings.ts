import "server-only";

import { defineOperationFn } from "@/aura/server/operation";

export const publicGetWhatsAppNumber = defineOperationFn("public.getWhatsAppNumber")
  .query()
  .entities(["AppSettings"])
  .public()
  .handler(async ({ ctx }) => {
    const settings = await ctx.db.appSettings.findUnique({ where: { id: "default" } });
    return { number: settings?.adminWhatsAppNumber ?? null };
  });
