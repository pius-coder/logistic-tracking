"use client";

import { useAuraQuery } from "@/aura/client/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type AccountData = {
  user: {
    username: string;
    email: string | null;
    displayName: string | null;
    businessName: string | null;
    isAdmin: boolean;
  };
};

export function CompteShell() {
  const { data, isLoading } = useAuraQuery<AccountData>("auth.me", {});
  const user = data?.user;

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-8">
      <div>
        <p className="text-sm font-medium text-muted-foreground">Compte</p>
        <h1 className="text-2xl font-semibold tracking-tight">Informations personnelles</h1>
      </div>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">{isLoading ? "Chargement..." : user?.displayName || user?.username || "Compte"}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm md:grid-cols-2">
          <Info label="Identifiant" value={user?.username ?? "-"} />
          <Info label="Email" value={user?.email ?? "-"} />
          <Info label="Entreprise" value={user?.businessName ?? "-"} />
          <Info label="Rôle" value={user?.isAdmin ? "Administrateur" : "Client"} />
        </CardContent>
      </Card>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
