import "server-only";

import { defineOperationFn } from "@/aura/server/operation";
import {
  deleteProductInputSchema,
  saveProductInputSchema,
} from "@/features/admin/shared/schemas";
import { requireAdmin } from "./common";

export const adminProducts = defineOperationFn("admin.products")
  .query()
  .entities(["Product", "ProductTestimonial"])
  .use(requireAdmin())
  .auth()
  .handler(async ({ ctx }) => {
    const products = await ctx.db.product.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      include: {
        _count: { select: { testimonials: true } },
      },
    });

    return { products };
  });

export const adminSaveProduct = defineOperationFn("admin.saveProduct")
  .mutate()
  .input(saveProductInputSchema)
  .entities(["Product"])
  .use(requireAdmin())
  .auth()
  .handler(async ({ ctx, input }) => {
    const { id, isPublished, ...data } = input;
    const publishedAt = isPublished ? new Date() : null;

    if (id) {
      const updated = await ctx.db.product.update({
        where: { id },
        data: {
          ...data,
          isPublished,
          publishedAt,
        },
      });
      return { id: updated.id };
    }

    const created = await ctx.db.product.create({
      data: {
        ...data,
        isPublished,
        publishedAt,
      },
    });

    return { id: created.id };
  });

export const adminDeleteProduct = defineOperationFn("admin.deleteProduct")
  .mutate()
  .input(deleteProductInputSchema)
  .entities(["Product", "ProductTestimonial"])
  .use(requireAdmin())
  .auth()
  .handler(async ({ ctx, input }) => {
    await ctx.db.product.delete({ where: { id: input.id } });
    return { success: true };
  });
