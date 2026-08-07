/**
 * In-memory rate limiter using sliding window counter.
 *
 * For development/testing. In production on Vercel, this should be replaced
 * with @upstash/ratelimit using Redis.
 *
 * Usage:
 *   const limiter = createRateLimiter(5, 15 * 60 * 1000); // 5 per 15 min
 *   const key = req.ip;
 *   if (!limiter.isAllowed(key)) return NextResponse.json(..., { status: 429 });
 */

interface RateLimiter {
  isAllowed(key: string): boolean;
}

interface RequestLog {
  timestamps: number[];
}

export function createRateLimiter(
  maxRequests: number,
  windowMs: number,
): RateLimiter {
  const store = new Map<string, RequestLog>();

  return {
    isAllowed(key: string): boolean {
      const now = Date.now();
      const windowStart = now - windowMs;

      let log = store.get(key);

      if (!log) {
        // First request from this key
        store.set(key, { timestamps: [now] });
        return true;
      }

      // Remove old timestamps outside the window
      log.timestamps = log.timestamps.filter((ts) => ts > windowStart);

      if (log.timestamps.length < maxRequests) {
        // Within limit
        log.timestamps.push(now);
        return true;
      }

      // Over limit
      return false;
    },
  };
}

/**
 * Pre-configured limiters for common use cases
 */

// Global: 300 requests per 15 minutes
export const globalLimiter = createRateLimiter(300, 15 * 60 * 1000);

// Login: 5 requests per 15 minutes (stricter for auth)
export const loginLimiter = createRateLimiter(5, 15 * 60 * 1000);