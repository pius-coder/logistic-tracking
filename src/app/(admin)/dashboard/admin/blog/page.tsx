"use client";

import { useState } from "react";
import { useAuraMutation, useAuraQuery } from "@/aura/client/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import type { SaveBlogPostInput } from "@/features/admin/shared/schemas";

interface BlogPost {
  id: string; title: string; slug: string; excerpt: string;
  content: string; imageUrl: string | null; author: string;
  published: boolean; publishedAt: string | null;
  tags: string; createdAt: string;
  metaTitle: string; metaDesc: string; type: "BLOG" | "ADVICE";
}

export default function AdminBlogPage() {
  const { data, isLoading } = useAuraQuery("admin.blogPosts", { params: { limit: 100 } });
  const posts: BlogPost[] = (data as any)?.posts || [];

  const saveMutation = useAuraMutation<SaveBlogPostInput, { id: string }>("admin.saveBlogPost", {
    invalidate: ["admin.blogPosts"],
    refresh: true,
  });
  const deleteMutation = useAuraMutation<{ id: string }, { success: boolean }>("admin.deleteBlogPost", {
    invalidate: ["admin.blogPosts"],
    refresh: true,
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [author, setAuthor] = useState("JC Import Express");
  const [tags, setTags] = useState("");
  const [published, setPublished] = useState(false);
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDesc, setMetaDesc] = useState("");
  const [postType, setPostType] = useState<"BLOG" | "ADVICE">("BLOG");

  const openCreate = () => {
    setEditing(null);
    setTitle(""); setSlug(""); setContent(""); setExcerpt("");
    setImageUrl(""); setAuthor("JC Import Express"); setTags("");
    setPublished(false); setMetaTitle(""); setMetaDesc("");
    setPostType("BLOG");
    setDialogOpen(true);
  };

  const openEdit = (post: BlogPost) => {
    setEditing(post);
    setTitle(post.title); setSlug(post.slug); setContent(post.content);
    setExcerpt(post.excerpt); setImageUrl(post.imageUrl || "");
    setAuthor(post.author); setTags(post.tags);
    setPublished(post.published);     setMetaTitle(post.metaTitle); setMetaDesc(post.metaDesc);
    setPostType(post.type || "BLOG");
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: SaveBlogPostInput = {
      title, slug, content,
      excerpt: excerpt || undefined,
      imageUrl: imageUrl || null,
      author, tags, published,
      metaTitle: metaTitle || undefined,
      metaDesc: metaDesc || undefined,
      type: postType,
    };
    saveMutation.mutate(editing ? { id: editing.id, ...payload } : payload, {
      onSuccess: () => setDialogOpen(false),
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Supprimer cet article ?")) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-4 py-8 md:py-12">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Administration</p>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Blog</h1>
        </div>
        <Button size="sm" onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> Nouvel article</Button>
      </header>

      <Card>
        <CardHeader><CardTitle>Tous les articles</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <p className="text-sm text-muted-foreground">Chargement...</p> : posts.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun article.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow><TableHead>Titre</TableHead><TableHead>Slug</TableHead><TableHead>Auteur</TableHead><TableHead>Statut</TableHead><TableHead className="text-right">Actions</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium max-w-[200px] truncate">{p.title}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{p.slug}</TableCell>
                    <TableCell className="text-xs">{p.author}</TableCell>
                    <TableCell>
                      <span className={`text-[10px] px-2 py-0.5 rounded-md ${p.published ? "bg-secondary" : "bg-destructive/10 text-destructive"}`}>
                        {p.published ? "Publié" : "Brouillon"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="outline" size="sm" onClick={() => openEdit(p)}><Pencil className="h-3 w-3" /></Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(p.id)}><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Modifier" : "Nouvel"} article</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Titre *</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} required /></div>
              <div className="space-y-2"><Label>Slug *</Label><Input value={slug} onChange={(e) => setSlug(e.target.value)} required /></div>
            </div>
            <div className="space-y-2"><Label>Contenu * (HTML)</Label><Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={12} required /></div>
            <div className="space-y-2"><Label>Extrait</Label><Textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Image URL</Label><Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." /></div>
            </div>
            <div className="space-y-2"><Label>Tags (séparés par des virgules)</Label><Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="import, chine, douane" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type de contenu</Label>
                <select value={postType} onChange={(e) => setPostType(e.target.value as any)} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="BLOG">Article de Blog</option>
                  <option value="ADVICE">Conseil (guide)</option>
                </select>
              </div>
              <div className="space-y-2"><Label>Auteur</Label><Input value={author} onChange={(e) => setAuthor(e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Meta Title (SEO)</Label><Input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} /></div>
              <div className="space-y-2"><Label>Meta Description</Label><Input value={metaDesc} onChange={(e) => setMetaDesc(e.target.value)} /></div>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="pub" checked={published} onCheckedChange={setPublished} />
              <Label htmlFor="pub">Publié</Label>
            </div>
            <Button type="submit" disabled={saveMutation.isPending}>{saveMutation.isPending ? "..." : "Enregistrer"}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
