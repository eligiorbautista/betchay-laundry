import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ url }) => {
	const token = url.searchParams.get('token');
	
	return {
		token
	};
};

export const actions: Actions = {
	default: async ({ request, url }) => {
		const data = await request.formData();
		const token = data.get('token') as string;
		const password = data.get('password') as string;
		const confirmPassword = data.get('confirmPassword') as string;

		// Validation
		if (!token) {
			return fail(400, {
				error: 'Invalid reset token'
			});
		}

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
			// Here you would typically validate the token and update the password
			// For now, we'll simulate success
			
			return {
				success: true
			};
		} catch (error) {
			return fail(500, {
				error: 'Failed to update password. Please try again.'
			});
		}
	}
};
