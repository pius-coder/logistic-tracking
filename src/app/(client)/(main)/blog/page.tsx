import { callAuraServer } from "@/aura/server/call";
import { buildMetadata } from "@/lib/metadata";
import { BlogListShell } from "@/components/blog/BlogListShell";
import type { SiteContentMap } from "@/features/site";
import { contentText } from "@/lib/site-content";

export async function generateMetadata() {
  const data = await callAuraServer<{ values: SiteContentMap }>({
    operationName: "site.content",
    params: { sections: ["metadata"] },
    source: "rsc",
  }).catch(() => ({ values: {} }));

  return buildMetadata({
    title: contentText(data.values, "metadata.blogTitle"),
    description: contentText(data.values, "metadata.blogDescription"),
    path: "/blog",
  });
}

export default async function BlogPage() {
  const data = await callAuraServer<{ values: SiteContentMap }>({
    operationName: "site.content",
    params: { sections: ["blog"] },
    source: "rsc",
  }).catch(() => ({ values: {} }));

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 md:py-16">
      <header className="mb-12">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          {contentText(data.values, "blog.listEyebrow")}
        </p>
        <h1 className="mt-1 text-3xl font-black leading-tight tracking-tight sm:text-4xl">
          {contentText(data.values, "blog.listTitle")}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground max-w-2xl">
          {contentText(data.values, "blog.listDescription")}
        </p>
      </header>

      <BlogListShell />
    </main>
  );
}
