"use client";

import { useEffect, useMemo, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Anchor,
  CheckCircle2,
  Clock3,
  Gauge,
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
  EN_COURS: "Navigation active",
  EN_PAUSE: "Voyage en pause",
  PROBLEME: "Incident en cours",
  TERMINE: "Voyage terminé",
  ANNULE: "Voyage annulé",
};

export function JourneyTrackingClient({
  publicToken,
  mapboxToken,
}: {
  publicToken: string;
  mapboxToken: string;
}) {
  const [nowMs, setNowMs] = useState(() => Date.now());
  const { data, isFetching, refetch } = useAuraQuery<JourneyDto | null>(
    "journey.publicGet",
    {
      params: { token: publicToken },
      refetchInterval: 10_000,
      staleTime: 5_000,
    },
  );

  useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), 30_000);
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
          <span className="font-display text-[13px] font-semibold text-white/70">Chargement du suivi…</span>
        </div>
      </div>
    );
  }

  if (!data || !progress) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f3ef] px-5">
        <div className="max-w-[420px] rounded-[28px] border border-black/[0.075] bg-[#fbfaf7] p-8 text-center ring-1 ring-white/85 shadow-[0_24px_65px_-40px_rgba(15,23,42,0.36),inset_0_1px_0_rgba(255,255,255,1)]">
          <MapPin className="mx-auto size-7 text-[#0a192f]/28" />
          <h1 className="mt-4 font-display text-[22px] font-bold tracking-[-0.04em] text-[#0a192f]">Suivi indisponible</h1>
          <p className="mt-3 font-display text-[13px] leading-[1.65] text-[#0a192f]/45">Ce voyage n’existe pas, n’est pas encore publié ou le lien a expiré.</p>
        </div>
      </div>
    );
  }

  const stops = progress.stops;
  const nextStop = progress.nextStopIndex >= 0 ? stops[progress.nextStopIndex] : null;
  const currentStop = progress.currentFromIndex >= 0 ? stops[progress.currentFromIndex] : null;
  const finalStop = stops.at(-1) ?? null;
  const TransportIcon = data.transportType === "MARITIME" ? Ship : Plane;
  const hasEstimatedPosition =
    data.status === "EN_COURS" &&
    progress.currentFromIndex >= 0 &&
    Boolean(nextStop?.estimatedArrivalAt);

  return (
    <main className="min-h-screen bg-[#f2f1ec] text-[#0a192f]">
      <section className="relative isolate overflow-hidden bg-[#0a6b47] text-white">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.14),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.025),rgba(0,0,0,0.08))]" />
        <div className="relative mx-auto flex w-full max-w-[1180px] flex-col gap-6 px-5 pb-7 pt-6 min-[810px]:px-10 min-[810px]:pb-9 min-[810px]:pt-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-[16px] border border-white/[0.12] bg-white/[0.08] text-white shadow-[0_1px_2px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(255,255,255,0.10)]">
                <TransportIcon className="size-[22px]" strokeWidth={1.7} />
              </span>
              <div>
                <span className="font-display text-[10px] font-bold uppercase tracking-[0.16em] text-white/52">Suivi du voyage</span>
                <h1 className="mt-1 font-display text-[27px] font-bold leading-[1.05] tracking-[-0.045em] min-[640px]:text-[34px]">{data.vehicleName}</h1>
                <div className="mt-2 flex flex-wrap items-center gap-2.5 font-display text-[12px] text-white/58">
                  <span className="inline-flex items-center gap-1.5"><span className="size-1.5 rounded-full bg-[#6ff0aa] shadow-[0_0_0_4px_rgba(111,240,170,0.10)]" />{STATUS_LABELS[data.status]}</span>
                  <span>·</span>
                  <span>{data.requestNumber}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="flex size-11 shrink-0 items-center justify-center rounded-[15px] border border-white/[0.12] bg-white/[0.08] text-white/72 shadow-[0_1px_2px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(255,255,255,0.10)] transition-colors hover:bg-white/[0.13] hover:text-white disabled:opacity-50"
              aria-label="Actualiser le suivi"
            >
              <RefreshCw className={`size-[18px] ${isFetching ? "animate-spin" : ""}`} strokeWidth={1.8} />
            </button>
          </div>

          <div className="grid gap-3 min-[700px]:grid-cols-[1fr_auto] min-[700px]:items-end">
            <div>
              <p className="max-w-[720px] font-display text-[14px] leading-[1.6] text-white/68">
                {data.problemMessage ?? data.latestMessage ?? "Le suivi est actualisé automatiquement à chaque nouvelle confirmation de l’administration."}
              </p>
              <p className="mt-2 font-display text-[10px] uppercase tracking-[0.11em] text-white/34">
                Mise à jour automatique toutes les 10 secondes · dernière synchronisation {formatDate(data.updatedAt)}
              </p>
            </div>
            <div className="rounded-full border border-white/[0.11] bg-white/[0.075] px-4 py-2 font-display text-[11px] font-semibold text-white/64 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              {progress.completedCount}/{stops.length} étapes complétées
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-6 px-4 py-6 min-[810px]:px-8 min-[810px]:py-9">
        {data.status === "PROBLEME" && data.problemMessage ? (
          <div className="flex items-start gap-3 rounded-[20px] border border-[#a5403b]/12 bg-[#f7e9e7] px-5 py-4 text-[#8e3935] shadow-[0_1px_2px_rgba(15,23,42,0.035),inset_0_1px_0_rgba(255,255,255,0.72)]">
            <AlertTriangle className="mt-0.5 size-5 shrink-0" strokeWidth={1.8} />
            <div>
              <p className="font-display text-[12px] font-bold">Incident en cours</p>
              <p className="mt-1 font-display text-[12px] leading-[1.55] opacity-80">{data.problemMessage}</p>
            </div>
          </div>
        ) : null}

        <section className="overflow-hidden rounded-[30px] border border-black/[0.075] bg-[#fbfaf7] ring-1 ring-white/85 shadow-[0_2px_4px_rgba(15,23,42,0.04),0_28px_75px_-44px_rgba(15,23,42,0.38),inset_0_1px_0_rgba(255,255,255,1)]">
          <div className="relative h-[440px] min-[810px]:h-[560px]">
            <JourneyMap
              stops={stops}
              transportType={data.transportType}
              mapboxToken={mapboxToken}
              currentFromIndex={progress.currentFromIndex}
              currentLegFraction={progress.currentLegFraction}
              showEstimatedVehicle={hasEstimatedPosition}
              className="h-full"
            />
            {hasEstimatedPosition ? (
              <div className="pointer-events-none absolute left-4 top-4 z-10 rounded-full border border-white/[0.10] bg-[#071522]/80 px-3 py-2 font-display text-[10px] font-semibold text-white/62 shadow-[0_10px_28px_-16px_rgba(0,0,0,0.75)] backdrop-blur-xl">
                Position estimée entre {currentStop?.placeName} et {nextStop?.placeName}
              </div>
            ) : null}
          </div>

          <div className="border-t border-black/[0.065] p-5 min-[810px]:p-7">
            <div className="mb-5 flex flex-col gap-2 min-[600px]:flex-row min-[600px]:items-center min-[600px]:justify-between">
              <div>
                <span className="font-display text-[10px] font-bold uppercase tracking-[0.14em] text-[#0a192f]/34">Escales du voyage</span>
                <h2 className="mt-1 font-display text-[22px] font-bold tracking-[-0.04em]">{nextStop ? `Prochaine étape : ${nextStop.placeName}` : "Toutes les étapes sont terminées"}</h2>
              </div>
              <span className="font-display text-[12px] font-semibold text-[#388063]">{progress.progressPercent} % du trajet estimé</span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-black/[0.07] shadow-[inset_0_1px_1px_rgba(15,23,42,0.08)]">
              <div className="h-full rounded-full bg-[#388063] transition-[width] duration-700" style={{ width: `${progress.progressPercent}%` }} />
            </div>

            <div className="mt-6 grid gap-3 min-[620px]:grid-cols-2 min-[980px]:grid-cols-4">
              {stops.map((stop, index) => {
                const reached = Boolean(stop.reachedAt);
                const isNext = nextStop?.id === stop.id;
                return (
                  <article
                    key={stop.id}
                    className={`rounded-[19px] border p-4 ring-1 ring-white/75 shadow-[0_1px_2px_rgba(15,23,42,0.035),inset_0_1px_0_rgba(255,255,255,0.82)] ${
                      reached
                        ? "border-[#388063]/12 bg-[#e9f2ed]"
                        : isNext
                          ? "border-[#C39145]/18 bg-[#f6efe3]"
                          : "border-black/[0.06] bg-[#efeee9]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`flex size-8 shrink-0 items-center justify-center rounded-full font-display text-[11px] font-bold ${reached ? "bg-[#388063] text-white" : isNext ? "bg-[#C39145] text-[#071522]" : "bg-[#d9dad7] text-[#0a192f]/48"}`}>
                        {reached ? <CheckCircle2 className="size-4" strokeWidth={2} /> : index + 1}
                      </span>
                      <div className="min-w-0">
                        <h3 className="line-clamp-2 font-display text-[13px] font-bold leading-[1.35] text-[#0a192f]">{stop.placeName}</h3>
                        <p className="mt-1 font-display text-[10px] text-[#0a192f]/40">
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
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3 min-[760px]:grid-cols-4">
          <StatCard icon={Navigation} label="Parcouru" value={`${formatDistance(progress.completedDistanceKm)} km`} accent="green" />
          <StatCard icon={Route} label="Restant" value={`${formatDistance(progress.remainingDistanceKm)} km`} accent="green" />
          <StatCard icon={Gauge} label="Vitesse moyenne" value={data.averageSpeed ? `${data.averageSpeed} ${data.speedUnit === "KNOTS" ? "nœuds" : "km/h"}` : "Non renseignée"} />
          <StatCard icon={Clock3} label="ETA finale" value={formatDate(finalStop?.estimatedArrivalAt ?? null, false)} accent="green" />
        </section>

        <section className="grid gap-6 min-[900px]:grid-cols-[0.92fr_1.08fr]">
          <div className="rounded-[28px] border border-black/[0.075] bg-[#fbfaf7] p-6 ring-1 ring-white/85 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_18px_45px_-32px_rgba(15,23,42,0.30),inset_0_1px_0_rgba(255,255,255,1)]">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-[13px] border border-black/[0.06] bg-[#f1f0eb] text-[#388063]">
                {data.transportType === "MARITIME" ? <Anchor className="size-[18px]" /> : <Plane className="size-[18px]" />}
              </span>
              <div>
                <h2 className="font-display text-[16px] font-bold tracking-[-0.02em]">Détails du voyage</h2>
                <p className="font-display text-[11px] text-[#0a192f]/40">Informations de référence</p>
              </div>
            </div>
            <dl className="mt-5 divide-y divide-black/[0.06]">
              <DetailRow label="Client" value={data.customerName} />
              <DetailRow label="Destinataire" value={data.recipientName} />
              <DetailRow label="Départ" value={stops[0]?.placeName ?? "—"} />
              <DetailRow label="Destination" value={finalStop?.placeName ?? "—"} />
              <DetailRow label="Type" value={data.transportType === "MARITIME" ? "Transport maritime" : "Transport aérien"} />
            </dl>
          </div>

          <div className="rounded-[28px] border border-black/[0.075] bg-[#fbfaf7] p-6 ring-1 ring-white/85 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_18px_45px_-32px_rgba(15,23,42,0.30),inset_0_1px_0_rgba(255,255,255,1)]">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-[13px] border border-black/[0.06] bg-[#f1f0eb] text-[#173f68]"><Clock3 className="size-[18px]" /></span>
              <div>
                <h2 className="font-display text-[16px] font-bold tracking-[-0.02em]">Historique</h2>
                <p className="font-display text-[11px] text-[#0a192f]/40">Événements confirmés par l’administration</p>
              </div>
            </div>

            <div className="mt-5 flex max-h-[370px] flex-col overflow-y-auto pr-1">
              {data.events.length === 0 ? (
                <p className="rounded-[16px] border border-dashed border-black/[0.10] px-4 py-7 text-center font-display text-[12px] text-[#0a192f]/38">Aucun événement pour le moment.</p>
              ) : (
                data.events.map((event, index) => (
                  <article key={event.id} className="relative flex gap-3 pb-5 last:pb-0">
                    {index < data.events.length - 1 ? <span className="absolute bottom-0 left-[6px] top-[14px] w-px bg-black/[0.08]" /> : null}
                    <span className="relative z-10 mt-1.5 size-[13px] shrink-0 rounded-full border-[3px] border-[#fbfaf7] bg-[#388063] shadow-[0_0_0_1px_rgba(56,128,99,0.20)]" />
                    <div className="min-w-0 flex-1 border-b border-black/[0.055] pb-5 last:border-b-0">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <h3 className="font-display text-[13px] font-bold tracking-[-0.015em]">{event.title}</h3>
                        <time className="font-display text-[9px] text-[#0a192f]/32">{formatDate(event.createdAt)}</time>
                      </div>
                      <p className="mt-1.5 font-display text-[11px] leading-[1.55] text-[#0a192f]/46">{event.message}</p>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

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
        <Icon className={`size-4 ${accent === "green" ? "text-[#388063]" : "text-[#4e84b8]"}`} strokeWidth={1.7} />
        {label}
      </div>
      <p className={`mt-3 font-display text-[21px] font-bold leading-[1.1] tracking-[-0.035em] ${accent === "green" ? "text-[#388063]" : "text-[#0a192f]"}`}>{value}</p>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-5 py-3.5 first:pt-0 last:pb-0">
      <dt className="font-display text-[11px] font-semibold text-[#0a192f]/38">{label}</dt>
      <dd className="max-w-[65%] text-right font-display text-[12px] font-semibold leading-[1.45] text-[#0a192f]/72">{value}</dd>
    </div>
  );
}
