export interface Order {
	id: string;
	order_number: string;
	customer_name: string;
	customer_phone: string; // required now
	status: 'pending' | 'processing' | 'ready' | 'completed' | 'cancelled';
	service_type: string;
	quantity: number;
	unit_price: number;
	total_amount: number;
	payment_status: 'paid' | 'unpaid';
	payment_method: 'cash' | 'gcash' | 'paymaya' | 'bank_transfer' | 'credit_card';
	pickup_date?: string;
	delivery_date?: string;
	remarks?: string;
	created_at: string;
	updated_at: string;
}
