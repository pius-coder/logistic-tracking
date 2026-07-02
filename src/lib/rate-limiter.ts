const buckets = new Map<string, { count: number; resetAt: number }>();

export interface RateLimitConfig {
  maxRequests: number;
  windowSeconds: number;
}

export function checkRateLimit(key: string, config: RateLimitConfig): boolean {
  const now = Date.now();

  // Lazy cleanup of expired buckets (runs during check to avoid memory leak)
  if (buckets.size > 10000) {
    for (const [k, bucket] of buckets) {
      if (now > bucket.resetAt) buckets.delete(k);
    }
  }

  const bucket = buckets.get(key);
  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + config.windowSeconds * 1000 });
    return true;
  }

  if (bucket.count >= config.maxRequests) {
    return false;
  }

  bucket.count++;
  return true;
}

export function rateLimitResponse(key: string, config: RateLimitConfig): Response {
  const bucket = buckets.get(key);
  const retryAfter = bucket ? Math.ceil((bucket.resetAt - Date.now()) / 1000) : config.windowSeconds;
  return Response.json(
    {
      ok: false,
      error: { code: "RATE_LIMITED", message: "Trop de requêtes. Réessayez plus tard.", status: 429, retryAfter },
    },
    { status: 429, headers: { "Retry-After": String(retryAfter) } },
  );
}
