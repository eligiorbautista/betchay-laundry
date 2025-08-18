import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// Simplified approach - let client-side handle auth like other pages
	// Return basic user profile data that will be populated by client-side auth
	return {
		userProfile: {
			email: '',
			full_name: 'Admin User'
		}
	};
};
