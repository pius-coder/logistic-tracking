import "server-only";

import { z } from "zod";
import { defineOperationFn } from "@/aura/server/operation";

export type SiteContentMap = Record<string, string>;

export const siteContent = defineOperationFn("site.content")
  .query()
  .params(z.object({ sections: z.array(z.string().min(1)).optional() }).optional())
  .entities(["SiteContent"])
  .public()
  .handler(async ({ ctx, params }) => {
    const items = await ctx.db.siteContent.findMany({
      where: {
        locale: "fr",
        isPublished: true,
        ...(params?.sections?.length ? { section: { in: params.sections } } : {}),
      },
      orderBy: [{ section: "asc" }, { sortOrder: "asc" }],
    });

    const values: SiteContentMap = {};
    const sections: Record<string, SiteContentMap> = {};

    for (const item of items) {
      const value = item.publishedContent || item.value || "";
      values[`${item.section}.${item.key}`] = value;
      sections[item.section] ??= {};
      sections[item.section][item.key] = value;
    }

    return { values, sections };
  });
