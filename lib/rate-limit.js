const store = new Map()

// Clean expired entries every 5 minutes
if (typeof globalThis !== 'undefined' && !globalThis.__rateLimitCleanup) {
  globalThis.__rateLimitCleanup = setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of store) {
      if (now - entry.windowStart > entry.windowMs * 2) {
        store.delete(key)
      }
    }
  }, 5 * 60 * 1000)
}

export function rateLimit(key, windowMs, maxRequests) {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now - entry.windowStart > windowMs) {
    store.set(key, { windowStart: now, windowMs, count: 1 })
    return {
      success: true,
      allowed: true,
      remaining: maxRequests - 1,
      resetAt: new Date(now + windowMs),
    }
  }

  if (entry.count >= maxRequests) {
    const resetAt = new Date(entry.windowStart + windowMs)
    return { success: false, allowed: false, remaining: 0, resetAt }
  }

  entry.count += 1
  return {
    success: true,
    allowed: true,
    remaining: maxRequests - entry.count,
    resetAt: new Date(entry.windowStart + windowMs),
  }
}

export function rateLimitAuth(ip) {
  return rateLimit(`auth:${ip}`, 15 * 60 * 1000, 5)
}

export function rateLimitSignup(ip) {
  return rateLimit(`signup:${ip}`, 60 * 60 * 1000, 3)
}

export function rateLimitOTP(email) {
  return rateLimit(`otp:${email}`, 60 * 60 * 1000, 3)
}

export function rateLimitGenerate(userId) {
  return rateLimit(`gen:${userId}`, 60 * 60 * 1000, 60)
}

export function rateLimitContact(ip) {
  return rateLimit(`contact:${ip}`, 60 * 60 * 1000, 3)
}
