// Lightweight in-memory TTL cache for hot, read-heavy data (e.g. product lists).
// Persists for the lifetime of the server process / warm serverless instance,
// so repeat requests are served from memory instead of hitting the database.

interface CacheEntry {
  value: unknown
  expires: number
}

const store = new Map<string, CacheEntry>()

export function getCached<T>(key: string): T | undefined {
  const entry = store.get(key)
  if (!entry) return undefined
  if (Date.now() > entry.expires) {
    store.delete(key)
    return undefined
  }
  return entry.value as T
}

export function setCached(key: string, value: unknown, ttlMs: number): void {
  store.set(key, { value, expires: Date.now() + ttlMs })
}

/** Remove every entry whose key starts with the given prefix. */
export function invalidatePrefix(prefix: string): void {
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key)
  }
}

export function clearCache(): void {
  store.clear()
}

// TTLs (overridable via env), with sensible defaults. The list TTL is comfortably
// longer than the startup warmer's refresh interval so hot entries never lapse.
export const PRODUCTS_CACHE_TTL_MS = Number(process.env.PRODUCTS_CACHE_TTL_MS) || 120_000
export const PRODUCT_DETAIL_CACHE_TTL_MS = Number(process.env.PRODUCT_DETAIL_CACHE_TTL_MS) || 300_000

// Shared prefix so any write can wipe all product-related cache entries.
export const PRODUCTS_CACHE_PREFIX = "products:"
