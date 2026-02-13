/**
 * Simple in-memory sliding-window rate limiter for API routes.
 * Not suitable for multi-instance deployments — use Redis there.
 */
interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export function isRateLimited(
  key: string,
  config: RateLimitConfig,
): { limited: boolean; remaining: number } {
  const now = Date.now();
  const cutoff = now - config.windowMs;

  let entry = store.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Prune expired timestamps
  entry.timestamps = entry.timestamps.filter((t) => t > cutoff);

  if (entry.timestamps.length >= config.maxRequests) {
    return { limited: true, remaining: 0 };
  }

  entry.timestamps.push(now);
  return { limited: false, remaining: config.maxRequests - entry.timestamps.length };
}
