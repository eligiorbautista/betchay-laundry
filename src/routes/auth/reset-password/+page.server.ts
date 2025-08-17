import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { supabase } from '$lib/config/supabaseClient';

export const load: PageServerLoad = async ({ url }) => {
	// Supabase automatically handles the token validation
	// We just need to check if we have the required URL fragments
	const accessToken = url.searchParams.get('access_token');
	const refreshToken = url.searchParams.get('refresh_token');
	
	return {
		accessToken,
		refreshToken
	};
};

export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const password = data.get('password') as string;
		const confirmPassword = data.get('confirmPassword') as string;

		// Validation
		if (!password || !confirmPassword) {
			return fail(400, {
				error: 'Password and confirmation are required'
			});
		}

		if (password !== confirmPassword) {
			return fail(400, {
				error: 'Passwords do not match'
			});
		}

		if (password.length < 8) {
			return fail(400, {
				error: 'Password must be at least 8 characters long'
			});
		}

		try {
			// Update password using Supabase
			const { error } = await supabase.auth.updateUser({
				password: password
			});

			if (error) {
				return fail(400, {
					error: error.message
				});
			}
			
			return {
				success: true
			};
		} catch (error: any) {
			console.error('Password update error:', error);
			return fail(500, {
				error: 'Failed to update password. Please try again.'
			});
		}
	}
};
