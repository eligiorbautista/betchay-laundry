import type { Session, User } from '@supabase/supabase-js';
import { env } from '$env/dynamic/public';

/**
 * Admin email that has access to Dashboard and Reports
 * Uses environment variable PUBLIC_ADMIN_EMAIL with fallback
 */
export const ADMIN_EMAIL = env.PUBLIC_ADMIN_EMAIL || 'betchaylaundryhub@gmail.com';

/**
 * Check if the current user is an admin
 * @param user - The current user object from Supabase
 * @returns boolean - true if user is admin, false otherwise
 */
export function isAdmin(user: User | null): boolean {
	if (!user || !user.email) {
		return false;
	}
	
	const userEmail = user.email.toLowerCase().trim();
	const adminEmail = ADMIN_EMAIL.toLowerCase().trim();
	
	return userEmail === adminEmail;
}

/**
 * Check if the current session belongs to an admin user
 * @param session - The current session object from Supabase
 * @returns boolean - true if session belongs to admin, false otherwise
 */
export function isAdminSession(session: Session | null): boolean {
	if (!session || !session.user) {
		return false;
	}
	
	return isAdmin(session.user);
}

/**
 * Get user role based on email
 * @param user - The current user object from Supabase
 * @returns string - 'admin' if admin email, 'user' otherwise
 */
export function getUserRole(user: User | null): 'admin' | 'user' {
	return isAdmin(user) ? 'admin' : 'user';
}

/**
 * Get the current admin email being used (for debugging)
 * @returns string - The admin email from environment or fallback
 */
export function getAdminEmail(): string {
	return ADMIN_EMAIL;
}
