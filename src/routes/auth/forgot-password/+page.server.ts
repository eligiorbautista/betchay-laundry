import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { supabase } from '$lib/config/supabaseClient';
import { logAuditEvent } from '$lib/utils/audit';

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

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return fail(400, {
				error: 'Please enter a valid email address',
				email
			});
		}

		try {
			// Trigger password reset flow
			console.log('Attempting password reset for:', email);
			
			// Use explicit localhost URL for development
			const redirectUrl = url.hostname === 'localhost' 
				? `http://localhost:${url.port || 5173}/auth/reset-password`
				: `${url.origin}/auth/reset-password`;
			
			console.log('Redirect URL:', redirectUrl);
			
			const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
				redirectTo: redirectUrl,
			});

			console.log('Supabase response:', { data, error });

			if (error) {
				console.error('Supabase password reset error:', error);
				return fail(400, {
					error: error.message,
					email
				});
			}
			
			// log audit event for password reset request
			await logAuditEvent(
				supabase,
				'reset_password',
				`Password reset requested for email: ${email}`,
				'user',
				null, // no user ID yet since they're not logged in
				getClientIP(request),
				getUserAgent(request)
			);
			
			return {
				success: true
			};
		} catch (error: any) {
			console.error('Password reset exception:', error);
			return fail(500, {
				error: error.message || 'Failed to send reset email. Please try again.',
				email
			});
		}
	}
};

// Helper functions for getting client info
function getClientIP(request: Request): string | undefined {
	const forwarded = request.headers.get('x-forwarded-for');
	const realIP = request.headers.get('x-real-ip');
	
	if (forwarded) {
		return forwarded.split(',')[0].trim();
	}
	
	if (realIP) {
		return realIP;
	}
	
	return undefined;
}

function getUserAgent(request: Request): string | undefined {
	return request.headers.get('user-agent') || undefined;
}
