import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { createSupabaseServerClient } from '$lib/config/supabaseServer';
import { logAuditEvent } from '$lib/utils/audit';

export const actions: Actions = {
	default: async (event) => {
		// Create server-side client with cookie handling
		const supabase = createSupabaseServerClient(event);
		
		try {
			// Get current user before signing out
			const { data: { user } } = await supabase.auth.getUser();
			
			// Try to sign out from Supabase (this will clear the cookies)
			const { error } = await supabase.auth.signOut();
			
			// Log audit event for logout if user was found
			if (user) {
				await logAuditEvent(
					supabase,
					'logout',
					`User ${user.email} logged out`,
					'user',
					user.id,
					getClientIP(event.request),
					getUserAgent(event.request)
				);
			}
			
			// Even if signOut failed (e.g., no session), we still want to redirect
			// The error might be due to missing session, which is fine for logout
			if (error && !error.message.includes('Auth session missing')) {
				console.error('Logout error:', error);
			}
			
		} catch (error) {
			// Handle any unexpected errors during logout
			console.error('Unexpected logout error:', error);
			// Continue with logout process even if there's an error
		}
		
		// Always redirect to login, regardless of any errors
		throw redirect(302, '/auth/login');
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
