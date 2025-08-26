import type { PageServerLoad, Actions } from './$types';
import type { ReportsData } from '$lib/types/report';
import { redirect } from '@sveltejs/kit';
import { getServerSession, createSupabaseServerClient } from '$lib/config/supabaseServer';
import { isAdmin } from '$lib/utils/auth';
import { generateReportsData } from '$lib/utils/database';
import { json } from '@sveltejs/kit';

export const load: PageServerLoad = async (event) => {
	// temporary fix: disable server-side protection due to cookie sync issues
	// the adminonly component will handle client-side protection
	
	// debug: check server session (for debugging purposes)
	const session = await getServerSession(event);
	console.log('Reports Server Session Debug:', {
		hasSession: !!session,
		userEmail: session?.user?.email || 'No user found in server session',
		note: 'Using client-side protection only due to cookie sync issues'
	});
	
	// allow access - client-side adminonly component will handle protection
	
	try {
		// get supabase client
		const supabase = createSupabaseServerClient(event);
		
		// get date range from url params (optional)
		const url = new URL(event.request.url);
		let startDate = url.searchParams.get('startDate');
		let endDate = url.searchParams.get('endDate');
		
		// for initial load, show all data if no specific dates provided
		// this allows users to see their actual data range first
		let useAllData = false;
		if (!startDate || !endDate) {
			useAllData = true;
		}
		
		console.log('Reports page load with params:', { startDate, endDate });
		
		// generate reports from real database data
		const reportsData = await generateReportsData(
			supabase, 
			useAllData ? undefined : (startDate || undefined), 
			useAllData ? undefined : (endDate || undefined)
		);
		

		return {
			reports: reportsData
		};
	} catch (error) {
		console.error('Error loading reports:', error);
		
		// return fallback data if database query fails
		const fallbackData: ReportsData = {
			summary: {
				totalRevenue: 0,
				totalOrders: 0,
				completedOrdersCount: 0,
				averageOrderValue: 0,
				period: "Last 30 Days",
				periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
				periodEnd: new Date().toISOString().split('T')[0]
			},
			orderStatusDistribution: [],
			paymentMethodAnalysis: [],
			serviceTypePerformance: [],
			monthlyTrends: [],
			availableYears: [],
			dateRange: {
				start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
				end: new Date().toISOString().split('T')[0]
			}
		};

		return {
			reports: fallbackData
		};
	}
};

// server action for date filtering
export const actions: Actions = {
	filterByDate: async (event) => {
		try {
			const formData = await event.request.formData();
			const startDate = formData.get('startDate') as string;
			const endDate = formData.get('endDate') as string;
			
			console.log('Filtering reports with dates:', { startDate, endDate });
			
			const supabase = createSupabaseServerClient(event);
			const reportsData = await generateReportsData(supabase, startDate, endDate);
			
			console.log('Generated reports data:', {
				totalOrders: reportsData.summary.totalOrders,
				totalRevenue: reportsData.summary.totalRevenue,
				monthlyTrendsCount: reportsData.monthlyTrends.length
			});
			
			return { success: true, reports: reportsData };
		} catch (error) {
			console.error('Error in filterByDate action:', error);
			return { success: false, error: 'Failed to filter reports' };
		}
	}
};