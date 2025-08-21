import { writable } from 'svelte/store';
import { supabase } from '$lib/config/supabaseClient';
import type { User, Session } from '@supabase/supabase-js';
import { goto } from '$app/navigation';
import { browser } from '$app/environment';

// Auth state shape
interface AuthState {
	user: User | null;
	session: Session | null;
	loading: boolean;
}

// Default auth values
const initialState: AuthState = {
	user: null,
	session: null,
	loading: true
};

// Create the store
export const authStore = writable<AuthState>(initialState);

// Flag to prevent redirects during password changes
let isChangingPassword = false;

// Main auth operations
export const auth = {
	// Setup session listener and initial state
	async initialize() {
		if (!browser) {
			return;
		}

		try {
			// Get current session from our cookie-based client
			const { data: { session }, error } = await supabase.auth.getSession();
			
			if (error) {
				console.error('Error getting session:', error);
				authStore.set({ user: null, session: null, loading: false });
				return;
			}

			// Set initial session if found
			authStore.set({
				user: session?.user || null,
				session: session,
				loading: false
			});

			// Listen for auth changes
			supabase.auth.onAuthStateChange((event, session) => {
				console.log('Auth state change:', event, !!session);
				
				authStore.set({
					user: session?.user || null,
					session: session,
					loading: false
				});

				// Navigate user based on login status
				if (event === 'SIGNED_IN' && session) {
					// Don't redirect if we're currently changing password
					if (isChangingPassword) {
						return;
					}
					// Only redirect to dashboard if we're on any auth page or root
					// Don't redirect from app pages (like settings during password change)
					// Don't redirect from password reset page (user needs to set new password first)
					const currentPath = window.location.pathname;
					if (currentPath === '/auth/reset-password') {
						// User is on password reset page - don't redirect, let them set new password
						return;
					}
					if (currentPath.startsWith('/auth/') || currentPath === '/') {
						console.log('Redirecting to dashboard after SIGNED_IN');
						goto('/dashboard');
					}
				} else if (event === 'SIGNED_OUT') {
					goto('/auth/login');
				} else if (event === 'INITIAL_SESSION' && session) {
					// If we have a session and we're on any auth page or root, redirect to dashboard
					// Don't redirect from password reset page (user needs to set new password first)
					const currentPath = window.location.pathname;
					if (currentPath === '/auth/reset-password') {
						// User is on password reset page - don't redirect, let them set new password
						return;
					}
					if (currentPath.startsWith('/auth/') || currentPath === '/') {
						console.log('Redirecting to dashboard after INITIAL_SESSION');
						goto('/dashboard');
					}
				}
			});

		} catch (error) {
			console.error('Error initializing auth:', error);
			authStore.set({ user: null, session: null, loading: false });
		}
	},

	// Create new user account
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

	// User login with credentials
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

			// Don't redirect here - let the auth state change handler do it
			// The auth store onAuthStateChange will handle the redirect

			return { success: true, data };
		} catch (error: any) {
			console.error('Login error:', error);
			return { 
				success: false, 
				error: error.message || 'Failed to sign in' 
			};
		}
	},

	// Sign out
	async signOut() {
		try {
			// Clear auth store immediately
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

// Check if user has valid session
export const isAuthenticated = (state: AuthState): boolean => {
	return !state.loading && state.user !== null && state.session !== null;
};

// Extract email from current user
export const getUserEmail = (state: AuthState): string | null => {
	return state.user?.email || null;
};