export type OrderStatus = 'pending' | 'completed' | 'cancelled';
export type PaymentStatus = 'paid' | 'unpaid';
export type PaymentMethod = 'cash' | 'gcash' | 'others';

export interface LoadDetail {
	id: string;
	weight: number; // kg for this load (max 8kg)
}

export interface Order {
	id: string;
	order_number: string;
	customer_name: string;
	customer_phone: string; // required now
	status: OrderStatus;
	service_type: string;
	load_count: number;
	total_weight_kg: number;
	unit_price: number;
	subtotal_amount: number;
	add_ons_amount: number;
	total_amount: number;
	payment_status: PaymentStatus;
	payment_method: PaymentMethod;
	load_details?: LoadDetail[];
	pickup_date?: string;
	delivery_date?: string;
	remarks?: string;
	// New add-ons columns for easier UI display
	add_ons?: Array<{
		id: string;
		name: string;
		quantity: number;
		unit_price: number;
		total_price: number;
	}>;
	add_ons_quantity?: number;
	add_ons_list?: string;
	created_at: string;
	updated_at: string;
}

export interface AddOn {
	id: string;
	name: string;
	description?: string;
	price: number;
	unit: 'piece' | 'kg' | 'set' | 'order';
	is_active: boolean;
	created_at: string;
	updated_at: string;
}

export interface OrderAddOn {
	id: string;
	order_id: string;
	add_on_id: string;
	quantity: number;
	unit_price: number;
	total_price: number;
	created_at: string;
	// Joined data
	add_on?: AddOn;
}

export interface OrderWithAddOns extends Order {
	order_add_ons?: OrderAddOn[];
}
