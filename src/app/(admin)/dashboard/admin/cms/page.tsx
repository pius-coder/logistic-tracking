"use client";

import { useState, useMemo } from "react";
import { useAuraMutation, useAuraQuery } from "@/aura/client/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Send, Eye } from "lucide-react";
import Link from "next/link";
import type { SaveSiteContentInput, PublishAllSiteContentInput } from "@/features/admin/shared/schemas";

interface SiteContentItem {
  id: string;
  section: string;
  key: string;
  draftContent: string;
  publishedContent: string;
  isPublished: boolean;
  publishedAt: string | null;
  type: string;
}

const SECTION_LABELS: Record<string, string> = {
  hero: "Hero (Bannière)",
  parcours: "Parcours client",
  transit: "Section Transit",
  sections: "Titres de section",
};

const SECTION_KEYS: Record<string, { key: string; label: string; rows?: number }[]> = {
  hero: [
    { key: "title", label: "Titre principal" },
    { key: "subtitle", label: "Sous-titre", rows: 3 },
    { key: "ctaCatalog", label: "Bouton Catalogue" },
    { key: "ctaRequests", label: "Bouton Demandes" },
    { key: "ctaTransit", label: "Bouton Transit" },
  ],
  parcours: [
    { key: "title", label: "Titre du bloc" },
    { key: "step1", label: "Étape 1" },
    { key: "step2", label: "Étape 2" },
    { key: "step3", label: "Étape 3" },
    { key: "step4", label: "Étape 4" },
  ],
  transit: [
    { key: "title", label: "Titre" },
    { key: "description", label: "Description", rows: 4 },
    { key: "feature1", label: "Feature 1" },
    { key: "feature2", label: "Feature 2" },
    { key: "feature3", label: "Feature 3" },
    { key: "feature4", label: "Feature 4" },
    { key: "cta", label: "Bouton CTA" },
  ],
  sections: [
    { key: "categoriesTitle", label: "Titre catégories" },
    { key: "productsTitle", label: "Titre produits" },
    { key: "countriesTitle", label: "Titre pays" },
  ],
};

export default function AdminCmsPage() {
  const { data, isLoading } = useAuraQuery("admin.listSiteContent", {});
  const sections: Record<string, SiteContentItem[]> = (data as any)?.sections || {};

  const saveMutation = useAuraMutation<SaveSiteContentInput, { success: true }>("admin.saveSiteContent", {
    invalidate: ["admin.listSiteContent", "catalog.homeData"],
    refresh: true,
  });
  const publishMutation = useAuraMutation<PublishAllSiteContentInput, { success: true; count: number }>("admin.publishAllSiteContent", {
    invalidate: ["admin.listSiteContent", "catalog.homeData"],
    refresh: true,
  });

  const [drafts, setDrafts] = useState<Record<string, Record<string, string>>>({});
  const [activeTab, setActiveTab] = useState("hero");

  const getDraft = (section: string, key: string, item?: SiteContentItem) => {
    return drafts[section]?.[key] ?? item?.draftContent ?? "";
  };

  const setDraft = (section: string, key: string, value: string) => {
    setDrafts((prev) => ({ ...prev, [section]: { ...prev[section], [key]: value } }));
  };

  const hasChanges = useMemo(() => {
    for (const [section, keys] of Object.entries(drafts)) {
      for (const [key, value] of Object.entries(keys)) {
        const item = sections[section]?.find((i) => i.key === key);
        if (item && value !== item.draftContent) return true;
        if (!item && value) return true;
      }
    }
    return false;
  }, [drafts, sections]);

  const handleSave = () => {
    const items: any[] = [];
    for (const [section, keys] of Object.entries(drafts)) {
      for (const [key, draftContent] of Object.entries(keys)) {
        items.push({ section, key, draftContent });
      }
    }
    if (items.length > 0) {
      saveMutation.mutate({ items });
    }
  };

  const handlePublishSection = (section: string) => {
    publishMutation.mutate({ section });
  };

  if (isLoading) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-4 py-8 md:py-12">
        <p className="text-sm text-muted-foreground">Chargement...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-4 py-8 md:py-12">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Administration</p>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">CMS · Contenu du site</h1>
        </div>
        <div className="flex gap-2">
          <Link href="/?preview=true" target="_blank" className={ButtonVariants({ variant: "outline", size: "sm" })}>
            <Eye className="h-4 w-4 mr-1" /> Prévisualiser
          </Link>
          <Button size="sm" onClick={handleSave} disabled={!hasChanges || saveMutation.isPending}>
            <Save className="h-4 w-4 mr-1" /> Enregistrer brouillon
          </Button>
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap h-auto">
          {Object.keys(SECTION_KEYS).map((section) => (
            <TabsTrigger key={section} value={section}>{SECTION_LABELS[section]}</TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(SECTION_KEYS).map(([section, keys]) => {
          const sectionItems = sections[section] || [];
          const allPublished = sectionItems.length > 0 && sectionItems.every((i) => i.isPublished);
          const hasDraftChanges = keys.some(({ key }) => {
            const item = sectionItems.find((i) => i.key === key);
            const draft = getDraft(section, key, item);
            return item ? draft !== item.draftContent : !!draft;
          });

          return (
            <TabsContent key={section} value={section}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-base">{SECTION_LABELS[section]}</CardTitle>
                  <div className="flex items-center gap-2">
                    {hasDraftChanges && <Badge variant="secondary" className="text-[10px]">Brouillon modifié</Badge>}
                    <Button
                      size="sm"
                      variant={allPublished ? "outline" : "default"}
                      onClick={() => handlePublishSection(section)}
                      disabled={publishMutation.isPending}
                    >
                      <Send className="h-3 w-3 mr-1" />
                      {allPublished ? "Republier" : "Publier"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {keys.map(({ key, label, rows }) => {
                    const item = sectionItems.find((i) => i.key === key);
                    const draft = getDraft(section, key, item);
                    const isModified = item ? draft !== item.draftContent : !!draft;
                    const isPublished = item?.isPublished && item?.publishedContent === draft;

                    return (
                      <div key={key} className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <Label className="text-xs font-medium">{label}</Label>
                          {isModified && <Badge variant="outline" className="text-[10px] px-1.5 py-0">Modifié</Badge>}
                          {isPublished && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Publié</Badge>}
                        </div>
                        {rows ? (
                          <Textarea
                            value={draft}
                            onChange={(e) => setDraft(section, key, e.target.value)}
                            rows={rows}
                            className="text-sm"
                          />
                        ) : (
                          <Input
                            value={draft}
                            onChange={(e) => setDraft(section, key, e.target.value)}
                            className="text-sm"
                          />
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </main>
  );
}

function ButtonVariants({ variant, size }: { variant?: string; size?: string }) {
  return `inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 ${
    variant === "outline" ? "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground" : "bg-primary text-primary-foreground shadow hover:bg-primary/90"
  } ${size === "sm" ? "h-6 rounded-md px-3 text-xs" : "h-9 px-4 py-2"}`;
}
