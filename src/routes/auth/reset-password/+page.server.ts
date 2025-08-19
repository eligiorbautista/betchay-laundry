import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ url }) => {
	// For implicit flow, tokens are in URL hash (not available server-side)
	// Client-side will handle session establishment
	return {};
};

export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const password = data.get('password') as string;
		const confirmPassword = data.get('confirmPassword') as string;

		// Basic validation only - session validation will be done client-side
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

		// Return the validated data - actual password update will be handled client-side
		return {
			success: true,
			password: password
		};
	}
};