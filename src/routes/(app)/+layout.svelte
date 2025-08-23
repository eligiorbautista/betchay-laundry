<script lang="ts">
	import { onMount } from 'svelte';
	import { afterNavigate, goto } from '$app/navigation';
	import Header from '$lib/components/layout/Header.svelte';
	import Sidebar from '$lib/components/layout/Sidebar.svelte';
	import MobileNav from '$lib/components/layout/MobileNav.svelte';
	import LoadingSpinner from '$lib/components/common/LoadingSpinner.svelte';
	import { authStore, isAuthenticated } from '$lib/stores/authStore';

	export const data: { user?: any; session?: any } = {};
	
	let mobileNavOpen = false;
	let loading = true;

	onMount(() => {
		let lastAuthState: any = null;
		
		// Watch for auth changes and handle redirects
		const unsubscribe = authStore.subscribe((state) => {
			loading = state.loading;
			
			// Client-side route protection (but avoid redirect loops)
			if (!loading && !isAuthenticated(state)) {
				// Only redirect if we had a session before (to avoid initial load issues)
				if (lastAuthState && isAuthenticated(lastAuthState)) {
					goto('/auth/login');
				} else if (!lastAuthState) {
					// First load without authentication
					goto('/auth/login');
				}
			}
			
			lastAuthState = { ...state };
		});

		// Close mobile navigation after route changes
		afterNavigate(() => {
			mobileNavOpen = false;
		});

		return unsubscribe;
	});
	
	function toggleMobileNav() {
		mobileNavOpen = !mobileNavOpen;
	}

	function closeMobileNav() {
		mobileNavOpen = false;
	}
	
	// Mobile nav is closed after navigation via afterNavigate hook
</script>


{#if loading}
	<div class="min-h-screen flex items-center justify-center bg-gray-50">
		<LoadingSpinner size="lg" />
	</div>
{:else}	<div class="min-h-screen bg-gray-50 print:bg-white print:min-h-0">
		<!-- Header (hidden in print) -->
		<div class="print:hidden">
			<Header 
				on:toggleSidebar={toggleMobileNav}
			/>
		</div>
		
		<!-- Desktop Sidebar (hidden on mobile and print) -->
		<div class="hidden lg:block print:hidden">
			<Sidebar />
		</div>

		<!-- Mobile Navigation (hidden in print) -->
		<div class="print:hidden">
			<MobileNav 
				isOpen={mobileNavOpen}
				on:close={closeMobileNav}
			/>
		</div>

		<!-- Main Content -->
		<div class="lg:pl-64 transition-all duration-300 print:pl-0">
			<main class="pt-20 min-h-screen print:pt-0 print:min-h-0">
				<slot />
			</main>
		</div>
	</div>
{/if}

<style>
	/* Ensure proper z-index layering */
	:global(.sidebar) {
		z-index: 50;
	}
	
	:global(.header) {
		z-index: 45;
	}
</style>
