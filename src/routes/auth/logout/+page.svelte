<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	let isLoggingOut = true;
	let error = '';

	// Trigger logout immediately on page visit
	onMount(() => {
		const form = document.querySelector('form');
		if (form) {
			form.submit();
		}
	});

	function handleSubmit() {
		return async ({ update, result }: { update: () => Promise<void>; result: { type: string } }) => {
			if (result.type === 'redirect') {
				await goto('/auth/login');
			} else if (result.type === 'failure') {
				// Handle any errors 
				isLoggingOut = false;
				error = 'There was an issue during logout, but you have been signed out.';
				// Still redirect to login after a short delay
				setTimeout(() => goto('/auth/login'), 2000);
			}
			await update();
		};
	}
</script>

<svelte:head>
	<title>Logging out... - Laundry Management System</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gray-50">
	<div class="text-center">
		{#if isLoggingOut}
			<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-500 mx-auto mb-4"></div>
			<h2 class="text-xl font-semibold text-brand-900 mb-2">Logging out...</h2>
			<p class="text-gray-600">Please wait while we sign you out.</p>
		{:else if error}
			<div class="rounded-full h-12 w-12 bg-yellow-100 flex items-center justify-center mx-auto mb-4">
				<svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
				</svg>
			</div>
			<h2 class="text-xl font-semibold text-brand-900 mb-2">Logout Complete</h2>
			<p class="text-gray-600 mb-4">{error}</p>
			<p class="text-sm text-gray-500">Redirecting to login page...</p>
		{/if}
		
		<!-- Hidden form that will be auto-submitted -->
		<form method="POST" use:enhance={handleSubmit} class="hidden">
			<button type="submit">Logout</button>
		</form>
	</div>
</div> 