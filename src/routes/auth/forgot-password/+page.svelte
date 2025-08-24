<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { Mail, ArrowLeft } from 'lucide-svelte';

	export let form: { success?: boolean; error?: string, email?: string } = {};

	let loading = false;
	let email = form?.email || '';

	// Handle form submission
	function handleSubmit() {
		loading = true;
		return async ({ update, result }: { update: () => Promise<void>; result: { type: string; data?: { error?: string; success?: boolean } } }) => {
			loading = false;
			
			if (result.type === 'success' && result.data?.success) {
				toast.success('Password reset link sent! Check your email.');
				email = ''; // Clear the form on success
			} else if (result.type === 'failure') {
				toast.error(result.data?.error || 'Failed to send reset link. Please try again.');
			} else if (result.type === 'error') {
				toast.error('An unexpected error occurred. Please try again.');
			}
			
			await update();
		};
	}
</script>

<svelte:head>
	<title>Forgot Password - Laundry Management System</title>
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
								<Mail class="w-8 h-8 text-white" />
							</div>
							<h2 class="text-2xl lg:text-3xl font-bold text-brand-900 mb-2">
								Reset your password
							</h2>
							<p class="text-gray-600">
								Enter your email address and we'll send you a link to reset your password.
							</p>
						</div>
			<form 
				method="POST"
				class="space-y-6"
				use:enhance={handleSubmit}
			>
				<!-- Email Field -->
				<div>
					<label for="email" class="block text-sm font-medium text-gray-700 mb-2">
						Email address
					</label>
					<div class="relative">
						<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<Mail class="h-5 w-5 text-gray-400" />
						</div>
						<input
							id="email"
							name="email"
							type="email"
							required
							bind:value={email}
							class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors"
							placeholder="Enter your email"
						/>
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
							Sending...
						</div>
					{:else}
						Send Reset Link
					{/if}
				</button>

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
			</form>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
