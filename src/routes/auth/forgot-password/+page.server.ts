import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
	return {};
};

export const actions: Actions = {
	default: async ({ request }) => {
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
			// Here you would typically send a password reset email
			// For now, we'll simulate success
			
			return {
				success: true
			};
		} catch (error) {
			return fail(500, {
				error: 'Failed to send reset email. Please try again.',
				email
			});
		}
	}
};
