import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

// Use environment variables
const supabaseUrl = PUBLIC_SUPABASE_URL;
const supabaseKey = PUBLIC_SUPABASE_ANON_KEY;

// Check if environment variables are set properly
if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('supabase_url_here')) {
	console.warn('⚠️  Supabase environment variables not configured properly.');
	console.warn('📝 Please check your .env file and ensure PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY are set.');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey, {
	auth: {
		autoRefreshToken: true,
		persistSession: true,
		detectSessionInUrl: true,
		flowType: 'implicit', // Use implicit flow for simplicity
		// Use cookies instead of localStorage for better security
		storage: {
			getItem: (key: string) => {
				if (typeof document !== 'undefined') {
					// Client-side: read from cookies
					const cookies = document.cookie.split(';');
					for (let cookie of cookies) {
						const [name, value] = cookie.trim().split('=');
						if (name === key) {
							return decodeURIComponent(value);
						}
					}
				}
				return null;
			},
			setItem: (key: string, value: string) => {
				if (typeof document !== 'undefined') {
					// Client-side: set secure cookie
					const isProduction = process.env.NODE_ENV === 'production';
					const secureFlag = isProduction ? '; Secure' : '';
					// Must be readable by JS on client to sync with Supabase client storage
					const sameSiteFlag = '; SameSite=Lax';
					const cookieString = `${key}=${encodeURIComponent(value)}; path=/; max-age=${7 * 24 * 60 * 60}${sameSiteFlag}${secureFlag}`;
					document.cookie = cookieString;
				}
			},
			removeItem: (key: string) => {
				if (typeof document !== 'undefined') {
					// Client-side: remove cookie
					document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
				}
			}
		}
	}
});

// Export types for use throughout the app
export type Database = any; // TODO: Generate types from Supabase CLI
