import "server-only";

import { defineOperationFn } from "@/aura/server/operation";
import {
  deleteProductTestimonialInputSchema,
  saveProductTestimonialInputSchema,
} from "@/features/admin/shared/schemas";
import { requireAdmin } from "./common";

export const adminProductTestimonials = defineOperationFn("admin.productTestimonials")
  .query()
  .entities(["ProductTestimonial", "Product"])
  .use(requireAdmin())
  .auth()
  .handler(async ({ ctx }) => {
    const testimonials = await ctx.db.productTestimonial.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      include: {
        product: { select: { id: true, name: true, slug: true } },
      },
    });

    return { testimonials };
  });

export const adminSaveProductTestimonial = defineOperationFn("admin.saveProductTestimonial")
  .mutate()
  .input(saveProductTestimonialInputSchema)
  .entities(["ProductTestimonial", "Product"])
  .use(requireAdmin())
  .auth()
  .handler(async ({ ctx, input }) => {
    const { id, ...data } = input;

    if (id) {
      const updated = await ctx.db.productTestimonial.update({
        where: { id },
        data,
      });
      return { id: updated.id };
    }

    const created = await ctx.db.productTestimonial.create({ data });
    return { id: created.id };
  });

export const adminDeleteProductTestimonial = defineOperationFn("admin.deleteProductTestimonial")
  .mutate()
  .input(deleteProductTestimonialInputSchema)
  .entities(["ProductTestimonial"])
  .use(requireAdmin())
  .auth()
  .handler(async ({ ctx, input }) => {
    await ctx.db.productTestimonial.delete({ where: { id: input.id } });
    return { success: true };
  });
