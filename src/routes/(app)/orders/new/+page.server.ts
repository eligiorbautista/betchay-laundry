import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// Mock data for frontend development - based on actual services used in orders
	return {
		servicePricing: [
			{ id: '1', service_name: 'Wash & Fold', price: 50, description: 'Basic wash and fold service', is_active: true },
			{ id: '2', service_name: 'Wash & Dry', price: 50, description: 'Standard wash and dry service', is_active: true },
			{ id: '3', service_name: 'Dry Cleaning', price: 78.57, description: 'Professional dry cleaning service', is_active: true },
			{ id: '4', service_name: 'Premium Care', price: 121, description: 'Premium laundry service with special care', is_active: true },
			{ id: '5', service_name: 'Ironing', price: 20, description: 'Press and iron service', is_active: true }
		]
	};
};
