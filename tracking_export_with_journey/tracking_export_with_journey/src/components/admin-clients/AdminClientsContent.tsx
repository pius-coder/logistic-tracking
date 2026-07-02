"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuraQuery, useAuraMutation } from "@/aura/client";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Shield, Ban, CheckCircle, UserPlus } from "lucide-react";
import { toast } from "sonner";
import type { AdminClientsData, AdminClientsParams } from "./AdminClientsTypes";

export function AdminClientsContent({
  initialData,
  params,
}: {
  initialData: AdminClientsData;
  params: AdminClientsParams;
}) {
  const { data, refetch } = useAuraQuery<AdminClientsData>("admin.users", {
    initialData,
    params,
    staleTime: 15_000,
  });

  const value: AdminClientsData = data ?? initialData;
  const qsBase = new URLSearchParams();
  if (params.search) qsBase.set("search", params.search);

  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");

  const createMutation = useAuraMutation("admin.createUser");

  async function handleCreate() {
    try {
      await createMutation.mutateAsync({ username, displayName, password } as never);
      toast.success("Client créé avec succès.");
      setOpen(false);
      setUsername("");
      setDisplayName("");
      setPassword("");
      refetch();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erreur lors de la création.";
      toast.error(message);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-8 md:py-12">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Administration</p>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Clients</h1>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button><UserPlus className="h-4 w-4 mr-1.5" />Ajouter un client</Button>} />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nouveau client</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Identifiant</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ex: jean.dupont"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="displayName">Nom complet</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="ex: Jean Dupont"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 caractères"
                />
              </div>
              <Button
                className="w-full"
                onClick={handleCreate}
                disabled={createMutation.isPending || !username || !displayName || !password}
              >
                {createMutation.isPending ? "Création..." : "Créer le client"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
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
                    <TableHead>Pays</TableHead>
                    <TableHead>Suivis</TableHead>
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
