import "server-only";

import { defineOperationFn } from "@/aura/server/operation";
import { requireAdmin } from "@/features/admin/server/common";
import { searchTransportNodes, type TransportNodeKind } from "@/lib/transport-catalog";
import { journeyGeocodeSchema } from "../shared/schemas";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";
const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
];
const OSM_HEADERS = {
  Accept: "application/json",
  "Accept-Language": "fr,en;q=0.8",
  "User-Agent": "JC-Import-Express-Tracking/1.0 admin-location-search",
};

type JourneyTransportType = "MARITIME" | "AERIEN";

type LocationResult = {
  id: string;
  name: string;
  label: string;
  longitude: number;
  latitude: number;
};

type NominatimResult = {
  osm_type?: string;
  osm_id?: number;
  lat?: string;
  lon?: string;
  category?: string;
  type?: string;
  name?: string;
  display_name?: string;
};

type OverpassElement = {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: {
    lat?: number;
    lon?: number;
  };
  tags?: Record<string, string>;
};

type OverpassPayload = {
  elements?: OverpassElement[];
};

type MapboxFeature = {
  id: string;
  text?: string;
  place_name?: string;
  center?: [number, number];
  properties?: {
    category?: string;
    maki?: string;
  };
};

const AIRPORT_TERMS = [
  "airport",
  "aeroport",
  "aéroport",
  "airfield",
  "aerodrome",
  "aérodrome",
  "aeroway",
];

const PORT_TERMS = [
  "port",
  "harbor",
  "harbour",
  "seaport",
  "maritime",
  "container terminal",
  "terminal portuaire",
  "harbour_basin",
];

function kindFromTransport(transportType: JourneyTransportType): TransportNodeKind {
  return transportType === "AERIEN" ? "AIRPORT" : "PORT";
}

function termsForTransport(transportType: JourneyTransportType) {
  return transportType === "AERIEN" ? AIRPORT_TERMS : PORT_TERMS;
}

function matchesTransportText(value: string, transportType: JourneyTransportType) {
  const lower = value.toLowerCase();
  return termsForTransport(transportType).some((term) => lower.includes(term));
}

function matchesQuery(result: LocationResult, query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  return `${result.name} ${result.label}`.toLowerCase().includes(normalized);
}

