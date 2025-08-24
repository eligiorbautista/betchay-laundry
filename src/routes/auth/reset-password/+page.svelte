<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { toast } from 'svelte-sonner';
	import { Lock, Eye, EyeOff, ArrowLeft } from 'lucide-svelte';
	import { supabase } from '$lib/config/supabaseClient';
	import { auth } from '$lib/stores/authStore';
	import { onMount, onDestroy } from 'svelte';

	export let form: { success?: boolean; error?: string } = {};

	let loading = false;
	let showPassword = false;
	let showConfirmPassword = false;
	let password = '';
	let confirmPassword = '';
	let validSession = false;
	let hasError = false;
	let errorMessage = '';
	let authStateListener: any = null;
	
	// Handle password reset token processing on mount
	onMount(async () => {
		console.log('Password reset page loaded:', window.location.href);
		
		const hash = window.location.hash;
		console.log('URL hash:', hash);
		
		// Set up auth state change listener to detect session changes
		authStateListener = supabase.auth.onAuthStateChange((event, session) => {
			console.log('Auth state change:', event, session?.user?.email);
			
			if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
				if (session?.user) {
					validSession = true;
					console.log('Session established via auth state change for:', session.user.email);
				}
			} else if (event === 'SIGNED_OUT') {
				validSession = false;
			}
		});
		
		// Handle tokens in URL hash manually (for localhost issues)
		if (hash && (hash.includes('access_token=') || hash.includes('refresh_token='))) {
			console.log('Found auth tokens in URL, processing manually...');
			console.log('Full hash content:', hash);
			
			try {
				// Parse the hash parameters
				const hashParams = new URLSearchParams(hash.replace('#', ''));
				const accessToken = hashParams.get('access_token');
				const refreshToken = hashParams.get('refresh_token');
				const tokenType = hashParams.get('type');
				const expiresIn = hashParams.get('expires_in');
				
				console.log('Parsed tokens:', { 
					hasAccessToken: !!accessToken, 
					hasRefreshToken: !!refreshToken, 
					type: tokenType,
					expiresIn: expiresIn,
					accessTokenLength: accessToken?.length,
					refreshTokenLength: refreshToken?.length
				});
				
				// Log all hash parameters for debugging
				console.log('All hash parameters:');
				for (const [key, value] of hashParams.entries()) {
					console.log(`  ${key}: ${key.includes('token') ? `${value.substring(0, 10)}...` : value}`);
				}
				
				// Verify this is a password reset flow
				if (accessToken && refreshToken && tokenType === 'recovery') {
					console.log('Setting session manually with recovery tokens...');
					
					// Set the session manually
					const { data, error } = await supabase.auth.setSession({
						access_token: accessToken,
						refresh_token: refreshToken
					});
					
					console.log('setSession result:', { 
						hasSession: !!data.session, 
						user: data.session?.user?.email,
						error: error?.message 
					});
					
					if (error) {
						console.error('Error setting session:', error);
						hasError = true;
						errorMessage = `Invalid or expired reset link: ${error.message}`;
						toast.error(errorMessage);
					} else if (data.session?.user) {
						validSession = true;
						console.log('✅ Session set successfully for:', data.session.user.email);
						
						// Clear the hash from URL to clean up
						window.history.replaceState(null, '', window.location.pathname);
					} else {
						console.error('❌ Session was not established despite no error');
						hasError = true;
						errorMessage = 'Failed to establish session. Please request a new password reset.';
						toast.error(errorMessage);
					}
				} else {
					console.error('❌ Invalid token type or missing tokens:', { 
						tokenType, 
						hasAccessToken: !!accessToken, 
						hasRefreshToken: !!refreshToken,
						expectedType: 'recovery'
					});
					hasError = true;
					errorMessage = 'Invalid reset link format. Please request a new password reset.';
					toast.error(errorMessage);
				}
			} catch (error) {
				console.error('❌ Error processing tokens:', error);
				hasError = true;
				errorMessage = 'Error processing reset link. Please request a new password reset.';
				toast.error(errorMessage);
			}
		} else if (hash && hash.includes('error=')) {
			// Handle explicit errors in URL
			console.log('Error found in URL hash');
			const errorParams = new URLSearchParams(hash.replace('#', ''));
			const errorCode = errorParams.get('error_code');
			const errorDescription = errorParams.get('error_description');
			
			if (errorCode === 'otp_expired') {
				errorMessage = 'This password reset link has expired. Please request a new one.';
			} else if (errorDescription) {
				errorMessage = `Reset link error: ${errorDescription}`;
			} else {
				errorMessage = 'Invalid password reset link. Please request a new one.';
			}
			hasError = true;
			toast.error(errorMessage);
		} else {
			// No tokens and no explicit error - check for existing session
			console.log('No tokens in URL, checking for existing session...');
			
			const { data: { session }, error } = await supabase.auth.getSession();
			console.log('Existing session check:', { 
				hasSession: !!session, 
				user: session?.user?.email,
				error: error?.message 
			});
			
			if (session?.user) {
				validSession = true;
				console.log('Found existing valid session for:', session.user.email);
			} else {
				// No session and no tokens - invalid access
				hasError = true;
				errorMessage = 'Invalid or missing password reset link. Please request a new password reset.';
				toast.error(errorMessage);
			}
		}
	});
	
	// Clean up auth listener on destroy
	onDestroy(() => {
		if (authStateListener) {
			authStateListener.data.subscription.unsubscribe();
		}
	});

	// Handle form submission
	function handleSubmit() {
		loading = true;
		return async ({ update, result }: { update: () => Promise<void>; result: { type: string; data?: { error?: string; success?: boolean; password?: string } } }) => {
			try {
				if (result.type === 'success' && result.data?.success) {
					// Server-side validation passed, now update password with client-side session
					console.log('Server validation passed, updating password with client session...');
					
					// Check if we have a valid session
					const { data: { session }, error: sessionError } = await supabase.auth.getSession();
					
					if (!session || sessionError) {
						console.error('No valid session for password update:', sessionError);
						toast.error('Session expired. Please request a new password reset.');
						loading = false;
						return;
					}
					
					console.log('Updating password for user:', session.user.email);
					
					// Update password using the client-side session
					const { error: updateError } = await supabase.auth.updateUser({
						password: result.data.password
					});
					
					if (updateError) {
						console.error('Password update error:', updateError);
						toast.error(updateError.message || 'Failed to update password. Please try again.');
						loading = false;
						return;
					}
					
					console.log('Password updated successfully');
					toast.success('Password updated successfully! Signing out...');
					
					// Clear form
					password = '';
					confirmPassword = '';
					
					// Sign out properly using the auth store
					console.log('Signing out user after password change...');
					
					try {
						await auth.signOut();
						console.log('Successfully signed out via auth store');
						toast.success('Password updated successfully! Redirecting to login...');
					} catch (signOutError) {
						console.error('Error signing out via auth store:', signOutError);
						toast.error('Password updated but failed to sign out completely. Please login again.');
					}
					
					// Clear any remaining session state
					validSession = false;
					
					// Clean up auth listener to prevent memory leaks
					if (authStateListener) {
						authStateListener.data.subscription.unsubscribe();
						authStateListener = null;
					}
					
					// Redirect to login after a short delay
					setTimeout(() => {
						// The auth store signOut should handle the redirect, but ensure it happens
						window.location.href = '/auth/login';
					}, 1500);
				} else if (result.type === 'failure') {
					toast.error(result.data?.error || 'Failed to validate password. Please try again.');
				}
			} catch (error: any) {
				console.error('Password update exception:', error);
				toast.error('An error occurred while updating password. Please try again.');
			} finally {
				loading = false;
				await update();
			}
		};
	}
