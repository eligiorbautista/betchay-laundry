import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	// If user is already authenticated, redirect to dashboard
	if ((locals as any).user) {
		throw redirect(302, '/dashboard');
	}

	return {};
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();
		const email = data.get('email') as string;
		const password = data.get('password') as string;

		// Basic validation
		if (!email || !password) {
			return fail(400, {
				error: 'Email and password are required'
			});
		}

		try {
			// For frontend-only development, simulate authentication
			// In a real app, this would authenticate with Supabase or your auth provider
			
			// Simulate a successful login for demo purposes
			// You can modify this logic for testing different scenarios
			if (email && password) {
				// Set authentication cookie for frontend-only development
				cookies.set('session', 'demo-session-token', {
					path: '/',
					httpOnly: true,
					secure: process.env.NODE_ENV === 'production',
					sameSite: 'lax',
					maxAge: 60 * 60 * 24 * 7 // 7 days
				});

				// Return success response that the frontend can handle
				return {
					type: 'success',
					data: { message: 'Login successful' }
				};
			} else {
				return fail(400, {
					error: 'Invalid email or password',
					email
				});
			}
		} catch (error) {
			return fail(400, {
				error: 'Login failed. Please try again.',
				email
			});
		}
	}
}; 