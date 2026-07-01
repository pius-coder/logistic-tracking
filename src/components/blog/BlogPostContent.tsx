"use client";

import { notFound } from "next/navigation";
import { useAuraQuery } from "@/aura/client";
import { sanitizeBlogHtml } from "@/lib/html-sanitizer";
import { Calendar, User, BookOpen } from "lucide-react";
import type { BlogPostData, BlogPostParams } from "./BlogPostTypes";

export function BlogPostContent({ 
  initialData, 
  params 
}: { 
  initialData: BlogPostData; 
  params: BlogPostParams;
}) {
  const { data } = useAuraQuery<BlogPostData>("blog.postBySlug", {
    initialData,
    params,
    staleTime: 30_000,
  });

  const value: BlogPostData = data ?? initialData;
  
  if (!value.post) notFound();

  const post = value.post;

  return (
    <article>
      <header className="mb-8">
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground mb-3">
          <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-primary/10 text-primary font-bold"><BookOpen className="h-3 w-3" />{post.type === "ADVICE" ? "Conseil" : "Article"}</span>
          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : ""}</span>
          <span className="flex items-center gap-1"><User className="h-3 w-3" />{post.author}</span>
          {post.tags && <span className="text-[10px] px-2 py-0.5 rounded-md bg-secondary">{post.tags}</span>}
        </div>
        <h1 className="text-3xl font-black leading-tight tracking-tight sm:text-4xl">{post.title}</h1>
        {post.excerpt && <p className="mt-3 text-sm text-muted-foreground">{post.excerpt}</p>}
      </header>

      {post.imageUrl && (
        <div className="mb-8 rounded-lg overflow-hidden bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.imageUrl} alt={post.title} className="w-full h-auto object-cover max-h-96" />
        </div>
      )}

      <div className="prose prose-sm max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: sanitizeBlogHtml(post.content) }} />
    </article>
  );
}
