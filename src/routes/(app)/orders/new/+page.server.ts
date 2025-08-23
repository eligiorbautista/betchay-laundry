import type { PageServerLoad, Actions } from './$types';
import type { Order } from '$lib/types/order';
import { fail } from '@sveltejs/kit';
import { createSupabaseServerClient, getServerSession } from '$lib/config/supabaseServer';
import { createOrder } from '$lib/utils/database';

export const load: PageServerLoad = async (event) => {
	try {
		const supabase = createSupabaseServerClient(event);
		const { data: servicePricing, error: servicePricingError } = await supabase
			.from('service_pricing')
			.select('*')
			.order('service_name');

		if (servicePricingError) {
			console.error('Error fetching service pricing:', servicePricingError);
		}

		return {
			servicePricing: servicePricing || []
		};
	} catch (err) {
		console.error('Error loading service pricing:', err);
		throw new Error('Failed to load service pricing data');
	}
};

export const actions: Actions = {
	create: async (event) => {
		const formData = await event.request.formData();
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
			const supabase = createSupabaseServerClient(event);
			
			console.log('Order Creation Debug:', {
				formUserEmail: userEmail,
				userEmailProvided: !!userEmail
			});
			
			await createOrder(supabase, {
				customer_name,
				customer_phone,
				service_type,
				quantity,
				unit_price,
				payment_method,
				payment_status,
				status,
				pickup_date,
				delivery_date,
				remarks
			}, event.request, userEmail);
			// return success response
			return { success: true };
		} catch (err) {
			console.error('Error in create order action:', err);
			const errorMessage = err instanceof Error ? err.message : 'Failed to create order';
			return fail(500, { error: errorMessage });
		}
	}
};
