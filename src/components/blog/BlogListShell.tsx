import { callAuraServer } from "@/aura/server/call";
import { BlogListContent } from "./BlogListContent";
import type { BlogListData } from "./types";

/**
 * Server Shell — fetch initial dans la RSC, passé en `initialData` au Content
 * client. Aucun round-trip client au mount (pas de flash de skeleton) ; les
 * updates suivantes arrivent par le canal broadcast (TanStack Query auto-
 * invalidé par entité).
 */
export async function BlogListShell() {
  const initialData = await callAuraServer<BlogListData>({
    operationName: "blog.posts",
    source: "rsc",
  }).catch<BlogListData>(() => ({ posts: [] }));

  return <BlogListContent initialData={initialData} />;
}
