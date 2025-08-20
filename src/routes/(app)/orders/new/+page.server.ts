import type { PageServerLoad } from './$types';
import { createSupabaseServerClient } from '$lib/config/supabaseServer';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async (event) => {
	try {
		// Create Supabase client
		const supabase = createSupabaseServerClient(event);
		
		// Fetch service pricing from database
		const { data: servicePricing, error: dbError } = await supabase
			.from('service_pricing')
			.select('*')
			.order('service_name');

		if (dbError) {
			console.error('Error fetching service pricing:', dbError);
			// Fallback to empty array if database error
			return {
				servicePricing: []
			};
		}

		return {
			servicePricing: servicePricing || []
		};
	} catch (err) {
		console.error('Error in new order page load:', err);
		// Fallback to empty array on any error
		return {
			servicePricing: []
		};
	}
};
