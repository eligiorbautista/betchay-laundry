import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies }) => {
	// For frontend-only development, check if user has a session cookie
	const session = cookies.get('session');
	
	// If session exists, consider user as authenticated
	const user = session ? { id: 'demo-user', email: 'demo@example.com' } : null;

	return {
		user
	};
};
