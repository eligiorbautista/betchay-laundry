import type { PageServerLoad } from './$types';
import type { OrderWithAddOns } from '$lib/types/order';
import { error } from '@sveltejs/kit';
import { createSupabaseServerClient } from '$lib/config/supabaseServer';
import { fetchOrderWithAddOns } from '$lib/utils/database';

export const load: PageServerLoad = async (event) => {
	try {
		const orderId = event.params.orderId;
		
		// create supabase client
		const supabase = createSupabaseServerClient(event);
		
		// fetch order with add-ons from database
		const orderWithAddOns = await fetchOrderWithAddOns(supabase, orderId);

		if (!orderWithAddOns) {
			throw error(404, 'Order not found');
		}

		return {
			order: orderWithAddOns
		};
	} catch (err) {
		console.error('Error loading order for print:', err);
		if (err && typeof err === 'object' && 'status' in err) {
			// Re-throw SvelteKit errors
			throw err;
		}
		throw error(500, 'Failed to load order');
	}
};
