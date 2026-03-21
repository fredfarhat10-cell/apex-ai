/**
 * Simple in-memory rate limiter for API routes
 * Prevents abuse and handles Gemini API rate limits gracefully
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

export interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
}

/**
 * Check if a request is allowed based on rate limits
 */
export function checkRateLimit(identifier: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now()
  const entry = rateLimitStore.get(identifier)

  // Clean up expired entries
  if (entry && now > entry.resetAt) {
    rateLimitStore.delete(identifier)
  }

  const currentEntry = rateLimitStore.get(identifier)

  if (!currentEntry) {
    // First request in window
    const resetAt = now + config.windowMs
    rateLimitStore.set(identifier, { count: 1, resetAt })
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt,
    }
  }

  if (currentEntry.count >= config.maxRequests) {
    // Rate limit exceeded
    return {
      allowed: false,
      remaining: 0,
      resetAt: currentEntry.resetAt,
    }
  }

  // Increment count
  currentEntry.count++
  rateLimitStore.set(identifier, currentEntry)

  return {
    allowed: true,
    remaining: config.maxRequests - currentEntry.count,
    resetAt: currentEntry.resetAt,
  }
}

/**
 * Get client identifier from request
 */
export function getClientIdentifier(request: Request): string {
  // In production, use IP address or user ID
  // For now, use a simple identifier
  const forwarded = request.headers.get("x-forwarded-for")
  const ip = forwarded ? forwarded.split(",")[0] : "unknown"
  return ip
}

/**
 * Clean up old entries periodically
 */
export function cleanupRateLimits(): void {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetAt) {
      rateLimitStore.delete(key)
    }
  }
}

// Clean up every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(cleanupRateLimits, 5 * 60 * 1000)
}
