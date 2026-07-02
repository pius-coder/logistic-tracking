import "server-only";

import { z } from "zod";
import { defineOperationFn } from "@/aura/server/operation";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

export const trackingGetRoute = defineOperationFn("tracking.getRoute")
  .query()
  .params(z.object({
    fromLng: z.number(),
    fromLat: z.number(),
    toLng: z.number(),
    toLat: z.number(),
    legMode: z.enum(["TRUCK", "PLANE", "BOAT"]),
  }))
  .entities([])
  .public()
  .handler(async ({ params }) => {
    if (params.legMode === "TRUCK") {
      const coords = `${params.fromLng},${params.fromLat};${params.toLng},${params.toLat}`;
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coords}?geometries=geojson&overview=full&access_token=${MAPBOX_TOKEN}`;
      const res = await fetch(url);
      if (!res.ok) return { geometry: null, error: `Directions API ${res.status}` };
      const data = await res.json();
      return { geometry: data.routes?.[0]?.geometry ?? null, error: null };
    }

    if (params.legMode === "PLANE" || params.legMode === "BOAT") {
      const { greatCircle } = await import("@turf/great-circle");
      const { point } = await import("@turf/helpers");
      const npoints = params.legMode === "PLANE" ? 100 : 80;
      const result = greatCircle(
        point([params.fromLng, params.fromLat]),
        point([params.toLng, params.toLat]),
        { npoints },
      );
      return { geometry: result.geometry as GeoJSON.LineString, error: null };
    }

    return { geometry: null, error: "Invalid leg mode" };
  });
