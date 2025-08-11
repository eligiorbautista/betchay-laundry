export interface UserProfile {
	email: string;
	full_name: string;
}

export interface SystemPreferences {
	// Notifications
	enable_notifications: boolean;
	enable_email_alerts: boolean;
	enable_pickup_reminders: boolean;
}

export interface ServicePricing {
	id: string;
	service_name: string;
	price: number;
	description?: string;
	is_active: boolean;
}

export interface SettingsFormData {
	profile: Partial<UserProfile>;
	preferences: Partial<SystemPreferences>;
	pricing: ServicePricing[];
} 