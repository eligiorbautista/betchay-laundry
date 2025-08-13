<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { Key, ArrowLeft, Mail, RefreshCw } from 'lucide-svelte';

	let loading = false;
	let resendLoading = false;
	let otpCode = '';

	// Handle form submission
	function handleSubmit() {
		loading = true;
		return async ({ update, result }: { update: () => Promise<void>; result: { type: string; data?: { message?: string } } }) => {
			loading = false;
			
			if (result.type === 'success') {
				toast.success('OTP verification successful!');
			} else if (result.type === 'failure') {
				toast.error(result.data?.message || 'Verification failed. Please try again.');
			}
			
			await update();
		};
	}

	// Handle resend OTP
	function handleResend() {
		resendLoading = true;
		// You can implement the resend logic here
		setTimeout(() => {
			resendLoading = false;
			toast.success('OTP resent successfully!');
		}, 1000);
	}
</script>

<svelte:head>
	<title>OTP Verification - Laundry Management System</title>
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
								<Mail class="w-8 h-8 text-white" />
							</div>
							<h2 class="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
								OTP Verification
							</h2>
							<p class="text-gray-600">
								Enter the 6-digit OTP sent to your email
							</p>
						</div>
			<form 
				method="POST"
				class="space-y-6"
				use:enhance={handleSubmit}
			>
				<!-- Code Input -->
				<div>
					<label for="code" class="block text-sm font-medium text-gray-700 mb-2">
						OTP Code
					</label>
					<div class="relative">
						<div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
							<Key class="h-5 w-5 text-gray-400" />
						</div>
						<input
							id="code"
							name="token"
							type="text"
							required
							value={otpCode}
							on:input={(e) => {
								otpCode = e.currentTarget.value;
							}}
							maxlength={6}
							class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors text-center text-2xl tracking-widest font-mono"
							placeholder="000000"
						/>
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
							Verifying...
						</div>
					{:else}
						Verify
					{/if}
				</button>

				<!-- Resend Button -->
				<div class="text-center">
					<button
						type="button"
						disabled={resendLoading}
						class="inline-flex items-center text-sm text-gray-700 hover:text-gray-900 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
						on:click={handleResend}
					>
						{#if resendLoading}
							<RefreshCw class="w-4 h-4 mr-1 animate-spin" />
							Resending...
						{:else}
							<RefreshCw class="w-4 h-4 mr-1" />
							Resend OTP
						{/if}
					</button>
				</div>

				<!-- Help Links -->
				<div class="mt-8 text-center space-y-4">
					<a 
						href="/auth/login" 
						class="inline-flex items-center text-sm text-gray-700 hover:text-gray-900 font-medium"
					>
						<ArrowLeft class="w-4 h-4 mr-1" />
						Back to login
					</a>
					
					<div class="text-xs text-gray-500">
						<p class="mb-1">Having trouble with OTP verification?</p>
						<a 
							href="/auth/forgot-password" 
							class="text-gray-700 hover:text-gray-900"
						>
							Reset your password instead
						</a>
					</div>
				</div>
			</form>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
