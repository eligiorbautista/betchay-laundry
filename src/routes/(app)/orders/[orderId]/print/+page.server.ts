import type { PageServerLoad } from './$types';
import type { Order } from '$lib/types/order';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, parent }) => {
	await parent(); // Ensure authentication
	
	try {
		const orderId = params.orderId;

		// TODO: Fetch order data from database
		// Using same data structure as order detail
		const mockOrders: Order[] = [
			{
				id: 'ORD-001',
				order_number: 'ORD-001',
				customer_name: 'Juan Bautista',
				customer_phone: '+639123456789',
				customer_email: 'juan.bautista@email.com',
				status: 'pending',
				payment_status: 'unpaid',
				payment_method: 'cash',
				service_type: 'Wash & Dry',
				quantity: 5.5,
				unit_price: 50.00,
				total_amount: 275.00,
				pickup_date: '2025-08-05T14:30:00Z',
				delivery_date: '2025-08-07T16:00:00Z',
				created_at: '2025-08-03T08:30:00Z',
				updated_at: '2025-08-03T14:20:00Z',
				remarks: 'Please handle delicate items with care'
			},
			{
				id: 'ORD-002',
				order_number: 'ORD-002',
				customer_name: 'Liza Reyes',
				customer_phone: '+639234567890',
				customer_email: 'liza.reyes@email.com',
				status: 'ready',
				payment_status: 'paid',
				payment_method: 'gcash',
				service_type: 'Wash & Fold',
				quantity: 6.4,
				unit_price: 50.00,
				total_amount: 320.00,
				pickup_date: '2025-08-04T10:00:00Z',
				delivery_date: '2025-08-06T12:00:00Z',
				created_at: '2025-08-02T14:15:00Z',
				updated_at: '2025-08-03T10:30:00Z',
				remarks: undefined
			},
			{
				id: 'ORD-003',
				order_number: 'ORD-003',
				customer_name: 'Maria Santos',
				customer_phone: '+639345678901',
				customer_email: 'maria.santos@email.com',
				status: 'completed',
				payment_status: 'paid',
				payment_method: 'paymaya',
				service_type: 'Dry Clean',
				quantity: 3.2,
				unit_price: 80.00,
				total_amount: 256.00,
				pickup_date: '2025-08-01T09:00:00Z',
				delivery_date: '2025-08-03T17:00:00Z',
				created_at: '2025-07-30T11:20:00Z',
				updated_at: '2025-08-01T15:45:00Z',
				remarks: 'Urgent order - needed by Friday'
			}
		];

		const order = mockOrders.find(o => o.id === orderId);

		if (!order) {
			throw error(404, 'Order not found');
		}

		return {
			order
		};
	} catch (err) {
		console.error('Error loading order for print:', err);
		throw error(500, 'Failed to load order');
	}
};
