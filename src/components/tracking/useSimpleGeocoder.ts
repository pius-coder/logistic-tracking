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
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (query.length < 2) {
      setDebouncedQuery("");
      setResults([]);
      return;
    }
    timerRef.current = setTimeout(() => setDebouncedQuery(query), 300);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [query]);

  const { data, isFetching } = useAuraQuery<{ results: GeocodingResult[] }>(
    "tracking.geocode",
    {
      params: { query: debouncedQuery },
      enabled: debouncedQuery.length >= 2,
    },
  );

  useEffect(() => {
    if (data?.results) setResults(data.results);
  }, [data]);

  const search = useCallback((q: string) => setQuery(q), []);
  const clear = useCallback(() => { setQuery(""); setDebouncedQuery(""); setResults([]); }, []);

  return { results, loading: isFetching, search, clear };
}
