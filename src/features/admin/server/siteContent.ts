import "server-only";

import { defineOperationFn } from "@/aura/server/operation";
import {
  saveSiteContentInputSchema,
  publishSiteContentInputSchema,
  publishAllSiteContentInputSchema,
} from "@/features/admin/shared/schemas";
import { requireAdmin } from "./common";

export const adminListSiteContent = defineOperationFn("admin.listSiteContent")
  .query()
  .entities(["SiteContent"])
  .use(requireAdmin())
  .auth()
  .handler(async ({ ctx }) => {
    const items = await ctx.db.siteContent.findMany({
      where: { locale: "fr" },
      orderBy: [{ section: "asc" }, { sortOrder: "asc" }],
    });

    const grouped: Record<string, typeof items> = {};
    for (const item of items) {
      if (!grouped[item.section]) grouped[item.section] = [];
      grouped[item.section].push(item);
    }

    return { sections: grouped };
  });

export const adminSaveSiteContent = defineOperationFn("admin.saveSiteContent")
  .mutate()
  .input(saveSiteContentInputSchema)
  .entities(["SiteContent"])
  .use(requireAdmin())
  .auth()
  .handler(async ({ ctx, input }) => {
    for (const item of input.items) {
      await ctx.db.siteContent.upsert({
        where: { section_key_locale: { section: item.section, key: item.key, locale: "fr" } },
        create: {
          section: item.section,
          key: item.key,
          draftContent: item.draftContent,
          type: item.type || "text",
          sortOrder: item.sortOrder ?? 0,
        },
        update: { draftContent: item.draftContent },
      });
    }
    return { success: true };
  });

export const adminPublishSiteContent = defineOperationFn("admin.publishSiteContent")
  .mutate()
  .input(publishSiteContentInputSchema)
  .entities(["SiteContent"])
  .use(requireAdmin())
  .auth()
  .handler(async ({ ctx, input }) => {
    for (const id of input.ids) {
      const item = await ctx.db.siteContent.findUnique({ where: { id } });
      if (item) {
        await ctx.db.siteContent.update({
          where: { id },
          data: {
            publishedContent: item.draftContent,
            isPublished: true,
            publishedAt: new Date(),
          },
        });
      }
    }
    return { success: true };
  });

export const adminPublishAllSiteContent = defineOperationFn("admin.publishAllSiteContent")
  .mutate()
  .input(publishAllSiteContentInputSchema)
  .entities(["SiteContent"])
  .use(requireAdmin())
  .auth()
  .handler(async ({ ctx, input }) => {
    const where = input.section ? { section: input.section, locale: "fr" } : { locale: "fr" };
    const items = await ctx.db.siteContent.findMany({ where });
    for (const item of items) {
      await ctx.db.siteContent.update({
        where: { id: item.id },
        data: {
          publishedContent: item.draftContent,
          isPublished: true,
          publishedAt: new Date(),
        },
      });
    }
    return { success: true, count: items.length };
  });
