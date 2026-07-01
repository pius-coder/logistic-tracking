import Link from "next/link";
import { buildMetadata } from "@/lib/metadata";
import { BlogListShell } from "@/components/blog/BlogListShell";

export const metadata = buildMetadata({
  title: "Blog | JC Import Express — Guide Import-Export Afrique",
  description: "Conseils, guides et astuces pour importer vos produits en Afrique. Fret maritime, fret aérien, douane, et tout ce qu'il faut savoir.",
  path: "/blog",
});

export default async function BlogPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 md:py-16">
      <header className="mb-12">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Blog</p>
        <h1 className="mt-1 text-3xl font-black leading-tight tracking-tight sm:text-4xl">
          Guide Import-Export Afrique
        </h1>
        <p className="mt-3 text-sm text-muted-foreground max-w-2xl">
          Conseils pratiques, guides étape par étape et astuces pour importer vos produits en Afrique en toute sérénité.
        </p>
      </header>

      <BlogListShell />
    </main>
  );
}
