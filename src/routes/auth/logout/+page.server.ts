import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { createSupabaseServerClient } from '$lib/config/supabaseServer';
import { logAuditEvent } from '$lib/utils/audit';

export const actions: Actions = {
	default: async (event) => {
		// Create server-side client with cookie handling
		const supabase = createSupabaseServerClient(event);
		
		// Get current user before signing out
		const { data: { user } } = await supabase.auth.getUser();
		
		// Sign out from Supabase (this will clear the cookies)
		await supabase.auth.signOut();
		
		// log audit event for logout
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
		
		// Redirect to login
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
