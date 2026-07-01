import "server-only";
import { defineOperationFn } from "@/aura/server/operation";
import { z } from "zod";
import { requireAdmin } from "./common";

export const adminDeleteBlogPost = defineOperationFn("admin.deleteBlogPost")
  .mutate()
  .input(z.object({ id: z.string().min(1) }))
  .entities(["BlogPost"])
  .use(requireAdmin())
  .auth()
  .handler(async ({ ctx, input }) => {
    await ctx.db.blogPost.delete({ where: { id: input.id } });
    return { success: true };
  });
