import type { PageServerLoad } from './$types';
import type { Order } from '$lib/types/order';
import { error } from '@sveltejs/kit';
import { createSupabaseServerClient } from '$lib/config/supabaseServer';

export const load: PageServerLoad = async (event) => {
	try {
		const orderId = event.params.orderId;
		
		// create supabase client
		const supabase = createSupabaseServerClient(event);
		
		// fetch order from database
		const { data: order, error: dbError } = await supabase
			.from('orders')
			.select('*')
			.eq('id', orderId)
			.single();

		if (dbError) {
			console.error('Error fetching order:', dbError);
			throw error(404, 'Order not found');
		}

		if (!order) {
			throw error(404, 'Order not found');
		}

		// transform database data to match our Order interface
		const transformedOrder: Order = {
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
		};

		return {
			order: transformedOrder
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
