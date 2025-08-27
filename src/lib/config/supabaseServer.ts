import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { RequestEvent } from '@sveltejs/kit';

const supabaseUrl = PUBLIC_SUPABASE_URL;
const supabaseKey = PUBLIC_SUPABASE_ANON_KEY;

/**
 * Creates a Supabase client for server-side operations with cookie handling
 */
export function createSupabaseServerClient(event: RequestEvent) {
	return createClient(supabaseUrl, supabaseKey, {
		auth: {
			autoRefreshToken: true,
			persistSession: true,
			detectSessionInUrl: false,
			// Server-side cookie handling
			storage: {
				getItem: (key: string) => {
					const value = event.cookies.get(key);
					return value ?? null;
				},
				setItem: (key: string, value: string) => {
					event.cookies.set(key, value, {
						path: '/',
						maxAge: 7 * 24 * 60 * 60, // 7 days
						sameSite: 'lax',
						secure: process.env.NODE_ENV === 'production',
						// Do not use httpOnly so the client-side storage can read the cookie
						httpOnly: false
					});
				},
				removeItem: (key: string) => {
					event.cookies.delete(key, {
						path: '/'
					});
				}
			}
		}
	});
}

/**
 * Helper to get session from server-side cookies
 */
export async function getServerSession(event: RequestEvent) {
	const supabase = createSupabaseServerClient(event);
	const { data: { session }, error } = await supabase.auth.getSession();
	
	if (error) {
		console.error('Error getting server session:', error);
		return null;
	}
	
	return session;
}