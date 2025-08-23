import type { PageServerLoad, Actions } from './$types';
import type { Order } from '$lib/types/order';
import { error, fail } from '@sveltejs/kit';
import { createSupabaseServerClient, getServerSession } from '$lib/config/supabaseServer';
import { updateOrderStatus, updatePaymentStatus } from '$lib/utils/database';

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
		console.error('Error loading order:', err);
		if (err && typeof err === 'object' && 'status' in err) {
			// Re-throw SvelteKit errors
			throw err;
		}
		throw error(500, 'Failed to load order data');
	}
};

export const actions: Actions = {
	updateStatus: async (event) => {
		const formData = await event.request.formData();
		const orderId = event.params.orderId;
		const newStatus = formData.get('status') as string;
		const userEmail = formData.get('user_email') as string;

		if (!newStatus) {
			return fail(400, { error: 'Status is required' });
		}

		try {
			const supabase = createSupabaseServerClient(event);
			
			await updateOrderStatus(supabase, orderId, newStatus, event.request, userEmail);
			return { success: true };
		} catch (err) {
			console.error('Error updating order status:', err);
			const errorMessage = err instanceof Error ? err.message : 'Failed to update order status';
			return fail(500, { error: errorMessage });
		}
	},

	updatePayment: async (event) => {
		const formData = await event.request.formData();
		const orderId = event.params.orderId;
		const newPaymentStatus = formData.get('payment_status') as string;
		const userEmail = formData.get('user_email') as string;

		if (!newPaymentStatus) {
			return fail(400, { error: 'Payment status is required' });
		}

		try {
			const supabase = createSupabaseServerClient(event);
			
			await updatePaymentStatus(supabase, orderId, newPaymentStatus, event.request, userEmail);
			return { success: true };
		} catch (err) {
			console.error('Error updating payment status:', err);
			const errorMessage = err instanceof Error ? err.message : 'Failed to update payment status';
			return fail(500, { error: errorMessage });
		}
	}
};
