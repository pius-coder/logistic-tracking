import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { callAuraServer } from "@/aura/server/call";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AdminClientDetail {
  id: string;
  displayName: string | null;
  businessName: string | null;
  isAdmin: boolean;
  isBlocked: boolean;
  onboardingCompleted: boolean;
  createdAt: string;
  country: { name: string } | null;
  _count: { requests: number };
}

async function ClientContent({ id }: { id: string }) {
  let user: AdminClientDetail;
  try {
    user = await callAuraServer<AdminClientDetail>({
      operationName: "admin.userById",
      params: { id },
      source: "rsc",
    });
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {user.displayName || "Utilisateur"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {user.businessName && <>{user.businessName} · </>}
            Inscrit le {new Date(user.createdAt).toLocaleDateString("fr-FR")}
          </p>
        </div>
        <Link
          href="/dashboard/admin/clients"
          className={buttonVariants({ variant: "outline" })}
        >
          Retour
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Statut</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              {user.isBlocked ? (
                <Badge variant="destructive">Bloqué</Badge>
              ) : user.isAdmin ? (
                <Badge>Admin</Badge>
              ) : (
                <Badge variant="secondary">
                  {user.onboardingCompleted ? "Actif" : "Onboarding"}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {user._count.requests} demande(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Contact</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            {user.country && <p className="text-muted-foreground">{user.country.name}</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ClientSkeleton() {
  return (
    <div className="mx-auto w-full max-w-3xl p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-7 w-48 animate-pulse rounded bg-muted" />
          <div className="h-4 w-32 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-9 w-24 animate-pulse rounded-md bg-muted" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-lg border bg-card p-6 space-y-3">
            <div className="h-5 w-16 animate-pulse rounded bg-muted" />
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="h-4 w-full animate-pulse rounded bg-muted" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function AdminClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <Suspense fallback={<ClientSkeleton />}>
      <ClientContent id={id} />
    </Suspense>
  );
}
