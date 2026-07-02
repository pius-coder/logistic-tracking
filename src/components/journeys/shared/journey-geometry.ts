import { greatCircle } from "@turf/great-circle";
import { point } from "@turf/helpers";
import type { JourneyDto, JourneyStopDto } from "@/features/journeys/shared/types";

export type JourneyLegGeometry = {
  fromIndex: number;
  state: "completed" | "current" | "future";
  geometry: GeoJSON.LineString;
  distanceKm: number;
};

const EARTH_RADIUS_KM = 6371.0088;

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

export function distanceKm(
  from: Pick<JourneyStopDto, "latitude" | "longitude">,
  to: Pick<JourneyStopDto, "latitude" | "longitude">,
) {
  const latitudeDelta = toRadians(to.latitude - from.latitude);
  const longitudeDelta = toRadians(to.longitude - from.longitude);
  const fromLatitude = toRadians(from.latitude);
  const toLatitude = toRadians(to.latitude);

  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(fromLatitude) * Math.cos(toLatitude) * Math.sin(longitudeDelta / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function buildGreatCircleLine(from: JourneyStopDto, to: JourneyStopDto) {
  try {
    const result = greatCircle(
      point([from.longitude, from.latitude]),
      point([to.longitude, to.latitude]),
      { npoints: 120 },
    );

    if (result.geometry.type === "LineString") return result.geometry;
    const coordinates = result.geometry.coordinates.flat();
    return { type: "LineString", coordinates } satisfies GeoJSON.LineString;
  } catch {
    return {
      type: "LineString",
      coordinates: [
        [from.longitude, from.latitude],
        [to.longitude, to.latitude],
      ],
    } satisfies GeoJSON.LineString;
  }
}

export function getJourneyProgress(journey: JourneyDto, nowMs = Date.now()) {
  const stops = [...journey.stops].sort((a, b) => a.sequence - b.sequence);
  const completedCount = stops.filter((stop) => stop.reachedAt).length;
  const nextStopIndex = stops.findIndex((stop) => !stop.reachedAt);
  const currentFromIndex =
    nextStopIndex > 0 ? nextStopIndex - 1 : journey.status === "PLANIFIE" ? -1 : 0;

  let currentLegFraction = 0;
  if (currentFromIndex >= 0 && nextStopIndex > currentFromIndex) {
    const from = stops[currentFromIndex];
    const to = stops[nextStopIndex];
    const startedAt = from.reachedAt ? new Date(from.reachedAt).getTime() : journey.startedAt ? new Date(journey.startedAt).getTime() : 0;
    const eta = to.estimatedArrivalAt ? new Date(to.estimatedArrivalAt).getTime() : 0;

    if (startedAt > 0 && eta > startedAt && journey.status === "EN_COURS") {
      currentLegFraction = Math.max(0, Math.min(1, (nowMs - startedAt) / (eta - startedAt)));
    }
  }

  const totalLegs = Math.max(0, stops.length - 1);
  const completedLegs = Math.max(0, completedCount - 1);
  const progressPercent =
    journey.status === "TERMINE"
      ? 100
      : totalLegs > 0
        ? Math.round(((completedLegs + currentLegFraction) / totalLegs) * 100)
        : 0;

  const legs: JourneyLegGeometry[] = stops.slice(0, -1).map((from, index) => {
    const to = stops[index + 1];
    const state = to.reachedAt
      ? "completed"
      : index === currentFromIndex && journey.status === "EN_COURS"
        ? "current"
        : "future";

    return {
      fromIndex: index,
      state,
      geometry: buildGreatCircleLine(from, to),
      distanceKm: distanceKm(from, to),
    };
  });

  const totalDistanceKm = legs.reduce((sum, leg) => sum + leg.distanceKm, 0);
  const completedDistanceKm = legs.reduce((sum, leg) => {
    if (leg.state === "completed") return sum + leg.distanceKm;
    if (leg.state === "current") return sum + leg.distanceKm * currentLegFraction;
    return sum;
  }, 0);

  return {
    stops,
    completedCount,
    nextStopIndex,
    currentFromIndex,
    currentLegFraction,
    progressPercent: Math.max(0, Math.min(100, progressPercent)),
    legs,
    totalDistanceKm,
    completedDistanceKm,
    remainingDistanceKm: Math.max(0, totalDistanceKm - completedDistanceKm),
  };
}

export function coordinateAlongLine(geometry: GeoJSON.LineString, fraction: number) {
  const coordinates = geometry.coordinates;
  if (coordinates.length === 0) return null;
  if (coordinates.length === 1 || fraction <= 0) return coordinates[0] as [number, number];
  if (fraction >= 1) return coordinates.at(-1) as [number, number];

  const segmentDistances = coordinates.slice(0, -1).map((coordinate, index) => {
    const next = coordinates[index + 1];
    return distanceKm(
      { longitude: coordinate[0], latitude: coordinate[1] },
      { longitude: next[0], latitude: next[1] },
    );
  });
  const total = segmentDistances.reduce((sum, value) => sum + value, 0);
  const target = total * fraction;
  let travelled = 0;

  for (let index = 0; index < segmentDistances.length; index += 1) {
    const segment = segmentDistances[index];
    if (travelled + segment >= target) {
      const localFraction = segment > 0 ? (target - travelled) / segment : 0;
      const from = coordinates[index];
      const to = coordinates[index + 1];
      return [
        from[0] + (to[0] - from[0]) * localFraction,
        from[1] + (to[1] - from[1]) * localFraction,
      ] as [number, number];
    }
    travelled += segment;
  }

  return coordinates.at(-1) as [number, number];
}

export function formatDistance(km: number) {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(km);
}

export function formatDate(value: string | null, withTime = true) {
  if (!value) return "Non définie";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(new Date(value));
}
