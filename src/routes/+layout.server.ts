import type { LayoutServerLoad } from './$types';
import { getServerSession } from '$lib/config/supabaseServer';

export const load: LayoutServerLoad = async (event) => {
	// Set security headers
	event.setHeaders({
		'X-Content-Type-Options': 'nosniff',
		'X-Frame-Options': 'DENY',
		'X-XSS-Protection': '1; mode=block',
		'Referrer-Policy': 'strict-origin-when-cross-origin',
		'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
		'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.supabase.co; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.iconify.design https://api.unisvg.com; frame-src 'none'; object-src 'none';"
	});

	// get session from server-side cookies
	const session = await getServerSession(event);
	const user = session?.user || null;

	return {
		user,
		session
	};
};
