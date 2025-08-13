<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import { Eye, EyeOff, Lock, Mail } from 'lucide-svelte';

	export let form: { error?: string; email?: string } = {};

	let loading = false;
	let showPassword = false;
	let email = form?.email || '';
	let password = '';

	// Handle form submission
	function handleSubmit() {
		loading = true;
		return async ({ update, result }: { update: () => Promise<void>; result: { type: string; data?: { message?: string } } }) => {
			loading = false;
			
			if (result.type === 'success') {
				toast.success('Login successful!');
				await goto('/dashboard');
			} else if (result.type === 'failure') {
				toast.error(result.data?.message || 'Login failed. Please try again.');
			}
			
			await update();
		};
	}
</script>

<svelte:head>
	<title>Login - Laundry Management System</title>
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

				<!-- Login Form Section -->
				<div class="lg:w-1/2 p-8 lg:p-12">
					<div class="max-w-sm mx-auto">
						<div class="mb-8">
							<h2 class="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
								Welcome back
							</h2>
							<p class="text-gray-600">
								Sign in to your account
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

				<!-- Password Field -->
				<div>
					<label for="password" class="block text-sm font-medium text-gray-700 mb-2">
						Password
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
							placeholder="Enter your password"
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

				<!-- Forgot Password -->
				<div class="text-right">
					<a href="/auth/forgot-password" class="text-sm text-gray-700 hover:text-gray-900 font-medium">
						Forgot password?
					</a>
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
							Signing in...
						</div>
					{:else}
						Sign in
					{/if}
				</button>

				<!-- Footer Links -->
				<div class="mt-8 text-center">
					<p class="text-sm text-gray-600">
						Have an issue?
						<a href="https://eligiobautista.dev" class="text-gray-700 hover:text-gray-900 font-medium">
							Contact Developer
						</a>
					</p>
				</div>
			</form>
					</div>
				</div>
			</div>
		</div>
	</div>
</div> 