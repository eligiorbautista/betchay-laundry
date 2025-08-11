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
	<div class="max-w-md w-full space-y-8">
		<!-- Header -->
		<div class="text-center">
			<div class="mx-auto h-16 w-16 bg-blue-500 rounded-xl flex items-center justify-center mb-6">
				<Lock class="w-8 h-8 text-white" />
			</div>
			<h2 class="text-3xl font-bold text-gray-900 mb-2">
				Create new password
			</h2>
			<p class="text-gray-600">
				Enter your new password below.
			</p>
		</div>

		{#if !token}
			<!-- Invalid Token -->
			<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
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
						class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
					>
						Request New Reset Link
					</a>
				</div>
			</div>
		{:else if form?.success}
			<!-- Success State -->
			<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
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
						class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
					>
						Go to Login
					</a>
				</div>
			</div>
		{:else}
			<!-- Reset Form -->
			<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
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
								class="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
								class="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
						class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
			</div>
		{/if}

		<!-- Back to Login -->
		<div class="text-center">
			<a 
				href="/auth/login" 
				class="inline-flex items-center text-sm text-blue-500 hover:text-blue-400 font-medium"
			>
				<ArrowLeft class="w-4 h-4 mr-1" />
				Back to login
			</a>
		</div>
	</div>
</div>
