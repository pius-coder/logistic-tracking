"use client";

import { Loader2, Route } from "lucide-react";
import { useAuraQuery } from "@/aura/client";

import type { JourneyDto } from "@/features/journeys/shared/types";
import { JourneyPlanEditor } from "./JourneyPlanEditor";
import { JourneyOperations } from "./JourneyOperations";

export function JourneyAdminPanel({
  requestId,
  mapboxToken,
}: {
  requestId: string;
  mapboxToken: string;
}) {
  const { data, isFetching, refetch } = useAuraQuery<JourneyDto | null>(
    "journey.adminGet",
    {
      params: { requestId },
      refetchInterval: 10_000,
    },
  );

  if (data === undefined && isFetching) {
    return (
      <div className="flex min-h-[360px] items-center justify-center rounded-[30px] border border-black/[0.07] bg-[#f5f4f0]">
        <div className="flex items-center gap-3 rounded-[16px] border border-black/[0.07] bg-white px-5 py-4 shadow-[0_12px_32px_-22px_rgba(15,23,42,0.34),inset_0_1px_0_rgba(255,255,255,1)]">
          <Loader2 className="size-4 animate-spin text-[#173f68]" />
          <span className="font-display text-[12px] font-semibold text-[#0a192f]/55">Chargement du voyage…</span>
        </div>
      </div>
    );
  }

  const journey = data ?? null;

  return (
    <main className="mx-auto flex w-full max-w-[1240px] flex-col gap-8 px-4 py-8 min-[810px]:px-8 min-[810px]:py-12">
      <header className="flex flex-col gap-4 min-[720px]:flex-row min-[720px]:items-end min-[720px]:justify-between">
        <div>
          <span className="inline-flex items-center gap-2 font-display text-[10px] font-bold uppercase tracking-[0.17em] text-[#0a192f]/35">
            <Route className="size-3.5" /> Gestion simplifiée du trajet
          </span>
          <h1 className="mt-3 font-display text-[34px] font-bold leading-[1] tracking-[-0.055em] text-[#0a192f] min-[810px]:text-[44px]">
            Voyage et escales
          </h1>
          <p className="mt-3 max-w-[680px] font-display text-[14px] leading-[1.65] text-[#0a192f]/50">
            Configurez les ports ou les aéroports, publiez le voyage puis confirmez les escales une par une. Aucune coordonnée ni aucun timer manuel n’est nécessaire.
          </p>
        </div>

        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-black/[0.07] bg-white/75 px-3.5 py-2 font-display text-[10px] font-semibold text-[#0a192f]/42 shadow-[0_1px_2px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,1)]">
          <span className={`size-1.5 rounded-full ${isFetching ? "animate-pulse bg-[#C39145]" : "bg-[#388063]"}`} />
          {isFetching ? "Synchronisation…" : "Synchronisé"}
        </div>
      </header>

      {journey ? <JourneyOperations journey={journey} onChanged={refetch} /> : null}

      <JourneyPlanEditor
        key={`${journey?.id ?? "new"}-${journey?.updatedAt ?? "0"}`}
        requestId={requestId}
        mapboxToken={mapboxToken}
        journey={journey}
        onSaved={refetch}
      />
    </main>
  );
}
