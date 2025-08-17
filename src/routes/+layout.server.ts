import type { LayoutServerLoad } from './$types';
import { getServerSession } from '$lib/config/supabaseServer';

export const load: LayoutServerLoad = async (event) => {
	// Get session from server-side cookies
	const session = await getServerSession(event);
	const user = session?.user || null;

	return {
		user,
		session
	};
};
