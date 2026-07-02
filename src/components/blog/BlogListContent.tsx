"use client";

import Link from "next/link";
import { Calendar, User, ArrowUpRight, BookOpen } from "lucide-react";
import { useAuraQuery } from "@/aura/client";
import { BlogListData } from "./types";

export function BlogListContent({ initialData }: { initialData: BlogListData }) {
  // Live-updating client query: seeded synchronously with the server fetch,
  // auto-invalidated by the Aura broadcast channel when any BlogPost mutates.
  const { data } = useAuraQuery<BlogListData>("blog.posts", {
    initialData,
    staleTime: 30_000,
  });

  const posts = data?.posts ?? [];

  if (posts.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-sm text-muted-foreground">
          Aucun article pour le moment. Revenez bientôt !
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-8 sm:grid-cols-2">
      {posts.map((post) => (
        <Link key={post.id} href={`/blog/${post.slug}`} className="group block">
          <article className="rounded-lg border bg-card p-6 transition-colors hover:bg-muted/50 h-full flex flex-col">
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground mb-3">
              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-primary/10 text-primary font-bold">
                <BookOpen className="h-3 w-3" />
                {post.type === "ADVICE" ? "Conseil" : "Article"}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {post.publishedAt
                  ? new Date(post.publishedAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : ""}
              </span>
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {post.author}
              </span>
            </div>
            <h2 className="text-lg font-bold tracking-tight group-hover:underline mb-2">
              {post.title}
            </h2>
            {post.excerpt && (
              <p className="text-sm text-muted-foreground flex-1">{post.excerpt}</p>
            )}
            <div className="flex items-center gap-1 text-xs font-medium text-primary mt-4">
              Lire l&apos;article <ArrowUpRight className="h-3 w-3" />
            </div>
          </article>
        </Link>
      ))}
    </div>
  );
}
