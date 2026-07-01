"use client";

import { useRef, useMemo, useCallback, useState } from "react";
import { Map, Marker, Source, Layer, NavigationControl, type MapRef } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { useMultiModalRoute, type LegMode } from "./useMultiModalRoute";
import { useVehiclePosition, formatDuration, type VehicleStep } from "./useVehiclePosition";
import { Loader2, Plane, Ship, Truck, ArrowLeft, MapPin, RotateCw } from "lucide-react";
import Link from "next/link";

type Step = {
  id: string;
  locationName: string;
  stepType: string;
  legMode?: LegMode;
  reachedAt?: string | Date | null;
  latitude: number | null;
  longitude: number | null;
  timerStartedAt?: string | Date | null;
  timerEndsAt?: string | Date | null;
  timerDurationHours?: number | null;
  isTimerPaused?: boolean;
  pausedRemainingMinutes?: number | null;
};

type Props = {
  steps: Step[];
  mapboxToken: string;
  transportMode: string;
  requestId: string;
  backHref?: string;
  onRefresh?: () => void;
  onStepSelect?: (stepId: string) => void;
};

const LEG_MODE_COLORS: Record<string, string> = {
  TRUCK: "#FF5733",
  PLANE: "#3388FF",
  BOAT: "#2ECC71",
};

function VehicleIcon({ legMode }: { legMode: string }) {
  if (legMode === "PLANE") return <Plane className="h-5 w-5 text-primary-foreground" />;
  if (legMode === "BOAT") return <Ship className="h-5 w-5 text-primary-foreground" />;
  return <Truck className="h-5 w-5 text-primary-foreground" />;
}

