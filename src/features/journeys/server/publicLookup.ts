import "server-only";

import { z } from "zod";
import { defineOperationFn } from "@/aura/server/operation";

export const publicLookupJourney = defineOperationFn("journey.publicLookup")
  .query()
  .params(z.object({ requestNumber: z.string().trim().min(3).max(80) }))
  .entities(["Journey", "Request"])
  .public()
  .handler(async ({ ctx, params }) => {
    if (!params) return null;

    const journey = await ctx.db.journey.findFirst({
      where: {
        request: { requestNumber: params.requestNumber },
        status: { not: "BROUILLON" },
      },
      select: {
        publicToken: true,
        request: { select: { requestNumber: true } },
      },
    });

    return journey
      ? { publicToken: journey.publicToken, requestNumber: journey.request.requestNumber }
      : null;
  });
