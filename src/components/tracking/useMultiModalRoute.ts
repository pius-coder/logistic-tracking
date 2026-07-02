"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { greatCircle } from "@turf/great-circle";
import { point } from "@turf/helpers";

export type LegMode = "TRUCK" | "PLANE" | "BOAT";

export interface RouteLeg {
  fromIndex: number;
  geometry: GeoJSON.LineString;
  legMode: LegMode;
}

interface UseMultiModalRouteOptions {
  waypoints: Array<{ latitude: number; longitude: number }>;
  legModes: LegMode[];
  mapboxToken: string;
  refreshKey?: number;
}

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 2_000;

function buildStraightLine(
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number },
): GeoJSON.LineString {
  return {
    type: "LineString",
    coordinates: [
      [from.longitude, from.latitude],
      [to.longitude, to.latitude],
    ],
  };
}

async function fetchTruckRoute(
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number },
  mapboxToken: string,
  signal: AbortSignal,
): Promise<GeoJSON.LineString> {
  const coords = `${from.longitude},${from.latitude};${to.longitude},${to.latitude}`;
  const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coords}?geometries=geojson&overview=full&access_token=${mapboxToken}`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Directions API ${res.status}`);
  const data = await res.json();
  return data.routes?.[0]?.geometry ?? buildStraightLine(from, to);
}

function computeGreatCircle(
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number },
  npoints: number,
): GeoJSON.LineString {
  const result = greatCircle(
    point([from.longitude, from.latitude]),
    point([to.longitude, to.latitude]),
    { npoints },
  );
  return result.geometry as GeoJSON.LineString;
}

export function useMultiModalRoute({
  waypoints,
  legModes,
  mapboxToken,
  refreshKey = 0,
}: UseMultiModalRouteOptions) {
  const [legs, setLegs] = useState<RouteLeg[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastKeyRef = useRef<string>("");

  const key = `${refreshKey}|${waypoints
    .map((p, i) => `${p.latitude.toFixed(4)},${p.longitude.toFixed(4)}|${legModes[i] ?? "TRUCK"}`)
    .join(";")}`;

  const compute = useCallback(
    async (signal: AbortSignal, attempt = 0) => {
      setLoading(true);
      setError(null);

      try {
        if (waypoints.length < 2) {
          setLegs([]);
          return;
        }

        const result: RouteLeg[] = [];
        const count = Math.min(waypoints.length - 1, legModes.length);

        for (let i = 0; i < count; i++) {
          const from = waypoints[i];
          const to = waypoints[i + 1];
          const mode = legModes[i] || "TRUCK";

          if (signal.aborted) return;

          let geometry: GeoJSON.LineString;

          if (mode === "TRUCK") {
            geometry = await fetchTruckRoute(from, to, mapboxToken, signal);
          } else if (mode === "PLANE") {
            geometry = computeGreatCircle(from, to, 100);
          } else {
            geometry = computeGreatCircle(from, to, 80);
          }

          result.push({ fromIndex: i, geometry, legMode: mode });
        }

        if (signal.aborted) return;
        setLegs(result);
        setError(null);
      } catch (err) {
        if (signal.aborted) return;

        if (attempt < MAX_RETRIES) {
          retryTimerRef.current = setTimeout(() => {
            if (!signal.aborted) compute(signal, attempt + 1);
          }, RETRY_DELAY_MS);
          return;
        }

        const fallback: RouteLeg[] = [];
        for (let i = 0; i < waypoints.length - 1; i++) {
          fallback.push({
            fromIndex: i,
            geometry: buildStraightLine(waypoints[i], waypoints[i + 1]),
            legMode: legModes[i] || "TRUCK",
          });
        }
        setLegs(fallback);
        setError(err instanceof Error ? err.message : "Route error");
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key, mapboxToken],
  );

  useEffect(() => {
    if (waypoints.length < 2) {
      setLegs([]);
      setError(null);
      lastKeyRef.current = "";
      return;
    }

    if (key === lastKeyRef.current) return;
    lastKeyRef.current = key;

    abortRef.current?.abort();
    if (retryTimerRef.current) clearTimeout(retryTimerRef.current);

    const controller = new AbortController();
    abortRef.current = controller;

    compute(controller.signal);

    return () => {
      controller.abort();
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current);
    };
  }, [key, compute, waypoints.length]);

  return { legs, loading, error };
}
