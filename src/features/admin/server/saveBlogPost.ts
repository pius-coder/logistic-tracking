import "server-only";
import { defineOperationFn } from "@/aura/server/operation";
import { saveBlogPostInputSchema } from "@/features/admin/shared/schemas";
import { requireAdmin } from "./common";
import { sanitizeBlogHtml } from "@/lib/html-sanitizer";

export const adminSaveBlogPost = defineOperationFn("admin.saveBlogPost")
  .mutate()
  .input(saveBlogPostInputSchema)
  .entities(["BlogPost"])
  .use(requireAdmin())
  .auth()
  .handler(async ({ ctx, input }) => {
    const { id, ...raw } = input;
    const data = { ...raw, content: sanitizeBlogHtml(raw.content) };
    if (id) {
      const updated = await ctx.db.blogPost.update({
        where: { id },
        data: {
          ...data,
          ...(data.published && !id ? { publishedAt: new Date() } : {}),
        },
      });
      return { id: updated.id };
    }
    const created = await ctx.db.blogPost.create({
      data: {
        ...data,
        excerpt: data.excerpt || "",
        tags: data.tags || "",
        metaTitle: data.metaTitle || "",
        metaDesc: data.metaDesc || "",
        publishedAt: data.published ? new Date() : null,
      },
    });
    return { id: created.id };
  });
