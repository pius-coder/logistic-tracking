import type { JourneyDto, JourneyStopDto, JourneyTransportType } from "@/features/journeys/shared/types";

export type RouteStop = Pick<
  JourneyStopDto,
  "id" | "placeName" | "latitude" | "longitude" | "sequence" | "reachedAt" | "estimatedArrivalAt" | "stopType"
>;

export const JOURNEY_STATUS_LABELS: Record<string, string> = {
  BROUILLON: "Brouillon",
  PLANIFIE: "Planifié",
  EN_COURS: "En transit",
  EN_PAUSE: "En pause",
  PROBLEME: "Incident",
  TERMINE: "Terminé",
  ANNULE: "Annulé",
};

export const STOP_TYPE_LABELS: Record<string, string> = {
  DEPART: "Départ",
  ESCALE: "Escale",
  DESTINATION: "Destination",
};

export function transportModeToJourneyType(mode: "AVION" | "BATEAU"): JourneyTransportType {
  return mode === "AVION" ? "AERIEN" : "MARITIME";
}

export function journeyTransportLabel(type: JourneyTransportType) {
  return type === "AERIEN" ? "Avion" : "Bateau";
}

export function orderedStops<T extends { sequence: number }>(stops: T[]) {
  return [...stops].sort((a, b) => a.sequence - b.sequence);
}

export function buildRouteFeature(stops: Array<{ latitude: number; longitude: number }>): GeoJSON.Feature<GeoJSON.LineString> {
  return {
    type: "Feature",
    properties: {},
    geometry: {
      type: "LineString",
      coordinates: stops.map((stop) => [stop.longitude, stop.latitude]),
    },
  };
}

export function getJourneyProgress(journey: JourneyDto | null) {
  if (!journey || journey.stops.length === 0) return null;
  const stops = orderedStops(journey.stops);
  let lastReachedIndex = -1;
  stops.forEach((stop, index) => {
    if (stop.reachedAt) lastReachedIndex = index;
  });

  if (lastReachedIndex < 0) {
    return { currentStop: stops[0], nextStop: stops[1] ?? null, progress: 0, completed: false };
  }

  const currentStop = stops[lastReachedIndex];
  const nextStop = stops[lastReachedIndex + 1] ?? null;
  if (!nextStop) return { currentStop, nextStop: null, progress: 1, completed: true };

  const startTime = new Date(currentStop.reachedAt ?? journey.startedAt ?? journey.updatedAt).getTime();
  const etaTime = nextStop.estimatedArrivalAt ? new Date(nextStop.estimatedArrivalAt).getTime() : startTime + 6 * 60 * 60 * 1000;
  const referenceTime =
    journey.status === "EN_PAUSE" || journey.status === "PROBLEME"
      ? new Date(journey.updatedAt).getTime()
      : Date.now();
  const progress = etaTime <= startTime ? 0 : Math.max(0, Math.min(1, (referenceTime - startTime) / (etaTime - startTime)));

  return { currentStop, nextStop, progress, completed: false };
}

export function interpolatePosition(journey: JourneyDto | null) {
  const progress = getJourneyProgress(journey);
  if (!progress) return null;
  const { currentStop, nextStop } = progress;
  if (!nextStop) {
    return {
      latitude: currentStop.latitude,
      longitude: currentStop.longitude,
      label: currentStop.placeName,
      progress: 1,
    };
  }

  return {
    latitude: currentStop.latitude + (nextStop.latitude - currentStop.latitude) * progress.progress,
    longitude: currentStop.longitude + (nextStop.longitude - currentStop.longitude) * progress.progress,
    label: `${currentStop.placeName} → ${nextStop.placeName}`,
    progress: progress.progress,
  };
}