</script>

<svelte:head>
	<title>Reset Password - Laundry Management System</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
	<div class="max-w-4xl w-full">
		<div class="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
			<div class="flex flex-col lg:flex-row">
				<!-- Logo Section -->
				<div class="lg:w-1/2 bg-gradient-to-br from-gray-50 to-gray-100 p-8 lg:p-12 flex flex-col items-center justify-center">
					<div class="text-center">
						<img src="/logo/logo_banner.png" alt="App Logo" class="h-20 lg:h-24 xl:h-28 mx-auto mb-6 px-2" />
						<h1 class="text-2xl lg:text-3xl font-bold text-brand-900 mb-3">
							Laundry Management System
						</h1>
						<p class="text-gray-600 text-sm lg:text-base max-w-sm">
							Manage your laundry business efficiently
						</p>
					</div>
				</div>

				<!-- Form Section -->
				<div class="lg:w-1/2 p-8 lg:p-12">
					<div class="max-w-sm mx-auto">
						<div class="mb-8">
							<div class="mx-auto h-16 w-16 bg-brand-800 rounded-xl flex items-center justify-center mb-6">
								<Lock class="w-8 h-8 text-white" />
							</div>
							<h2 class="text-2xl lg:text-3xl font-bold text-brand-900 mb-2">
								Create new password
							</h2>
							<p class="text-gray-600">
								Enter your new password below.
							</p>
						</div>

		{#if hasError}
			<!-- Invalid/Expired Token -->
				<div class="text-center">
					<div class="mx-auto h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
						<Lock class="w-6 h-6 text-red-600" />
					</div>
					<h3 class="text-lg font-semibold text-brand-900 mb-2">Reset Link Issue</h3>
					<p class="text-gray-600 mb-6">
						{errorMessage}
					</p>
					<a 
						href="/auth/forgot-password" 
						class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-brand-800 rounded-lg hover:bg-brand-900 transition-colors"
					>
						<ArrowLeft class="w-4 h-4 mr-2" />
						Request New Reset Link
					</a>
				</div>
		{:else if form?.success}
			<!-- Success State -->
			<div class="text-center">
					<div class="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
						<Lock class="w-6 h-6 text-green-600" />
					</div>
					<h3 class="text-lg font-semibold text-brand-900 mb-2">Password Updated!</h3>
					<p class="text-gray-600 mb-6">
						Your password has been successfully updated. You can now login with your new password.
					</p>
					<a 
						href="/auth/login" 
						class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-brand-800 rounded-lg hover:bg-brand-900 transition-colors"
					>
						Go to Login
					</a>
			</div>
		{:else if validSession}
			<!-- Reset Form -->
			<form 
				method="POST"
				class="space-y-6"
				use:enhance={handleSubmit}
			>
					
					<!-- New Password Field -->
					<div>
						<label for="password" class="block text-sm font-medium text-gray-700 mb-2">
							New Password
						</label>
						<div class="relative">
							<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
								<Lock class="h-5 w-5 text-gray-400" />
							</div>
							<input
								id="password"
								name="password"
								type={showPassword ? 'text' : 'password'}
								required
								bind:value={password}
								class="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors"
								placeholder="Enter new password"
							/>
							<button
								type="button"
								class="absolute inset-y-0 right-0 pr-3 flex items-center"
								on:click={() => showPassword = !showPassword}
							>
								{#if showPassword}
									<EyeOff class="h-5 w-5 text-gray-400 hover:text-gray-600" />
								{:else}
									<Eye class="h-5 w-5 text-gray-400 hover:text-gray-600" />
								{/if}
							</button>
						</div>
					</div>

					<!-- Confirm Password Field -->
					<div>
						<label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">
							Confirm New Password
						</label>
						<div class="relative">
							<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
								<Lock class="h-5 w-5 text-gray-400" />
							</div>
							<input
								id="confirmPassword"
								name="confirmPassword"
								type={showConfirmPassword ? 'text' : 'password'}
								required
								bind:value={confirmPassword}
								class="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors"
								placeholder="Confirm new password"
							/>
							<button
								type="button"
								class="absolute inset-y-0 right-0 pr-3 flex items-center"
								on:click={() => showConfirmPassword = !showConfirmPassword}
							>
								{#if showConfirmPassword}
									<EyeOff class="h-5 w-5 text-gray-400 hover:text-gray-600" />
								{:else}
									<Eye class="h-5 w-5 text-gray-400 hover:text-gray-600" />
								{/if}
							</button>
						</div>
					</div>

					<!-- Submit Button -->
					<button
						type="submit"
						disabled={loading}
						class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-brand-800 hover:bg-brand-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
					>
						{#if loading}
							<div class="flex items-center">
								<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
								Updating...
							</div>
						{:else}
							Update Password
						{/if}
					</button>
				</form>

				<!-- Back to Login -->
				<div class="mt-8 text-center">
					<a 
						href="/auth/login" 
						class="inline-flex items-center text-sm text-gray-700 hover:text-brand-900 font-medium"
					>
						<ArrowLeft class="w-4 h-4 mr-1" />
						Back to login
					</a>
				</div>
		{:else}
			<!-- Loading or no session state -->
			<div class="text-center">
				<div class="mx-auto h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
					<Lock class="w-6 h-6 text-gray-400" />
				</div>
				<h3 class="text-lg font-semibold text-brand-900 mb-2">Checking Reset Link...</h3>
				<p class="text-gray-600 mb-6">
					Please wait while we validate your password reset link.
				</p>
			</div>
		{/if}
					</div>
				</div>
			</div>
		</div>
	</div>
</div>