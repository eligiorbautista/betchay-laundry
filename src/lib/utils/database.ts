import type { SupabaseClient } from '@supabase/supabase-js';
import type { Order } from '$lib/types/order';
import { logAuditEvent, getClientIP, getUserAgent } from './audit';

// database utility functions for common operations

/**
 * fetch all orders from database with optional filters
 */
export async function fetchOrders(supabase: SupabaseClient, options?: {
	status?: string;
	payment_status?: string;
	limit?: number;
	orderBy?: string;
}) {
	const query = supabase
		.from('orders')
		.select('*');

	// apply filters if provided
	if (options?.status && options.status !== 'all') {
		query.eq('status', options.status);
	}

	if (options?.payment_status && options.payment_status !== 'all') {
		query.eq('payment_status', options.payment_status);
	}

	// apply ordering
	const orderBy = options?.orderBy || 'created_at';
	query.order(orderBy, { ascending: false });

	// apply limit if provided
	if (options?.limit) {
		query.limit(options.limit);
	}

	const { data, error } = await query;

	if (error) {
		console.error('Error fetching orders:', error);
		throw new Error('Failed to fetch orders');
	}

	return data || [];
}

/**
 * create a new order in the database
 */
export async function createOrder(supabase: SupabaseClient, orderData: {
	customer_name: string;
	customer_phone: string; // required now
	service_type: string;
	quantity: number;
	unit_price: number;
	payment_method: string;
	payment_status: string;
	status: string;
	pickup_date?: string;
	delivery_date?: string;
	remarks?: string;
}, request?: Request, userEmail?: string) {
	// get current user for created_by field
	const { data: { user } } = await supabase.auth.getUser();

	// calculate total amount
	const total_amount = orderData.quantity * orderData.unit_price;

	// generate order number
	const { data: orderNumber, error: orderNumberError } = await supabase
		.rpc('generate_order_number');

	if (orderNumberError) {
		console.error('Error generating order number:', orderNumberError);
		throw new Error(`Failed to generate order number: ${orderNumberError.message}`);
	}

	// insert new order
	const { data: newOrder, error: insertError } = await supabase
		.from('orders')
		.insert({
			order_number: orderNumber,
			customer_name: orderData.customer_name.trim(),
			customer_phone: orderData.customer_phone.trim(),
			status: orderData.status,
			service_type: orderData.service_type,
			quantity: orderData.quantity,
			unit_price: orderData.unit_price,
			total_amount,
			payment_status: orderData.payment_status,
			payment_method: orderData.payment_method,
			pickup_date: orderData.pickup_date || null,
			delivery_date: orderData.delivery_date || null,
			remarks: orderData.remarks?.trim() || null,
			created_by: user?.id || null
		})
		.select()
		.single();

	if (insertError) {
		console.error('Error creating order:', insertError);
		throw new Error(`Failed to create order: ${insertError.message}`);
	}

	// log audit event for order creation
	await logAuditEvent(
		supabase,
		'order_created',
		`Order ${orderNumber} created for customer ${orderData.customer_name}`,
		'order',
		newOrder.id,
		request ? getClientIP(request) : undefined,
		request ? getUserAgent(request) : undefined,
		userEmail
	);

	return newOrder;
}

/**
 * update order status
 */
export async function updateOrderStatus(supabase: SupabaseClient, orderId: string, newStatus: string, request?: Request, userEmail?: string) {
	// get order details for audit log
	const { data: order } = await supabase
		.from('orders')
		.select('order_number, customer_name')
		.eq('id', orderId)
		.single();

	// update order status
	const { error: updateError } = await supabase
		.from('orders')
		.update({ 
			status: newStatus,
			updated_at: new Date().toISOString()
		})
		.eq('id', orderId);

	if (updateError) {
		console.error('Error updating order status:', updateError);
		throw new Error(`Failed to update order status: ${updateError.message}`);
	}

	// log audit event for status change
	await logAuditEvent(
		supabase,
		'order_status_changed',
		`Order ${order?.order_number || orderId} status changed to ${newStatus}`,
		'order',
		orderId,
		request ? getClientIP(request) : undefined,
		request ? getUserAgent(request) : undefined,
		userEmail
	);

	return { success: true };
}

/**
 * update payment status
 */
export async function updatePaymentStatus(supabase: SupabaseClient, orderId: string, newPaymentStatus: string, request?: Request, userEmail?: string) {
	// get order details for audit log
	const { data: order } = await supabase
		.from('orders')
		.select('order_number, customer_name')
		.eq('id', orderId)
		.single();

	// update payment status
	const { error: updateError } = await supabase
		.from('orders')
		.update({ 
			payment_status: newPaymentStatus,
			updated_at: new Date().toISOString()
		})
		.eq('id', orderId);

	if (updateError) {
		console.error('Error updating payment status:', updateError);
		throw new Error(`Failed to update payment status: ${updateError.message}`);
	}

	// log audit event for payment status change
	await logAuditEvent(
		supabase,
		'payment_status_changed',
		`Order ${order?.order_number || orderId} payment status changed to ${newPaymentStatus}`,
		'order',
		orderId,
		request ? getClientIP(request) : undefined,
		request ? getUserAgent(request) : undefined,
		userEmail
	);

	return { success: true };
}

/**
 * fetch order by id with all related data
 */
export async function fetchOrderById(supabase: SupabaseClient, orderId: string) {
	const { data: order, error } = await supabase
		.from('orders')
		.select('*')
		.eq('id', orderId)
		.single();

	if (error) {
		console.error('Error fetching order:', error);
		throw new Error('Failed to fetch order');
	}

	return order;
}


