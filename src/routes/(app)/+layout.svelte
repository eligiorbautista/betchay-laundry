<script lang="ts">
	import { onMount } from 'svelte';
	import { afterNavigate } from '$app/navigation';
	import Header from '$lib/components/layout/Header.svelte';
	import Sidebar from '$lib/components/layout/Sidebar.svelte';
	import MobileNav from '$lib/components/layout/MobileNav.svelte';
	import LoadingSpinner from '$lib/components/common/LoadingSpinner.svelte';
	let mobileNavOpen = false;
	let loading = false; // Set to false for frontend development

	onMount(async () => {
		// For frontend development, no authentication check needed
		loading = false;

		// Close mobile navigation after route changes
		afterNavigate(() => {
			mobileNavOpen = false;
		});
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
