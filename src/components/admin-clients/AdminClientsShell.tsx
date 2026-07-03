"use client";

import { useState } from "react";
import { useAuraMutation, useAuraQuery } from "@/aura/client/hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus } from "lucide-react";

interface AdminUser {
  id: string;
  username: string;
  email: string | null;
  displayName: string | null;
  businessName: string | null;
  isAdmin: boolean;
  isBlocked: boolean;
  createdAt: string;
  _count?: { requests: number };
}

interface CreateUserInput {
  username: string;
  displayName: string;
  password: string;
  email?: string;
  businessName?: string;
  isAdmin: boolean;
}

const emptyForm: CreateUserInput = {
  username: "",
  displayName: "",
  password: "",
  email: "",
  businessName: "",
  isAdmin: false,
};

export function AdminClientsShell() {
  const { data, isLoading } = useAuraQuery<{ users: AdminUser[] }>("admin.users", { params: { limit: 100 } });
  const users = data?.users ?? [];
  const createUser = useAuraMutation<CreateUserInput, { id: string }>("admin.createUser", {
    invalidate: ["admin.users", "admin.dashboard"],
    refresh: true,
  });
  const [form, setForm] = useState<CreateUserInput>(emptyForm);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    createUser.mutate(form, { onSuccess: () => setForm(emptyForm) });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Ajouter un client manuellement</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Nom d&apos;utilisateur</Label>
              <Input value={form.username} onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label>Nom affiché</Label>
              <Input value={form.displayName} onChange={(event) => setForm((current) => ({ ...current, displayName: event.target.value }))} required />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Entreprise</Label>
              <Input value={form.businessName} onChange={(event) => setForm((current) => ({ ...current, businessName: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Mot de passe</Label>
              <Input type="password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} required minLength={8} />
            </div>
            <div className="flex items-end gap-3 pb-2">
              <Switch checked={form.isAdmin} onCheckedChange={(isAdmin) => setForm((current) => ({ ...current, isAdmin }))} />
              <Label>Administrateur</Label>
            </div>
            <div className="md:col-span-2">
              <Button type="submit" disabled={createUser.isPending}>
                <Plus className="mr-1 h-4 w-4" />
                Ajouter le client
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Clients</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <p className="text-sm text-muted-foreground">Chargement...</p> : (
            <Table>
              <TableHeader>
                <TableRow><TableHead>Client</TableHead><TableHead>Email</TableHead><TableHead>Demandes</TableHead><TableHead>Statut</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="font-medium">{user.displayName || user.username}</div>
                      <div className="text-xs text-muted-foreground">{user.businessName || user.username}</div>
                    </TableCell>
                    <TableCell>{user.email || "-"}</TableCell>
                    <TableCell>{user._count?.requests ?? 0}</TableCell>
                    <TableCell>{user.isBlocked ? "Bloqué" : user.isAdmin ? "Admin" : "Client"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
