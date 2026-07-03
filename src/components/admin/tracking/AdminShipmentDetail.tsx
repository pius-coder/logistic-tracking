"use client";

import type { ElementType, FormEvent, ReactNode } from "react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuraMutation, useAuraQuery } from "@/aura/client/hooks";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JOURNEY_STATUS_LABELS } from "@/components/journeys/shared/route-utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Circle,
  ExternalLink,
  Package,
  Plane,
  Save,
  Ship,
  ShipWheel,
} from "lucide-react";
import { toast } from "sonner";

type ShipmentStatus = "EN_ATTENTE" | "EN_COURS" | "EN_PAUSE" | "PROBLEME" | "TERMINE" | "ANNULEE";
type ProblemType =
  | "DOUANE"
  | "POLICE"
  | "DOCUMENTATION"
  | "RETARD_LOGISTIQUE"
  | "PAIEMENT"
  | "AUTRE";

interface ShipmentDetail {
  id: string;
  requestNumber: string;
  status: ShipmentStatus;
  problemType: ProblemType | null;
  latestStatusMessage: string | null;
  transportMode: "AVION" | "BATEAU";
  recipientName: string;
  recipientPhone: string;
  deliveryAddress: string;
  packageWeightKg: number | null;
  packageVolumeM3: number | null;
  packageCount: number;
  productDescription: string;
  adminNotes: string | null;
  user: {
    label: string;
    email: string | null;
    phone: string | null;
    businessName: string | null;
  };
  originCountry: { name: string } | null;
  destinationCountry: { name: string } | null;
  journey: {
    publicToken: string;
    vehicleName: string;
    transportType: "AERIEN" | "MARITIME";
    status: string;
    latestMessage: string | null;
    problemMessage: string | null;
    stops: Array<{
      id: string;
      placeName: string;
      stopType: string;
      reachedAt: string | null;
      estimatedArrivalAt: string | null;
    }>;
  } | null;
  statusEvents: Array<{
    id: string;
    status: ShipmentStatus;
    problemType: ProblemType | null;
    title: string;
    message: string;
    createdAt: string;
  }>;
}

const STATUS_LABELS: Record<ShipmentStatus, string> = {
  EN_ATTENTE: "À planifier",
  EN_COURS: "En route",
  EN_PAUSE: "En pause",
  PROBLEME: "Incident",
  TERMINE: "Terminé",
  ANNULEE: "Annulé",
};

const PROBLEM_LABELS: Record<ProblemType, string> = {
  DOUANE: "Douane",
  POLICE: "Police",
  DOCUMENTATION: "Documentation",
  RETARD_LOGISTIQUE: "Retard logistique",
  PAIEMENT: "Paiement",
  AUTRE: "Autre",
};