export function DhlTrackingMap({ steps, mapboxToken, transportMode, requestId, backHref, onRefresh, onStepSelect }: Props) {
  const mapRef = useRef<MapRef>(null);

  const routePoints = useMemo(
    () => steps.filter((s) => s.latitude && s.longitude).map((s) => ({ ...s, lat: s.latitude!, lng: s.longitude! })),
    [steps],
  );

  const waypoints = useMemo(() => routePoints.map((p) => ({ latitude: p.lat, longitude: p.lng })), [routePoints]);
  const legModes = useMemo(() => routePoints.slice(0, -1).map((s) => s.legMode || "TRUCK"), [routePoints]);

  const { legs, loading } = useMultiModalRoute({ waypoints, legModes, mapboxToken });

  const vehicleSteps: VehicleStep[] = useMemo(
    () => steps.map((s) => ({
      id: s.id,
      locationName: s.locationName,
      latitude: s.latitude,
      longitude: s.longitude,
      reachedAt: s.reachedAt ?? null,
      timerStartedAt: s.timerStartedAt ?? null,
      timerEndsAt: s.timerEndsAt ?? null,
      timerDurationHours: s.timerDurationHours ?? null,
      isTimerPaused: s.isTimerPaused ?? false,
      pausedRemainingMinutes: s.pausedRemainingMinutes ?? null,
    })),
    [steps],
  );

  const vehicle = useVehiclePosition(vehicleSteps, legs);

  const handleStepClick = useCallback((stepId: string, lat: number, lng: number) => {
    mapRef.current?.flyTo({ center: [lng, lat], zoom: 8, duration: 1000 });
    onStepSelect?.(stepId);
  }, [onStepSelect]);

  const activeIndex = useMemo(() => {
    for (let i = 0; i < routePoints.length; i++) {
      if (!routePoints[i].reachedAt) return i;
    }
    return routePoints.length - 1;
  }, [routePoints]);

  const currentLegMode = useMemo(() => {
    if (!vehicle || vehicle.status === "arrived") return transportMode === "AVION" ? "PLANE" : "TRUCK";
    return legModes[vehicle.legIndex] || "TRUCK";
  }, [vehicle, legModes, transportMode]);

  const center = useMemo(() => {
    if (vehicle) return { lat: vehicle.latitude, lng: vehicle.longitude };
    if (routePoints.length === 0) return { lat: 5.3599, lng: -4.0083 };
    const target = routePoints[activeIndex] || routePoints[0];
    return { lat: target.lat, lng: target.lng };
  }, [vehicle, routePoints, activeIndex]);

  if (routePoints.length === 0) {
    return (
      <div className="flex h-full items-center justify-center bg-muted">
        <p className="text-sm text-muted-foreground">La carte apparaitra quand les etapes seront renseignees.</p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <div className="absolute left-4 top-4 z-10">
        <Link
          href={backHref || `/demande/${requestId}`}
          className="flex items-center gap-2 rounded-md bg-background px-4 py-2 text-sm font-medium shadow-lg hover:bg-accent"
        >
          <ArrowLeft className="h-4 w-4" /> Retour
        </Link>
      </div>

      <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
        <button type="button" onClick={onRefresh} className="flex items-center gap-1 rounded-md bg-background px-3 py-2 text-xs font-medium shadow-lg hover:bg-accent" title="Rafraichir">
          <RotateCw className="h-3.5 w-3.5" />
        </button>
        {vehicle && vehicle.status !== "arrived" && (
          <div className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg">
            {vehicle.status === "idle" && "En attente de depart"}
            {vehicle.status === "moving" && formatDuration(vehicle.remainingMs)}
            {vehicle.status === "paused" && `Pause — ${formatDuration(vehicle.remainingMs)}`}
          </div>
        )}
      </div>

      <Map
        ref={mapRef}
        mapboxAccessToken={mapboxToken}
        initialViewState={{ latitude: center.lat, longitude: center.lng, zoom: 4 }}
        mapStyle="mapbox://styles/mapbox/dark-v11"
      >
        <NavigationControl position="bottom-right" />

        {/* Per-leg route layers */}
        {legs.map((leg) => {
          const isReachedLeg = legs.every((l, i) => i < leg.fromIndex || routePoints[l.fromIndex]?.reachedAt) && routePoints[leg.fromIndex]?.reachedAt;
          const isCurrentLeg = !isReachedLeg && (leg.fromIndex === 0 || legs.slice(0, leg.fromIndex).every((_, i) => routePoints[i]?.reachedAt));
          const traveledOpacity = isReachedLeg ? 0.95 : isCurrentLeg ? 0.75 : 0.35;
          const traveledWidth = isReachedLeg ? 7 : 4;

          return (
            <Source
              key={`leg-${leg.fromIndex}`}
              id={`leg-${leg.fromIndex}`}
              type="geojson"
              data={{ type: "Feature", geometry: leg.geometry, properties: { legMode: leg.legMode } }}
            >
              <Layer
                id={`leg-glow-${leg.fromIndex}`}
                type="line"
                paint={{
                  "line-color": LEG_MODE_COLORS[leg.legMode] || "#9ca3af",
                  "line-width": traveledWidth + 6,
                  "line-opacity": traveledOpacity * 0.25,
                  "line-blur": 8,
                  "line-dasharray": leg.legMode === "PLANE" ? [2, 4] : [1, 0],
                }}
              />
              <Layer
                id={`leg-line-${leg.fromIndex}`}
                type="line"
                paint={{
                  "line-color": LEG_MODE_COLORS[leg.legMode] || "#9ca3af",
                  "line-width": traveledWidth,
                  "line-opacity": traveledOpacity,
                  "line-dasharray": leg.legMode === "PLANE" ? [2, 4] : [1, 0],
                }}
              />
            </Source>
          );
        })}

        {/* Step markers */}
        {routePoints.map((step, idx) => {
          const isReached = !!step.reachedAt;
          const isCurrent = idx === activeIndex;
          return (
            <Marker key={step.id} latitude={step.lat} longitude={step.lng} anchor="bottom" onClick={(e) => { e.originalEvent?.stopPropagation?.(); handleStepClick(step.id, step.lat, step.lng); }}>
              <div
                className={`flex h-6 w-8 items-center justify-center rounded-md border-2 shadow-md cursor-pointer transition-transform hover:scale-110 ${
                  isCurrent ? "border-background bg-primary text-primary-foreground" : isReached ? "border-background bg-primary/80 text-primary-foreground" : "border-muted bg-muted text-foreground"
                }`}
              >
                {isCurrent ? <MapPin className="h-4 w-4" /> : <span className="text-xs font-bold">{idx + 1}</span>}
              </div>
            </Marker>
          );
        })}

        {/* Vehicle marker */}
        {vehicle && (
          <Marker latitude={vehicle.latitude} longitude={vehicle.longitude} anchor="center">
            <div className="relative flex items-center justify-center">
              <div className="absolute h-12 w-12 animate-ping rounded-md bg-primary opacity-20" />
              <div
                className="flex h-10 w-10 items-center justify-center rounded-md border-2 border-background bg-primary shadow-xl transition-transform"
                style={{ transform: `rotate(${vehicle.heading}deg)` }}
              >
                <VehicleIcon legMode={currentLegMode} />
              </div>
            </div>
          </Marker>
        )}
      </Map>

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <div className="flex items-center gap-2 rounded-lg bg-card px-4 py-2 shadow-lg">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Calcul de l&apos;itineraire...</span>
          </div>
        </div>
      )}
    </div>
  );
}
