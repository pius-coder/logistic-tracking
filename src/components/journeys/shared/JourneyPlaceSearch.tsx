"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, MapPin, Search, X } from "lucide-react";
import { useAuraQuery } from "@/aura/client";
import type {
  JourneyGeocodingResult,
  JourneyTransportType,
} from "@/features/journeys/shared/types";

type Props = {
  transportType: JourneyTransportType;
  value?: JourneyGeocodingResult | null;
  label: string;
  placeholder?: string;
  onSelect: (place: JourneyGeocodingResult) => void;
  onClear?: () => void;
};

export function JourneyPlaceSearch({
  transportType,
  value,
  label,
  placeholder,
  onSelect,
  onClear,
}: Props) {
  const [query, setQuery] = useState(value?.label ?? "");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [open, setOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (value) setQuery(value.label);
  }, [value]);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (query.trim().length < 2 || value?.label === query) {
      setDebouncedQuery("");
      return;
    }
    timerRef.current = setTimeout(() => setDebouncedQuery(query.trim()), 280);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, value?.label]);

  const { data, isFetching } = useAuraQuery<{ results: JourneyGeocodingResult[] }>(
    "journey.geocode",
    {
      params: { query: debouncedQuery, transportType },
      enabled: debouncedQuery.length >= 2,
      staleTime: 60_000,
    },
  );

  const results = data?.results ?? [];

  return (
    <div className="relative flex flex-col gap-2">
      <label className="font-display text-[11px] font-bold uppercase tracking-[0.12em] text-[#0a192f]/42">
        {label}
      </label>

      <div className="group relative flex min-h-[54px] items-center gap-3 rounded-[16px] border border-black/[0.08] bg-[#faf9f6] px-4 ring-1 ring-white/80 shadow-[0_1px_2px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.95)] transition-[border-color,box-shadow,background-color] focus-within:border-[#173f68]/25 focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(23,63,104,0.08),inset_0_1px_0_rgba(255,255,255,1)]">
        <Search className="size-[18px] shrink-0 text-[#0a192f]/32 group-focus-within:text-[#173f68]/70" strokeWidth={1.8} />
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
            if (value && event.target.value !== value.label) onClear?.();
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder ?? `Rechercher ${transportType === "MARITIME" ? "un port" : "un aéroport"}…`}
          className="min-w-0 flex-1 bg-transparent font-display text-[14px] font-medium tracking-[-0.01em] text-[#0a192f] outline-none placeholder:font-normal placeholder:text-[#0a192f]/28"
          autoComplete="off"
        />
        {isFetching ? (
          <Loader2 className="size-4 animate-spin text-[#173f68]/55" />
        ) : query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setDebouncedQuery("");
              onClear?.();
            }}
            className="flex size-7 items-center justify-center rounded-full text-[#0a192f]/30 hover:bg-black/[0.05] hover:text-[#0a192f]/65"
            aria-label="Effacer le lieu"
          >
            <X className="size-3.5" />
          </button>
        ) : null}
      </div>

      {open && debouncedQuery.length >= 2 ? (
        <div className="absolute inset-x-0 top-[82px] z-50 overflow-hidden rounded-[18px] border border-black/[0.08] bg-[#fbfaf7]/98 p-1.5 ring-1 ring-white/80 shadow-[0_18px_45px_-22px_rgba(15,23,42,0.38),0_2px_5px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(255,255,255,1)] backdrop-blur-xl">
          {isFetching ? (
            <div className="flex items-center gap-2 px-3 py-4 font-display text-[12px] text-[#0a192f]/45">
              <Loader2 className="size-4 animate-spin" /> Recherche du lieu…
            </div>
          ) : results.length === 0 ? (
            <p className="px-3 py-4 font-display text-[12px] text-[#0a192f]/42">
              Aucun résultat. Essayez avec le nom complet du {transportType === "MARITIME" ? "port" : "de l’aéroport"} et le pays.
            </p>
          ) : (
            results.map((result) => (
              <button
                key={result.id}
                type="button"
                onClick={() => {
                  setQuery(result.label);
                  setOpen(false);
                  onSelect(result);
                }}
                className="flex w-full items-start gap-3 rounded-[13px] px-3 py-3 text-left transition-colors hover:bg-black/[0.045] focus-visible:bg-black/[0.045] focus-visible:outline-none"
              >
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-[10px] border border-black/[0.06] bg-white text-[#173f68] shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                  <MapPin className="size-4" strokeWidth={1.7} />
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-display text-[13px] font-bold tracking-[-0.015em] text-[#0a192f]">{result.name}</span>
                  <span className="mt-0.5 block line-clamp-2 font-display text-[11px] leading-[1.45] text-[#0a192f]/42">{result.label}</span>
                </span>
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
