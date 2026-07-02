import Link from "next/link";
import { callAuraServer } from "@/aura/server/call";
import { buildMetadata } from "@/lib/metadata";
import { BlogPostShell } from "@/components/blog/BlogPostShell";
import { ArrowLeft } from "lucide-react";

interface BlogPost {
  id: string; title: string; slug: string; content: string;
  excerpt: string; imageUrl: string | null; author: string;
  published: boolean; publishedAt: string | null; tags: string;
  type: string; metaTitle: string; metaDesc: string;
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 md:py-16">
      <Link href="/blog" className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground mb-8">
        <ArrowLeft className="h-3 w-3" /> Retour au blog
      </Link>
      <BlogPostShell slug={slug} />
    </main>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<ReturnType<typeof buildMetadata>> {
  const { slug } = await params;
  const data = await callAuraServer<{ post: BlogPost | null }>({
    operationName: "blog.postBySlug",
    params: { slug },
    source: "rsc",
  }).catch(() => ({ post: null }));

  const post = data?.post;
  if (!post) return buildMetadata({ title: "Article | JC Import Express", description: "", path: `/blog/${slug}` });

  return buildMetadata({
    title: post.metaTitle || `${post.title} | JC Import Express`,
    description: post.metaDesc || post.excerpt || "",
    path: `/blog/${post.slug}`,
    image: post.imageUrl || undefined,
  });
}
