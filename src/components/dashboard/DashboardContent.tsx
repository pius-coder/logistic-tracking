"use client";

import Link from "next/link";
import { useAuraQuery } from "@/aura/client";
import { CurrentUserCard, LogoutButton } from "@/aura/auth/components/forms";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardData } from "./DashboardTypes";

export function DashboardContent({ initialData }: { initialData: DashboardData }) {
  const { data } = useAuraQuery<DashboardData>("auth.me", {
    initialData,
    staleTime: 15_000,
  });

  const value: DashboardData = data ?? initialData;
  const user = value.user;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-4 py-12">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Tableau de bord</h1>
          <p className="text-sm text-muted-foreground">Bienvenue, {user.displayName || "Utilisateur"}</p>
        </div>
        <div className="flex gap-2">
          <Link className={buttonVariants({ variant: "outline" })} href="/account/security">Sécurité</Link>
          <LogoutButton />
        </div>
      </header>

      <CurrentUserCard />

      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/catalogue">
          <Card className="transition-colors hover:bg-muted/50">
            <CardHeader><CardTitle>Catalogue</CardTitle><CardDescription>Parcourir les produits disponibles</CardDescription></CardHeader>
          </Card>
        </Link>
        <Link href="/mes-demandes">
          <Card className="transition-colors hover:bg-muted/50">
            <CardHeader><CardTitle>Mes demandes</CardTitle><CardDescription>Suivre mes commandes en cours</CardDescription></CardHeader>
          </Card>
        </Link>
        {user.isAdmin && (
          <Link href="/dashboard/admin">
            <Card className="transition-colors hover:bg-muted/50 border-primary/30">
              <CardHeader><CardTitle>Administration</CardTitle><CardDescription>Gérer les demandes, utilisateurs et trajectoires</CardDescription></CardHeader>
            </Card>
          </Link>
        )}
      </div>
    </main>
  );
}
