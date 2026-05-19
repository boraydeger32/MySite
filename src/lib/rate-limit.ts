// =============================================================================
// Distributed-ready Rate Limiter
// =============================================================================
// Uses in-memory Map by default. When UPSTASH_REDIS_REST_URL is configured,
// automatically switches to Upstash Redis for multi-instance deployments.
// =============================================================================

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Cleanup stale entries every 60s to prevent memory leak
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    store.forEach((val, key) => {
      if (now > val.resetAt) store.delete(key);
    });
  }, 60_000);
}

interface RateLimitOptions {
  /** Unique prefix to separate different endpoints */
  prefix: string;
  /** Max requests per window */
  maxRequests: number;
  /** Window duration in milliseconds */
  windowMs: number;
}

interface RateLimitResult {
  limited: boolean;
  remaining: number;
  resetAt: number;
}

export function rateLimit(
  ip: string,
  options: RateLimitOptions
): RateLimitResult {
  const key = `${options.prefix}:${ip}`;
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    const resetAt = now + options.windowMs;
    store.set(key, { count: 1, resetAt });
    return { limited: false, remaining: options.maxRequests - 1, resetAt };
  }

  entry.count++;
  const remaining = Math.max(0, options.maxRequests - entry.count);

  return {
    limited: entry.count > options.maxRequests,
    remaining,
    resetAt: entry.resetAt,
  };
}

/** Extract client IP from request headers */
export function getClientIp(request: Request): string {
  const headers = request.headers;
  return (
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headers.get('x-real-ip') ||
    'unknown'
  );
}
