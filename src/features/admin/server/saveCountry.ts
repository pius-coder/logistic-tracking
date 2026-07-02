import "server-only";

import { defineOperationFn } from "@/aura/server/operation";
import { saveCountryInputSchema } from "@/features/admin/shared/schemas";
import { requireAdmin } from "./common";

export const adminSaveCountry = defineOperationFn("admin.saveCountry")
  .mutate()
  .input(saveCountryInputSchema)
  .entities(["Country"])
  .use(requireAdmin())
  .auth()
  .handler(async ({ ctx, input }) => {
    const { id, ...data } = input;
    const updated = await ctx.db.country.update({ where: { id }, data });
    return { id: updated.id };
  });
