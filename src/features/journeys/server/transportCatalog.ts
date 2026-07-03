import "server-only";

import { defineOperationFn } from "@/aura/server/operation";
import { requireAdmin } from "@/features/admin/server/common";
import { AIRCRAFT_NAMES, VESSEL_NAMES } from "@/lib/transport-catalog";

export const journeyTransportCatalog = defineOperationFn("journey.transportCatalog")
  .query()
  .entities([])
  .use(requireAdmin())
  .auth()
  .handler(async () => ({
    aircraft: AIRCRAFT_NAMES,
    vessels: VESSEL_NAMES,
  }));
