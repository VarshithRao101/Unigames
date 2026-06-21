interface RateLimitRule {
  limit: number;
  windowMs: number;
}

// In serverless, memory is ephemeral but persists across warm containers.
// A simple Map is the perfect free-tier starting point.
const cache = new Map<string, { count: number; resetTime: number }>();

/**
 * Checks rate limit for a given identifier (IP address or user ID).
 * 
 * @returns Object with verification status and headers context.
 */
export function rateLimit(
  identifier: string,
  actionKey: string,
  rule: RateLimitRule
) {
  const now = Date.now();
  const cacheKey = `${identifier}:${actionKey}`;
  const record = cache.get(cacheKey);

  // If no record exists, or the window has expired, reset the window
  if (!record || now > record.resetTime) {
    const newRecord = {
      count: 1,
      resetTime: now + rule.windowMs,
    };
    cache.set(cacheKey, newRecord);

    // Occasional cleanup of expired records to avoid memory leaks
    if (Math.random() < 0.01) {
      for (const [k, v] of cache.entries()) {
        if (now > v.resetTime) {
          cache.delete(k);
        }
      }
    }

    return {
      success: true,
      limit: rule.limit,
      remaining: rule.limit - 1,
      reset: newRecord.resetTime,
    };
  }

  // Record exists and window is active: increment
  record.count += 1;
  const success = record.count <= rule.limit;
  const remaining = Math.max(0, rule.limit - record.count);

  return {
    success,
    limit: rule.limit,
    remaining,
    reset: record.resetTime,
  };
}
