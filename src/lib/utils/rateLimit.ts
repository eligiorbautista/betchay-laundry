import type { SupabaseClient } from '@supabase/supabase-js';

interface RateLimitConfig {
	maxAttempts: number;
	windowMs: number;
	blockDurationMs: number;
}

interface RateLimitEntry {
	attempts: number;
	firstAttempt: number;
	blockedUntil?: number;
}

// In-memory store for rate limiting (in production, use Redis or database)
const rateLimitStore = new Map<string, RateLimitEntry>();

const defaultConfig: RateLimitConfig = {
	maxAttempts: 5,
	windowMs: 15 * 60 * 1000, // 15 minutes
	blockDurationMs: 30 * 60 * 1000 // 30 minutes
};

/**
 * Check if an IP address is rate limited
 */
export function checkRateLimit(identifier: string, config: Partial<RateLimitConfig> = {}): {
	isLimited: boolean;
	remainingAttempts: number;
	resetTime?: number;
	blockedUntil?: number;
} {
	const finalConfig = { ...defaultConfig, ...config };
	const now = Date.now();
	const entry = rateLimitStore.get(identifier);

	if (!entry) {
		return { isLimited: false, remainingAttempts: finalConfig.maxAttempts };
	}

	// Check if currently blocked
	if (entry.blockedUntil && now < entry.blockedUntil) {
		return {
			isLimited: true,
			remainingAttempts: 0,
			blockedUntil: entry.blockedUntil
		};
	}

	// Check if window has expired
	if (now - entry.firstAttempt > finalConfig.windowMs) {
		rateLimitStore.delete(identifier);
		return { isLimited: false, remainingAttempts: finalConfig.maxAttempts };
	}

	const remainingAttempts = Math.max(0, finalConfig.maxAttempts - entry.attempts);
	const resetTime = entry.firstAttempt + finalConfig.windowMs;

	return {
		isLimited: remainingAttempts === 0,
		remainingAttempts,
		resetTime
	};
}

/**
 * Record a failed attempt
 */
export function recordFailedAttempt(identifier: string, config: Partial<RateLimitConfig> = {}): {
	isBlocked: boolean;
	remainingAttempts: number;
	blockedUntil?: number;
} {
	const finalConfig = { ...defaultConfig, ...config };
	const now = Date.now();
	const entry = rateLimitStore.get(identifier);

	if (!entry) {
		// First attempt
		rateLimitStore.set(identifier, {
			attempts: 1,
			firstAttempt: now
		});
		return { isBlocked: false, remainingAttempts: finalConfig.maxAttempts - 1 };
	}

	// Check if window has expired
	if (now - entry.firstAttempt > finalConfig.windowMs) {
		// Reset window
		rateLimitStore.set(identifier, {
			attempts: 1,
			firstAttempt: now
		});
		return { isBlocked: false, remainingAttempts: finalConfig.maxAttempts - 1 };
	}

	// Increment attempts
	entry.attempts++;

	// Check if should be blocked
	if (entry.attempts >= finalConfig.maxAttempts) {
		entry.blockedUntil = now + finalConfig.blockDurationMs;
		rateLimitStore.set(identifier, entry);
		return {
			isBlocked: true,
			remainingAttempts: 0,
			blockedUntil: entry.blockedUntil
		};
	}

	rateLimitStore.set(identifier, entry);
	return {
		isBlocked: false,
		remainingAttempts: finalConfig.maxAttempts - entry.attempts
	};
}

/**
 * Record a successful attempt (reset rate limit)
 */
export function recordSuccessfulAttempt(identifier: string): void {
	rateLimitStore.delete(identifier);
}

/**
 * Get client identifier (IP address or user ID)
 */
export function getClientIdentifier(request: Request, userId?: string): string {
	// Prefer user ID if available (more secure)
	if (userId) {
		return `user:${userId}`;
	}

	// Fall back to IP address
	const forwarded = request.headers.get('x-forwarded-for');
	const realIP = request.headers.get('x-real-ip');
	const ip = forwarded?.split(',')[0].trim() || realIP || 'unknown';
	
	return `ip:${ip}`;
}

/**
 * Clean up expired rate limit entries
 */
export function cleanupExpiredEntries(): void {
	const now = Date.now();
	for (const [identifier, entry] of rateLimitStore.entries()) {
		// Remove if window expired and not blocked
		if (!entry.blockedUntil && now - entry.firstAttempt > 15 * 60 * 1000) {
			rateLimitStore.delete(identifier);
		}
		// Remove if block expired
		else if (entry.blockedUntil && now > entry.blockedUntil) {
			rateLimitStore.delete(identifier);
		}
	}
}

// Clean up expired entries every 5 minutes
setInterval(cleanupExpiredEntries, 5 * 60 * 1000);

/**
 * Rate limit middleware for SvelteKit
 */
export function createRateLimitMiddleware(config: Partial<RateLimitConfig> = {}) {
	return async (event: any, resolve: any) => {
		const identifier = getClientIdentifier(event.request);
		const rateLimit = checkRateLimit(identifier, config);

		if (rateLimit.isLimited) {
			return new Response('Too Many Requests', {
				status: 429,
				headers: {
					'Retry-After': rateLimit.blockedUntil 
						? Math.ceil((rateLimit.blockedUntil - Date.now()) / 1000).toString()
						: '900', // 15 minutes
					'X-RateLimit-Limit': config.maxAttempts?.toString() || '5',
					'X-RateLimit-Remaining': rateLimit.remainingAttempts.toString(),
					'X-RateLimit-Reset': rateLimit.resetTime?.toString() || ''
				}
			});
		}

		// Add rate limit headers to response
		const response = await resolve(event);
		response.headers.set('X-RateLimit-Limit', config.maxAttempts?.toString() || '5');
		response.headers.set('X-RateLimit-Remaining', rateLimit.remainingAttempts.toString());
		if (rateLimit.resetTime) {
			response.headers.set('X-RateLimit-Reset', rateLimit.resetTime.toString());
		}

		return response;
	};
}
