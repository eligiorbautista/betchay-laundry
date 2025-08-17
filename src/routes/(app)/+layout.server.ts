import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { supabase } from '$lib/config/supabaseClient';

export const load: LayoutServerLoad = async ({ url }) => {
	// Check if user is authenticated
	const { data: { session }, error } = await supabase.auth.getSession();

	// If no session, redirect to login
	if (!session || !session.user) {
		throw redirect(302, '/auth/login');
	}

	// Return user data
	return {
		user: session.user,
		session: session
	};
};