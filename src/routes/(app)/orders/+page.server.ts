import type { PageServerLoad } from './$types';
import type { Order } from '$lib/types/order';
import { createSupabaseServerClient } from '$lib/config/supabaseServer';
import { fetchOrders } from '$lib/utils/database';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async (event) => { 
	// create supabase client for server-side operations
	const supabase = createSupabaseServerClient(event);

	// Get pagination parameters from URL
	const url = new URL(event.request.url);
	const page = parseInt(url.searchParams.get('page') || '1');
	const pageSize = parseInt(url.searchParams.get('pageSize') || '20');
	const search = url.searchParams.get('search') || '';
	const status = url.searchParams.get('status') || 'all';
	const paymentStatus = url.searchParams.get('paymentStatus') || 'all';
	const startDate = url.searchParams.get('startDate') || '';
	const endDate = url.searchParams.get('endDate') || '';

	try {
		// fetch orders with pagination from database using utility function
		const orders = await fetchOrders(supabase, {
			orderBy: 'created_at',
			page,
			pageSize
		});

		// Get total count for pagination
		let countQuery = supabase
			.from('orders')
			.select('*', { count: 'exact', head: true });

		// Apply same filters to count query
		if (status !== 'all') {
			countQuery = countQuery.eq('status', status);
		}
		if (paymentStatus !== 'all') {
			countQuery = countQuery.eq('payment_status', paymentStatus);
		}
		if (startDate && endDate) {
			const startDateTime = `${startDate} 00:00:00`;
			const endDateTime = `${endDate} 23:59:59`;
			countQuery = countQuery
				.gte('created_at', startDateTime)
				.lte('created_at', endDateTime);
		}

		const { count } = await countQuery;

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
			orders: transformedOrders,
			pagination: {
				page,
				pageSize,
				total: count || 0,
				totalPages: Math.ceil((count || 0) / pageSize)
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
