import "server-only";

import { z } from "zod";
import { defineOperationFn } from "@/aura/server/operation";
import type { ProductTestimonialView, ProductView } from "@/features/catalog/types";

type ProductRecord = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  imageUrl: string;
  gallery: string[];
  priceXaf: number;
  likes: number;
  features: string[];
  isPublished: boolean;
  sortOrder: number;
  publishedAt: Date | null;
  testimonials: Array<{
    id: string;
    name: string;
    advice: string;
    star: number;
    showOnLanding: boolean;
    productId: string | null;
  }>;
};

function toTestimonialView(testimonial: ProductRecord["testimonials"][number]): ProductTestimonialView {
  return {
    id: testimonial.id,
    name: testimonial.name,
    advice: testimonial.advice,
    star: Math.max(1, Math.min(5, testimonial.star)),
    showOnLanding: testimonial.showOnLanding,
    productId: testimonial.productId,
  };
}

function toProductView(product: ProductRecord): ProductView {
  const testimonials = product.testimonials.map(toTestimonialView);
  const averageRating = testimonials.length
    ? testimonials.reduce((total, testimonial) => total + testimonial.star, 0) / testimonials.length
    : 0;

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    shortDescription: product.shortDescription,
    fullDescription: product.fullDescription,
    imageUrl: product.imageUrl,
    gallery: product.gallery,
    priceXaf: product.priceXaf,
    likes: product.likes,
    features: product.features,
    isPublished: product.isPublished,
    sortOrder: product.sortOrder,
    publishedAt: product.publishedAt?.toISOString() ?? null,
    testimonials,
    averageRating,
    testimonialCount: testimonials.length,
  };
}

const productInclude = {
  testimonials: {
    where: { isPublished: true },
    orderBy: [{ sortOrder: "asc" as const }, { createdAt: "desc" as const }],
    select: {
      id: true,
      name: true,
      advice: true,
      star: true,
      showOnLanding: true,
      productId: true,
    },
  },
};

export const catalogProducts = defineOperationFn("catalog.products")
  .query()
  .entities(["Product", "ProductTestimonial"])
  .public()
  .handler(async ({ ctx }) => {
    const products = await ctx.db.product.findMany({
      where: { isPublished: true },
      include: productInclude,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });

    return { products: products.map((product) => toProductView(product)) };
  });

export const catalogProductBySlug = defineOperationFn("catalog.productBySlug")
  .query()
  .params(z.object({ slug: z.string().min(1) }))
  .entities(["Product", "ProductTestimonial"])
  .public()
  .handler(async ({ ctx, params }) => {
    const product = await ctx.db.product.findFirst({
      where: { slug: params.slug, isPublished: true },
      include: productInclude,
    });

    return { product: product ? toProductView(product) : null };
  });

export const catalogProductSlugs = defineOperationFn("catalog.productSlugs")
  .query()
  .entities(["Product"])
  .public()
  .handler(async ({ ctx }) => {
    const products = await ctx.db.product.findMany({
      where: { isPublished: true },
      select: { slug: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });

    return { slugs: products.map((product) => product.slug) };
  });

export const catalogLandingTestimonials = defineOperationFn("catalog.landingTestimonials")
  .query()
  .entities(["ProductTestimonial"])
  .public()
  .handler(async ({ ctx }) => {
    const testimonials = await ctx.db.productTestimonial.findMany({
      where: { isPublished: true, showOnLanding: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      select: {
        id: true,
        name: true,
        advice: true,
        star: true,
        showOnLanding: true,
        productId: true,
      },
    });

    return { testimonials: testimonials.map(toTestimonialView) };
  });
