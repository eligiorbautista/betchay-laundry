import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// Service pricing configuration
	return {
		servicePricing: [
			{ id: '1', service_name: 'Wash + Dry + Fold', price: 20, description: 'Basic wash and fold service', is_active: true },
		]
	};
};
