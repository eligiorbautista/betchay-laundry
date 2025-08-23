import type { PageServerLoad } from './$types';
import { createSupabaseServerClient } from '$lib/config/supabaseServer';

export const load: PageServerLoad = async (event) => {
	try {
		const supabase = createSupabaseServerClient(event);
		
		// Fetch all audit logs (client-side pagination like orders page)
		const { data: auditLogs, error } = await supabase
			.from('audit_logs')
			.select('*')
			.order('created_at', { ascending: false });
		
		if (error) {
			console.error('Error fetching audit logs:', error);
			throw new Error('Failed to fetch audit logs');
		}
		
		return {
			auditLogs: auditLogs || [],
			pagination: {
				page: 1,
				limit: 20,
				totalCount: auditLogs?.length || 0,
				totalPages: 1,
				hasNextPage: false,
				hasPrevPage: false
			}
		};
	} catch (error) {
		console.error('Error loading audit logs:', error);
		return {
			auditLogs: [],
			pagination: {
				page: 1,
				limit: 20,
				totalCount: 0,
				totalPages: 0,
				hasNextPage: false,
				hasPrevPage: false
			}
		};
	}
};
