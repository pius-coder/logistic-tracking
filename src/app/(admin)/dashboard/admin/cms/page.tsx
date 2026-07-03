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
import { buttonVariants } from "@/components/ui/button";
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
  metadata: "SEO",
  header: "Header",
  hero: "Hero",
  products: "Produits",
  features: "Services",
  benefits: "À propos",
  faq: "FAQ",
  pricing: "Contact",
  blog: "Blog",
};

const SECTION_KEYS: Record<string, { key: string; label: string; rows?: number }[]> = {
  metadata: [
    { key: "homeTitle", label: "Titre SEO accueil" },
    { key: "homeDescription", label: "Description SEO accueil", rows: 3 },
    { key: "blogTitle", label: "Titre SEO blog" },
    { key: "blogDescription", label: "Description SEO blog", rows: 3 },
  ],
  header: [
    { key: "brandName", label: "Nom de marque" },
    { key: "phone", label: "Téléphone" },
    { key: "navLinks", label: "Navigation (JSON)", rows: 8 },
  ],
  hero: [
    { key: "badge", label: "Badge" },
    { key: "title", label: "Titre principal" },
    { key: "accent", label: "Titre secondaire" },
    { key: "description", label: "Description", rows: 3 },
    { key: "desktopImage", label: "Image desktop" },
    { key: "mobileImage", label: "Image mobile" },
    { key: "trackingPlaceholder", label: "Placeholder suivi" },
    { key: "trackingButton", label: "Bouton suivi" },
    { key: "stats", label: "Statistiques (JSON)", rows: 8 },
  ],
  products: [
    { key: "eyebrow", label: "Eyebrow" },
    { key: "title", label: "Titre" },
    { key: "accent", label: "Accent" },
    { key: "description", label: "Description", rows: 3 },
  ],
  features: [
    { key: "eyebrow", label: "Eyebrow" },
    { key: "title", label: "Titre" },
    { key: "accent", label: "Accent" },
    { key: "description", label: "Description", rows: 4 },
    { key: "stats", label: "Statistiques (JSON)", rows: 8 },
    { key: "services", label: "Services (JSON)", rows: 12 },
    { key: "trackingSteps", label: "Étapes suivi (JSON)", rows: 8 },
    { key: "testimonialEyebrow", label: "Eyebrow témoignages" },
    { key: "testimonialTitle", label: "Titre témoignages" },
    { key: "testimonialDescription", label: "Description témoignages", rows: 3 },
  ],
  benefits: [
    { key: "eyebrow", label: "Eyebrow" },
    { key: "title", label: "Titre" },
    { key: "accent", label: "Accent" },
    { key: "description", label: "Description", rows: 3 },
    { key: "items", label: "Valeurs (JSON)", rows: 10 },
  ],
  faq: [
    { key: "eyebrow", label: "Eyebrow" },
    { key: "title", label: "Titre" },
    { key: "description", label: "Description", rows: 3 },
    { key: "items", label: "Questions (JSON)", rows: 12 },
  ],
  pricing: [
    { key: "eyebrow", label: "Eyebrow" },
    { key: "title", label: "Titre" },
    { key: "description", label: "Description", rows: 3 },
    { key: "panelTitle", label: "Titre panneau" },
    { key: "panelDescription", label: "Description panneau", rows: 3 },
    { key: "addressLabel", label: "Label adresse" },
    { key: "address", label: "Adresse" },
    { key: "phoneLabel", label: "Label téléphone" },
    { key: "phone", label: "Téléphone" },
    { key: "emailLabel", label: "Label email" },
    { key: "email", label: "Email" },
    { key: "availabilityTitle", label: "Titre disponibilité" },
    { key: "availabilityBody", label: "Texte disponibilité", rows: 2 },
    { key: "formEyebrow", label: "Eyebrow formulaire" },
    { key: "formTitle", label: "Titre formulaire" },
    { key: "formDescription", label: "Description formulaire", rows: 3 },
    { key: "privacy", label: "Texte confidentialité", rows: 2 },
  ],
  blog: [
    { key: "eyebrow", label: "Eyebrow aperçu" },
    { key: "title", label: "Titre aperçu" },
    { key: "accent", label: "Accent aperçu" },
    { key: "description", label: "Description aperçu", rows: 3 },
    { key: "cta", label: "Bouton aperçu" },
    { key: "listEyebrow", label: "Eyebrow page blog" },
    { key: "listTitle", label: "Titre page blog" },
    { key: "listDescription", label: "Description page blog", rows: 3 },
  ],
};

export default function AdminCmsPage() {
  const { data, isLoading } = useAuraQuery<{ sections: Record<string, SiteContentItem[]> }>("admin.listSiteContent", {});
  const sections = useMemo(() => data?.sections ?? {}, [data?.sections]);

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
    const items: SaveSiteContentInput["items"] = [];
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
          <Link href="/?preview=true" target="_blank" className={buttonVariants({ variant: "outline", size: "sm" })}>
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
