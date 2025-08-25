/**
 * Security configuration and utilities
 */

export const SECURITY_CONFIG = {
	// Session configuration
	session: {
		maxAge: 7 * 24 * 60 * 60, // 7 days
		sameSite: 'strict' as const,
		secure: process.env.NODE_ENV === 'production',
		httpOnly: true
	},

	// Rate limiting configuration
	rateLimit: {
		login: {
			maxAttempts: 5,
			windowMs: 15 * 60 * 1000, // 15 minutes
			blockDurationMs: 30 * 60 * 1000 // 30 minutes
		},
		api: {
			maxAttempts: 100,
			windowMs: 15 * 60 * 1000, // 15 minutes
			blockDurationMs: 60 * 60 * 1000 // 1 hour
		}
	},

	// Input validation limits
	validation: {
		maxCustomerNameLength: 100,
		maxPhoneLength: 20,
		maxRemarksLength: 500,
		maxSearchQueryLength: 100,
		maxQuantity: 1000,
		maxUnitPrice: 10000
	},

	// Password requirements
	password: {
		minLength: 8,
		requireUppercase: true,
		requireLowercase: true,
		requireNumbers: true,
		requireSpecialChars: true
	},

	// Security headers
	headers: {
		'X-Content-Type-Options': 'nosniff',
		'X-Frame-Options': 'DENY',
		'X-XSS-Protection': '1; mode=block',
		'Referrer-Policy': 'strict-origin-when-cross-origin',
		'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
		'Content-Security-Policy': [
			"default-src 'self'",
			"script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co",
			"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
			"font-src 'self' https://fonts.gstatic.com",
			"img-src 'self' data: https:",
			"connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.iconify.design https://api.unisvg.com",
			"frame-src 'none'",
			"object-src 'none'"
		].join('; ')
	}
};

/**
 * Validate password strength
 */
export function validatePassword(password: string): {
	isValid: boolean;
	errors: string[];
	strength: 'weak' | 'medium' | 'strong';
} {
	const errors: string[] = [];
	const { minLength, requireUppercase, requireLowercase, requireNumbers, requireSpecialChars } = SECURITY_CONFIG.password;

	if (password.length < minLength) {
		errors.push(`Password must be at least ${minLength} characters long`);
	}

	if (requireUppercase && !/[A-Z]/.test(password)) {
		errors.push('Password must contain at least one uppercase letter');
	}

	if (requireLowercase && !/[a-z]/.test(password)) {
		errors.push('Password must contain at least one lowercase letter');
	}

	if (requireNumbers && !/\d/.test(password)) {
		errors.push('Password must contain at least one number');
	}

	if (requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
		errors.push('Password must contain at least one special character');
	}

	// Calculate password strength
	let strength: 'weak' | 'medium' | 'strong' = 'weak';
	const hasUppercase = /[A-Z]/.test(password);
	const hasLowercase = /[a-z]/.test(password);
	const hasNumbers = /\d/.test(password);
	const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
	const length = password.length;

	const criteria = [hasUppercase, hasLowercase, hasNumbers, hasSpecialChars, length >= 12].filter(Boolean).length;

	if (criteria >= 4 && length >= 12) {
		strength = 'strong';
	} else if (criteria >= 3 && length >= 8) {
		strength = 'medium';
	}

	return {
		isValid: errors.length === 0,
		errors,
		strength
	};
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
	return input
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#x27;')
		.replace(/\//g, '&#x2F;');
}

/**
 * Check if string contains potentially malicious content
 */
export function containsMaliciousContent(input: string): boolean {
	const dangerousPatterns = [
		/<script/i,
		/javascript:/i,
		/on\w+\s*=/i,
		/data:text\/html/i,
		/vbscript:/i,
		/expression\(/i,
		/url\(/i,
		/eval\(/i,
		/alert\(/i,
		/confirm\(/i,
		/prompt\(/i
	];

	return dangerousPatterns.some(pattern => pattern.test(input));
}

/**
 * Generate secure random string
 */
export function generateSecureToken(length: number = 32): string {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let result = '';
	const randomArray = new Uint8Array(length);
	crypto.getRandomValues(randomArray);
	
	for (let i = 0; i < length; i++) {
		result += chars.charAt(randomArray[i] % chars.length);
	}
	
	return result;
}

/**
 * Hash sensitive data (for logging purposes)
 */
export function hashSensitiveData(data: string): string {
	// Simple hash for logging - not for security purposes
	let hash = 0;
	for (let i = 0; i < data.length; i++) {
		const char = data.charCodeAt(i);
		hash = ((hash << 5) - hash) + char;
		hash = hash & hash; // Convert to 32-bit integer
	}
	return Math.abs(hash).toString(16);
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

/**
 * Check if request is from a trusted source
 */
export function isTrustedOrigin(origin: string): boolean {
	const trustedOrigins = [
		'http://localhost:5173',
		'http://localhost:4173',
		'http://localhost:3000',
		'https://yourdomain.com' // Replace with your actual domain
	];
	
	return trustedOrigins.includes(origin);
}

/**
 * Get security headers for responses
 */
export function getSecurityHeaders(): Record<string, string> {
	return SECURITY_CONFIG.headers;
}

/**
 * Log security event
 */
export function logSecurityEvent(event: string, details: any, severity: 'low' | 'medium' | 'high' = 'medium'): void {
	const timestamp = new Date().toISOString();
	const logEntry = {
		timestamp,
		event,
		severity,
		details: typeof details === 'string' ? details : JSON.stringify(details),
		userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server-side'
	};

	// In production, send to security monitoring service
	if (process.env.NODE_ENV === 'production') {
		console.warn('SECURITY EVENT:', logEntry);
		// TODO: Send to security monitoring service
	} else {
		console.log('SECURITY EVENT:', logEntry);
	}
}
