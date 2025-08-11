import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// Mock data for frontend development
	return {
		userProfile: {
			email: 'betchaylaundryhub@gmail.com',
			full_name: 'Admin User'
		},
		systemPreferences: {
			// Notifications
			enable_notifications: true,
			enable_email_alerts: true,
			enable_pickup_reminders: true
		},
		servicePricing: [
			{ id: '1', service_name: 'Wash & Fold', price: 150, description: 'Basic wash and fold service', is_active: true },
			{ id: '2', service_name: 'Dry Clean', price: 200, description: 'Professional dry cleaning', is_active: true }, 
		]
	};
};
