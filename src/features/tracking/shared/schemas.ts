import { z } from "zod";

export const getByRequestParamsSchema = z.object({
  requestId: z.string().min(1),
});

export type GetByRequestParams = z.infer<typeof getByRequestParamsSchema>;
