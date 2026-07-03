"use client";

import type { FormEvent } from "react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuraMutation, useAuraQuery } from "@/aura/client/hooks";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { JourneyDto, JourneyGeocodingResult, JourneyStopDto } from "@/features/journeys/shared/types";
import {
  JOURNEY_STATUS_LABELS,
  STOP_TYPE_LABELS,
  journeyTransportLabel,
  orderedStops,
  transportModeToJourneyType,
} from "@/components/journeys/shared/route-utils";
import { JourneyAdminMap } from "./JourneyAdminMap";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  ExternalLink,
  LocateFixed,
  PauseCircle,
  Play,
  Plus,
  Save,
  ShipWheel,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

type TransportMode = "AVION" | "BATEAU";
type JourneyTransportType = "AERIEN" | "MARITIME";
type StopType = "DEPART" | "ESCALE" | "DESTINATION";
type ProblemType = "DOUANE" | "POLICE" | "DOCUMENTATION" | "RETARD_LOGISTIQUE" | "PAIEMENT" | "AUTRE";

type ShipmentForJourney = {
  id: string;
  requestNumber: string;
  transportMode: TransportMode;
  productDescription: string;
  packageWeightKg: number | null;
  packageCount: number;
  user: { label: string };
  originCountry: { name: string; iso2: string } | null;
  destinationCountry: { name: string; iso2: string } | null;
  journey: JourneyDto | null;
};

type EditableStop = {
  localId: string;
  id?: string;
  placeName: string;
  placeLabel: string | null;
  mapboxPlaceId: string | null;
  latitude: number | null;
  longitude: number | null;
  stopType: StopType;
  sequence: number;
  estimatedArrivalAt: string;
  durationHours: string;
  reachedAt: string | null;
  note: string;
};

const PROBLEM_LABELS: Record<ProblemType, string> = {
  DOUANE: "Douane",
  POLICE: "Police",
  DOCUMENTATION: "Documentation",
  RETARD_LOGISTIQUE: "Retard logistique",
  PAIEMENT: "Paiement",
  AUTRE: "Autre",
};

function makeLocalId() {
  return `stop-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

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

function formatElapsed(startIso: string): string {
  const diff = Date.now() - new Date(startIso).getTime();
  const totalMinutes = Math.floor(diff / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}j ${hours % 24}h en transit`;
  if (hours > 0) return `${hours}h ${totalMinutes % 60}min en transit`;
  return `${totalMinutes} min en transit`;
}

