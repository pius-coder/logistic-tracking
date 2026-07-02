import "server-only";

import { z } from "zod";
import { defineOperationFn } from "@/aura/server/operation";
import { AuraError } from "@/aura/core/errors";

export const trackingLookupByRequestNumber = defineOperationFn("tracking.lookupByRequestNumber")
  .query()
  .params(z.object({ requestNumber: z.string().min(1) }))
  .entities(["Request"])
  .public()
  .handler(async ({ ctx, params }) => {
    const request = await ctx.db.request.findFirst({
      where: { requestNumber: params.requestNumber },
      select: { id: true, requestNumber: true },
    });

    if (!request) {
      throw new AuraError("NOT_FOUND", "Aucune expedition trouvee avec ce numero.");
    }

    return request;
  });
