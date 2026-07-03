"use client";

import { useState } from "react";
import { useAuraMutation, useAuraQuery } from "@/aura/client/hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import type {
  DeleteProductInput,
  DeleteProductTestimonialInput,
  SaveProductInput,
  SaveProductTestimonialInput,
} from "@/features/admin/shared/schemas";
import { Pencil, Plus, Trash2 } from "lucide-react";

interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  imageUrl: string;
  gallery: string[];
  priceXaf: number;
  likes: number;
  features: string[];
  isPublished: boolean;
  sortOrder: number;
  _count?: { testimonials: number };
}

interface AdminTestimonial {
  id: string;
  productId: string | null;
  name: string;
  advice: string;
  star: number;
  showOnLanding: boolean;
  isPublished: boolean;
  sortOrder: number;
  product: { id: string; name: string; slug: string } | null;
}

const emptyProduct: SaveProductInput = {
  name: "",
  slug: "",
  shortDescription: "",
  fullDescription: "",
  imageUrl: "",
  gallery: [],
  priceXaf: 0,
  likes: 0,
  features: [],
  isPublished: false,
  sortOrder: 0,
};

const emptyTestimonial: SaveProductTestimonialInput = {
  productId: null,
  name: "",
  advice: "",
  star: 5,
  showOnLanding: false,
  isPublished: true,
  sortOrder: 0,
};

