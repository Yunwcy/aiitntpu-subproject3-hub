// Minimal in-memory daily rate limiter, keyed by client identifier (IP).
//
// This resets whenever the server process restarts (e.g. a new deploy or a
// serverless cold start), and is per-instance rather than global. That's an
// intentional trade-off for a portfolio demo: it avoids needing an external
// KV/Redis store just to cap a "try the live AI" button. For real production
// use, swap this for Vercel KV / Upstash / a database-backed counter.

interface Bucket {
  count: number;
  resetAt: number; // epoch ms
}

const buckets = new Map<string, Bucket>();

const DAY_MS = 24 * 60 * 60 * 1000;

export function checkRateLimit(
  key: string,
  limitPerDay: number,
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + DAY_MS;
    buckets.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limitPerDay - 1, resetAt };
  }

  if (existing.count >= limitPerDay) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return { allowed: true, remaining: limitPerDay - existing.count, resetAt: existing.resetAt };
}

// Read-only peek — does not consume quota. Used to show remaining count in the UI.
export function peekRateLimit(
  key: string,
  limitPerDay: number,
): { remaining: number; resetAt: number | null } {
  const now = Date.now();
  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    return { remaining: limitPerDay, resetAt: null };
  }
  return { remaining: Math.max(0, limitPerDay - existing.count), resetAt: existing.resetAt };
}
