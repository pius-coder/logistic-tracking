import { callAuraServer } from "@/aura/server/call";
import { BlogPostContent } from "./BlogPostContent";
import { BlogPostSkeleton } from "./BlogPostSkeleton";
import type { BlogPostData } from "./BlogPostTypes";

export async function BlogPostShell({ slug }: { slug: string }) {
  const initialData = await callAuraServer<BlogPostData>({
    operationName: "blog.postBySlug",
    params: { slug },
    source: "rsc",
  }).catch<BlogPostData>(() => ({ post: null }));

  if (!initialData.post) {
    return <BlogPostSkeleton />;
  }

  return <BlogPostContent initialData={initialData} params={{ slug }} />;
}
