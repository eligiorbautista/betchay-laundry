import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { getServerSession } from '$lib/config/supabaseServer';

export const load: LayoutServerLoad = async (event) => {
	// Check if user is authenticated using server-side cookies
	const session = await getServerSession(event);

	// Using client-side auth protection
	// Server-side protection can be re-enabled once cookie sync is perfected
	
	// Return user data (or null if no session)
	return {
		user: session?.user || null,
		session: session
	};
};