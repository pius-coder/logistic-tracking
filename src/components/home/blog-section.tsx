import { callAuraServer } from "@/aura/server/call";
import Link from "next/link";
import { Calendar, User, ArrowUpRight, BookOpen } from "lucide-react";
import type { BlogPreviewContent } from "./types";

interface BlogListItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  imageUrl: string | null;
  author: string;
  tags: string;
  type: string;
  publishedAt: string | null;
  createdAt: string;
}

export async function BlogSection({ content }: { content: BlogPreviewContent }) {
  const { posts } = await callAuraServer<{ posts: BlogListItem[] }>({
    operationName: "blog.posts",
    source: "rsc",
  }).catch(() => ({ posts: [] }));

  if (posts.length === 0) return null;

  const latest = posts.slice(0, 3);

  return (
    <section className="relative flex w-full flex-col items-center justify-start overflow-clip bg-[#f7f7f7] py-20">
      <div className="relative z-[3] flex w-full max-w-[430px] flex-col items-center justify-center gap-16 px-5 min-[810px]:max-w-none min-[810px]:px-10 min-[1200px]:max-w-[1200px]">
        <div className="flex w-full max-w-[390px] flex-col items-center gap-5 text-center min-[810px]:max-w-[600px]">
          <span className="font-display text-sm font-semibold tracking-[-0.02em] text-amber-500">
            {content.eyebrow}
          </span>
          <h2 className="font-display text-[38px] font-bold leading-[38px] tracking-[-1.9px] text-black min-[810px]:text-5xl min-[810px]:leading-[48px] min-[1200px]:text-[60px] min-[1200px]:leading-[60px]">
            {content.title} <span className="text-[#006fff]">{content.accent}</span>
          </h2>
          <p className="font-display text-[16px] leading-[22.4px] tracking-[-0.16px] text-black/60 min-[810px]:text-lg">
            {content.description}
          </p>
        </div>

        <div className="grid w-full max-w-[390px] grid-cols-1 gap-5 min-[810px]:max-w-none min-[810px]:grid-cols-3">
          {latest.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group flex flex-col gap-6 rounded-[24px] bg-white p-8 transition-all hover:shadow-lg"
            >
              <div className="flex items-center gap-2 text-[11px] text-black/50">
                <span className="inline-flex items-center gap-1 rounded-md bg-[#006fff]/10 px-2 py-0.5 text-[10px] font-bold text-[#006fff]">
                  <BookOpen className="size-3" />
                  {post.type === "ADVICE" ? "Conseil" : "Article"}
                </span>
                {post.publishedAt && (
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3" />
                    {new Date(post.publishedAt).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                )}
              </div>
              <h3 className="font-display text-[20px] font-bold leading-[24px] tracking-[-1px] text-black group-hover:text-[#006fff] transition-colors">
                {post.title}
              </h3>
              {post.excerpt && (
                <p className="font-display text-[13px] leading-[18px] tracking-[-0.13px] text-black/60 flex-1 line-clamp-3">
                  {post.excerpt}
                </p>
              )}
              <div className="flex items-center justify-between mt-auto">
                <span className="flex items-center gap-1 text-[11px] text-black/50">
                  <User className="size-3" />
                  {post.author}
                </span>
                <span className="flex items-center gap-1 text-[12px] font-semibold text-[#006fff] opacity-0 group-hover:opacity-100 transition-opacity">
                  Lire <ArrowUpRight className="size-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        <Link
          href="/blog"
          className="inline-flex items-center justify-center gap-2 rounded-[16px] bg-[#006fff] px-8 py-4 font-display text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
        >
          {content.cta} <ArrowUpRight className="size-4" />
        </Link>
      </div>
    </section>
  );
}
