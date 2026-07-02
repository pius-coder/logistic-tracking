import "server-only";

import { defineOperationFn } from "@/aura/server/operation";
import { journeyPublicTokenSchema } from "../shared/schemas";
import { journeyInclude, serializeJourney } from "./helpers";

export const publicGetJourney = defineOperationFn("journey.publicGet")
  .query()
  .params(journeyPublicTokenSchema)
  .entities(["Journey", "JourneyStop", "JourneyEvent", "Request"])
  .public()
  .handler(async ({ ctx, params }) => {
    if (!params) return null;

    const journey = await ctx.db.journey.findUnique({
      where: { publicToken: params.token },
      include: journeyInclude,
    });

    if (!journey || journey.status === "BROUILLON") return null;
    return serializeJourney(journey, false);
  });
