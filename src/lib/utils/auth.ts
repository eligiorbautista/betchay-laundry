import type { Session, User } from '@supabase/supabase-js';
import { env } from '$env/dynamic/public';

/**
 * Admin email that has access to Dashboard and Reports
 * Uses environment variable PUBLIC_ADMIN_EMAIL (required)
 */
export const ADMIN_EMAIL = env.PUBLIC_ADMIN_EMAIL;

if (!ADMIN_EMAIL) {
	throw new Error('PUBLIC_ADMIN_EMAIL environment variable is required');
}

/**
 * Check if the current user is an admin
 * @param user - The current user object from Supabase
 * @returns boolean - true if user is admin, false otherwise
 */
export function isAdmin(user: User | null): boolean {
	if (!user || !user.email || !ADMIN_EMAIL) {
		return false;
	}
	
	const userEmail = user.email.toLowerCase().trim();
	const adminEmail = ADMIN_EMAIL.toLowerCase().trim();
	
	return userEmail === adminEmail;
}


