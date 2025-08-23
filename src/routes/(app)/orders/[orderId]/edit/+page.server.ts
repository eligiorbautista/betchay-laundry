import type { PageServerLoad, Actions } from './$types';
import type { Order } from '$lib/types/order';
import { error, fail } from '@sveltejs/kit';
import { createSupabaseServerClient, getServerSession } from '$lib/config/supabaseServer';
import { logAuditEvent } from '$lib/utils/audit';

export const load: PageServerLoad = async (event) => {
	const { params } = event;
	try {
		const orderId = params.orderId;
		const supabase = createSupabaseServerClient(event);
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
		const { data: servicePricing, error: servicePricingError } = await supabase
			.from('service_pricing')
			.select('*')
			.order('service_name');

		if (servicePricingError) {
			console.error('Error fetching service pricing:', servicePricingError);
		}
		return {
			order: transformedOrder,
			servicePricing: servicePricing || []
		};
	} catch (err) {
		console.error('Error loading order for edit:', err);
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		throw error(500, 'Failed to load order data');
	}
};

export const actions: Actions = {
	update: async (event) => {
		const formData = await event.request.formData();
		const orderId = event.params.orderId;

		// extract form fields
		const customer_name = formData.get('customer_name') as string;
		const customer_phone = formData.get('customer_phone') as string;
		const service_type = formData.get('service_type') as string;
		const quantity = parseFloat(formData.get('quantity') as string);
		const unit_price = parseFloat(formData.get('unit_price') as string);
		const payment_method = formData.get('payment_method') as string;
		const payment_status = formData.get('payment_status') as string;
		const status = formData.get('status') as string;
		const pickup_date = formData.get('pickup_date') as string;
		const delivery_date = formData.get('delivery_date') as string;
		const remarks = formData.get('remarks') as string;
		const userEmail = formData.get('user_email') as string;

		// basic validation
		if (!customer_name?.trim()) {
			return fail(400, { error: 'Customer name is required' });
		}
		if (!customer_phone?.trim()) {
			return fail(400, { error: 'Customer phone is required' });
		}
		if (!service_type) {
			return fail(400, { error: 'Service type is required' });
		}
		if (!quantity || quantity <= 0) {
			return fail(400, { error: 'Quantity must be greater than 0' });
		}
		if (!unit_price || unit_price <= 0) {
			return fail(400, { error: 'Unit price must be greater than 0' });
		}

		try {
			// create supabase client
			const supabase = createSupabaseServerClient(event);

			// calculate total amount
			const total_amount = quantity * unit_price;

			// update order
			const { error: updateError } = await supabase
				.from('orders')
				.update({
					customer_name: customer_name.trim(),
					customer_phone: customer_phone.trim(),
					status,
					service_type,
					quantity,
					unit_price,
					total_amount,
					payment_status,
					payment_method,
					pickup_date: pickup_date || null,
					delivery_date: delivery_date || null,
					remarks: remarks?.trim() || null,
					updated_at: new Date().toISOString()
				})
				.eq('id', orderId);

			if (updateError) {
				console.error('Error updating order:', updateError);
				throw new Error(`Failed to update order: ${updateError.message}`);
			}

			// User email is now passed from the form data

			// log audit event for order update
			await logAuditEvent(
				supabase,
				'order_updated',
				`Order ${orderId} updated - Customer: ${customer_name}, Service: ${service_type}`,
				'order',
				orderId,
				getClientIP(event.request),
				getUserAgent(event.request),
				userEmail
			);

			// return success response
			return { success: true };
		} catch (err) {
			console.error('Error in update order action:', err);
			const errorMessage = err instanceof Error ? err.message : 'Failed to update order';
			return fail(500, { error: errorMessage });
		}
	}
};

// helper functions for getting client info
function getClientIP(request: Request): string | undefined {
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

function getUserAgent(request: Request): string | undefined {
	return request.headers.get('user-agent') || undefined;
}
