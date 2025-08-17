import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { supabase } from '$lib/config/supabaseClient';

export const load: PageServerLoad = async () => {
	return {};
};

export const actions: Actions = {
	default: async ({ request, url }) => {
		const data = await request.formData();
		const email = data.get('email') as string;

		// Basic validation
		if (!email) {
			return fail(400, {
				error: 'Email is required'
			});
		}

		// Basic email validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return fail(400, {
				error: 'Please enter a valid email address',
				email
			});
		}

		try {
			// Send password reset email using Supabase
			const { error } = await supabase.auth.resetPasswordForEmail(email, {
				redirectTo: `${url.origin}/auth/reset-password`,
			});

			if (error) {
				return fail(400, {
					error: error.message,
					email
				});
			}
			
			return {
				success: true
			};
		} catch (error: any) {
			console.error('Password reset error:', error);
			return fail(500, {
				error: 'Failed to send reset email. Please try again.',
				email
			});
		}
	}
};
