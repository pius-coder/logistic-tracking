import "server-only";

import { defineOperationFn } from "@/aura/server/operation";
import { journeyGeocodeSchema } from "../shared/schemas";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

type MapboxFeature = {
  id: string;
  text?: string;
  place_name?: string;
  center?: [number, number];
};

export const geocodeJourneyPlace = defineOperationFn("journey.geocode")
  .query()
  .params(journeyGeocodeSchema)
  .entities([])
  .public()
  .handler(async ({ params }) => {
    if (!params || !MAPBOX_TOKEN) return { results: [] };

    const hint = params.transportType === "MARITIME" ? "port" : params.transportType === "AERIEN" ? "airport" : "";
    const searchText = hint ? `${params.query} ${hint}` : params.query;
    const url = new URL(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchText)}.json`,
    );
    url.searchParams.set("access_token", MAPBOX_TOKEN);
    url.searchParams.set("types", "poi,place,locality,address");
    url.searchParams.set("limit", "8");
    url.searchParams.set("language", "fr");
    url.searchParams.set("autocomplete", "true");

    const response = await fetch(url, { next: { revalidate: 3600 } });
    if (!response.ok) return { results: [] };

    const payload = (await response.json()) as { features?: MapboxFeature[] };
    return {
      results: (payload.features ?? []).flatMap((feature) => {
        if (!feature.center) return [];
        return [
          {
            id: feature.id,
            name: feature.text ?? feature.place_name ?? params.query,
            label: feature.place_name ?? feature.text ?? params.query,
            longitude: feature.center[0],
            latitude: feature.center[1],
          },
        ];
      }),
    };
  });
