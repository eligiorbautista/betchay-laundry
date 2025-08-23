import type { SupabaseClient } from '@supabase/supabase-js';

// audit logging utility functions

/**
 * log an audit event to the database
 */
export async function logAuditEvent(
	supabase: SupabaseClient,
	actionType: 'login' | 'logout' | 'reset_password' | 'order_created' | 'order_updated' | 'order_status_changed' | 'payment_status_changed',
	description: string,
	entityType?: 'order' | 'user' | 'system',
	entityId?: string,
	ipAddress?: string,
	userAgent?: string,
	userEmail?: string
) {
	try {
		// get current user - try both getUser and getSession
		const { data: { user } } = await supabase.auth.getUser();
		const { data: { session } } = await supabase.auth.getSession();

		// Use session user if getUser fails, or use provided userEmail
		const currentUser = user || session?.user;
		const finalUserEmail = userEmail || currentUser?.email;

		// Debug logging to see what we're getting
		console.log('Audit Log Debug:', {
			actionType,
			description,
			userId: currentUser?.id,
			providedUserEmail: userEmail,
			finalUserEmail,
			entityType,
			entityId
		});

		// call the database function to log the event
		const { error } = await supabase.rpc('log_audit_event', {
			p_user_id: currentUser?.id || null,
			p_action_type: actionType,
			p_description: description,
			p_user_email: finalUserEmail || null,
			p_entity_type: entityType || null,
			p_entity_id: entityId || null,
			p_ip_address: ipAddress || null,
			p_user_agent: userAgent || null
		});

		if (error) {
			console.error('Error logging audit event:', error);
			// don't throw error to avoid breaking the main functionality
		} else {
			console.log('Audit event logged successfully');
		}
	} catch (error) {
		console.error('Error in logAuditEvent:', error);
		// don't throw error to avoid breaking the main functionality
	}
}

/**
 * get client ip address from request headers
 */
export function getClientIP(request: Request): string | undefined {
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

/**
 * get user agent from request headers
 */
export function getUserAgent(request: Request): string | undefined {
	return request.headers.get('user-agent') || undefined;
}