function toLocalDateTime(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function fromJourneyStop(stop: JourneyStopDto): EditableStop {
  return {
    localId: stop.id,
    id: stop.id,
    placeName: stop.placeName,
    placeLabel: stop.placeLabel,
    mapboxPlaceId: stop.mapboxPlaceId,
    latitude: stop.latitude,
    longitude: stop.longitude,
    stopType: stop.stopType,
    sequence: stop.sequence,
    estimatedArrivalAt: toLocalDateTime(stop.estimatedArrivalAt),
    durationHours: "",
    reachedAt: stop.reachedAt,
    note: stop.note ?? "",
  };
}

function emptyStops(): EditableStop[] {
  return [
    {
      localId: makeLocalId(),
      placeName: "",
      placeLabel: null,
      mapboxPlaceId: null,
      latitude: null,
      longitude: null,
      stopType: "DEPART",
      sequence: 0,
      estimatedArrivalAt: "",
      durationHours: "",
      reachedAt: null,
      note: "",
    },
    {
      localId: makeLocalId(),
      placeName: "",
      placeLabel: null,
      mapboxPlaceId: null,
      latitude: null,
      longitude: null,
      stopType: "DESTINATION",
      sequence: 1,
      estimatedArrivalAt: "",
      durationHours: "",
      reachedAt: null,
      note: "",
    },
  ];
}

function resequence(stops: EditableStop[]): EditableStop[] {
  return stops.map((stop, index) => ({
    ...stop,
    sequence: index,
    stopType: (index === 0 ? "DEPART" : index === stops.length - 1 ? "DESTINATION" : "ESCALE") as StopType,
  }));
}

export function JourneyAdminPanel({
  requestId,
  mapboxToken,
}: {
  requestId: string;
  mapboxToken: string;
}) {
  const { data: shipment } = useAuraQuery<ShipmentForJourney>("admin.trackingShipment", {
    params: { requestId },
    refetchInterval: 15_000,
  });
  const { data: journey } = useAuraQuery<JourneyDto | null>("journey.adminGet", {
    params: { requestId },
    refetchInterval: 15_000,
  });
  const { data: transportCatalog } = useAuraQuery<{ aircraft: string[]; vessels: string[] }>("journey.transportCatalog", {
    staleTime: 300_000,
  });

  const transportType: JourneyTransportType = shipment ? transportModeToJourneyType(shipment.transportMode) : "AERIEN";
  const vehicleOptions = transportType === "AERIEN" ? transportCatalog?.aircraft ?? [] : transportCatalog?.vessels ?? [];
  const [vehicleName, setVehicleName] = useState("");
  const [averageSpeed, setAverageSpeed] = useState("");
  const [stops, setStops] = useState<EditableStop[]>(emptyStops);
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const initializedKeyRef = useRef<string | null>(null);
  const [issueForm, setIssueForm] = useState<{ problemType: ProblemType; title: string; message: string }>({
    problemType: "DOUANE",
    title: "Blocage douane",
    message: "",
  });

  const currentJourney = journey ?? shipment?.journey ?? null;
  const canEditPlan = !currentJourney || ["BROUILLON", "PLANIFIE"].includes(currentJourney.status);
  const hasReachedStops = stops.some((stop) => stop.reachedAt);

  const mutationOptions = {
    invalidate: ["journey.adminGet", "admin.trackingShipment", "admin.trackingShipments", "admin.trackingDashboard"],
  };
  const savePlan = useAuraMutation<Record<string, unknown>, JourneyDto>("journey.adminSavePlan", mutationOptions);
  const publishJourney = useAuraMutation<Record<string, unknown>, { success: boolean; publicToken: string }>("journey.adminPublish", mutationOptions);
  const startJourney = useAuraMutation<Record<string, unknown>, { success: boolean }>("journey.adminStart", mutationOptions);
  const confirmNextStop = useAuraMutation<Record<string, unknown>, { success: boolean; completed: boolean }>(
    "journey.adminConfirmNextStop",
    mutationOptions,
  );
  const pauseJourney = useAuraMutation<Record<string, unknown>, { success: boolean }>("journey.adminPause", mutationOptions);
  const resumeJourney = useAuraMutation<Record<string, unknown>, { success: boolean }>("journey.adminResume", mutationOptions);
  const reportProblem = useAuraMutation<Record<string, unknown>, { success: boolean }>("journey.adminReportProblem", mutationOptions);
  const updateEta = useAuraMutation<Record<string, unknown>, { success: boolean }>("journey.adminUpdateEta", mutationOptions);

  useEffect(() => {
    if (!shipment) return;
    const sourceKey = `${shipment.id}:${currentJourney?.updatedAt ?? "new"}`;
    if (initializedKeyRef.current === sourceKey) return;
    initializedKeyRef.current = sourceKey;
    const source = currentJourney;
    setVehicleName(source?.vehicleName ?? (shipment.transportMode === "AVION" ? "Avion à renseigner" : "Navire à renseigner"));
    setAverageSpeed(source?.averageSpeed?.toString() ?? "");
    setStops(source ? orderedStops(source.stops).map(fromJourneyStop) : emptyStops());
  }, [shipment?.id, currentJourney?.id, currentJourney?.updatedAt, shipment, currentJourney]);

  const orderedEditableStops = useMemo(() => orderedStops(stops), [stops]);
  const publicLink = currentJourney?.publicToken ? `/voyage/${currentJourney.publicToken}` : null;

  function countryIsoForStop(index: number) {
    if (index === 0) return shipment?.originCountry?.iso2 ?? undefined;
    if (index === orderedEditableStops.length - 1) return shipment?.destinationCountry?.iso2 ?? undefined;
    return undefined;
  }

  function updateStop(localId: string, patch: Partial<EditableStop>) {
    setStops((current) => current.map((stop) => (stop.localId === localId ? { ...stop, ...patch } : stop)));
  }

  function addStop() {
    setStops((current) => {
      const next = [...current];
      next.splice(Math.max(1, next.length - 1), 0, {
        ...emptyStops()[0],
        localId: makeLocalId(),
        stopType: "ESCALE",
      });
      return resequence(next);
    });
  }

  function removeStop(localId: string) {
    setStops((current) => resequence(current.filter((stop) => stop.localId !== localId)));
  }

  function buildStopEta(stop: EditableStop, index: number, previousDate: Date | null) {
    if (stop.estimatedArrivalAt) return new Date(stop.estimatedArrivalAt);
    if (index === 0) return previousDate;
    const duration = Number(stop.durationHours);
    if (!Number.isFinite(duration) || duration <= 0 || !previousDate) return null;
    return new Date(previousDate.getTime() + duration * 60 * 60 * 1000);
  }

  async function submitPlan(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const invalidStop = orderedEditableStops.find((stop) => !stop.placeName || !stop.mapboxPlaceId || stop.latitude == null || stop.longitude == null);
    if (invalidStop) {
      toast.error(`Chaque étape doit être un ${transportType === "AERIEN" ? "aéroport" : "port"} sélectionné.`);
      return;
    }

    let previousEta: Date | null = new Date();
    const plannedStops = orderedEditableStops.map((stop, index) => {
      const eta = buildStopEta(stop, index, previousEta);
      if (eta) previousEta = eta;
      return { stop, eta };
    });

    const result = await savePlan.mutateAsync({
      requestId,
      vehicleName,
      transportType,
      averageSpeed: averageSpeed ? Number(averageSpeed) : null,
      speedUnit: transportType === "MARITIME" ? "KNOTS" : "KMH",
      stops: plannedStops.map(({ stop, eta }, index) => ({
        id: stop.id,
        placeName: stop.placeName,
        placeLabel: stop.placeLabel,
        mapboxPlaceId: stop.mapboxPlaceId,
        latitude: stop.latitude,
        longitude: stop.longitude,
        stopType: index === 0 ? "DEPART" : index === orderedEditableStops.length - 1 ? "DESTINATION" : "ESCALE",
        sequence: index,
        estimatedArrivalAt: eta ? eta.toISOString() : null,
        note: stop.note || null,
      })),
    });
    toast.success("Trajet enregistré.");
    setStops(orderedStops(result.stops).map(fromJourneyStop));
  }

  async function runLifecycle(action: "publish" | "start" | "confirm" | "pause" | "resume") {
    if (action === "publish") await publishJourney.mutateAsync({ requestId });
    if (action === "start") await startJourney.mutateAsync({ requestId });
    if (action === "confirm") await confirmNextStop.mutateAsync({ requestId });
    if (action === "pause") await pauseJourney.mutateAsync({ requestId });
    if (action === "resume") await resumeJourney.mutateAsync({ requestId });
    toast.success("Trajet mis à jour.");
  }

  async function submitIssue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await reportProblem.mutateAsync({ requestId, ...issueForm });
    setIssueForm((current) => ({ ...current, message: "" }));
    toast.success("Incident signalé.");
  }

  async function submitEta(stop: EditableStop) {
    if (!stop.id || !stop.estimatedArrivalAt) return;
    await updateEta.mutateAsync({
      requestId,
      stopId: stop.id,
      estimatedArrivalAt: new Date(stop.estimatedArrivalAt).toISOString(),
      reason: "Mise à jour admin",
    });
    toast.success("ETA mise à jour.");
  }

  const journeyStartedAt = currentJourney?.status === "EN_COURS" ? (currentJourney as Record<string, unknown>)?.startedAt as string | undefined : undefined;

  return (
    <main className="grid min-h-screen gap-6 px-4 py-6 xl:grid-cols-[minmax(420px,0.9fr)_minmax(0,1.1fr)] md:px-6">
      <section className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <Link
              href={`/dashboard/admin/requests/${requestId}`}
              className="mb-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Retour au colis
            </Link>
            <p className="text-sm font-medium text-muted-foreground">Éditeur de trajet</p>
            <h1 className="text-2xl font-semibold tracking-tight">{shipment?.requestNumber ?? "Colis"}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {shipment ? `${shipment.user.label} · ${shipment.destinationCountry?.name ?? "Destination"}` : "Chargement..."}
            </p>
            {journeyStartedAt && (
              <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {formatElapsed(journeyStartedAt)}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {publicLink ? (
              <Link href={publicLink} className={buttonVariants({ variant: "secondary" })}>
                <ExternalLink className="h-4 w-4" />
                Vue client
              </Link>
            ) : null}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base">
              <span>Trajet {journeyTransportLabel(transportType)}</span>
              {currentJourney ? (
                <Badge variant={currentJourney.status === "PROBLEME" ? "destructive" : "secondary"}>
                  {JOURNEY_STATUS_LABELS[currentJourney.status] ?? currentJourney.status}
                </Badge>
              ) : (
                <Badge variant="outline">Non configuré</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm md:grid-cols-3">
            <Info label="Contenu" value={shipment?.productDescription ?? "-"} />
            <Info label="Poids" value={`${shipment?.packageWeightKg ?? "-"} kg`} />
          </CardContent>
        </Card>

        <form onSubmit={submitPlan} className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Transport</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{transportType === "AERIEN" ? "Nom de l'avion / compagnie" : "Nom du navire / armateur"}</Label>
                <select
                  value=""
                  onChange={(event) => {
                    if (event.target.value) setVehicleName(event.target.value);
                  }}
                  className="h-9 w-full rounded-md border bg-background px-2 text-sm"
                  disabled={!canEditPlan || hasReachedStops}
                >
                  <option value="">Suggestions, à vérifier</option>
                  {vehicleOptions.map((vehicle) => (
                    <option key={vehicle} value={vehicle}>
                      {vehicle}
                    </option>
                  ))}
                </select>
                <Input value={vehicleName} onChange={(event) => setVehicleName(event.target.value)} required disabled={!canEditPlan || hasReachedStops} />
              </div>
              <div className="space-y-2">
                <Label>Vitesse moyenne {transportType === "AERIEN" ? "(km/h)" : "(nœuds)"}</Label>
                <Input
                  value={averageSpeed}
                  onChange={(event) => setAverageSpeed(event.target.value)}
                  type="number"
                  min="1"
                  step="0.1"
                  disabled={!canEditPlan || hasReachedStops}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Ports et aéroports</CardTitle>
              <Button type="button" variant="outline" onClick={addStop} disabled={!canEditPlan || hasReachedStops}>
                <Plus className="h-4 w-4" />
                Escale
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {orderedEditableStops.map((stop, index) => (
                <div
                  key={stop.localId}
                  className={`rounded-md border bg-background p-3 ${selectedStopId === stop.localId ? "border-primary" : ""}`}
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{STOP_TYPE_LABELS[stop.stopType]}</Badge>
                      <span className="text-sm font-medium">Étape {index + 1}</span>
                    </div>
                    {index > 0 && index < orderedEditableStops.length - 1 && !stop.reachedAt ? (
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeStop(stop.localId)} disabled={!canEditPlan || hasReachedStops}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    ) : null}
                  </div>

                  <PlaceSearch
                    disabled={!canEditPlan || hasReachedStops}
                    transportType={transportType}
                    countryIso2={countryIsoForStop(index)}
                    selectedLabel={stop.placeLabel || stop.placeName}
                    onSelect={(place) => {
                      updateStop(stop.localId, {
                        placeName: place.name,
                        placeLabel: place.label,
                        mapboxPlaceId: place.id,
                        latitude: place.latitude,
                        longitude: place.longitude,
                      });
                      setSelectedStopId(stop.localId);
                    }}
                  />

                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>ETA</Label>
                      <Input
                        value={stop.estimatedArrivalAt}
                        onChange={(event) => updateStop(stop.localId, { estimatedArrivalAt: event.target.value })}
                        type="datetime-local"
                        disabled={Boolean(stop.reachedAt)}
                      />
                    </div>
                    {index > 0 ? (
                      <div className="space-y-2">
                        <Label>Durée depuis l&apos;étape précédente (heures)</Label>
                        <Input
                          value={stop.durationHours}
                          onChange={(event) => updateStop(stop.localId, { durationHours: event.target.value })}
                          type="number"
                          min="0.5"
                          step="0.5"
                          placeholder="ex: 72"
                          disabled={Boolean(stop.reachedAt)}
                        />
                      </div>
                    ) : null}
                    <div className="space-y-2">
                      <Label>Note étape</Label>
                      <Input value={stop.note} onChange={(event) => updateStop(stop.localId, { note: event.target.value })} disabled={!canEditPlan || hasReachedStops} />
                    </div>
                  </div>
                  {stop.id && !stop.reachedAt && currentJourney && currentJourney.status !== "BROUILLON" ? (
                    <Button type="button" variant="outline" className="mt-3" onClick={() => submitEta(stop)} disabled={!stop.estimatedArrivalAt || updateEta.isPending}>
                      Mettre à jour ETA
                    </Button>
                  ) : null}
                </div>
              ))}

              <Button type="submit" disabled={!canEditPlan || hasReachedStops || savePlan.isPending}>
                <Save className="h-4 w-4" />
                Enregistrer le trajet
              </Button>
            </CardContent>
          </Card>
        </form>
      </section>

      <section className="space-y-6">
        <JourneyAdminMap
          mapboxToken={mapboxToken}
          stops={orderedEditableStops}
          transportType={transportType}
          selectedStopId={selectedStopId}
          onSelectStop={setSelectedStopId}
        />

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Commandes trajet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
              <Button type="button" variant="outline" disabled={currentJourney?.status !== "BROUILLON"} onClick={() => runLifecycle("publish")}>
                <ShipWheel className="h-4 w-4" />
                Publier
              </Button>
              <Button type="button" variant="outline" disabled={currentJourney?.status !== "PLANIFIE"} onClick={() => runLifecycle("start")}>
                <Play className="h-4 w-4" />
                Démarrer
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={!currentJourney || !["EN_COURS", "EN_PAUSE", "PROBLEME"].includes(currentJourney.status)}
                onClick={() => runLifecycle("confirm")}
              >
                <CheckCircle2 className="h-4 w-4" />
                Étape atteinte
              </Button>
              <Button type="button" variant="outline" disabled={currentJourney?.status !== "EN_COURS"} onClick={() => runLifecycle("pause")}>
                <PauseCircle className="h-4 w-4" />
                Pause
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={!currentJourney || !["EN_PAUSE", "PROBLEME"].includes(currentJourney.status)}
                onClick={() => runLifecycle("resume")}
              >
                <Play className="h-4 w-4" />
                Reprendre
              </Button>
            </div>

            <form onSubmit={submitIssue} className="grid gap-3 rounded-md border bg-muted/20 p-3 md:grid-cols-[160px_minmax(0,1fr)]">
              <select
                value={issueForm.problemType}
                onChange={(event) => setIssueForm((current) => ({ ...current, problemType: event.target.value as ProblemType }))}
                className="h-9 rounded-md border bg-background px-2 text-sm"
              >
                {Object.entries(PROBLEM_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <Input value={issueForm.title} onChange={(event) => setIssueForm((current) => ({ ...current, title: event.target.value }))} placeholder="Titre incident" />
              <Textarea
                value={issueForm.message}
                onChange={(event) => setIssueForm((current) => ({ ...current, message: event.target.value }))}
                placeholder="Détails de l&apos;incident, douane, retard, document manquant..."
                className="md:col-span-2"
                required
              />
              <Button
                type="submit"
                variant="destructive"
                disabled={!currentJourney || !["PLANIFIE", "EN_COURS", "EN_PAUSE"].includes(currentJourney.status) || reportProblem.isPending}
                className="md:col-span-2"
              >
                <AlertTriangle className="h-4 w-4" />
                Signaler l&apos;incident
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Timeline trajet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(currentJourney?.events ?? []).length === 0 && (
              <p className="text-sm text-muted-foreground">Aucun événement trajet.</p>
            )}
            {(currentJourney?.events ?? []).map((event) => (
              <div key={event.id} className="rounded-md border bg-background p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{event.title}</p>
                  <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatRelative(event.createdAt)} · {new Date(event.createdAt).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{event.message}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

function PlaceSearch({
  transportType,
  countryIso2,
  selectedLabel,
  disabled,
  onSelect,
}: {
  transportType: JourneyTransportType;
  countryIso2?: string;
  selectedLabel: string;
  disabled: boolean;
  onSelect: (place: JourneyGeocodingResult) => void;
}) {
  const [query, setQuery] = useState("");
  const { data, isLoading } = useAuraQuery<{ results: JourneyGeocodingResult[] }>("journey.geocode", {
    params: { query, transportType, countryIso2 },
    enabled: !disabled && (query.trim().length >= 2 || Boolean(countryIso2)),
    staleTime: 60_000,
  });
  const results = data?.results ?? [];
  const shouldShowResults = !disabled && (query.trim().length >= 2 || results.length > 0);
  const placeholder = transportType === "AERIEN" ? "Choisir un aéroport..." : "Choisir un port...";

  return (
    <div className="space-y-2">
      <Label>{transportType === "AERIEN" ? "Aéroport" : "Port"}</Label>
      <div className="relative">
        <LocateFixed className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={selectedLabel || placeholder} className="pl-8" disabled={disabled} />
      </div>
      {shouldShowResults ? (
        <div className="max-h-48 overflow-auto rounded-md border bg-background">
          {isLoading ? <p className="p-3 text-sm text-muted-foreground">Recherche...</p> : null}
          {!isLoading && results.length === 0 ? (
            <p className="p-3 text-sm text-muted-foreground">Aucun {transportType === "AERIEN" ? "aéroport" : "port"} trouvé.</p>
          ) : null}
          {results.map((place) => (
            <button
              type="button"
              key={place.id}
              onClick={() => {
                onSelect(place);
                setQuery(place.name);
              }}
              className="block w-full border-b px-3 py-2 text-left text-sm last:border-b-0 hover:bg-muted"
            >
              <span className="block font-medium">{place.name}</span>
              <span className="block text-xs text-muted-foreground">{place.label}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}