function lines(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function linesText(value: string[] | undefined): string {
  return (value ?? []).join("\n");
}

export default function AdminProductsPage() {
  const { data: productsData, isLoading: productsLoading } = useAuraQuery<{ products: AdminProduct[] }>("admin.products", {});
  const { data: testimonialsData, isLoading: testimonialsLoading } = useAuraQuery<{ testimonials: AdminTestimonial[] }>("admin.productTestimonials", {});
  const products = productsData?.products ?? [];
  const testimonials = testimonialsData?.testimonials ?? [];

  const saveProduct = useAuraMutation<SaveProductInput, { id: string }>("admin.saveProduct", {
    invalidate: ["admin.products", "catalog.products", "catalog.productSlugs"],
    refresh: true,
  });
  const deleteProduct = useAuraMutation<DeleteProductInput, { success: boolean }>("admin.deleteProduct", {
    invalidate: ["admin.products", "admin.productTestimonials", "catalog.products"],
    refresh: true,
  });
  const saveTestimonial = useAuraMutation<SaveProductTestimonialInput, { id: string }>("admin.saveProductTestimonial", {
    invalidate: ["admin.productTestimonials", "catalog.products", "catalog.landingTestimonials"],
    refresh: true,
  });
  const deleteTestimonial = useAuraMutation<DeleteProductTestimonialInput, { success: boolean }>("admin.deleteProductTestimonial", {
    invalidate: ["admin.productTestimonials", "catalog.products", "catalog.landingTestimonials"],
    refresh: true,
  });

  const [productForm, setProductForm] = useState<SaveProductInput>(emptyProduct);
  const [testimonialForm, setTestimonialForm] = useState<SaveProductTestimonialInput>(emptyTestimonial);
  const [galleryText, setGalleryText] = useState("");
  const [featuresText, setFeaturesText] = useState("");

  const resetProduct = () => {
    setProductForm(emptyProduct);
    setGalleryText("");
    setFeaturesText("");
  };

  const editProduct = (product: AdminProduct) => {
    setProductForm({
      id: product.id,
      name: product.name,
      slug: product.slug,
      shortDescription: product.shortDescription,
      fullDescription: product.fullDescription,
      imageUrl: product.imageUrl,
      gallery: product.gallery,
      priceXaf: product.priceXaf,
      likes: product.likes,
      features: product.features,
      isPublished: product.isPublished,
      sortOrder: product.sortOrder,
    });
    setGalleryText(linesText(product.gallery));
    setFeaturesText(linesText(product.features));
  };

  const editTestimonial = (testimonial: AdminTestimonial) => {
    setTestimonialForm({
      id: testimonial.id,
      productId: testimonial.productId,
      name: testimonial.name,
      advice: testimonial.advice,
      star: testimonial.star,
      showOnLanding: testimonial.showOnLanding,
      isPublished: testimonial.isPublished,
      sortOrder: testimonial.sortOrder,
    });
  };

  const submitProduct = (event: React.FormEvent) => {
    event.preventDefault();
    saveProduct.mutate(
      {
        ...productForm,
        gallery: lines(galleryText),
        features: lines(featuresText),
      },
      { onSuccess: resetProduct },
    );
  };

  const submitTestimonial = (event: React.FormEvent) => {
    event.preventDefault();
    saveTestimonial.mutate(testimonialForm, {
      onSuccess: () => setTestimonialForm(emptyTestimonial),
    });
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-8 md:py-12">
      <header>
        <p className="text-sm font-medium text-muted-foreground">Administration</p>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Produits & témoignages</h1>
      </header>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <CardTitle>{productForm.id ? "Modifier le produit" : "Nouveau produit"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submitProduct} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Nom</Label>
                  <Input value={productForm.name} onChange={(event) => setProductForm((current) => ({ ...current, name: event.target.value }))} required />
                </div>
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input value={productForm.slug} onChange={(event) => setProductForm((current) => ({ ...current, slug: event.target.value }))} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description courte</Label>
                <Textarea value={productForm.shortDescription ?? ""} onChange={(event) => setProductForm((current) => ({ ...current, shortDescription: event.target.value }))} rows={2} />
              </div>
              <div className="space-y-2">
                <Label>Description complète</Label>
                <Textarea value={productForm.fullDescription ?? ""} onChange={(event) => setProductForm((current) => ({ ...current, fullDescription: event.target.value }))} rows={6} />
              </div>
              <div className="space-y-2">
                <Label>Image principale</Label>
                <Input value={productForm.imageUrl ?? ""} onChange={(event) => setProductForm((current) => ({ ...current, imageUrl: event.target.value }))} placeholder="/images/warehouse.jpg" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Galerie (une URL par ligne)</Label>
                  <Textarea value={galleryText} onChange={(event) => setGalleryText(event.target.value)} rows={5} />
                </div>
                <div className="space-y-2">
                  <Label>Caractéristiques (une par ligne)</Label>
                  <Textarea value={featuresText} onChange={(event) => setFeaturesText(event.target.value)} rows={5} />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>Prix XAF</Label>
                  <Input type="number" min={0} value={productForm.priceXaf} onChange={(event) => setProductForm((current) => ({ ...current, priceXaf: Number(event.target.value) }))} />
                </div>
                <div className="space-y-2">
                  <Label>Likes</Label>
                  <Input type="number" min={0} value={productForm.likes} onChange={(event) => setProductForm((current) => ({ ...current, likes: Number(event.target.value) }))} />
                </div>
                <div className="space-y-2">
                  <Label>Ordre</Label>
                  <Input type="number" value={productForm.sortOrder} onChange={(event) => setProductForm((current) => ({ ...current, sortOrder: Number(event.target.value) }))} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={productForm.isPublished} onCheckedChange={(isPublished) => setProductForm((current) => ({ ...current, isPublished }))} />
                <Label>Publié</Label>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={saveProduct.isPending}>
                  <Plus className="mr-1 h-4 w-4" />
                  {productForm.id ? "Mettre à jour" : "Ajouter"}
                </Button>
                {productForm.id && <Button type="button" variant="outline" onClick={resetProduct}>Annuler</Button>}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{testimonialForm.id ? "Modifier le témoignage" : "Nouveau témoignage"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submitTestimonial} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Nom</Label>
                  <Input value={testimonialForm.name} onChange={(event) => setTestimonialForm((current) => ({ ...current, name: event.target.value }))} required />
                </div>
                <div className="space-y-2">
                  <Label>Produit</Label>
                  <select
                    value={testimonialForm.productId ?? ""}
                    onChange={(event) => setTestimonialForm((current) => ({ ...current, productId: event.target.value || null }))}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="">Aucun produit spécifique</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>{product.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Avis / conseil</Label>
                <Textarea value={testimonialForm.advice} onChange={(event) => setTestimonialForm((current) => ({ ...current, advice: event.target.value }))} rows={5} required />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label>Étoiles</Label>
                  <Input type="number" min={1} max={5} value={testimonialForm.star} onChange={(event) => setTestimonialForm((current) => ({ ...current, star: Number(event.target.value) }))} />
                </div>
                <div className="space-y-2">
                  <Label>Ordre</Label>
                  <Input type="number" value={testimonialForm.sortOrder} onChange={(event) => setTestimonialForm((current) => ({ ...current, sortOrder: Number(event.target.value) }))} />
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <Switch checked={testimonialForm.showOnLanding} onCheckedChange={(showOnLanding) => setTestimonialForm((current) => ({ ...current, showOnLanding }))} />
                  Landing page
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Switch checked={testimonialForm.isPublished} onCheckedChange={(isPublished) => setTestimonialForm((current) => ({ ...current, isPublished }))} />
                  Publié
                </label>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={saveTestimonial.isPending}>
                  <Plus className="mr-1 h-4 w-4" />
                  {testimonialForm.id ? "Mettre à jour" : "Ajouter"}
                </Button>
                {testimonialForm.id && <Button type="button" variant="outline" onClick={() => setTestimonialForm(emptyTestimonial)}>Annuler</Button>}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Produits</CardTitle></CardHeader>
        <CardContent>
          {productsLoading ? <p className="text-sm text-muted-foreground">Chargement...</p> : (
            <Table>
              <TableHeader>
                <TableRow><TableHead>Produit</TableHead><TableHead>Prix</TableHead><TableHead>Statut</TableHead><TableHead>Avis</TableHead><TableHead className="text-right">Actions</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell><div className="font-medium">{product.name}</div><div className="text-xs text-muted-foreground">{product.slug}</div></TableCell>
                    <TableCell>{product.priceXaf.toLocaleString("fr-FR")} XAF</TableCell>
                    <TableCell>{product.isPublished ? "Publié" : "Brouillon"}</TableCell>
                    <TableCell>{product._count?.testimonials ?? 0}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => editProduct(product)}><Pencil className="h-3 w-3" /></Button>
                      <Button variant="destructive" size="sm" onClick={() => deleteProduct.mutate({ id: product.id })}><Trash2 className="h-3 w-3" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Témoignages</CardTitle></CardHeader>
        <CardContent>
          {testimonialsLoading ? <p className="text-sm text-muted-foreground">Chargement...</p> : (
            <Table>
              <TableHeader>
                <TableRow><TableHead>Nom</TableHead><TableHead>Produit</TableHead><TableHead>Étoiles</TableHead><TableHead>Landing</TableHead><TableHead className="text-right">Actions</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {testimonials.map((testimonial) => (
                  <TableRow key={testimonial.id}>
                    <TableCell><div className="font-medium">{testimonial.name}</div><div className="max-w-xs truncate text-xs text-muted-foreground">{testimonial.advice}</div></TableCell>
                    <TableCell>{testimonial.product?.name ?? "Global"}</TableCell>
                    <TableCell>{testimonial.star}/5</TableCell>
                    <TableCell>{testimonial.showOnLanding ? "Oui" : "Non"}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => editTestimonial(testimonial)}><Pencil className="h-3 w-3" /></Button>
                      <Button variant="destructive" size="sm" onClick={() => deleteTestimonial.mutate({ id: testimonial.id })}><Trash2 className="h-3 w-3" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
