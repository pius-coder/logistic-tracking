import "server-only";
import { defineOperationFn } from "@/aura/server/operation";
import type { BlogPostWhereInput } from "@/generated/prisma/models/BlogPost";
import { z } from "zod";
import { requireAdmin } from "./common";

export const adminBlogPosts = defineOperationFn("admin.blogPosts")
  .query()
  .params(z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(50),
    search: z.string().optional(),
  }))
  .entities(["BlogPost"])
  .use(requireAdmin())
  .auth()
  .handler(async ({ ctx, params }) => {
    const where: BlogPostWhereInput = {};
    if (params.search) {
      where.OR = [
        { title: { contains: params.search, mode: "insensitive" } },
      ];
    }
    const skip = (params.page - 1) * params.limit;
    const [posts, total] = await Promise.all([
      ctx.db.blogPost.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: params.limit,
      }),
      ctx.db.blogPost.count({ where }),
    ]);
    return { posts, total, page: params.page, totalPages: Math.ceil(total / params.limit) };
  });
