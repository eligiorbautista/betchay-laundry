import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { RequestEvent } from '@sveltejs/kit';

const supabaseUrl = PUBLIC_SUPABASE_URL;
const supabaseKey = PUBLIC_SUPABASE_ANON_KEY;

/**
 * Creates a Supabase client for server-side operations with cookie handling
 */
export function createSupabaseServerClient(event: RequestEvent) {
	// Validate environment variables
	if (!supabaseUrl || !supabaseKey) {
		console.error('Missing Supabase environment variables');
		throw new Error('Supabase configuration is incomplete');
	}

	return createClient(supabaseUrl, supabaseKey, {
		auth: {
			autoRefreshToken: false, // Disable auto refresh to prevent cookie setting after response
			persistSession: true,
			detectSessionInUrl: false,
			// Server-side cookie handling
			storage: {
				getItem: (key: string) => {
					try {
						const value = event.cookies.get(key);
						return value ?? null;
					} catch (error) {
						console.warn('Error getting cookie:', key, error);
						return null;
					}
				},
				setItem: (key: string, value: string) => {
					// Only set cookies if the response hasn't been generated yet
					try {
						event.cookies.set(key, value, {
							path: '/',
							maxAge: 7 * 24 * 60 * 60, // 7 days
							sameSite: 'lax',
							secure: process.env.NODE_ENV === 'production',
							// Do not use httpOnly so the client-side storage can read the cookie
							httpOnly: false
						});
					} catch (error) {
						// Silently fail if response has already been generated
						console.warn('Could not set cookie, response may have been generated:', key, error);
					}
				},
				removeItem: (key: string) => {
					try {
						event.cookies.delete(key, {
							path: '/'
						});
					} catch (error) {
						// Silently fail if response has already been generated
						console.warn('Could not delete cookie, response may have been generated:', key, error);
					}
				}
			}
		}
	});
}

/**
 * Helper to get session from server-side cookies
 */
export async function getServerSession(event: RequestEvent) {
	try {
		const supabase = createSupabaseServerClient(event);
		
		const { data: { session }, error } = await supabase.auth.getSession();
		
		if (error) {
			console.error('Error getting server session:', error);
			return null;
		}
		
		return session;
	} catch (error) {
		console.error('Error in getServerSession:', error);
		return null;
	}
}

/**
 * Helper to refresh session manually if needed
 */
export async function refreshServerSession(event: RequestEvent) {
	try {
		const supabase = createSupabaseServerClient(event);
		
		const { data: { session }, error } = await supabase.auth.refreshSession();
		
		if (error) {
			console.error('Error refreshing server session:', error);
			return null;
		}
		
		return session;
	} catch (error) {
		console.error('Error in refreshServerSession:', error);
		return null;
	}
}