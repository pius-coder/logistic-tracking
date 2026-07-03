import "server-only";
import { defineOperationFn } from "@/aura/server/operation";
import type { BlogPostWhereInput } from "@/generated/prisma/models/BlogPost";
import { z } from "zod";

export const blogPosts = defineOperationFn("blog.posts")
  .query()
  .params(z.object({ type: z.enum(["BLOG", "ADVICE"]).optional() }).optional())
  .entities(["BlogPost"])
  .public()
  .handler(async ({ ctx, params }) => {
    const where: BlogPostWhereInput = { published: true };
    if (params?.type) where.type = params.type;
    const posts = await ctx.db.blogPost.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      select: {
        id: true, title: true, slug: true, excerpt: true,
        imageUrl: true, author: true, tags: true,
        publishedAt: true, createdAt: true,
      },
    });
    return { posts };
  });

export const blogPostBySlug = defineOperationFn("blog.postBySlug")
  .query()
  .params(z.object({ slug: z.string().min(1) }))
  .entities(["BlogPost"])
  .public()
  .handler(async ({ ctx, params }) => {
    const post = await ctx.db.blogPost.findUnique({
      where: { slug: params.slug, published: true },
    });
    return { post };
  });
