import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { getServerSession } from '$lib/config/supabaseServer';

export const load: LayoutServerLoad = async (event) => {
	try {
		// Check if user is authenticated using server-side cookies
		const session = await getServerSession(event);

		// Using client-side auth protection
		// Server-side protection can be re-enabled once cookie sync is perfected
		
		// Return user data (or null if no session)
		return {
			user: session?.user || null,
			session: session
		};
	} catch (error) {
		console.error('Error in app layout server load:', error);
		// Return null values instead of throwing to prevent app crashes
		return {
			user: null,
			session: null
		};
	}
};