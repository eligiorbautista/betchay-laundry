import type { PageServerLoad } from './$types';
import type { Order } from '$lib/types/order';
import { createSupabaseServerClient } from '$lib/config/supabaseServer';
import { fetchOrders } from '$lib/utils/database';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async (event) => { 
	// create supabase client for server-side operations
	const supabase = createSupabaseServerClient(event);

	try {
		// fetch all orders from database using utility function
		const orders = await fetchOrders(supabase, {
			orderBy: 'created_at'
		});

		// transform database data to match our Order interface
		const transformedOrders: Order[] = orders.map(order => ({
			id: order.id,
			order_number: order.order_number,
			customer_name: order.customer_name,
			customer_phone: order.customer_phone,
			status: order.status,
			payment_status: order.payment_status,
			payment_method: order.payment_method,
			service_type: order.service_type,
			quantity: order.quantity,
			unit_price: order.unit_price,
			total_amount: order.total_amount,
			pickup_date: order.pickup_date,
			delivery_date: order.delivery_date,
			remarks: order.remarks,
			created_at: order.created_at,
			updated_at: order.updated_at
		}));

		return {
			orders: transformedOrders
		};

	} catch (err) {
		console.error('Error in orders page load:', err);
		throw error(500, 'Failed to load orders');
	}
};
