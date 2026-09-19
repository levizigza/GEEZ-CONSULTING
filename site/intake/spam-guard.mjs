/**
 * Spam / rate protection compatible with a lean WP + static stack.
 * Honeypot + sliding-window rate limit (in-memory; swap for Redis/host later).
 */

/**
 * @param {{ windowMs?: number, max?: number }} [opts]
 */
export function createRateLimiter({ windowMs = 60_000, max = 5 } = {}) {
  /** @type {Map<string, number[]>} */
  const hits = new Map();

  return {
    /**
     * @param {string} key IP or anonymous bucket — never log raw PII
     */
    check(key) {
      const now = Date.now();
      const bucket = (hits.get(key) || []).filter((t) => now - t < windowMs);
      if (bucket.length >= max) {
        hits.set(key, bucket);
        return { ok: false, retryAfterSec: Math.ceil(windowMs / 1000) };
      }
      bucket.push(now);
      hits.set(key, bucket);
      return { ok: true, retryAfterSec: 0 };
    },
    reset() {
      hits.clear();
    },
    _size() {
      return hits.size;
    },
  };
}

/**
 * @param {string} honeypotValue
 */
export function isHoneypotTriggered(honeypotValue) {
  return Boolean(String(honeypotValue || '').trim());
}
