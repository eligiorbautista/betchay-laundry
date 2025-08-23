import { writable } from 'svelte/store';
import { supabase } from '$lib/config/supabaseClient';
import type { User, Session } from '@supabase/supabase-js';
import { goto } from '$app/navigation';
import { browser } from '$app/environment';
import { logAuditEvent } from '$lib/utils/audit';

// auth state shape
interface AuthState {
	user: User | null;
	session: Session | null;
	loading: boolean;
}

// default auth values
const initialState: AuthState = {
	user: null,
	session: null,
	loading: true
};

// create the store
export const authStore = writable<AuthState>(initialState);

// flag to prevent redirects during password changes
let isChangingPassword = false;

// main auth operations
export const auth = {
	// setup session listener and initial state
	async initialize() {
		if (!browser) {
			return;
		}

		try {
			// get current session from our cookie-based client
			const { data: { session }, error } = await supabase.auth.getSession();
			
			if (error) {
				console.error('Error getting session:', error);
				authStore.set({ user: null, session: null, loading: false });
				return;
			}

			// set initial session if found
			authStore.set({
				user: session?.user || null,
				session: session,
				loading: false
			});

			// listen for auth changes
			supabase.auth.onAuthStateChange((event, session) => {
				console.log('Auth state change:', event, !!session);
				
				authStore.set({
					user: session?.user || null,
					session: session,
					loading: false
				});

				// navigate user based on login status
				if (event === 'SIGNED_IN' && session) {
					// don't redirect if we're currently changing password
					if (isChangingPassword) {
						return;
					}
					// only redirect to orders if we're on any auth page or root
					// don't redirect from app pages (like settings during password change)
					// don't redirect from password reset page (user needs to set new password first)
					const currentPath = window.location.pathname;
					if (currentPath === '/auth/reset-password') {
						// user is on password reset page - don't redirect, let them set new password
						return;
					}
					if (currentPath.startsWith('/auth/') || currentPath === '/') {
						console.log('Redirecting to orders after SIGNED_IN');
						goto('/orders');
					}
				} else if (event === 'SIGNED_OUT') {
					goto('/auth/login');
				} else if (event === 'INITIAL_SESSION' && session) {
					// if we have a session and we're on any auth page or root, redirect to orders
					// don't redirect from password reset page (user needs to set new password first)
					const currentPath = window.location.pathname;
					if (currentPath === '/auth/reset-password') {
						// user is on password reset page - don't redirect, let them set new password
						return;
					}
					if (currentPath.startsWith('/auth/') || currentPath === '/') {
						console.log('Redirecting to orders after INITIAL_SESSION');
						goto('/orders');
					}
				}
			});

		} catch (error) {
			console.error('Error initializing auth:', error);
			authStore.set({ user: null, session: null, loading: false });
		}
	},

	// create new user account
	async signUp(email: string, password: string) {
		try {
			const { data, error } = await supabase.auth.signUp({
				email,
				password,
			});

			if (error) {
				throw error;
			}

			return { success: true, data };
		} catch (error: any) {
			console.error('Signup error:', error);
			return { 
				success: false, 
				error: error.message || 'Failed to create account' 
			};
		}
	},

	// user login with credentials
	async signIn(email: string, password: string) {
		try {
			const { data, error } = await supabase.auth.signInWithPassword({
				email,
				password,
			});

			if (error) {
				throw error;
			}

			console.log('Login successful, session:', !!data.session, 'user:', !!data.user);

			// log audit event for successful login
			if (data.user) {
				await logAuditEvent(
					supabase,
					'login',
					`User ${data.user.email} logged in successfully`,
					'user',
					data.user.id,
					getClientIP(),
					getUserAgent()
				);
			}

			// don't redirect here - let the auth state change handler do it
			// the auth store onauthstatechange will handle the redirect

			return { success: true, data };
		} catch (error: any) {
			console.error('Login error:', error);
			return { 
				success: false, 
				error: error.message || 'Failed to sign in' 
			};
		}
	},

	// sign out
	async signOut() {
		try {
			// clear auth store immediately
			authStore.set({ user: null, session: null, loading: false });
			
			const { error } = await supabase.auth.signOut();
			
			if (error) {
				throw error;
			}

			// Clear all cookies manually as backup
			if (typeof document !== 'undefined') {
				const cookies = document.cookie.split(';');
				for (let cookie of cookies) {
					const [name] = cookie.trim().split('=');
					if (name.includes('sb-') || name.includes('supabase')) {
						document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
					}
				}
			}

			// Force redirect to login
			setTimeout(() => goto('/auth/login'), 100);

			return { success: true };
		} catch (error: any) {
			console.error('Logout error:', error);
			return { 
				success: false, 
				error: error.message || 'Failed to sign out' 
			};
		}
	},

	// Reset password
	async resetPassword(email: string) {
		try {
			const { error } = await supabase.auth.resetPasswordForEmail(email, {
				redirectTo: `${window.location.origin}/auth/reset-password`,
			});

			if (error) {
				throw error;
			}

			return { success: true };
		} catch (error: any) {
			console.error('Password reset error:', error);
			return { 
				success: false, 
				error: error.message || 'Failed to send reset email' 
			};
		}
	},

	// Update password (after reset)
	async updatePassword(newPassword: string) {
		try {
			// Set flag to prevent redirects during password change
			isChangingPassword = true;
			
			const { error } = await supabase.auth.updateUser({
				password: newPassword
			});

			if (error) {
				isChangingPassword = false;
				throw error;
			}

			// Sign out the user after password update - they need to log in with new password
			await supabase.auth.signOut();
			isChangingPassword = false;

			return { success: true };
		} catch (error: any) {
			isChangingPassword = false;
			console.error('Password update error:', error);
			return { 
				success: false, 
				error: error.message || 'Failed to update password' 
			};
		}
	},

	// Change password with redirect prevention
	async changePassword(currentPassword: string, newPassword: string) {
		if (!browser) {
			return { success: false, error: 'Not in browser' };
		}

		try {
			// Set flag to prevent redirects during password change
			isChangingPassword = true;

			// Get current user
			const { data: { user } } = await supabase.auth.getUser();
			if (!user?.email) {
				throw new Error('User not found');
			}

			// Try to verify current password by attempting sign in
			const { error: verifyError } = await supabase.auth.signInWithPassword({
				email: user.email,
				password: currentPassword
			});

			if (verifyError) {
				throw new Error('Current password is incorrect');
			}

			// Update password
			const { error: updateError } = await supabase.auth.updateUser({
				password: newPassword
			});

			if (updateError) throw updateError;

			return { success: true };
		} catch (error: any) {
			console.error('Error changing password:', error);
			return {
				success: false,
				error: error.message || 'Failed to change password'
			};
		} finally {
			// Always clear the flag after password change attempt
			setTimeout(() => {
				isChangingPassword = false;
			}, 1000); // Give auth events time to complete
		}
	}
};

// Helper functions for getting client info
function getClientIP(): string | undefined {
	if (typeof window === 'undefined') return undefined;
	
	// In a real app, you might get this from a server-side context
	// For now, we'll return undefined as this is client-side
	return undefined;
}

function getUserAgent(): string | undefined {
	if (typeof window === 'undefined') return undefined;
	return window.navigator.userAgent;
}

// Helper function to check if user is authenticated
export function isAuthenticated(state: AuthState): boolean {
	return !!state.user && !!state.session;
}

// Extract email from current user
export const getUserEmail = (state: AuthState): string | null => {
	return state.user?.email || null;
};