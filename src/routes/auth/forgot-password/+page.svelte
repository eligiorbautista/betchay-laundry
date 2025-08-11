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
		return async ({ update, result }: { update: () => Promise<void>; result: { type: string; data?: { message?: string } } }) => {
			loading = false;
			
			if (result.type === 'success') {
				toast.success('Password reset link sent! Check your email.');
			} else if (result.type === 'failure') {
				toast.error(result.data?.message || 'Failed to send reset link. Please try again.');
			}
			
			await update();
		};
	}
</script>

<svelte:head>
	<title>Forgot Password - Laundry Management System</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
	<div class="max-w-md w-full space-y-8">
		<!-- Header -->
		<div class="text-center">
			<div class="mx-auto h-16 w-16 bg-blue-500 rounded-xl flex items-center justify-center mb-6">
				<Mail class="w-8 h-8 text-white" />
			</div>
			<h2 class="text-3xl font-bold text-gray-900 mb-2">
				Reset your password
			</h2>
			<p class="text-gray-600">
				Enter your email address and we'll send you a link to reset your password.
			</p>
		</div>

		<!-- Reset Form -->
		<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
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
							class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
							placeholder="Enter your email"
						/>
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
							Sending...
						</div>
					{:else}
						Send Reset Link
					{/if}
				</button>
			</form>
		</div>

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
