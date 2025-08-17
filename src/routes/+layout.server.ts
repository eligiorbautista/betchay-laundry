import type { LayoutServerLoad } from './$types';
import { supabase } from '$lib/config/supabaseClient';

export const load: LayoutServerLoad = async ({ cookies, url }) => {
	// Get session from Supabase
	const { data: { session }, error } = await supabase.auth.getSession();

	// If we have session data, return user info
	const user = session?.user || null;

	return {
		user,
		session
	};
};
