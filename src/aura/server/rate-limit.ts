import "server-only";

import { AuraError } from "@/aura/core/errors";

export interface RateLimitOptions {
  key: string;
  limit: number;
  windowSeconds: number;
}

const buckets = new Map<string, { count: number; resetAt: number }>();

export async function enforceRateLimit(_db: unknown, options: RateLimitOptions): Promise<void> {
  const now = Date.now();
  const bucket = buckets.get(options.key);

  if (!bucket || now >= bucket.resetAt) {
    buckets.set(options.key, { count: 1, resetAt: now + options.windowSeconds * 1000 });
    return;
  }

  if (bucket.count >= options.limit) {
    throw new AuraError("RATE_LIMITED", "Trop de tentatives. Réessayez plus tard.", {
      status: 429,
    });
  }

  bucket.count++;
}
