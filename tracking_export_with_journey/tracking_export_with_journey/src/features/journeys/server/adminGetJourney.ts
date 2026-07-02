import "server-only";

import { defineOperationFn } from "@/aura/server/operation";
import { requireAdmin } from "@/features/admin/server/common";
import { journeyRequestIdSchema } from "../shared/schemas";
import { journeyInclude, serializeJourney } from "./helpers";

export const adminGetJourney = defineOperationFn("journey.adminGet")
  .query()
  .params(journeyRequestIdSchema)
  .entities(["Journey", "JourneyStop", "JourneyEvent", "Request"])
  .use(requireAdmin())
  .auth()
  .handler(async ({ ctx, params }) => {
    if (!params) return null;

    const journey = await ctx.db.journey.findUnique({
      where: { requestId: params.requestId },
      include: journeyInclude,
    });

    return journey ? serializeJourney(journey, true) : null;
  });
