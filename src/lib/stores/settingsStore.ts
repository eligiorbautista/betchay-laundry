import { writable } from 'svelte/store';
import { supabase } from '$lib/config/supabaseClient';
import { browser } from '$app/environment';
import type { UserProfile } from '$lib/types/settings';

// Settings store structure
interface SettingsState {
	userProfile: UserProfile | null;
	loading: boolean;
}

// Default values
const initialState: SettingsState = {
	userProfile: null,
	loading: true
};

// Create the store
export const settingsStore = writable<SettingsState>(initialState);

// User settings operations
export const settings = {
	// Change password
	async changePassword(currentPassword: string, newPassword: string) {
		if (!browser) {
			return { success: false, error: 'Not in browser' };
		}

		try {
			// Supabase doesn't have a direct way to verify current password
			// We'll need to try to sign in with current credentials first
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
		}
	}
};