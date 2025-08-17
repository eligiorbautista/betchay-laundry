import { writable } from 'svelte/store';
import { supabase } from '$lib/config/supabaseClient';
import type { User, Session } from '@supabase/supabase-js';
import { goto } from '$app/navigation';
import { browser } from '$app/environment';

// Type for our auth state
interface AuthState {
	user: User | null;
	session: Session | null;
	loading: boolean;
}

// Initial state
const initialState: AuthState = {
	user: null,
	session: null,
	loading: true
};

// Create the store
export const authStore = writable<AuthState>(initialState);

// Auth helper functions
export const auth = {
	// Initialize auth state - call this when app starts
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

			// Update store with session data
			authStore.set({
				user: session?.user || null,
				session: session,
				loading: false
			});

			// Listen for auth changes
			supabase.auth.onAuthStateChange((event, session) => {
				authStore.set({
					user: session?.user || null,
					session: session,
					loading: false
				});

				// Handle redirects based on auth state
				if (event === 'SIGNED_IN' && session) {
					setTimeout(() => goto('/dashboard'), 100);
				} else if (event === 'SIGNED_OUT') {
					setTimeout(() => goto('/auth/login'), 100);
				} else if (event === 'INITIAL_SESSION' && session) {
					// If we have a session and we're on login page, redirect to dashboard
					if (window.location.pathname === '/auth/login' || window.location.pathname === '/') {
						setTimeout(() => goto('/dashboard'), 100);
					}
				}
			});

		} catch (error) {
			console.error('Error initializing auth:', error);
			authStore.set({ user: null, session: null, loading: false });
		}
	},

	// Sign up with email and password
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

	// Sign in with email and password
	async signIn(email: string, password: string) {
		try {
			const { data, error } = await supabase.auth.signInWithPassword({
				email,
				password,
			});

			if (error) {
				throw error;
			}

			// If we have a session, manually trigger redirect as backup
			if (data.session && data.user) {
				// Wait a bit for the auth state change to potentially fire first
				setTimeout(() => {
					if (window.location.pathname === '/auth/login') {
						goto('/dashboard');
					}
				}, 500);
			}

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
			const { error } = await supabase.auth.updateUser({
				password: newPassword
			});

			if (error) {
				throw error;
			}

			return { success: true };
		} catch (error: any) {
			console.error('Password update error:', error);
			return { 
				success: false, 
				error: error.message || 'Failed to update password' 
			};
		}
	}
};

// Helper function to check if user is authenticated
export const isAuthenticated = (state: AuthState): boolean => {
	return !state.loading && state.user !== null && state.session !== null;
};

// Helper function to get user email
export const getUserEmail = (state: AuthState): string | null => {
	return state.user?.email || null;
};