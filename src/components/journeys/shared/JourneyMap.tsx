"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  Layer,
  Map as MapboxMap,
  Marker,
  Source,
  type MapRef,
} from "react-map-gl/mapbox";
import { CheckCircle2, MapPin, Plane, Ship } from "lucide-react";
import "mapbox-gl/dist/mapbox-gl.css";

import type {
  JourneyStopDto,
  JourneyTransportType,
} from "@/features/journeys/shared/types";
import { cn } from "@/lib/utils";
import {
  buildGreatCircleLine,
  coordinateAlongLine,
} from "./journey-geometry";

type MapStop = Pick<
  JourneyStopDto,
  "id" | "placeName" | "latitude" | "longitude" | "sequence" | "reachedAt"
>;

type Props = {
  stops: MapStop[];
  transportType: JourneyTransportType;
  mapboxToken: string;
  currentFromIndex?: number;
  currentLegFraction?: number;
  showEstimatedVehicle?: boolean;
  onStopClick?: (stopId: string) => void;
  className?: string;
};

const ROUTE_COLORS = {
  completed: "#388063",
  current: "#C39145",
  future: "#7A8795",
} as const;

export function JourneyMap({
  stops,
  transportType,
  mapboxToken,
  currentFromIndex = -1,
  currentLegFraction = 0,
  showEstimatedVehicle = false,
  onStopClick,
  className = "h-full min-h-[420px]",
}: Props) {
  const mapRef = useRef<MapRef>(null);
  const orderedStops = useMemo(
    () => [...stops].sort((a, b) => a.sequence - b.sequence),
    [stops],
  );

  const legs = useMemo(
    () =>
      orderedStops.slice(0, -1).map((from, index) => {
        const to = orderedStops[index + 1];
        return {
          fromIndex: index,
          geometry: buildGreatCircleLine(from as JourneyStopDto, to as JourneyStopDto),
          state: to.reachedAt
            ? "completed"
            : index === currentFromIndex
              ? "current"
              : "future",
        } as const;
      }),
    [currentFromIndex, orderedStops],
  );

  const vehicleCoordinate = useMemo(() => {
    if (!showEstimatedVehicle || currentFromIndex < 0) return null;
    const leg = legs[currentFromIndex];
    return leg ? coordinateAlongLine(leg.geometry, currentLegFraction) : null;
  }, [currentFromIndex, currentLegFraction, legs, showEstimatedVehicle]);

  const hasFittedRef = useRef(false);

  const fitAll = useCallback(() => {
    if (!mapRef.current || orderedStops.length === 0) return;
    if (orderedStops.length === 1) {
      mapRef.current.flyTo({
        center: [orderedStops[0].longitude, orderedStops[0].latitude],
        zoom: 6,
        duration: 500,
      });
      return;
    }

    const lngs = orderedStops.map((stop) => stop.longitude);
    const lats = orderedStops.map((stop) => stop.latitude);
    mapRef.current.fitBounds(
      [
        [Math.min(...lngs), Math.min(...lats)],
        [Math.max(...lngs), Math.max(...lats)],
      ],
      {
        padding: { top: 90, right: 70, bottom: 90, left: 70 },
        maxZoom: 6,
        duration: 700,
      },
    );
  }, [orderedStops]);

  useEffect(() => {
    if (hasFittedRef.current) return;
    if (orderedStops.length === 0) return;
    hasFittedRef.current = true;
    const timeout = window.setTimeout(fitAll, 80);
    return () => window.clearTimeout(timeout);
  }, [fitAll, orderedStops.length]);

  const initial = orderedStops[0] ?? {
    latitude: 5.3599,
    longitude: -4.0083,
  };

  if (!mapboxToken) {
    return (
      <div className={cn("relative isolate overflow-hidden bg-[#071522]", className)}>
        <div className="flex h-full min-h-[320px] items-center justify-center px-6 text-center">
          <div className="max-w-[360px] rounded-[18px] border border-white/[0.10] bg-white/[0.06] px-5 py-4 text-white/70 shadow-[0_18px_44px_-28px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl">
            <MapPin className="mx-auto size-5 text-white/45" strokeWidth={1.8} />
            <p className="mt-3 font-display text-[12px] font-semibold">
              Token Mapbox manquant. La carte ne peut pas être chargée.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative isolate overflow-hidden bg-[#071522]", className)}>
      <MapboxMap
        ref={mapRef}
        mapboxAccessToken={mapboxToken}
        initialViewState={{
          latitude: initial.latitude,
          longitude: initial.longitude,
          zoom: 3,
        }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        dragRotate={false}
        touchPitch={false}
        maxPitch={0}
        minZoom={1.5}
        onLoad={fitAll}
        style={{ width: "100%", height: "100%" }}
      >
        {legs.map((leg) => {
          const color = ROUTE_COLORS[leg.state];
          const opacity = leg.state === "future" ? 0.38 : 0.94;
          const width = leg.state === "current" ? 5.5 : 4;
          return (
            <Source
              key={`journey-leg-${leg.fromIndex}`}
              id={`journey-leg-${leg.fromIndex}`}
              type="geojson"
              data={{
                type: "Feature",
                properties: { state: leg.state },
                geometry: leg.geometry,
              }}
            >
              <Layer
                id={`journey-leg-casing-${leg.fromIndex}`}
                type="line"
                layout={{ "line-cap": "round", "line-join": "round" }}
                paint={{
                  "line-color": "#04101b",
                  "line-width": width + 4,
                  "line-opacity": 0.72,
                  "line-dasharray": transportType === "AERIEN" ? [1.5, 2.2] : [1, 0],
                }}
              />
              {leg.state === "current" ? (
                <Layer
                  id={`journey-leg-glow-${leg.fromIndex}`}
                  type="line"
                  layout={{ "line-cap": "round", "line-join": "round" }}
                  paint={{
                    "line-color": color,
                    "line-width": width + 10,
                    "line-opacity": 0.18,
                    "line-blur": 7,
                    "line-dasharray": transportType === "AERIEN" ? [1.5, 2.2] : [1, 0],
                  }}
                />
              ) : null}
              <Layer
                id={`journey-leg-line-${leg.fromIndex}`}
                type="line"
                layout={{ "line-cap": "round", "line-join": "round" }}
                paint={{
                  "line-color": color,
                  "line-width": width,
                  "line-opacity": opacity,
                  "line-dasharray": transportType === "AERIEN" ? [1.5, 2.2] : [1, 0],
                }}
              />
            </Source>
          );
        })}

        {orderedStops.map((stop, index) => {
          const isReached = Boolean(stop.reachedAt);
          const isNext = !isReached && index === currentFromIndex + 1;
          return (
            <Marker
              key={stop.id}
              latitude={stop.latitude}
              longitude={stop.longitude}
              anchor="bottom"
            >
              <button
                type="button"
                onClick={() => onStopClick?.(stop.id)}
                className="group relative flex flex-col items-center outline-none"
                title={stop.placeName}
              >
                <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 w-max max-w-[220px] -translate-x-1/2 translate-y-1 rounded-[10px] border border-white/[0.09] bg-[#071522]/95 px-3 py-2 font-display text-[10px] font-semibold text-white/78 opacity-0 shadow-[0_10px_26px_-15px_rgba(0,0,0,0.9)] backdrop-blur-xl transition-[opacity,transform] group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
                  {stop.placeName}
                </span>
                <span
                  className={`relative flex items-center justify-center border shadow-[0_2px_5px_rgba(0,0,0,0.3),0_12px_25px_-14px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.18)] transition-transform group-hover:-translate-y-1 ${
                    isNext
                      ? "size-10 rounded-[14px] border-white/75 bg-[#C39145] text-[#071522] ring-4 ring-[#C39145]/20"
                      : isReached
                        ? "size-8 rounded-[11px] border-white/65 bg-[#388063] text-white"
                        : "size-8 rounded-[11px] border-white/70 bg-[#e9e8e3] text-[#0a192f]"
                  }`}
                >
                  {isReached ? (
                    <CheckCircle2 className="size-4" strokeWidth={2} />
                  ) : isNext ? (
                    <MapPin className="size-[18px]" strokeWidth={2} />
                  ) : (
                    <span className="font-display text-[10px] font-bold">{index + 1}</span>
                  )}
                </span>
                <span className={`h-2 w-px ${isReached ? "bg-[#388063]" : isNext ? "bg-[#C39145]" : "bg-[#e9e8e3]"}`} />
              </button>
            </Marker>
          );
        })}

        {vehicleCoordinate ? (
          <Marker latitude={vehicleCoordinate[1]} longitude={vehicleCoordinate[0]} anchor="center">
            <div className="pointer-events-none relative flex items-center justify-center">
              <span className="absolute size-16 animate-ping rounded-full bg-[#C39145]/14" />
              <span className="absolute size-12 rounded-full border border-[#C39145]/25 bg-[#C39145]/10" />
              <span className="relative flex size-11 items-center justify-center rounded-[15px] border border-white/80 bg-[#102b49] text-white ring-1 ring-black/40 shadow-[0_2px_6px_rgba(0,0,0,0.34),0_16px_30px_-16px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.16)]">
                {transportType === "MARITIME" ? <Ship className="size-5" strokeWidth={1.8} /> : <Plane className="size-5" strokeWidth={1.8} />}
              </span>
            </div>
          </Marker>
        ) : null}
      </MapboxMap>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_52%,rgba(2,8,16,0.20)_100%)]" />
      <button
        type="button"
        onClick={fitAll}
        className="absolute bottom-4 right-4 z-10 rounded-[13px] border border-black/[0.08] bg-[#f7f6f2]/94 px-3 py-2 font-display text-[10px] font-semibold text-[#0a192f]/60 ring-1 ring-white/80 shadow-[0_6px_20px_-12px_rgba(15,23,42,0.45),inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-xl hover:text-[#0a192f]"
      >
        Voir tout le trajet
      </button>
    </div>
  );
}
