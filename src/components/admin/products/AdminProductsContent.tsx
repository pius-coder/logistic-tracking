"use client";

import Link from "next/link";
import { Pencil } from "lucide-react";
import { useAuraQuery } from "@/aura/client";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AdminProductListData, AdminProductListParams } from "./types";

export function AdminProductsContent({
  initialData,
  params,
}: {
  initialData: AdminProductListData;
  params: AdminProductListParams;
}) {
  const { data } = useAuraQuery<AdminProductListData>("admin.products", {
    initialData,
    params,
    staleTime: 15_000,
  });

  // With initialData, TanStack guarantees a value — narrow for TS.
  const productsData: AdminProductListData = data ?? initialData;
  const qsBase = new URLSearchParams();
  if (params.search) qsBase.set("search", params.search);
  if (params.categorySlug) qsBase.set("categorySlug", params.categorySlug);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tous les produits</CardTitle>
      </CardHeader>
      <CardContent>
        {productsData.products.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun produit.</p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Image</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Prix (USD)</TableHead>
                  <TableHead>Commandes</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productsData.products.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      {p.images[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.images[0].url}
                          alt=""
                          className="h-10 w-10 rounded-md object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-md bg-muted" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="text-xs">
                      {p.category?.name || "—"}
                    </TableCell>
                    <TableCell>${p.basePriceUsd.toLocaleString()}</TableCell>
                    <TableCell>{p._count.requests}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {!p.isActive && (
                          <Badge variant="destructive" className="text-[10px]">
                            Inactif
                          </Badge>
                        )}
                        {p.isFeatured && (
                          <Badge variant="default" className="text-[10px]">
                            Vedette
                          </Badge>
                        )}
                        {p.isActive && !p.isFeatured && (
                          <Badge variant="secondary" className="text-[10px]">
                            Actif
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/dashboard/admin/produits/${p.id}/modifier`}
                        className={buttonVariants({
                          variant: "outline",
                          size: "sm",
                        })}
                      >
                        <Pencil className="h-3 w-3 mr-1" /> Modifier
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {productsData.totalPages > 1 && (
              <div className="mt-4 flex items-center gap-2">
                {Array.from(
                  { length: productsData.totalPages },
                  (_, i) => i + 1,
                ).map((p) => {
                  const qs = new URLSearchParams(qsBase);
                  qs.set("page", String(p));
                  return (
                    <Link
                      key={p}
                      href={`/dashboard/admin/produits?${qs.toString()}`}
                      className={buttonVariants({
                        variant: p === productsData.page ? "default" : "outline",
                        size: "sm",
                      })}
                    >
                      {p}
                    </Link>
                  );
                })}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
