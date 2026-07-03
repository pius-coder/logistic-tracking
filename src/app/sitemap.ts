import type { MetadataRoute } from "next";
import { callAuraServer } from "@/aura/server/call";

const BASE_URL = process.env.AURA_APP_URL || "https://jc-import-express.online";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/conditions-generales`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/confidentialite`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE_URL}/mentions-legales`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  ];

  const blogPages: MetadataRoute.Sitemap = [];
  const productPages: MetadataRoute.Sitemap = [];

  try {
    const data = await callAuraServer<{ posts: Array<{ slug: string; publishedAt: string }> }>({
      operationName: "blog.posts",
      source: "rsc",
    });
    if (data?.posts) {
      blogPages.push(...data.posts.map((post) => ({
        url: `${BASE_URL}/blog/${post.slug}`,
        lastModified: new Date(post.publishedAt || Date.now()),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })));
    }
  } catch {}

  try {
    const data = await callAuraServer<{ products: Array<{ slug: string; publishedAt: string | null }> }>({
      operationName: "catalog.products",
      source: "rsc",
    });
    if (data?.products) {
      productPages.push(...data.products.map((product) => ({
        url: `${BASE_URL}/produits/${product.slug}`,
        lastModified: new Date(product.publishedAt || Date.now()),
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })));
    }
  } catch {}

  return [
    ...staticPages,
    ...blogPages,
    ...productPages,
  ];
}
