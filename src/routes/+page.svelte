<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authStore, isAuthenticated } from '$lib/stores/authStore';

	onMount(() => {
		// Route to appropriate page based on login status
		const unsubscribe = authStore.subscribe((state) => {
			if (!state.loading) {
				if (isAuthenticated(state)) {
					// User is authenticated, redirect to orders
					goto('/orders');
				} else {
					// User is not authenticated, redirect to login
					goto('/auth/login');
				}
			}
		});

		return unsubscribe;
	});
</script>

<svelte:head>
	<title>Redirecting... - Laundry Management System</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gray-50">
	<div class="text-center">
		<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500 mx-auto mb-4"></div>
		<p class="text-gray-600">Redirecting...</p>
	</div>
</div>
