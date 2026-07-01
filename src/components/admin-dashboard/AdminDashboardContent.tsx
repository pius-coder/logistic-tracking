"use client";

import Link from "next/link";
import { useAuraQuery } from "@/aura/client";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getRequestStatusLabel } from "@/lib/displayLabels";
import {
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import type { AdminDashboardData } from "./AdminDashboardTypes";

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline" | "ghost"> = {
  EN_ATTENTE: "secondary",
  EN_COURS: "default",
  EN_PAUSE: "outline",
  PROBLEME: "destructive",
  TERMINE: "ghost",
  ANNULEE: "destructive",
};

export function AdminDashboardContent({ initialData }: { initialData: AdminDashboardData }) {
  const { data } = useAuraQuery<AdminDashboardData>("admin.dashboard", {
    initialData,
    staleTime: 15_000,
  });

  const value: AdminDashboardData = data ?? initialData;
  const { stats, recentPayments, recentRequests } = value;

  const revenueGrowth = stats.lastMonthRevenue > 0
    ? ((stats.monthlyRevenue - stats.lastMonthRevenue) / stats.lastMonthRevenue) * 100
    : 0;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-8 md:py-12">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Administration</p>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Tableau de bord</h1>
        </div>
        <Link className={buttonVariants({ variant: "outline" })} href="/dashboard">Dashboard</Link>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Demandes totales</CardDescription>
            <CardTitle className="text-2xl">{stats.totalRequests}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="rounded-md bg-secondary px-2 py-0.5">{stats.pendingRequests} en attente</span>
              <span className="rounded-md bg-primary/10 px-2 py-0.5 text-primary">{stats.activeRequests} en cours</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Clients inscrits</CardDescription>
            <CardTitle className="text-2xl">{stats.totalUsers}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{stats.totalProducts} produits · {stats.totalCategories} catégories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Chiffre ce mois (USD)</CardDescription>
            <CardTitle className="text-2xl">${stats.monthlyRevenue.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-xs">
              {revenueGrowth >= 0 ? (
                <>
                  <TrendingUp className="h-3 w-3 text-green-500" />
                  <span className="text-green-500">+{revenueGrowth.toFixed(1)}%</span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-3 w-3 text-red-500" />
                  <span className="text-red-500">{revenueGrowth.toFixed(1)}%</span>
                </>
              )}
              <span className="text-muted-foreground">vs mois dernier</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Demandes terminées</CardDescription>
            <CardTitle className="text-2xl">{stats.completedRequests}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{stats.totalCountries} pays desservis</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Demandes récentes</CardTitle>
          </CardHeader>
          <CardContent>
            {recentRequests.length === 0 ? (
              <p className="text-xs text-muted-foreground">Aucune demande récente.</p>
            ) : (
              <div className="space-y-3">
                {recentRequests.map((r) => (
                  <div key={r.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Link href={`/dashboard/admin/requests/${r.id}`} className="text-xs font-medium underline underline-offset-2 truncate">
                          {r.requestNumber}
                        </Link>
                        <Badge variant={statusVariant[r.status] || "outline"} className="text-[10px] px-1.5 py-0">
                          {getRequestStatusLabel(r.status)}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {r.userName || "—"} · {r.productName || "Transit"} · {r.destination || "—"}
                      </p>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-3">
              <Link href="/dashboard/admin/requests" className={buttonVariants({ variant: "outline", size: "sm" })}>
                Voir tout
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Paiements validés récents</CardTitle>
          </CardHeader>
          <CardContent>
            {recentPayments.length === 0 ? (
              <p className="text-xs text-muted-foreground">Aucun paiement récent.</p>
            ) : (
              <div className="space-y-3">
                {recentPayments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate">
                        {p.amountPaid.toLocaleString()} {p.currencyCode}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {p.userName || "—"} · {p.paymentMethodName || "—"} · {p.requestNumber || "—"}
                      </p>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-3">
              <Link href="/dashboard/admin/paiements" className={buttonVariants({ variant: "outline", size: "sm" })}>
                Voir tout
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
