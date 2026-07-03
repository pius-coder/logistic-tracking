"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAuraQuery } from "@/aura/client/hooks";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JOURNEY_STATUS_LABELS } from "@/components/journeys/shared/route-utils";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, Plane, Search, Ship, ShipWheel } from "lucide-react";

type ShipmentStatus =
  | "EN_ATTENTE"
  | "EN_COURS"
  | "EN_PAUSE"
  | "PROBLEME"
  | "TERMINE"
  | "ANNULEE";
type TransportMode = "AVION" | "BATEAU";

interface ShipmentRow {
  id: string;
  requestNumber: string;
  status: ShipmentStatus;
  problemType: string | null;
  transportMode: TransportMode;
  productDescription: string;
  packageWeightKg: number | null;
  packageCount: number;
  user: { label: string };
  recipientName: string;
  destinationCountry: { name: string } | null;
  journey: {
    status: string;
    vehicleName: string;
    stops: Array<{ id: string; reachedAt: string | null }>;
  } | null;
  updatedAt: string;
}

interface ShipmentsData {
  shipments: ShipmentRow[];
  total: number;
  page: number;
  totalPages: number;
}

const STATUS_OPTIONS: Array<{ value: ShipmentStatus | ""; label: string }> = [
  { value: "", label: "Tous les statuts" },
  { value: "EN_ATTENTE", label: "À planifier" },
  { value: "EN_COURS", label: "En route" },
  { value: "EN_PAUSE", label: "En pause" },
  { value: "PROBLEME", label: "Incident" },
  { value: "TERMINE", label: "Terminé" },
  { value: "ANNULEE", label: "Annulé" },
];

const MODE_OPTIONS: Array<{ value: TransportMode | ""; label: string }> = [
  { value: "", label: "Tous les modes" },
  { value: "AVION", label: "Avion" },
  { value: "BATEAU", label: "Bateau" },
];

const STATUS_LABELS: Record<ShipmentStatus, string> = {
  EN_ATTENTE: "À planifier",
  EN_COURS: "En route",
  EN_PAUSE: "En pause",
  PROBLEME: "Incident",
  TERMINE: "Terminé",
  ANNULEE: "Annulé",
};

function formatRelative(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 2) return "à l'instant";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}j`;
}

function statusTone(status: ShipmentStatus) {
  if (status === "PROBLEME") return "destructive" as const;
  if (status === "EN_PAUSE") return "outline" as const;
  if (status === "TERMINE") return "secondary" as const;
  return "secondary" as const;
}

export function AdminShipmentsShell() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ShipmentStatus | "">("");
  const [transportMode, setTransportMode] = useState<TransportMode | "">("");

  const params = useMemo(
    () => ({
      limit: 50,
      search: search.trim() || undefined,
      status: status || undefined,
      transportMode: transportMode || undefined,
    }),
    [search, status, transportMode],
  );

  const { data, isLoading } = useAuraQuery<ShipmentsData>("admin.trackingShipments", { params });
  const shipments = data?.shipments ?? [];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="gap-3">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-base">Colis et trajets</CardTitle>
              {data?.total != null && (
                <p className="mt-0.5 text-xs text-muted-foreground">{data.total} résultat{data.total !== 1 ? "s" : ""}</p>
              )}
            </div>
          </div>
          <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_180px_180px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Rechercher numéro, client, téléphone, contenu..."
                className="pl-8"
              />
            </div>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as ShipmentStatus | "")}
              className="h-9 rounded-md border bg-background px-2 text-sm"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value || "all"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              value={transportMode}
              onChange={(event) => setTransportMode(event.target.value as TransportMode | "")}
              className="h-9 rounded-md border bg-background px-2 text-sm"
            >
              {MODE_OPTIONS.map((option) => (
                <option key={option.value || "all"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Colis</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Trajet</TableHead>
                  <TableHead>Mise à jour</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shipments.map((shipment) => (
                  <ShipmentTableRow key={shipment.id} shipment={shipment} />
                ))}
                {!isLoading && shipments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                      Aucun colis trouvé.
                    </TableCell>
                  </TableRow>
                ) : null}
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                      Chargement des colis...
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ShipmentTableRow({ shipment }: { shipment: ShipmentRow }) {
  const TransportIcon = shipment.transportMode === "AVION" ? Plane : Ship;
  const reachedCount = shipment.journey?.stops.filter((s) => s.reachedAt).length ?? 0;
  const totalStops = shipment.journey?.stops.length ?? 0;
  const journeyStatusLabel = shipment.journey
    ? (JOURNEY_STATUS_LABELS[shipment.journey.status] ?? shipment.journey.status)
    : null;

  return (
    <TableRow>
      <TableCell className="min-w-[220px]">
        <Link
          href={`/dashboard/admin/requests/${shipment.id}`}
          className="font-medium hover:underline"
        >
          {shipment.requestNumber}
        </Link>
        <div className="mt-1 max-w-sm truncate text-xs text-muted-foreground">
          {shipment.productDescription}
        </div>
        <div className="mt-0.5 text-xs text-muted-foreground">
          {shipment.packageCount} colis
          {shipment.packageWeightKg ? ` · ${shipment.packageWeightKg} kg` : ""}
        </div>
      </TableCell>
      <TableCell>
        <div className="font-medium">{shipment.user.label}</div>
        <div className="text-xs text-muted-foreground">{shipment.recipientName}</div>
      </TableCell>
      <TableCell>{shipment.destinationCountry?.name ?? "—"}</TableCell>
      <TableCell>
        <span className="inline-flex items-center gap-2 text-sm">
          <TransportIcon className="h-4 w-4 text-muted-foreground" />
          {shipment.transportMode === "AVION" ? "Avion" : "Bateau"}
        </span>
      </TableCell>
      <TableCell>
        <div className="flex flex-col gap-1">
          <Badge variant={statusTone(shipment.status)}>{STATUS_LABELS[shipment.status]}</Badge>
          {journeyStatusLabel ? (
            <div className="flex items-center gap-1.5">
              <Badge variant="outline" className="text-[11px]">{journeyStatusLabel}</Badge>
              {totalStops > 0 && (
                <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground">
                  <CheckCircle2 className="h-3 w-3" />
                  {reachedCount}/{totalStops}
                </span>
              )}
            </div>
          ) : (
            <span className="text-xs text-muted-foreground">Aucun trajet</span>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3 w-3 shrink-0" />
          {formatRelative(shipment.updatedAt)}
        </div>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Link
            href={`/dashboard/admin/requests/${shipment.id}/journey`}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1")}
          >
            <ShipWheel className="h-3.5 w-3.5" />
            Trajet
          </Link>
          <Link
            href={`/dashboard/admin/requests/${shipment.id}`}
            className={buttonVariants({ variant: "secondary", size: "sm" })}
          >
            Détail
          </Link>
        </div>
      </TableCell>
    </TableRow>
  );
}
