import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { createSupabaseServerClient } from '$lib/config/supabaseServer';

export const actions: Actions = {
	default: async (event) => {
		// Create server-side client with cookie handling
		const supabase = createSupabaseServerClient(event);
		
		// Sign out from Supabase (this will clear the cookies)
		await supabase.auth.signOut();
		
		// Redirect to login
		throw redirect(302, '/auth/login');
	}
};
