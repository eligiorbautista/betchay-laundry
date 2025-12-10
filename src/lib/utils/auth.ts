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
 * Dev account email that also has admin access
 */
export const DEV_EMAIL = env.PUBLIC_DEV_EMAIL;

/**
 * Check if the current user is an admin
 * @param user - The current user object from Supabase
 * @returns boolean - true if user is admin or dev account, false otherwise
 */
export function isAdmin(user: User | null): boolean {
	if (!user || !user.email || !ADMIN_EMAIL) {
		return false;
	}
	
	const userEmail = user.email.toLowerCase().trim();
	const adminEmail = ADMIN_EMAIL.toLowerCase().trim();
	const devEmail = DEV_EMAIL.toLowerCase().trim();
	
	return userEmail === adminEmail || userEmail === devEmail;
}


