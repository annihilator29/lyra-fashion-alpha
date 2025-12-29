/**
 * In-memory rate limiter for authentication endpoints
 * NOTE: This is a simple in-memory implementation for MVP.
 * For production, consider using Redis or a distributed cache for rate limiting.
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  // In-memory storage for rate limit tracking
  private store = new Map<string, RateLimitEntry>();

  // Clean up expired entries every 60 seconds
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Clean up expired entries periodically to prevent memory leaks
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  /**
   * Clean up expired entries from the store
   */
  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (entry.resetTime < now) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Check if a request should be rate limited
   * @param identifier - Unique identifier for the request (IP address or email)
   * @param maxAttempts - Maximum number of attempts allowed (default: 5)
   * @param windowMs - Time window in milliseconds (default: 15 minutes)
   * @returns Object containing whether request is limited and rate limit info
   */
  check(
    identifier: string,
    maxAttempts: number = 5,
    windowMs: number = 15 * 60 * 1000 // 15 minutes
  ): {
    isLimited: boolean;
    remaining: number;
    resetTime: number;
    retryAfter: number | null;
  } {
    const now = Date.now();
    const entry = this.store.get(identifier);

    // If no entry exists, create new entry
    if (!entry || entry.resetTime < now) {
      const resetTime = now + windowMs;
      this.store.set(identifier, {
        count: 1,
        resetTime,
      });

      return {
        isLimited: false,
        remaining: maxAttempts - 1,
        resetTime,
        retryAfter: null,
      };
    }

    // Entry exists and is within window
    if (entry.count >= maxAttempts) {
      // Rate limit exceeded
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      return {
        isLimited: true,
        remaining: 0,
        resetTime: entry.resetTime,
        retryAfter,
      };
    }

    // Increment count
    entry.count += 1;
    this.store.set(identifier, entry);

    return {
      isLimited: false,
      remaining: maxAttempts - entry.count,
      resetTime: entry.resetTime,
      retryAfter: null,
    };
  }

  /**
   * Reset rate limit for a specific identifier
   * Useful for resetting after successful authentication
   */
  reset(identifier: string) {
    this.store.delete(identifier);
  }

  /**
   * Clean up interval to prevent memory leaks
   */
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.store.clear();
  }
}

// Export singleton instance
export const rateLimiter = new RateLimiter();

/**
 * Middleware-specific rate limiting helper
 * Returns true if request should be blocked, false otherwise
 */
export function checkRateLimit(
  identifier: string,
  response: Response
): { isLimited: boolean; retryAfter: number | null } {
  const result = rateLimiter.check(identifier);

  // Add rate limit headers to response
  response.headers.set('X-RateLimit-Limit', '5');
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
  response.headers.set('X-RateLimit-Reset', new Date(result.resetTime).toISOString());

  if (result.isLimited) {
    response.headers.set('Retry-After', result.retryAfter!.toString());
    return { isLimited: true, retryAfter: result.retryAfter };
  }

  return { isLimited: false, retryAfter: null };
}
