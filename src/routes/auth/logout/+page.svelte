<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

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
		<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-500 mx-auto mb-4"></div>
		<h2 class="text-xl font-semibold text-gray-900 mb-2">Logging out...</h2>
		<p class="text-gray-600">Please wait while we sign you out.</p>
		
		<!-- Hidden form that will be auto-submitted -->
		<form method="POST" use:enhance={handleSubmit} class="hidden">
			<button type="submit">Logout</button>
		</form>
	</div>
</div> 