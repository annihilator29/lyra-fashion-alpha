/**
 * Analytics Cache — In-Memory TTL Cache (Redis-Ready)
 * Story 7.1b: Admin Dashboard - Data Visualization
 *
 * Redis is not yet provisioned in this environment.
 * This module implements the same interface described in the story spec
 * using a Node.js in-memory Map with TTL. Swap the get/set calls below
 * for `redis.get` / `redis.set` once REDIS_URL is configured.
 */

// ---------------------------------------------------------------------------
// Cache TTL configuration (seconds) — matches story spec exactly
// ---------------------------------------------------------------------------
export const CACHE_TTL = {
  salesTrends: 300, // 5 minutes
  topProducts: 600, // 10 minutes
  customerGrowth: 300, // 5 minutes
  orderStatus: 60, // 1 minute
};

// ---------------------------------------------------------------------------
// Cache key builders — matches story spec exactly
// ---------------------------------------------------------------------------
export const CACHE_KEYS = {
  salesTrends: (range: string) => `analytics:sales:${range}`,
  topProducts: () => `analytics:top-products`,
  customerGrowth: (range: string) => `analytics:customers:${range}`,
  orderStatus: () => `analytics:status`,
};

// ---------------------------------------------------------------------------
// In-memory store
// ---------------------------------------------------------------------------
interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

// Using globalThis so the cache survives hot-reloads in Next.js dev mode
const globalForCache = globalThis as typeof globalThis & {
  __analyticsCache?: Map<string, CacheEntry<unknown>>;
};

if (!globalForCache.__analyticsCache) {
  globalForCache.__analyticsCache = new Map();
}

const store = globalForCache.__analyticsCache;

// ---------------------------------------------------------------------------
// Public cache API
// ---------------------------------------------------------------------------
export function cacheGet<T>(key: string): T | null {
  const entry = store.get(key) as CacheEntry<T> | undefined;
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.value;
}

export function cacheSet<T>(key: string, value: T, ttlSeconds: number): void {
  store.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

export function cacheDelete(key: string): void {
  store.delete(key);
}

// ---------------------------------------------------------------------------
// Utility: fetch-or-cache helper
// ---------------------------------------------------------------------------
export async function withCache<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>
): Promise<T> {
  try {
    const cached = cacheGet<T>(key);
    if (cached !== null) return cached;
  } catch (err) {
    console.warn('[analytics-cache] Cache read failed, querying DB directly:', err);
  }

  const value = await fetcher();

  try {
    cacheSet(key, value, ttlSeconds);
  } catch (err) {
    console.warn('[analytics-cache] Cache write failed:', err);
  }

  return value;
}
