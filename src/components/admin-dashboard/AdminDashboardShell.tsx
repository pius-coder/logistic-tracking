"use client";

import type { ElementType } from "react";
import Link from "next/link";
import { useAuraQuery } from "@/aura/client/hooks";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { JOURNEY_STATUS_LABELS } from "@/components/journeys/shared/route-utils";
import {
  AlertTriangle,
  Clock3,
  Package,
  PauseCircle,
  Plane,
  Ship,
  ShipWheel,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardData {
  stats: {
    totalShipments: number;
    waitingPlanning: number;
    inTransit: number;
    paused: number;
    issues: number;
    completed: number;
    totalClients: number;
    plannedJourneys: number;
  };
  recentShipments: DashboardShipment[];
  attentionShipments: DashboardShipment[];
}

interface DashboardShipment {
  id: string;
  requestNumber: string;
  status: string;
  transportMode: "AVION" | "BATEAU";
  productDescription: string;
  packageWeightKg: number | null;
  packageVolumeM3: number | null;
  user: { label: string };
  destinationCountry: { name: string } | null;
  journey: { status: string; vehicleName: string } | null;
  updatedAt?: string;
}

const SHIPMENT_STATUS_LABELS: Record<string, string> = {
  EN_ATTENTE: "À planifier",
  EN_COURS: "En route",
  EN_PAUSE: "En pause",
  PROBLEME: "Incident",
  TERMINE: "Terminé",
  ANNULEE: "Annulé",
};

function formatRelative(isoDate?: string): string | null {
  if (!isoDate) return null;
  const diff = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 2) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days}j`;
}

function shipmentStatusTone(status: string): "destructive" | "secondary" | "outline" {
  if (status === "PROBLEME") return "destructive";
  if (status === "EN_PAUSE") return "outline";
  return "secondary";
}

export function AdminDashboardShell() {
  const { data, isLoading } = useAuraQuery<DashboardData>("admin.trackingDashboard", {});
  const stats = data?.stats;

  return (
    <section className="space-y-6 px-4 py-6 md:px-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Pilotage tracking</p>
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
            Tableau de bord admin
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard/admin/requests/nouveau" className={buttonVariants({ size: "lg" })}>
            <Package className="h-4 w-4" />
            Nouveau colis
          </Link>
          <Link
            href="/dashboard/admin/requests"
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            <ShipWheel className="h-4 w-4" />
            Gérer tracking
          </Link>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric title="Colis total" value={stats?.totalShipments} loading={isLoading} icon={Package} />
        <Metric title="En transit" value={stats?.inTransit} loading={isLoading} icon={ShipWheel} />
        <Metric
          title="Incidents"
          value={stats?.issues}
          loading={isLoading}
          icon={AlertTriangle}
          tone="danger"
        />
        <Metric title="Clients" value={stats?.totalClients} loading={isLoading} icon={Users} />
      </div>

      {/* Alerte incidents */}
      {(stats?.issues ?? 0) > 0 && (
        <div className="flex items-center gap-3 rounded-md border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>
            <strong>{stats?.issues}</strong> colis en incident — action requise.
          </span>
          <Link
            href="/dashboard/admin/requests?status=PROBLEME"
            className="ml-auto font-medium underline underline-offset-2"
          >
            Voir
          </Link>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Colis récents</CardTitle>
            <Badge variant="outline">{stats?.waitingPlanning ?? 0} à planifier</Badge>
          </CardHeader>
          <CardContent className="space-y-2">
            {(data?.recentShipments ?? []).map((shipment) => (
              <ShipmentRow key={shipment.id} shipment={shipment} />
            ))}
            {!isLoading && (data?.recentShipments.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun colis enregistré.</p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">À traiter</CardTitle>
            <Badge variant={(stats?.issues ?? 0) > 0 ? "destructive" : "secondary"}>
              {(stats?.issues ?? 0) + (stats?.paused ?? 0)}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-2">
            {(data?.attentionShipments ?? []).map((shipment) => (
              <ShipmentRow key={shipment.id} shipment={shipment} compact />
            ))}
            {!isLoading && (data?.attentionShipments.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground">Aucun incident ni trajet en pause.</p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function Metric({
  title,
  value,
  loading,
  icon: Icon,
  tone = "default",
}: {
  title: string;
  value: number | undefined;
  loading: boolean;
  icon: ElementType;
  tone?: "default" | "danger";
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon
          className={cn("h-4 w-4 text-muted-foreground", tone === "danger" && "text-destructive")}
        />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{loading ? "..." : (value ?? 0)}</div>
      </CardContent>
    </Card>
  );
}

function ShipmentRow({
  shipment,
  compact = false,
}: {
  shipment: DashboardShipment;
  compact?: boolean;
}) {
  const TransportIcon = shipment.transportMode === "AVION" ? Plane : Ship;
  const relative = formatRelative(shipment.updatedAt);
  const statusLabel = SHIPMENT_STATUS_LABELS[shipment.status] ?? shipment.status;
  const journeyLabel = shipment.journey
    ? (JOURNEY_STATUS_LABELS[shipment.journey.status] ?? shipment.journey.status)
    : null;

  return (
    <Link
      href={`/dashboard/admin/requests/${shipment.id}`}
      className="flex items-center justify-between gap-3 rounded-md border bg-background px-3 py-3 transition-colors hover:bg-muted/60"
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">{shipment.requestNumber}</span>
          <Badge variant={shipmentStatusTone(shipment.status)}>{statusLabel}</Badge>
          {journeyLabel ? <Badge variant="outline">{journeyLabel}</Badge> : null}
        </div>
        <p className="mt-1 truncate text-xs text-muted-foreground">
          {shipment.user.label} · {shipment.destinationCountry?.name ?? "Destination non définie"}
          {relative ? ` · ${relative}` : ""}
        </p>
        {!compact ? (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {shipment.productDescription || "Colis"} · {shipment.packageWeightKg ?? "-"} kg ·{" "}
            {shipment.packageVolumeM3 ?? "-"} m³
          </p>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-2 text-muted-foreground">
        {shipment.status === "EN_PAUSE" ? (
          <PauseCircle className="h-4 w-4" />
        ) : (
          <Clock3 className="h-4 w-4" />
        )}
        <TransportIcon className="h-4 w-4" />
      </div>
    </Link>
  );
}
