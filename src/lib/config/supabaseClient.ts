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
					// Don't use Secure flag in development (localhost)
					const isProduction = process.env.NODE_ENV === 'production';
					const secureFlag = isProduction ? '; Secure' : '';
					const cookieString = `${key}=${encodeURIComponent(value)}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax${secureFlag}`;
					document.cookie = cookieString;
				}
			},
			removeItem: (key: string) => {
				if (typeof document !== 'undefined') {
					// Client-side: remove cookie
					document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
				}
			}
		}
	}
});

// Export types for use throughout the app
export type Database = any; // Replace with generated types from Supabase
