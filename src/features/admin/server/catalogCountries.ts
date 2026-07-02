import "server-only";
import { defineOperationFn } from "@/aura/server/operation";

export const adminCatalogCountries = defineOperationFn("catalog.countries")
  .query()
  .entities(["Country"])
  .public()
  .handler(async ({ ctx }) => {
    const countries = await ctx.db.country.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, iso2: true, slug: true },
    });
    return { countries };
  });
