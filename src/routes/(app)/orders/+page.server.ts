import type { PageServerLoad } from './$types';
import type { Order } from '$lib/types/order';
import { createSupabaseServerClient } from '$lib/config/supabaseServer';
import { fetchOrders } from '$lib/utils/database';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async (event) => { 
	// create supabase client for server-side operations
	const supabase = createSupabaseServerClient(event);

	// Get filter parameters from URL (pagination will be handled client-side)
	const url = new URL(event.request.url);
	const search = url.searchParams.get('search') || '';
	const status = url.searchParams.get('status') || 'all';
	const paymentStatus = url.searchParams.get('paymentStatus') || 'all';
	const startDate = url.searchParams.get('startDate') || '';
	const endDate = url.searchParams.get('endDate') || '';

	try {
		// fetch ALL orders from database (pagination will be handled client-side)
		const orders = await fetchOrders(supabase, {
			orderBy: 'created_at'
		});

		// Get total count (all orders since we're fetching all)
		const { count } = await supabase
			.from('orders')
			.select('*', { count: 'exact', head: true });

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
			load_count: order.load_count,
			kg_per_load: order.kg_per_load,
			total_weight_kg: order.total_weight_kg ?? (order.load_count && order.kg_per_load ? order.load_count * order.kg_per_load : 0),
			unit_price: order.unit_price,
			subtotal_amount: order.subtotal_amount,
			add_ons_amount: order.add_ons_amount,
			total_amount: order.total_amount,
			// New add-ons columns
			add_ons: order.add_ons,
			add_ons_quantity: order.add_ons_quantity,
			add_ons_list: order.add_ons_list,
			pickup_date: order.pickup_date,
			delivery_date: order.delivery_date,
			remarks: order.remarks,
			created_at: order.created_at,
			updated_at: order.updated_at
		}));

		return {
			orders: transformedOrders,
			pagination: {
				total: count || 0
			},
			filters: {
				search,
				status,
				paymentStatus,
				startDate,
				endDate
			}
		};

	} catch (err) {
		console.error('Error in orders page load:', err);
		throw error(500, 'Failed to load orders');
	}
};
