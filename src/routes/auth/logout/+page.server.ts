import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { supabase } from '$lib/config/supabaseClient';

export const actions: Actions = {
	default: async () => {
		// Sign out from Supabase
		await supabase.auth.signOut();
		
		// Redirect to login
		throw redirect(302, '/auth/login');
	}
};
