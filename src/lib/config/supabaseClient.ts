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
		detectSessionInUrl: true
	}
});

// Export types for use throughout the app
export type Database = any; // Replace with generated types from Supabase
