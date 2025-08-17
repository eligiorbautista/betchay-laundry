import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { supabase } from '$lib/config/supabaseClient';

export const load: PageServerLoad = async ({ url, locals }) => {
	// Check if user is already authenticated via Supabase
	const session = await supabase.auth.getSession();
	if (session.data.session) {
		throw redirect(302, '/dashboard');
	}

	return {};
};

export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const email = data.get('email') as string;
		const password = data.get('password') as string;

		// Validate inputs
		if (!email || !password) {
			return fail(400, {
				error: 'Email and password are required',
				email
			});
		}

		try {
			// Attempt to sign in with Supabase
			const { data: signInData, error } = await supabase.auth.signInWithPassword({
				email,
				password
			});

			if (error) {
				return fail(400, {
					error: error.message,
					email
				});
			}

			if (signInData.user) {
				// Success - frontend will handle redirect via authStore
				return {
					success: true,
					message: 'Login successful'
				};
			} else {
				return fail(400, {
					error: 'Login failed. Please try again.',
					email
				});
			}
		} catch (error: any) {
			console.error('Login error:', error);
			return fail(500, {
				error: 'An unexpected error occurred. Please try again.',
				email
			});
		}
	}
}; 