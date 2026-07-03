"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuraQuery } from "@/aura/client";

export interface GeocodingResult {
  name: string;
  lat: number;
  lng: number;
}

export function useSimpleGeocoder() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDebouncedQuery(query.length < 2 ? "" : query), query.length < 2 ? 0 : 300);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [query]);

  const { data, isFetching } = useAuraQuery<{ results: GeocodingResult[] }>(
    "tracking.geocode",
    {
      params: { query: debouncedQuery },
      enabled: debouncedQuery.length >= 2,
    },
  );

  const results = debouncedQuery.length >= 2 ? data?.results ?? [] : [];

  const search = useCallback((q: string) => setQuery(q), []);
  const clear = useCallback(() => { setQuery(""); setDebouncedQuery(""); }, []);

  return { results, loading: isFetching, search, clear };
}
