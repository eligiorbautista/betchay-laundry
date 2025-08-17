import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { createSupabaseServerClient, getServerSession } from '$lib/config/supabaseServer';

export const load: PageServerLoad = async (event) => {
	// Check if user is already authenticated via server-side cookies
	const session = await getServerSession(event);
	if (session) {
		throw redirect(302, '/dashboard');
	}

	return {};
};

export const actions: Actions = {
	default: async (event) => {
		const { request } = event;
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
			// Create server-side Supabase client with cookie handling
			const supabase = createSupabaseServerClient(event);
			
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
				// Success - session is now stored in cookies via our custom storage
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