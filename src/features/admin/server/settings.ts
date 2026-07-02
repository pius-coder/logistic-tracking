import "server-only";

import { defineOperationFn } from "@/aura/server/operation";
import { updateSettingsInputSchema } from "@/features/admin/shared/schemas";
import { requireAdmin } from "./common";

export const adminGetSettings = defineOperationFn("admin.getSettings")
  .query()
  .entities(["AppSettings"])
  .use(requireAdmin())
  .auth()
  .handler(async ({ ctx }) => {
    const settings = await ctx.db.appSettings.findUnique({ where: { id: "default" } });
    return { settings };
  });

export const adminUpdateSettings = defineOperationFn("admin.updateSettings")
  .mutate()
  .input(updateSettingsInputSchema)
  .entities(["AppSettings"])
  .use(requireAdmin())
  .auth()
  .handler(async ({ ctx, input }) => {
    const settings = await ctx.db.appSettings.upsert({
      where: { id: "default" },
      create: { id: "default", ...input },
      update: input,
    });
    return { settings };
  });
