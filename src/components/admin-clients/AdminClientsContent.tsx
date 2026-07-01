"use client";

import Link from "next/link";
import { useAuraQuery } from "@/aura/client";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, ShieldOff, Ban, CheckCircle } from "lucide-react";
import type { AdminClientsData, AdminClientsParams } from "./AdminClientsTypes";

export function AdminClientsContent({ 
  initialData, 
  params 
}: { 
  initialData: AdminClientsData; 
  params: AdminClientsParams;
}) {
  const { data } = useAuraQuery<AdminClientsData>("admin.users", {
    initialData,
    params,
    staleTime: 15_000,
  });

  const value: AdminClientsData = data ?? initialData;
  const qsBase = new URLSearchParams();
  if (params.search) qsBase.set("search", params.search);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-8 md:py-12">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Administration</p>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Clients</h1>
        </div>
      </header>

      <Card>
        <CardHeader><CardTitle>Tous les clients</CardTitle></CardHeader>
        <CardContent>
          {value.users.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun client.</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Téléphone</TableHead>
                    <TableHead>Pays</TableHead>
                    <TableHead>Demandes</TableHead>
                    <TableHead>Inscription</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {value.users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <Link href={`/dashboard/admin/clients/${u.id}`} className="font-medium underline underline-offset-2">
                          {u.displayName || u.businessName || "—"}
                        </Link>
                      </TableCell>
                      <TableCell className="text-xs">{u.phoneIdentities[0]?.phoneE164 || "—"}</TableCell>
                      <TableCell className="text-xs">{u.country?.name || "—"}</TableCell>
                      <TableCell>{u._count.requests}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{new Date(u.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {u.isAdmin && <Badge variant="default" className="text-[10px]"><Shield className="h-3 w-3 mr-0.5" />Admin</Badge>}
                          {u.isBlocked && <Badge variant="destructive" className="text-[10px]"><Ban className="h-3 w-3 mr-0.5" />Bloqué</Badge>}
                          {!u.onboardingCompleted && <Badge variant="outline" className="text-[10px]">Onboarding</Badge>}
                          {!u.isAdmin && !u.isBlocked && <Badge variant="secondary" className="text-[10px]"><CheckCircle className="h-3 w-3 mr-0.5" />Actif</Badge>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Link href={`/dashboard/admin/clients/${u.id}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
                          Voir
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {value.totalPages > 1 && (
                <div className="mt-4 flex items-center gap-2">
                  {Array.from({ length: value.totalPages }, (_, i) => i + 1).map((p) => {
                    const qs = new URLSearchParams(qsBase);
                    qs.set("page", String(p));
                    return (
                      <Link
                        key={p}
                        href={`/dashboard/admin/clients?${qs.toString()}`}
                        className={buttonVariants({ variant: p === value.page ? "default" : "outline", size: "sm" })}
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
    </main>
  );
}
