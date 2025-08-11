import type { PageServerLoad } from './$types';
import type { Order } from '$lib/types/order';

export const load: PageServerLoad = async ({ params, url }) => {
	// Mock dashboard stats
	const stats = {
		totalOrders: 156,
		pendingOrders: 12,
		completedToday: 8,
		revenue: 45000.00,
		loading: false
	};

	// Mock recent orders data
	const recentOrders: Order[] = [
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
			customer_name: 'Carlos Mendoza',
			customer_phone: '+639345678901',
			customer_email: 'carlos.mendoza@email.com',
			status: 'completed',
			payment_status: 'paid',
			payment_method: 'bank_transfer',
			service_type: 'Dry Cleaning',
			quantity: 3.2,
			unit_price: 78.57,
			total_amount: 251.42,
			pickup_date: '2025-08-03T09:00:00Z',
			delivery_date: '2025-08-05T11:00:00Z',
			created_at: '2025-08-01T16:45:00Z',
			updated_at: '2025-08-03T15:45:00Z',
			remarks: 'Express service requested'
		}
	];

	// Mock recent activities data
	const recentActivities = [
		{
			type: 'order',
			icon: 'FileText',
			color: 'bg-indigo-600',
			description: 'Order ORD-004 was created by Anna Cruz',
			timestamp: new Date().toISOString()
		},
		{
			type: 'payment',
			icon: 'mdi:currency-php', 
			color: 'bg-green-600',
			description: 'Payment received for ORD-002',
			timestamp: new Date().toISOString()
		},
		{
			type: 'customer',
			icon: 'Users',
			color: 'bg-blue-500',
			description: 'New customer registered: Mark Lee',
			timestamp: new Date().toISOString()
		},
		{
			type: 'status',
			icon: 'CheckCircle',
			color: 'bg-emerald-600',
			description: 'Order ORD-001 marked as completed',
			timestamp: new Date().toISOString()
		}
	];

	// Simulate loading delay for development
	await new Promise(resolve => setTimeout(resolve, 100));

	return {
		stats,
		recentOrders,
		recentActivities
	};
};
