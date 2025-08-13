<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { toast } from 'svelte-sonner';
	import { Lock, Eye, EyeOff, ArrowLeft } from 'lucide-svelte';

	export let form: { success?: boolean; error?: string } = {};

	let loading = false;
	let showPassword = false;
	let showConfirmPassword = false;
	let password = '';
	let confirmPassword = '';
	
	// Get token from URL params
	$: token = $page.url.searchParams.get('token');

	// Handle form submission
	function handleSubmit() {
		loading = true;
		return async ({ update, result }: { update: () => Promise<void>; result: { type: string; data?: { message?: string } } }) => {
			loading = false;
			
			if (result.type === 'success') {
				toast.success('Password updated successfully! You can now login.');
			} else if (result.type === 'failure') {
				toast.error(result.data?.message || 'Failed to update password. Please try again.');
			}
			
			await update();
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
						<img src="/logo/logo.png" alt="App Logo" class="h-40 lg:h-52 xl:h-60 mx-auto mb-6" />
						<h1 class="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
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
							<div class="mx-auto h-16 w-16 bg-gray-800 rounded-xl flex items-center justify-center mb-6">
								<Lock class="w-8 h-8 text-white" />
							</div>
							<h2 class="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
								Create new password
							</h2>
							<p class="text-gray-600">
								Enter your new password below.
							</p>
						</div>

		{#if !token}
			<!-- Invalid Token -->
				<div class="text-center">
					<div class="mx-auto h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
						<Lock class="w-6 h-6 text-red-600" />
					</div>
					<h3 class="text-lg font-semibold text-gray-900 mb-2">Invalid Reset Link</h3>
					<p class="text-gray-600 mb-6">
						The password reset link is invalid or has expired. Please request a new one.
					</p>
					<a 
						href="/auth/forgot-password" 
						class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-lg hover:bg-gray-900 transition-colors"
					>
						Request New Reset Link
					</a>
				</div>
		{:else if form?.success}
			<!-- Success State -->
			<div class="text-center">
					<div class="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
						<Lock class="w-6 h-6 text-green-600" />
					</div>
					<h3 class="text-lg font-semibold text-gray-900 mb-2">Password Updated!</h3>
					<p class="text-gray-600 mb-6">
						Your password has been successfully updated. You can now login with your new password.
					</p>
					<a 
						href="/auth/login" 
						class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-lg hover:bg-gray-900 transition-colors"
					>
						Go to Login
					</a>
			</div>
		{:else}
			<!-- Reset Form -->
			<form 
				method="POST"
				class="space-y-6"
				use:enhance={handleSubmit}
			>
					<input type="hidden" name="token" value={token} />
					
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
						class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
						class="inline-flex items-center text-sm text-gray-700 hover:text-gray-900 font-medium"
					>
						<ArrowLeft class="w-4 h-4 mr-1" />
						Back to login
					</a>
				</div>
		{/if}
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
