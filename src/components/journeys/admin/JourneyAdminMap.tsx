"use client";

import { useEffect, useMemo, useRef } from "react";
import { Layer, Map as MapboxMap, Marker, Source, type MapRef } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { Plane, Ship, MapPin } from "lucide-react";
import { buildRouteFeature, orderedStops } from "@/components/journeys/shared/route-utils";

export type AdminMapStop = {
  localId: string;
  placeName: string;
  latitude: number | null;
  longitude: number | null;
  stopType: "DEPART" | "ESCALE" | "DESTINATION";
  sequence: number;
};

export function JourneyAdminMap({
  mapboxToken,
  stops,
  transportType,
  selectedStopId,
  onSelectStop,
}: {
  mapboxToken: string;
  stops: AdminMapStop[];
  transportType: "AERIEN" | "MARITIME";
  selectedStopId: string | null;
  onSelectStop: (id: string) => void;
}) {
  const mapRef = useRef<MapRef | null>(null);
  const validStops = useMemo(
    () => orderedStops(stops).filter((stop) => stop.latitude != null && stop.longitude != null),
    [stops],
  );
  const route = useMemo(
    () =>
      validStops.length >= 2
        ? buildRouteFeature(validStops.map((stop) => ({ latitude: stop.latitude!, longitude: stop.longitude! })))
        : null,
    [validStops],
  );
  const center = validStops[0] ?? { latitude: 4.05, longitude: 9.7 };
  const VehicleIcon = transportType === "AERIEN" ? Plane : Ship;

  useEffect(() => {
    if (!mapRef.current || validStops.length < 2) return;
    const lngs = validStops.map((stop) => stop.longitude!);
    const lats = validStops.map((stop) => stop.latitude!);
    mapRef.current.fitBounds(
      [
        [Math.min(...lngs), Math.min(...lats)],
        [Math.max(...lngs), Math.max(...lats)],
      ],
      { padding: 80, duration: 600 },
    );
  }, [validStops]);

  if (!mapboxToken) {
    return (
      <div className="flex h-[520px] items-center justify-center rounded-lg border bg-muted text-sm text-muted-foreground">
        Token Mapbox manquant dans l&apos;environnement.
      </div>
    );
  }

  return (
    <div className="h-[520px] overflow-hidden rounded-lg border bg-muted">
      <MapboxMap
        ref={mapRef}
        mapboxAccessToken={mapboxToken}
        initialViewState={{ latitude: center.latitude!, longitude: center.longitude!, zoom: validStops.length ? 4 : 2 }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        reuseMaps
        style={{ width: "100%", height: "100%" }}
      >
        {route ? (
          <Source id="admin-journey-route" type="geojson" data={route}>
            <Layer
              id="admin-journey-route-casing"
              type="line"
              paint={{ "line-color": "#0f172a", "line-width": 7, "line-opacity": 0.18 }}
              layout={{ "line-cap": "round", "line-join": "round" }}
            />
            <Layer
              id="admin-journey-route-line"
              type="line"
              paint={{
                "line-color": transportType === "AERIEN" ? "#2563eb" : "#0f766e",
                "line-width": 4,
                "line-dasharray": transportType === "AERIEN" ? [1.4, 1.6] : [1, 0],
              }}
              layout={{ "line-cap": "round", "line-join": "round" }}
            />
          </Source>
        ) : null}

        {validStops.map((stop, index) => {
          const selected = stop.localId === selectedStopId;
          return (
            <Marker key={stop.localId} latitude={stop.latitude!} longitude={stop.longitude!} anchor="bottom">
              <button
                type="button"
                onClick={() => onSelectStop(stop.localId)}
                className={`flex h-9 min-w-9 items-center justify-center rounded-full border-2 bg-background shadow-sm ${
                  selected ? "border-primary text-primary" : "border-background text-foreground"
                }`}
                title={stop.placeName}
              >
                {index === 0 ? <VehicleIcon className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
              </button>
            </Marker>
          );
        })}
      </MapboxMap>
    </div>
  );
}