function formatRelative(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 2) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days}j`;
}

function formatDate(isoDate: string): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(isoDate));
}

function statusBadgeTone(status: ShipmentStatus): "destructive" | "secondary" | "outline" {
  if (status === "PROBLEME") return "destructive";
  if (status === "EN_PAUSE") return "outline";
  return "secondary";
}

export function AdminShipmentDetail({ requestId }: { requestId: string }) {
  const { data, isLoading } = useAuraQuery<ShipmentDetail>("admin.trackingShipment", {
    params: { requestId },
    refetchInterval: 15_000,
  });
  const [editForm, setEditForm] = useState({
    productDescription: "",
    packageWeightKg: "",
    packageVolumeM3: "",
    packageCount: "1",
    adminNotes: "",
  });
  const [statusForm, setStatusForm] = useState<{
    status: ShipmentStatus;
    problemType: ProblemType;
    title: string;
    message: string;
  }>({
    status: "EN_COURS",
    problemType: "DOUANE",
    title: "",
    message: "",
  });

  const updateShipment = useAuraMutation<Record<string, unknown>, { success: boolean }>(
    "admin.updateShipment",
    {
      invalidate: ["admin.trackingShipment", "admin.trackingShipments", "admin.trackingDashboard"],
    },
  );
  const addStatusNote = useAuraMutation<Record<string, unknown>, { success: boolean }>(
    "admin.addShipmentStatusNote",
    {
      invalidate: ["admin.trackingShipment", "admin.trackingShipments", "admin.trackingDashboard"],
    },
  );

  useEffect(() => {
    if (!data) return;
    const timeoutId = window.setTimeout(() => {
      setEditForm({
        productDescription: data.productDescription,
        packageWeightKg: data.packageWeightKg?.toString() ?? "",
        packageVolumeM3: data.packageVolumeM3?.toString() ?? "",
        packageCount: data.packageCount.toString(),
        adminNotes: data.adminNotes ?? "",
      });
      setStatusForm((current) => ({
        ...current,
        status: data.status,
        problemType: data.problemType ?? "DOUANE",
      }));
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [data]);

  async function submitEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await updateShipment.mutateAsync({
      requestId,
      ...editForm,
      packageWeightKg: editForm.packageWeightKg || null,
      packageVolumeM3: editForm.packageVolumeM3 || null,
    });
    toast.success("Colis mis à jour.");
  }

  async function submitStatus(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await addStatusNote.mutateAsync({
      requestId,
      ...statusForm,
      problemType: statusForm.status === "PROBLEME" ? statusForm.problemType : null,
    });
    setStatusForm((current) => ({ ...current, title: "", message: "" }));
    toast.success("Statut ajouté.");
  }

  if (isLoading || !data) {
    return <div className="h-72 animate-pulse rounded-lg bg-muted" />;
  }

  const TransportIcon = data.transportMode === "AVION" ? Plane : Ship;
  const publicLink = data.journey?.publicToken ? `/voyage/${data.journey.publicToken}` : null;
  const journeyStops = data.journey?.stops ?? [];
  const reachedCount = journeyStops.filter((s) => s.reachedAt).length;

  return (
    <div className="space-y-6">
      {/* Header + back */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Link
            href="/dashboard/admin/requests"
            className="mb-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Retour à la liste
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{data.requestNumber}</h1>
            <Badge variant={statusBadgeTone(data.status)}>{STATUS_LABELS[data.status]}</Badge>
            {data.problemType ? (
              <Badge variant="outline">{PROBLEM_LABELS[data.problemType]}</Badge>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {data.latestStatusMessage ?? "Aucune note de statut récente."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/dashboard/admin/requests/${requestId}/journey`}
            className={buttonVariants({ size: "lg" })}
          >
            <ShipWheel className="h-4 w-4" />
            Gérer le trajet
          </Link>
          {publicLink ? (
            <Link
              href={publicLink}
              className={buttonVariants({ variant: "outline", size: "lg" })}
              target="_blank"
            >
              <ExternalLink className="h-4 w-4" />
              Vue client
            </Link>
          ) : null}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <InfoCard title="Mode" value={data.transportMode === "AVION" ? "Avion" : "Bateau"} icon={TransportIcon} />
        <InfoCard title="Poids" value={data.packageWeightKg ? `${data.packageWeightKg} kg` : "—"} icon={Package} />
        <InfoCard title="Volume" value={data.packageVolumeM3 ? `${data.packageVolumeM3} m³` : "—"} icon={Package} />
        <InfoCard title="Colis" value={String(data.packageCount)} icon={Package} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          {/* Edit colis */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Colis</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={submitEdit} className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2 md:col-span-3">
                  <Label>Contenu</Label>
                  <Textarea
                    value={editForm.productDescription}
                    onChange={(event) =>
                      setEditForm((current) => ({
                        ...current,
                        productDescription: event.target.value,
                      }))
                    }
                  />
                </div>
                <Field label="Nombre">
                  <Input
                    value={editForm.packageCount}
                    onChange={(event) =>
                      setEditForm((current) => ({ ...current, packageCount: event.target.value }))
                    }
                    type="number"
                    min="1"
                  />
                </Field>
                <Field label="Poids kg">
                  <Input
                    value={editForm.packageWeightKg}
                    onChange={(event) =>
                      setEditForm((current) => ({
                        ...current,
                        packageWeightKg: event.target.value,
                      }))
                    }
                    type="number"
                    min="0"
                    step="0.01"
                  />
                </Field>
                <Field label="Volume m³">
                  <Input
                    value={editForm.packageVolumeM3}
                    onChange={(event) =>
                      setEditForm((current) => ({
                        ...current,
                        packageVolumeM3: event.target.value,
                      }))
                    }
                    type="number"
                    min="0"
                    step="0.001"
                  />
                </Field>
                <div className="space-y-2 md:col-span-3">
                  <Label>Notes admin</Label>
                  <Textarea
                    value={editForm.adminNotes}
                    onChange={(event) =>
                      setEditForm((current) => ({ ...current, adminNotes: event.target.value }))
                    }
                  />
                </div>
                <div className="md:col-span-3">
                  <Button type="submit" disabled={updateShipment.isPending}>
                    <Save className="h-4 w-4" />
                    Enregistrer
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Historique statut */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Historique statut</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.statusEvents.length === 0 && (
                <p className="text-sm text-muted-foreground">Aucun événement enregistré.</p>
              )}
              {data.statusEvents.map((event) => (
                <div key={event.id} className="rounded-md border bg-background p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={event.status === "PROBLEME" ? "destructive" : "secondary"}>
                      {STATUS_LABELS[event.status]}
                    </Badge>
                    {event.problemType ? (
                      <Badge variant="outline">{PROBLEM_LABELS[event.problemType]}</Badge>
                    ) : null}
                    <span className="ml-auto text-xs text-muted-foreground">
                      {formatRelative(event.createdAt)} · {formatDate(event.createdAt)}
                    </span>
                  </div>
                  <p className="mt-2 font-medium">{event.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{event.message}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-6">
          {/* Client */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Client et livraison</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <InfoLine label="Client" value={data.user.label} />
              <InfoLine label="Téléphone client" value={data.user.phone ?? "—"} />
              <InfoLine label="Email" value={data.user.email ?? "—"} />
              {data.user.businessName && (
                <InfoLine label="Entreprise" value={data.user.businessName} />
              )}
              <InfoLine label="Destinataire" value={data.recipientName} />
              <InfoLine label="Tél. destinataire" value={data.recipientPhone} />
              <InfoLine label="Origine" value={data.originCountry?.name ?? "—"} />
              <InfoLine label="Destination" value={data.destinationCountry?.name ?? "—"} />
              <InfoLine label="Adresse" value={data.deliveryAddress} />
            </CardContent>
          </Card>

          {/* Trajet */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Trajet</CardTitle>
              {data.journey && (
                <Badge variant="outline">
                  {JOURNEY_STATUS_LABELS[data.journey.status] ?? data.journey.status}
                </Badge>
              )}
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {data.journey ? (
                <>
                  <div className="text-sm font-medium">{data.journey.vehicleName}</div>
                  {data.journey.latestMessage && (
                    <p className="text-xs text-muted-foreground">{data.journey.latestMessage}</p>
                  )}

                  {/* Mini timeline des stops */}
                  {journeyStops.length > 0 && (
                    <div className="space-y-2 pt-1">
                      <p className="text-xs font-medium text-muted-foreground">
                        {reachedCount}/{journeyStops.length} étapes — {Math.round((reachedCount / journeyStops.length) * 100)}%
                      </p>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-[width]"
                          style={{ width: `${Math.round((reachedCount / journeyStops.length) * 100)}%` }}
                        />
                      </div>
                      <div className="space-y-1.5 pt-1">
                        {journeyStops.map((stop) => (
                          <div key={stop.id} className="flex items-center gap-2 text-xs">
                            {stop.reachedAt ? (
                              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary" />
                            ) : (
                              <Circle className="h-3.5 w-3.5 shrink-0 text-muted-foreground/40" />
                            )}
                            <span
                              className={
                                stop.reachedAt ? "font-medium text-foreground" : "text-muted-foreground"
                              }
                            >
                              {stop.placeName}
                            </span>
                            {stop.reachedAt && (
                              <span className="ml-auto text-muted-foreground">
                                {formatRelative(stop.reachedAt)}
                              </span>
                            )}
                            {!stop.reachedAt && stop.estimatedArrivalAt && (
                              <span className="ml-auto text-muted-foreground">
                                ETA {formatDate(stop.estimatedArrivalAt)}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-muted-foreground">Aucun trajet configuré.</p>
              )}
              <Link
                href={`/dashboard/admin/requests/${requestId}/journey`}
                className={cn(buttonVariants({ variant: "outline" }), "mt-1 w-full")}
              >
                Ouvrir l&apos;éditeur
              </Link>
            </CardContent>
          </Card>

          {/* Ajouter un statut */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Ajouter un statut</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={submitStatus} className="space-y-3">
                <select
                  value={statusForm.status}
                  onChange={(event) =>
                    setStatusForm((current) => ({
                      ...current,
                      status: event.target.value as ShipmentStatus,
                    }))
                  }
                  className="h-9 w-full rounded-md border bg-background px-2 text-sm"
                >
                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                {statusForm.status === "PROBLEME" ? (
                  <select
                    value={statusForm.problemType}
                    onChange={(event) =>
                      setStatusForm((current) => ({
                        ...current,
                        problemType: event.target.value as ProblemType,
                      }))
                    }
                    className="h-9 w-full rounded-md border bg-background px-2 text-sm"
                  >
                    {Object.entries(PROBLEM_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                ) : null}
                <Input
                  value={statusForm.title}
                  onChange={(event) =>
                    setStatusForm((current) => ({ ...current, title: event.target.value }))
                  }
                  placeholder="Titre"
                  required
                />
                <Textarea
                  value={statusForm.message}
                  onChange={(event) =>
                    setStatusForm((current) => ({ ...current, message: event.target.value }))
                  }
                  placeholder="Message visible dans l'historique"
                  required
                />
                <Button type="submit" disabled={addStatusNote.isPending} className="w-full">
                  <AlertTriangle className="h-4 w-4" />
                  Ajouter
                </Button>
              </form>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function InfoCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string;
  icon: ElementType;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="break-words font-medium">{value}</p>
    </div>
  );
}
