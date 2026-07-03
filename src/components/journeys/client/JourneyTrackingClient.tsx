"use client";

import { useEffect, useId, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Anchor,
  CheckCircle2,
  Clock3,
  Gauge,
  GripHorizontal,
  Info,
  Loader2,
  MapPin,
  Navigation,
  Plane,
  RefreshCw,
  Route,
  Ship,
} from "lucide-react";
import { useAuraQuery } from "@/aura/client";

import type { JourneyDto } from "@/features/journeys/shared/types";
import { JourneyMap } from "../shared/JourneyMap";
import {
  formatDate,
  formatDistance,
  getJourneyProgress,
} from "../shared/journey-geometry";

const STATUS_LABELS: Record<JourneyDto["status"], string> = {
  BROUILLON: "Préparation",
  PLANIFIE: "Voyage planifié",
  EN_COURS: "En cours",
  EN_PAUSE: "En pause",
  PROBLEME: "Incident",
  TERMINE: "Voyage terminé",
  ANNULE: "Voyage annulé",
};

type TabId = "escales" | "details" | "historique";

const TABS: Array<{ id: TabId; label: string; icon: LucideIcon }> = [
  { id: "escales", label: "Escales", icon: MapPin },
  { id: "details", label: "Détails", icon: Info },
  { id: "historique", label: "Historique", icon: Clock3 },
];

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function JourneyTrackingClient({
  publicToken,
  mapboxToken,
}: {
  publicToken: string;
  mapboxToken: string;
}) {
  const drawerId = useId();
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [activeTab, setActiveTab] = useState<TabId>("escales");
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);

  const { data, isFetching, refetch } = useAuraQuery<JourneyDto | null>(
    "journey.publicGet",
    {
      params: { token: publicToken },
      refetchInterval: 10_000,
      staleTime: 5_000,
    },
  );

  useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), 1_000);
    return () => window.clearInterval(id);
  }, []);

  const progress = useMemo(
    () => (data ? getJourneyProgress(data, nowMs) : null),
    [data, nowMs],
  );

  if (data === undefined && isFetching) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#071522] px-5">
        <div className="flex items-center gap-3 rounded-[18px] border border-white/[0.10] bg-white/[0.055] px-5 py-4 text-white shadow-[0_20px_55px_-32px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-xl">
          <Loader2 className="size-5 animate-spin text-[#91afd0]" />
          <span className="font-display text-[13px] font-semibold text-white/70">
            Chargement du suivi…
          </span>
        </div>
      </div>
    );
  }

  if (!data || !progress) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f3ef] px-5">
        <div className="max-w-[420px] rounded-[28px] border border-black/[0.075] bg-[#fbfaf7] p-8 text-center ring-1 ring-white/85 shadow-[0_24px_65px_-40px_rgba(15,23,42,0.36),inset_0_1px_0_rgba(255,255,255,1)]">
          <MapPin className="mx-auto size-7 text-[#0a192f]/28" />
          <h1 className="mt-4 font-display text-[22px] font-bold tracking-[-0.04em] text-[#0a192f]">
            Suivi indisponible
          </h1>
          <p className="mt-3 font-display text-[13px] leading-[1.65] text-[#0a192f]/45">
            Ce voyage n&apos;existe pas, n&apos;est pas encore publié ou le lien
            a expiré.
          </p>
        </div>
      </div>
    );
  }

  const stops = progress.stops;
  const nextStop =
    progress.nextStopIndex >= 0 ? stops[progress.nextStopIndex] : null;
  const currentStop =
    progress.currentFromIndex >= 0 ? stops[progress.currentFromIndex] : null;
  const finalStop = stops.at(-1) ?? null;
  const TransportIcon = data.transportType === "MARITIME" ? Ship : Plane;
  const hasEstimatedPosition =
    data.status === "EN_COURS" &&
    progress.currentFromIndex >= 0 &&
    Boolean(nextStop?.estimatedArrivalAt);

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#f2f1ec]">
      {/* Full‑screen map background */}
      <JourneyMap
        stops={stops}
        transportType={data.transportType}
        mapboxToken={mapboxToken}
        currentFromIndex={progress.currentFromIndex}
        currentLegFraction={progress.currentLegFraction}
        showEstimatedVehicle={hasEstimatedPosition}
        className="absolute inset-0 z-0 h-full w-full"
      />

      {hasEstimatedPosition ? (
        <div className="pointer-events-none absolute left-4 top-[66px] z-10 rounded-full border border-white/[0.10] bg-[#071522]/80 px-3 py-2 font-display text-[10px] font-semibold text-white/62 shadow-[0_10px_28px_-16px_rgba(0,0,0,0.75)] backdrop-blur-xl">
          Position estimée entre {currentStop?.placeName} et{" "}
          {nextStop?.placeName}
        </div>
      ) : null}

      {/* ── Bottom drawer ── */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30">
        {/* Grip handle — always visible */}
        <div className="relative z-20 mx-auto flex w-full justify-center px-4">
          <button
            type="button"
            aria-controls={drawerId}
            aria-expanded={isDrawerOpen}
            onClick={() => setIsDrawerOpen((v) => !v)}
            className="pointer-events-auto group relative flex min-h-[42px] items-center gap-2.5 rounded-t-[18px] border border-b-0 border-black/[0.08] bg-[#f4f3ef]/95 px-5 font-display text-[11px] font-semibold tracking-[-0.005em] text-[#0a192f]/52 ring-1 ring-white/80 shadow-[0_-8px_28px_-18px_rgba(15,23,42,0.34),inset_0_1px_0_rgba(255,255,255,0.96)] backdrop-blur-2xl transition-[color,background-color] hover:bg-[#faf9f6] hover:text-[#0a192f]/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0a192f]/20"
          >
            <GripHorizontal
              className="size-5 text-[#0a192f]/28 transition-colors group-hover:text-[#0a192f]/45"
              strokeWidth={1.8}
              aria-hidden="true"
            />
            <span>
              {isDrawerOpen ? "Masquer les détails" : "Afficher le suivi"}
            </span>
          </button>
        </div>

        {/* Drawer panel */}
        <div
          id={drawerId}
          aria-hidden={!isDrawerOpen}
          className={cx(
            "pointer-events-auto relative overflow-hidden rounded-t-[30px] border-x border-t border-black/[0.08] bg-[#f1f0eb]/95 ring-1 ring-white/85 shadow-[0_-2px_5px_rgba(15,23,42,0.04),0_-30px_80px_-45px_rgba(15,23,42,0.42),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-2xl transition-[height,opacity] duration-300 ease-out motion-reduce:transition-none",
            isDrawerOpen
              ? "h-[min(48svh,460px)] opacity-100 min-[810px]:h-[min(38vh,360px)]"
              : "pointer-events-none h-0 opacity-0",
          )}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-px rounded-t-[29px] shadow-[inset_1px_0_0_rgba(255,255,255,0.6),inset_-1px_0_0_rgba(15,23,42,0.02),inset_0_1px_0_rgba(255,255,255,0.82)]"
          />

          <div className="relative z-10 flex h-full flex-col">
            {/* ── Summary row ── */}
            <div className="shrink-0 border-b border-black/[0.065] bg-[#f7f6f2]/85">
              <div className="mx-auto flex flex-col gap-3 w-full max-w-[1180px] px-5 py-4 min-[810px]:px-10">
                <div className="flex items-center justify-between gap-4">
                  {/* Left: transport icon + identity */}
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-[10px] border border-black/[0.06] bg-[#e8edf2] text-[#102b49] shadow-sm">
                      <TransportIcon
                        className="size-[18px]"
                        strokeWidth={1.7}
                      />
                    </span>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-display text-[10px] font-bold uppercase tracking-[0.12em] text-[#0a192f]/35">
                          Suivi
                        </span>
                        <span className="font-display text-[11px] font-bold tracking-[0.02em] text-[#0a192f]">
                          {data.requestNumber}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full border border-[#102b49]/10 bg-[#e8edf2] px-2 py-0.5 font-display text-[9px] font-bold uppercase tracking-[0.05em] text-[#102b49]">
                          {STATUS_LABELS[data.status]}
                        </span>
                      </div>

                      <h2 className="mt-0.5 truncate font-display text-[15px] font-bold tracking-[-0.02em] text-[#0a192f]">
                        {data.problemMessage ??
                          data.vehicleName ??
                          "Suivi de votre voyage"}
                      </h2>
                    </div>
                  </div>

                  {/* Right: details info & refresh */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right hidden sm:block">
                      <p className="font-display text-[11px] font-semibold text-[#0a192f]/80">
                        {currentStop?.placeName ?? stops[0]?.placeName ?? "—"} →{" "}
                        {nextStop?.placeName ?? finalStop?.placeName ?? "—"}
                      </p>
                      <p className="text-[10px] text-[#0a192f]/40">
                        {progress.completedCount}/{stops.length} étapes (
                        {progress.progressPercent}%)
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => refetch()}
                      disabled={isFetching}
                      className="flex size-8 shrink-0 items-center justify-center rounded-[10px] border border-black/[0.07] bg-white/72 text-[#0a192f]/55 transition-colors hover:bg-white hover:text-[#0a192f]/75 disabled:opacity-50"
                      aria-label="Actualiser le suivi"
                    >
                      <RefreshCw
                        className={`size-3.5 ${isFetching ? "animate-spin" : ""}`}
                        strokeWidth={1.8}
                      />
                    </button>
                  </div>
                </div>

                {/* Single slim progress bar row */}
                <div className="flex items-center gap-3">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/[0.075]">
                    <div
                      className="h-full rounded-full bg-[#388063] transition-[width] duration-500 ease-out"
                      style={{ width: `${progress.progressPercent}%` }}
                    />
                  </div>
                  <span className="font-display text-[10px] font-bold text-[#0a192f]/60 tab-nums shrink-0">
                    {progress.progressPercent}%
                  </span>
                </div>
              </div>

              {/* ── Tab bar ── */}
              <div className="mx-auto flex w-full max-w-[1180px] px-5 min-[810px]:px-10">
                <div
                  className="flex gap-1 rounded-t-[15px] border-x border-t border-black/[0.065] bg-[#ebeae5] p-1 ring-1 ring-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"
                  role="tablist"
                  aria-label="Informations du voyage"
                >
                  {TABS.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => setActiveTab(tab.id)}
                        className={cx(
                          "inline-flex min-h-8 items-center gap-1.5 rounded-[11px] px-3 font-display text-[11px] font-semibold tracking-[-0.005em] outline-none transition-[background-color,color,box-shadow] focus-visible:ring-2 focus-visible:ring-[#0a192f]/18",
                          isActive
                            ? "bg-white text-[#0a192f] shadow-[0_1px_2px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,1)]"
                            : "text-[#0a192f]/42 hover:text-[#0a192f]/70",
                        )}
                      >
                        <tab.icon
                          className="size-3"
                          strokeWidth={1.8}
                          aria-hidden="true"
                        />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ── Scrollable tab content ── */}
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              <div className="mx-auto w-full max-w-[1180px] px-5 py-5 min-[810px]:px-10">
                {/* Problem alert — shown on every tab */}
                {data.status === "PROBLEME" && data.problemMessage ? (
                  <div className="mb-4 flex items-start gap-3 rounded-[16px] border border-[#a5403b]/12 bg-[#f7e9e7] px-4 py-3 text-[#8e3935] shadow-[0_1px_2px_rgba(15,23,42,0.035),inset_0_1px_0_rgba(255,255,255,0.72)]">
                    <AlertTriangle
                      className="mt-0.5 size-4.5 shrink-0"
                      strokeWidth={1.8}
                    />
                    <div>
                      <p className="font-display text-[11px] font-bold">
                        Incident en cours
                      </p>
                      <p className="mt-0.5 font-display text-[11px] leading-[1.5] opacity-80">
                        {data.problemMessage}
                      </p>
                    </div>
                  </div>
                ) : null}

                {/* ── Tab: Escales ── */}
                {activeTab === "escales" ? (
                  <div role="tabpanel" className="space-y-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-display text-[10px] font-bold uppercase tracking-[0.14em] text-[#0a192f]/34">
                        Escales du voyage
                      </span>
                      <h2 className="font-display text-[15px] font-bold tracking-[-0.02em] text-[#0a192f]">
                        {nextStop
                          ? `Prochaine étape : ${nextStop.placeName}`
                          : "Toutes les étapes sont terminées"}
                      </h2>
                    </div>

                    <div className="relative pl-6 space-y-5 py-2">
                      {/* Timeline line */}
                      <span className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-black/[0.08]" />

                      {stops.map((stop, index) => {
                        const reached = Boolean(stop.reachedAt);
                        const isNext = nextStop?.id === stop.id;
                        return (
                          <div
                            key={stop.id}
                            className="relative flex items-start gap-4"
                          >
                            {/* Timeline dot */}
                            <span
                              className={cx(
                                "absolute -left-[22px] mt-0.5 flex size-5 items-center justify-center rounded-full border-2 border-[#f1f0eb] text-[9px] font-bold shadow-sm",
                                reached
                                  ? "bg-[#388063] text-white"
                                  : isNext
                                    ? "bg-[#C39145] text-white"
                                    : "bg-[#d9dad7] text-[#0a192f]/48",
                              )}
                            >
                              {reached ? (
                                <CheckCircle2
                                  className="size-3"
                                  strokeWidth={2.5}
                                />
                              ) : (
                                index + 1
                              )}
                            </span>

                            <div className="min-w-0 flex-1">
                              <h3 className="font-display text-[13px] font-bold leading-[1.35] text-[#0a192f]">
                                {stop.placeName}
                              </h3>
                              <p className="mt-0.5 font-display text-[11px] text-[#0a192f]/45">
                                {reached
                                  ? `Confirmée le ${formatDate(stop.reachedAt)}`
                                  : stop.stopType === "DESTINATION"
                                    ? "Destination finale"
                                    : isNext
                                      ? `ETA ${formatDate(stop.estimatedArrivalAt)}`
                                      : `Prévue ${formatDate(stop.estimatedArrivalAt)}`}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                {/* ── Tab: Détails ── */}
                {activeTab === "details" ? (
                  <div role="tabpanel" className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="flex size-8 items-center justify-center rounded-[10px] border border-black/[0.06] bg-[#f1f0eb] text-[#388063]">
                        {data.transportType === "MARITIME" ? (
                          <Anchor className="size-4" />
                        ) : (
                          <Plane className="size-4" />
                        )}
                      </span>
                      <div>
                        <h2 className="font-display text-[14px] font-bold tracking-[-0.02em] text-[#0a192f]">
                          Détails du voyage
                        </h2>
                        <p className="font-display text-[10px] text-[#0a192f]/40">
                          Informations de référence
                        </p>
                      </div>
                    </div>
                    <dl className="divide-y divide-black/[0.06] border-t border-black/[0.06]">
                      <DetailRow label="Client" value={data.customerName} />
                      <DetailRow
                        label="Destinataire"
                        value={data.recipientName}
                      />
                      <DetailRow
                        label="Départ"
                        value={stops[0]?.placeName ?? "—"}
                      />
                      <DetailRow
                        label="Destination"
                        value={finalStop?.placeName ?? "—"}
                      />
                      <DetailRow
                        label="Type"
                        value={
                          data.transportType === "MARITIME"
                            ? "Transport maritime"
                            : "Transport aérien"
                        }
                      />
                    </dl>
                    <div className="grid grid-cols-2 gap-3 min-[760px]:grid-cols-4">
                      <StatCard
                        icon={Navigation}
                        label="Parcouru"
                        value={`${formatDistance(progress.completedDistanceKm)} km`}
                        accent="green"
                      />
                      <StatCard
                        icon={Route}
                        label="Restant"
                        value={`${formatDistance(progress.remainingDistanceKm)} km`}
                        accent="green"
                      />
                      <StatCard
                        icon={Gauge}
                        label="Vitesse moyenne"
                        value={
                          data.averageSpeed
                            ? `${data.averageSpeed} ${data.speedUnit === "KNOTS" ? "nœuds" : "km/h"}`
                            : "Non renseignée"
                        }
                      />
                      <StatCard
                        icon={Clock3}
                        label="ETA finale"
                        value={formatDate(
                          finalStop?.estimatedArrivalAt ?? null,
                          false,
                        )}
                        accent="green"
                      />
                    </div>
                  </div>
                ) : null}

                {/* ── Tab: Historique ── */}
                {activeTab === "historique" ? (
                  <div role="tabpanel" className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="flex size-8 items-center justify-center rounded-[10px] border border-black/[0.06] bg-[#f1f0eb] text-[#173f68]">
                        <Clock3 className="size-4" />
                      </span>
                      <div>
                        <h2 className="font-display text-[14px] font-bold tracking-[-0.02em] text-[#0a192f]">
                          Historique
                        </h2>
                        <p className="font-display text-[10px] text-[#0a192f]/40">
                          Événements confirmés par l&apos;administration
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col pr-1">
                      {data.events.length === 0 ? (
                        <p className="rounded-[12px] border border-dashed border-black/[0.10] px-4 py-6 text-center font-display text-[11px] text-[#0a192f]/38">
                          Aucun événement pour le moment.
                        </p>
                      ) : (
                        data.events.map((event, index) => (
                          <article
                            key={event.id}
                            className="relative flex gap-3 pb-4 last:pb-0"
                          >
                            {index < data.events.length - 1 ? (
                              <span className="absolute bottom-0 left-[6px] top-[14px] w-px bg-black/[0.08]" />
                            ) : null}
                            <span className="relative z-10 mt-1.5 size-[11px] shrink-0 rounded-full border-2 border-[#f1f0eb] bg-[#388063] shadow-sm" />
                            <div className="min-w-0 flex-1 border-b border-black/[0.055] pb-4 last:border-b-0">
                              <div className="flex flex-wrap items-start justify-between gap-2">
                                <h3 className="font-display text-[12px] font-bold tracking-[-0.015em]">
                                  {event.title}
                                </h3>
                                <time className="font-display text-[9px] text-[#0a192f]/32">
                                  {formatDate(event.createdAt)}
                                </time>
                              </div>
                              <p className="mt-1 font-display text-[11px] leading-[1.5] text-[#0a192f]/46">
                                {event.message}
                              </p>
                            </div>
                          </article>
                        ))
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

/* ── Sub-components ── */

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  accent?: "green";
}) {
  return (
    <div className="rounded-[22px] border border-black/[0.075] bg-[#fbfaf7] p-5 ring-1 ring-white/85 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_14px_34px_-28px_rgba(15,23,42,0.28),inset_0_1px_0_rgba(255,255,255,1)]">
      <div className="flex items-center gap-2 font-display text-[11px] font-semibold text-[#0a192f]/42">
        <Icon
          className={`size-4 ${accent === "green" ? "text-[#388063]" : "text-[#4e84b8]"}`}
          strokeWidth={1.7}
        />
        {label}
      </div>
      <p
        className={`mt-3 font-display text-[21px] font-bold leading-[1.1] tracking-[-0.035em] ${accent === "green" ? "text-[#388063]" : "text-[#0a192f]"}`}
      >
        {value}
      </p>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-5 py-3.5 first:pt-0 last:pb-0">
      <dt className="font-display text-[11px] font-semibold text-[#0a192f]/38">
        {label}
      </dt>
      <dd className="max-w-[65%] text-right font-display text-[12px] font-semibold leading-[1.45] text-[#0a192f]/72">
        {value}
      </dd>
    </div>
  );
}
