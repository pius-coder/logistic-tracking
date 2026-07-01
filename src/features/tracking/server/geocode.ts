import "server-only";

import { z } from "zod";
import { defineOperationFn } from "@/aura/server/operation";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

interface GeocodingFeature {
  place_name: string;
  center: [number, number];
}

export const trackingGeocode = defineOperationFn("tracking.geocode")
  .query()
  .params(z.object({
    query: z.string().min(2).max(200),
    countryCode: z.string().length(2).optional(),
  }).optional())
  .entities([])
  .public()
  .handler(async ({ params }) => {
    if (!params) return { results: [] };
    let url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(params.query)}.json?access_token=${MAPBOX_TOKEN}&types=place,locality,neighborhood&limit=10&language=fr`;
    if (params.countryCode) {
      url += `&country=${params.countryCode}`;
    }
    const res = await fetch(url);
    if (!res.ok) return { results: [] };
    const data = await res.json();
    return {
      results: (data.features || []).map((f: GeocodingFeature) => ({
        name: f.place_name,
        lat: f.center[1],
        lng: f.center[0],
      })),
    };
  });
