"use client";

import Link from "next/link";
import { useAuraQuery } from "@/aura/client";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getRequestStatusLabel } from "@/lib/displayLabels";
import type { AdminRequestListData, AdminRequestListParams } from "./types";

const statusVariant: Record<
  string,
  "default" | "secondary" | "destructive" | "outline" | "ghost"
> = {
  EN_ATTENTE: "secondary",
  EN_COURS: "default",
  EN_PAUSE: "outline",
  PROBLEME: "destructive",
  TERMINE: "ghost",
  ANNULEE: "destructive",
};

export function AdminRequestsContent({
  initialData,
  params,
}: {
  initialData: AdminRequestListData;
  params: AdminRequestListParams;
}) {
  const { data } = useAuraQuery<AdminRequestListData>("admin.requests", {
    initialData,
    params,
    staleTime: 15_000,
  });
  const value: AdminRequestListData = data ?? initialData;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Toutes les demandes</CardTitle>
      </CardHeader>
      <CardContent>
        {value.requests.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune demande.</p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N°</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Produit</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {value.requests.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <Link
                        href={`/dashboard/admin/requests/${r.id}`}
                        className="font-medium underline underline-offset-2"
                      >
                        {r.requestNumber}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {r.user.displayName ||
                        r.user.phoneIdentities[0]?.phoneE164 ||
                        "—"}
                    </TableCell>
                    <TableCell>{r.product?.name || "Transit"}</TableCell>
                    <TableCell>{r.destinationCountry?.name}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[r.status] || "outline"}>
                        {getRequestStatusLabel(r.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {value.totalPages > 1 && (
              <div className="mt-4 flex items-center gap-2">
                {Array.from({ length: value.totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <Link
                      key={p}
                      href={`/dashboard/admin/requests?page=${p}`}
                      className={buttonVariants({
                        variant: p === value.page ? "default" : "outline",
                        size: "sm",
                      })}
                    >
                      {p}
                    </Link>
                  ),
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
