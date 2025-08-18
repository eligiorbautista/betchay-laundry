import type { PageServerLoad } from './$types';
import type { Order } from '$lib/types/order';

export const load: PageServerLoad = async ({ params, url }) => { 
	const orders: Order[] = [
		// PENDING Orders
		{
			id: 'ORD-001',
			order_number: 'ORD-001',
			customer_name: 'Maria Santos',
			customer_phone: '+639123456789',
			customer_email: 'maria.santos@email.com',
			status: 'pending',
			payment_status: 'unpaid',
			payment_method: 'cash',
			service_type: 'Wash & Fold',
			quantity: 4.5,
			unit_price: 50.00,
			total_amount: 225.00,
			pickup_date: '2025-01-15T09:00:00Z',
			delivery_date: '2025-01-17T15:00:00Z',
			created_at: '2025-01-14T10:30:00Z',
			updated_at: '2025-01-14T10:30:00Z',
			remarks: 'Please separate whites and colors'
		},
		{
			id: 'ORD-002',
			order_number: 'ORD-002',
			customer_name: 'Juan Rodriguez',
			customer_phone: '+639234567890',
			customer_email: 'juan.rodriguez@email.com',
			status: 'pending',
			payment_status: 'unpaid',
			payment_method: 'gcash',
			service_type: 'Dry Cleaning',
			quantity: 2.0,
			unit_price: 75.00,
			total_amount: 150.00,
			pickup_date: '2025-01-16T14:00:00Z',
			delivery_date: '2025-01-18T16:00:00Z',
			created_at: '2025-01-14T11:15:00Z',
			updated_at: '2025-01-14T11:15:00Z',
			remarks: 'Silk dress - handle with extra care'
		},

		// PROCESSING Orders
		{
			id: 'ORD-003',
			order_number: 'ORD-003',
			customer_name: 'Ana Dela Cruz',
			customer_phone: '+639345678901',
			customer_email: 'ana.delacruz@email.com',
			status: 'processing',
			payment_status: 'paid',
			payment_method: 'paymaya',
			service_type: 'Express Wash',
			quantity: 3.2,
			unit_price: 65.00,
			total_amount: 208.00,
			pickup_date: '2025-01-15T08:00:00Z',
			delivery_date: '2025-01-15T18:00:00Z',
			created_at: '2025-01-14T07:45:00Z',
			updated_at: '2025-01-15T09:30:00Z',
			remarks: 'Rush order - needed same day'
		},
		{
			id: 'ORD-004',
			order_number: 'ORD-004',
			customer_name: 'Carlos Mendoza',
			customer_phone: '+639456789012',
			customer_email: 'carlos.mendoza@email.com',
			status: 'processing',
			payment_status: 'unpaid',
			payment_method: 'bank_transfer',
			service_type: 'Wash & Dry',
			quantity: 6.1,
			unit_price: 50.00,
			total_amount: 305.00,
			pickup_date: '2025-01-14T16:00:00Z',
			delivery_date: '2025-01-16T12:00:00Z',
			created_at: '2025-01-13T15:20:00Z',
			updated_at: '2025-01-15T08:45:00Z',
			remarks: 'Customer will pay upon delivery'
		},

		// READY Orders
		{
			id: 'ORD-005',
			order_number: 'ORD-005',
			customer_name: 'Liza Reyes',
			customer_phone: '+639567890123',
			customer_email: 'liza.reyes@email.com',
			status: 'ready',
			payment_status: 'paid',
			payment_method: 'cash',
			service_type: 'Premium Cleaning',
			quantity: 5.0,
			unit_price: 80.00,
			total_amount: 400.00,
			pickup_date: '2025-01-13T11:00:00Z',
			delivery_date: '2025-01-15T14:00:00Z',
			created_at: '2025-01-12T09:15:00Z',
			updated_at: '2025-01-15T13:20:00Z',
			remarks: 'All items cleaned and pressed'
		},
		{
			id: 'ORD-006',
			order_number: 'ORD-006',
			customer_name: 'Roberto Garcia',
			customer_phone: '+639678901234',
			customer_email: 'roberto.garcia@email.com',
			status: 'ready',
			payment_status: 'unpaid',
			payment_method: 'gcash',
			service_type: 'Wash & Fold',
			quantity: 7.8,
			unit_price: 50.00,
			total_amount: 390.00,
			pickup_date: '2025-01-13T15:30:00Z',
			delivery_date: '2025-01-15T17:00:00Z',
			created_at: '2025-01-12T14:00:00Z',
			updated_at: '2025-01-15T16:45:00Z',
			remarks: 'Will pay via GCash upon pickup'
		},

		// COMPLETED Orders
		{
			id: 'ORD-007',
			order_number: 'ORD-007',
			customer_name: 'Sofia Villanueva',
			customer_phone: '+639789012345',
			customer_email: 'sofia.villanueva@email.com',
			status: 'completed',
			payment_status: 'paid',
			payment_method: 'paymaya',
			service_type: 'Dry Cleaning',
			quantity: 1.5,
			unit_price: 90.00,
			total_amount: 135.00,
			pickup_date: '2025-01-12T10:00:00Z',
			delivery_date: '2025-01-14T11:00:00Z',
			created_at: '2025-01-11T16:30:00Z',
			updated_at: '2025-01-14T11:30:00Z',
			remarks: 'Business suit - excellent results'
		},
		{
			id: 'ORD-008',
			order_number: 'ORD-008',
			customer_name: 'Miguel Torres',
			customer_phone: '+639890123456',
			customer_email: 'miguel.torres@email.com',
			status: 'completed',
			payment_status: 'paid',
			payment_method: 'bank_transfer',
			service_type: 'Wash & Dry',
			quantity: 4.3,
			unit_price: 50.00,
			total_amount: 215.00,
			pickup_date: '2025-01-11T13:00:00Z',
			delivery_date: '2025-01-13T15:00:00Z',
			created_at: '2025-01-10T11:45:00Z',
			updated_at: '2025-01-13T15:15:00Z',
			remarks: 'Regular customer - family laundry'
		},

		// CANCELLED Orders
		{
			id: 'ORD-009',
			order_number: 'ORD-009',
			customer_name: 'Elena Ramos',
			customer_phone: '+639901234567',
			customer_email: 'elena.ramos@email.com',
			status: 'cancelled',
			payment_status: 'unpaid',
			payment_method: 'cash',
			service_type: 'Express Wash',
			quantity: 2.5,
			unit_price: 65.00,
			total_amount: 162.50,
			pickup_date: '2025-01-14T12:00:00Z',
			delivery_date: '2025-01-14T20:00:00Z',
			created_at: '2025-01-14T08:00:00Z',
			updated_at: '2025-01-14T09:30:00Z',
			remarks: 'Customer cancelled - change of plans'
		},

		// Sample orders for demo
		{
			id: 'ORD-010',
			order_number: 'ORD-010',
			customer_name: 'Patricia Cruz',
			customer_phone: '+639012345678',
			customer_email: 'patricia.cruz@email.com',
			status: 'ready',
			payment_status: 'unpaid',
			payment_method: 'gcash',
			service_type: 'Delicate Care',
			quantity: 1.2,
			unit_price: 100.00,
			total_amount: 120.00,
			pickup_date: '2025-01-13T09:00:00Z',
			delivery_date: '2025-01-15T10:00:00Z',
			created_at: '2025-01-12T16:00:00Z',
			updated_at: '2025-01-15T09:45:00Z',
			remarks: 'Wedding dress cleaning - special attention'
		},
		{
			id: 'ORD-011',
			order_number: 'ORD-011',
			customer_name: 'David Martinez',
			customer_phone: '+639123450987',
			customer_email: 'david.martinez@email.com',
			status: 'processing',
			payment_status: 'unpaid',
			payment_method: 'cash',
			service_type: 'Wash & Fold',
			quantity: 8.5,
			unit_price: 50.00,
			total_amount: 425.00,
			pickup_date: '2025-01-14T07:00:00Z',
			delivery_date: '2025-01-16T19:00:00Z',
			created_at: '2025-01-13T18:30:00Z',
			updated_at: '2025-01-15T10:15:00Z',
			remarks: 'Large family order - will pay cash on delivery'
		},
		{
			id: 'ORD-012',
			order_number: 'ORD-012',
			customer_name: 'Carmen Flores',
			customer_phone: '+639234561098',
			customer_email: 'carmen.flores@email.com',
			status: 'completed',
			payment_status: 'paid',
			payment_method: 'cash',
			service_type: 'Wash & Dry',
			quantity: 3.7,
			unit_price: 50.00,
			total_amount: 185.00,
			pickup_date: '2025-01-10T14:00:00Z',
			delivery_date: '2025-01-12T16:00:00Z',
			created_at: '2025-01-09T13:20:00Z',
			updated_at: '2025-01-12T16:30:00Z',
			remarks: 'Satisfied customer - recommended by friend'
		}
	];

	// Brief loading simulation
	await new Promise(resolve => setTimeout(resolve, 100));

	return {
		orders
	};
};
