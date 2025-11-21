import type { PageServerLoad, Actions } from './$types';
import type { Order, OrderWithAddOns } from '$lib/types/order';
import { error, fail } from '@sveltejs/kit';
import { createSupabaseServerClient, getServerSession } from '$lib/config/supabaseServer';
import { logAuditEvent } from '$lib/utils/audit';
import { fetchOrderWithAddOns, fetchAddOns } from '$lib/utils/database';
import { randomUUID } from 'crypto';

export const load: PageServerLoad = async (event) => {
	const { params } = event;
	try {
		const orderId = params.orderId;
		const supabase = createSupabaseServerClient(event);
		
		// Fetch order with add-ons
		const orderWithAddOns = await fetchOrderWithAddOns(supabase, orderId);
		if (!orderWithAddOns) {
			throw error(404, 'Order not found');
		}

		// Fetch service pricing and add-ons
		const { data: servicePricing, error: servicePricingError } = await supabase
			.from('service_pricing')
			.select('*')
			.order('service_name');

		if (servicePricingError) {
			console.error('Error fetching service pricing:', servicePricingError);
		}

		const addOns = await fetchAddOns(supabase);

		return {
			order: orderWithAddOns,
			servicePricing: servicePricing || [],
			addOns
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
		const unit_price = parseFloat(formData.get('unit_price') as string);
		const payment_method = formData.get('payment_method') as string;
		const payment_status = formData.get('payment_status') as string;
		const status = formData.get('status') as string;
		const pickup_date = formData.get('pickup_date') as string;
		const delivery_date = formData.get('delivery_date') as string;
		const remarks = formData.get('remarks') as string;
		const userEmail = formData.get('user_email') as string;
		
		// Parse add-ons from form data
		const addOns: Array<{add_on_id: string; quantity: number; unit_price: number}> = [];
		const addOnIds = formData.getAll('add_on_id') as string[];
		const addOnQuantities = formData.getAll('add_on_quantity') as string[];
		const addOnPrices = formData.getAll('add_on_price') as string[];
		
		for (let i = 0; i < addOnIds.length; i++) {
			if (addOnIds[i] && addOnQuantities[i] && addOnPrices[i]) {
				const quantity = parseFloat(addOnQuantities[i]);
				const price = parseFloat(addOnPrices[i]);
				if (quantity > 0 && price >= 0) {
					addOns.push({
						add_on_id: addOnIds[i],
						quantity,
						unit_price: price
					});
				}
			}
		}

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
		const loadIds = formData.getAll('load_id') as string[];
		const loadWeights = formData.getAll('load_weight') as string[];
		const loadDetails: Array<{ id: string; weight: number }> = [];

		for (let i = 0; i < loadWeights.length; i++) {
			const weight = parseFloat(loadWeights[i]);
			if (Number.isNaN(weight)) {
				continue;
			}
			const id = loadIds[i] && typeof loadIds[i] === 'string' && loadIds[i].trim().length > 0
				? loadIds[i]
				: randomUUID();
			loadDetails.push({ id, weight });
		}

		if (loadDetails.length === 0) {
			return fail(400, { error: 'Please add at least one load entry.' });
		}

		if (!unit_price || unit_price <= 0) {
			return fail(400, { error: 'Unit price must be greater than 0' });
		}

		// Payment validation: Prevent marking as completed if payment is unpaid
		if (status === 'completed' && payment_status === 'unpaid') {
			return fail(400, { error: 'Cannot mark order as completed when payment status is unpaid. Please update payment status first.' });
		}

		try {
			// create supabase client
			const supabase = createSupabaseServerClient(event);

			// calculate load metrics
			// Each load entry counts as 1 load (rounded up), regardless of weight
			const total_weight_kg = parseFloat(loadDetails.reduce((sum, load) => sum + load.weight, 0).toFixed(2));
			const load_count = loadDetails.length;

			if (load_count <= 0) {
				return fail(400, { error: 'Total loads must be greater than 0.' });
			}
			if (load_count > 8.3) {
				return fail(400, { error: 'Total loads cannot exceed 8.3 per order.' });
			}

			// calculate amounts
			const subtotal_amount = parseFloat((load_count * unit_price).toFixed(2));
			let add_ons_amount = 0;
			if (addOns && addOns.length > 0) {
				add_ons_amount = addOns.reduce((sum, addOn) => {
					return sum + (addOn.quantity * addOn.unit_price);
				}, 0);
			}
			const total_amount = subtotal_amount + add_ons_amount;

			// Prepare add-ons data for the new columns
			let add_ons_json = null;
			let add_ons_quantity = null;
			let add_ons_list = null;

			if (addOns && addOns.length > 0) {
				// Get add-on names from the database
				const addOnIds = addOns.map(a => a.add_on_id);
				const { data: addOnsData } = await supabase
					.from('add_ons')
					.select('id, name')
					.in('id', addOnIds);

				// Create JSON array for add_ons column
				add_ons_json = addOns.map(addOn => {
					const addOnInfo = addOnsData?.find(a => a.id === addOn.add_on_id);
					return {
						id: addOn.add_on_id,
						name: addOnInfo?.name || 'Unknown Add-on',
						quantity: addOn.quantity,
						unit_price: addOn.unit_price,
						total_price: addOn.quantity * addOn.unit_price
					};
				});

				// Calculate total quantity
				add_ons_quantity = addOns.reduce((sum, addOn) => sum + addOn.quantity, 0);

				// Create human-readable list
				add_ons_list = addOns.map(addOn => {
					const addOnInfo = addOnsData?.find(a => a.id === addOn.add_on_id);
					return `${addOnInfo?.name || 'Unknown Add-on'} (x${addOn.quantity})`;
				}).join(', ');
			}

			// update order
			const { error: updateError } = await supabase
				.from('orders')
				.update({
					customer_name: customer_name.trim(),
					customer_phone: customer_phone.trim(),
					status,
					service_type,
					load_count,
					total_weight_kg,
					unit_price,
					subtotal_amount,
					add_ons_amount,
					total_amount,
					payment_status,
					payment_method,
					pickup_date: pickup_date || null,
					delivery_date: delivery_date || null,
					remarks: remarks?.trim() || null,
					load_details: loadDetails,
					// New add-ons columns
					add_ons: add_ons_json,
					add_ons_quantity: add_ons_quantity,
					add_ons_list: add_ons_list,
					updated_at: new Date().toISOString()
				})
				.eq('id', orderId);

			if (updateError) {
				console.error('Error updating order:', updateError);
				throw new Error(`Failed to update order: ${updateError.message}`);
			}

			// Update order_add_ons table - delete existing and insert new ones
			// First, delete existing add-ons for this order
			const { error: deleteError } = await supabase
				.from('order_add_ons')
				.delete()
				.eq('order_id', orderId);

			if (deleteError) {
				console.error('Error deleting existing order add-ons:', deleteError);
				// Continue anyway - we'll try to insert new ones
			}

			// Insert new add-ons if any
			if (addOns && addOns.length > 0) {
				const orderAddOnsToInsert = addOns.map(addOn => ({
					order_id: orderId,
					add_on_id: addOn.add_on_id,
					quantity: addOn.quantity,
					unit_price: addOn.unit_price,
					total_price: addOn.quantity * addOn.unit_price
				}));

				const { error: addOnsInsertError } = await supabase
					.from('order_add_ons')
					.insert(orderAddOnsToInsert);

				if (addOnsInsertError) {
					console.error('Error inserting order add-ons:', addOnsInsertError);
					// Don't throw error, just log it - the JSON field still has the data
				}
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