function isFiniteCoordinate(latitude: number | undefined, longitude: number | undefined) {
  return (
    typeof latitude === "number" &&
    typeof longitude === "number" &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

function dedupeResults(results: LocationResult[]) {
  const seen = new Set<string>();
  return results.filter((result) => {
    const key = `${result.name.toLowerCase()}-${result.longitude.toFixed(4)}-${result.latitude.toFixed(4)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function catalogResults(options: {
  query: string;
  transportType: JourneyTransportType;
  countryIso2?: string | null;
}) {
  return searchTransportNodes({
    query: options.query,
    kind: kindFromTransport(options.transportType),
    countryIso2: options.countryIso2,
    limit: 12,
  }).map((node) => ({
    id: `catalog:${node.id}`,
    name: node.name,
    label: node.label,
    longitude: node.longitude,
    latitude: node.latitude,
  }));
}

async function fetchNominatim(url: URL): Promise<LocationResult[]> {
  try {
    const response = await fetch(url, {
      headers: OSM_HEADERS,
      next: { revalidate: 3600 },
    });
    if (!response.ok) return [];
    const payload = (await response.json()) as NominatimResult[];
    return payload.flatMap((place) => {
      const latitude = Number(place.lat);
      const longitude = Number(place.lon);
      const name = place.name || place.display_name?.split(",")[0] || "";
      const label = place.display_name || name;
      if (!isFiniteCoordinate(latitude, longitude)) return [];
      return [
        {
          id: `osm:${place.osm_type ?? "place"}:${place.osm_id ?? `${latitude},${longitude}`}`,
          name,
          label,
          longitude,
          latitude,
        },
      ];
    });
  } catch {
    return [];
  }
}

async function searchNominatim(options: {
  query: string;
  transportType: JourneyTransportType;
  countryIso2?: string | null;
}): Promise<LocationResult[]> {
  if (options.query.trim().length < 2) return [];

  // Pass 1: Specific POI search — append transport term, restrict to poi layer
  const specificUrl = new URL("https://nominatim.openstreetmap.org/search");
  const nodeWord = options.transportType === "AERIEN" ? "airport aerodrome" : "port harbour";
  specificUrl.searchParams.set("q", `${options.query} ${nodeWord}`);
  specificUrl.searchParams.set("format", "jsonv2");
  specificUrl.searchParams.set("limit", "10");
  specificUrl.searchParams.set("layer", "poi");
  specificUrl.searchParams.set("addressdetails", "1");
  specificUrl.searchParams.set("extratags", "1");
  if (options.countryIso2) specificUrl.searchParams.set("countrycodes", options.countryIso2.toLowerCase());

  let results = await fetchNominatim(specificUrl);
  results = results.filter((r) => matchesTransportText(`${r.name} ${r.label}`, options.transportType));
  if (results.length > 0) return results;

  // Pass 2: Broad search — just the query, no layer restriction
  // This catches IATA codes, airport names without the "airport" suffix, etc.
  const broadUrl = new URL("https://nominatim.openstreetmap.org/search");
  broadUrl.searchParams.set("q", options.query);
  broadUrl.searchParams.set("format", "jsonv2");
  broadUrl.searchParams.set("limit", "10");
  broadUrl.searchParams.set("addressdetails", "1");
  broadUrl.searchParams.set("extratags", "1");
  if (options.countryIso2) broadUrl.searchParams.set("countrycodes", options.countryIso2.toLowerCase());

  results = await fetchNominatim(broadUrl);
  results = results.filter((r) => matchesTransportText(`${r.name} ${r.label}`, options.transportType));
  return results;
}

function buildOverpassQuery(countryIso2: string, transportType: JourneyTransportType) {
  const country = countryIso2.toUpperCase();
  const selector =
    transportType === "AERIEN"
      ? `
        node["aeroway"="aerodrome"](area.searchArea);
        way["aeroway"="aerodrome"](area.searchArea);
        relation["aeroway"="aerodrome"](area.searchArea);
      `
      : `
        node["seamark:type"="harbour"](area.searchArea);
        way["seamark:type"="harbour"](area.searchArea);
        relation["seamark:type"="harbour"](area.searchArea);
        node["harbour"="yes"](area.searchArea);
        way["harbour"="yes"](area.searchArea);
        relation["harbour"="yes"](area.searchArea);
        node["industrial"="port"](area.searchArea);
        way["industrial"="port"](area.searchArea);
        relation["industrial"="port"](area.searchArea);
      `;

  return `
    [out:json][timeout:20];
    area["ISO3166-1"="${country}"][admin_level=2]->.searchArea;
    (
      ${selector}
    );
    out center tags 60;
  `;
}

async function searchOverpass(options: {
  query: string;
  transportType: JourneyTransportType;
  countryIso2?: string | null;
}): Promise<LocationResult[]> {
  if (!options.countryIso2) return [];

  const body = new URLSearchParams({
    data: buildOverpassQuery(options.countryIso2, options.transportType),
  });

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          ...OSM_HEADERS,
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
        body,
        next: { revalidate: 3600 },
      });
      if (!response.ok) continue;

      const payload = (await response.json()) as OverpassPayload;
      return (payload.elements ?? []).flatMap((element) => {
        const tags = element.tags ?? {};
        const latitude = element.lat ?? element.center?.lat;
        const longitude = element.lon ?? element.center?.lon;
        const name = tags.name ?? tags["name:fr"] ?? tags["name:en"] ?? tags.iata ?? tags.icao;
        if (!name || !isFiniteCoordinate(latitude, longitude)) return [];

        const coordinates = { latitude, longitude } as { latitude: number; longitude: number };
        const labelParts = [
          tags.iata ? `IATA ${tags.iata}` : null,
          tags.icao ? `ICAO ${tags.icao}` : null,
          options.countryIso2?.toUpperCase(),
        ].filter(Boolean);
        const result = {
          id: `osm:${element.type}:${element.id}`,
          name,
          label: labelParts.length > 0 ? labelParts.join(" · ") : name,
          longitude: coordinates.longitude,
          latitude: coordinates.latitude,
        };
        return matchesQuery(result, options.query) ? [result] : [];
      });
    } catch {
      continue;
    }
  }

  return [];
}

async function searchMapbox(options: {
  query: string;
  transportType: JourneyTransportType;
  countryIso2?: string | null;
}): Promise<LocationResult[]> {
  if (!MAPBOX_TOKEN || options.query.trim().length < 2) return [];

  const searchText = `${options.query} ${options.transportType === "MARITIME" ? "port maritime" : "airport"}`;
  const url = new URL(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchText)}.json`);
  url.searchParams.set("access_token", MAPBOX_TOKEN);
  url.searchParams.set("types", "poi");
  url.searchParams.set("limit", "8");
  url.searchParams.set("language", "fr");
  url.searchParams.set("autocomplete", "true");
  if (options.countryIso2) url.searchParams.set("country", options.countryIso2.toUpperCase());

  try {
    const response = await fetch(url, { next: { revalidate: 3600 } });
    if (!response.ok) return [];
    const payload = (await response.json()) as { features?: MapboxFeature[] };
    return (payload.features ?? []).flatMap((feature) => {
      if (!feature.center) return [];
      const haystack = [
        feature.text,
        feature.place_name,
        feature.properties?.category,
        feature.properties?.maki,
      ]
        .filter(Boolean)
        .join(" ");
      if (!matchesTransportText(haystack, options.transportType)) return [];
      return [
        {
          id: `mapbox:${feature.id}`,
          name: feature.text ?? feature.place_name ?? options.query,
          label: feature.place_name ?? feature.text ?? options.query,
          longitude: feature.center[0],
          latitude: feature.center[1],
        },
      ];
    });
  } catch {
    return [];
  }
}

export const geocodeJourneyPlace = defineOperationFn("journey.geocode")
  .query()
  .params(journeyGeocodeSchema)
  .entities([])
  .use(requireAdmin())
  .auth()
  .handler(async ({ params }) => {
    if (!params) return { results: [] };

    const [nominatim, overpass, mapbox] = await Promise.all([
      searchNominatim(params),
      searchOverpass(params),
      searchMapbox(params),
    ]);

    const fallback = catalogResults(params);
    return {
      results: dedupeResults([...nominatim, ...overpass, ...mapbox, ...fallback]).slice(0, 12),
    };
  });
