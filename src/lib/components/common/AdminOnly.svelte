<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authStore } from '$lib/stores/authStore';
	import { isAdmin } from '$lib/utils/auth';
	import LoadingSpinner from './LoadingSpinner.svelte';
	import { AlertTriangle, ArrowLeft } from 'lucide-svelte';

	// Props
	export let redirectTo: string = '/orders'; // Default redirect for non-admin users
	export let showAccessDenied: boolean = true; // Whether to show access denied message or redirect immediately

	let loading = true;
	let hasAccess = false;
	let showDeniedMessage = false;

	onMount(() => {
		const unsubscribe = authStore.subscribe((state) => {
			loading = state.loading;
			
			if (!loading) {
				// Check if user is authenticated and is admin
				const userHasAccess = state.user && isAdmin(state.user);
				hasAccess = !!userHasAccess;
				
				// Debug logging for AdminOnly component
				console.log('AdminOnly Component Check:', {
					hasUser: !!state.user,
					userEmail: state.user?.email || 'No user',
					isAdmin: userHasAccess,
					hasAccess: hasAccess,
					loading: loading
				});
				
				if (!hasAccess) {
					console.log('AdminOnly: Access denied, showing message or redirecting to:', redirectTo);
					if (showAccessDenied) {
						// Show access denied message
						showDeniedMessage = true;
					} else {
						// Redirect immediately
						goto(redirectTo);
					}
				} else {
					console.log('AdminOnly: Access granted, showing content');
				}
			}
		});

		return unsubscribe;
	});

	function handleGoBack() {
		goto(redirectTo);
	}
</script>

{#if loading}
	<div class="min-h-screen flex items-center justify-center bg-gray-50">
		<LoadingSpinner size="lg" message="Checking permissions..." />
	</div>
{:else if showDeniedMessage && !hasAccess}
	<div class="min-h-screen flex items-center justify-center bg-gray-50 p-4">
		<div class="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
			<div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
				<AlertTriangle class="w-8 h-8 text-red-600" />
			</div>
			
			<h1 class="text-2xl font-bold text-brand-900 mb-4">Access Denied</h1>
			
			<p class="text-gray-600 mb-2">
				You don't have permission to access this page.
			</p>
			
			<p class="text-sm text-gray-500 mb-8">
				This page is restricted to administrators only.
			</p>
			
			<button
				on:click={handleGoBack}
				class="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-brand-800 rounded-lg hover:bg-brand-900 transition-colors shadow-sm hover:shadow-md"
			>
				<ArrowLeft class="w-4 h-4" />
				Go Back to Orders
			</button>
		</div>
	</div>
{:else if hasAccess}
	<!-- Content is shown for admin users -->
	<slot />
{/if}
