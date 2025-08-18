import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
	return {};
};

export const actions: Actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const token = data.get('token') as string;
		const backupCode = data.get('backupCode') as string;

		// Validation
		if (!token && !backupCode) {
			return fail(400, {
				error: 'Authentication code or backup code is required'
			});
		}

		if (token && token.length !== 6) {
			return fail(400, {
				error: 'Authentication code must be 6 digits'
			});
		}

		if (backupCode && backupCode.length !== 8) {
			return fail(400, {
				error: 'Backup code must be 8 characters'
			});
		}

		try {
			// Here you would typically validate the 2FA code
			// TODO: Implement actual 2FA verification
			
			return {
				success: true
			};
		} catch (error) {
			return fail(500, {
				error: 'Verification failed. Please try again.'
			});
		}
	}
};
