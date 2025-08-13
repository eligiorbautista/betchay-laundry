<!-- Mobile Navigation Component -->
<script lang="ts">
	import { page } from '$app/stores';
	import { 
		LayoutDashboard, 
		ClipboardList, 
		Users, 
		FileText, 
		BarChart3, 
		Settings,
		X,
		LogOut
	} from 'lucide-svelte';
	import { APP_NAME } from '$lib/utils/constants';
	import { createEventDispatcher } from 'svelte';

	export let isOpen: boolean = false;
	const dispatch = createEventDispatcher();
	
	// Navigation items	
	const navItems = [
		{
			label: 'Dashboard',
			href: '/dashboard',
			icon: LayoutDashboard
		},
		{
			label: 'Orders',
			href: '/orders',
			icon: ClipboardList
		},
		{
			label: 'Reports',
			href: '/reports',
			icon: BarChart3
		},
		{
			label: 'Settings',
			href: '/settings',
			icon: Settings
		}
	];

	// Check if current route is active
	$: currentPath = $page.url.pathname;

	function closeMobileNav() {
		dispatch('close');
	}

	function handleNavClick() {
		closeMobileNav();
	}
</script>

<!-- Mobile Navigation Overlay -->
{#if isOpen}
	<!-- Backdrop -->
	<div 
		class="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden"
		on:click={closeMobileNav}
		on:keydown={(e) => e.key === 'Escape' && closeMobileNav()}
		role="button"
		tabindex="0"
		aria-label="Close mobile navigation"
	></div>

	<!-- Mobile Navigation Panel -->
	<div 
		class="fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden mobile-nav-panel flex flex-col"
	>
		<!-- Header -->
		<div class="flex items-center justify-between h-20 px-6 border-b border-gray-200 bg-white">
			<div class="flex items-center space-x-3">
				<img 
					src="/logo/logo_banner.png" 
					alt="Laundry Management System" 
					class="h-12 w-auto object-contain"
				/>
			</div>
			<button
				class="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
				on:click={closeMobileNav}
				aria-label="Close navigation"
			>
				<X class="w-6 h-6" />
			</button>
		</div>

		<!-- Navigation Links -->
		<nav class="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
			{#each navItems as item}
				<a
					href={item.href}
					class="flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 {currentPath.startsWith(item.href) 
						? 'bg-gray-900 text-white shadow-sm' 
						: 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
					}"
					on:click={handleNavClick}
				>
					<svelte:component this={item.icon} class="w-6 h-6" />
					<span>{item.label}</span>
				</a>
			{/each}
		</nav>

		<!-- Logout Button -->
		<div class="p-4 border-t border-gray-200 mt-auto">
			<form action="/auth/logout" method="POST">
				<button 
					type="submit" 
					class="w-full py-3 px-4 rounded-xl border border-gray-900 text-gray-900 bg-white font-semibold hover:bg-gray-900 hover:text-white transition-colors text-base flex items-center justify-center gap-3"
				>
					<LogOut class="w-5 h-5" />
					Logout
				</button>
			</form>
		</div>

		<!-- Footer -->
		<div class="p-4 bg-gray-50 border-t border-gray-200">
			<div class="text-xs text-gray-400 text-center">
				<p class="font-semibold">&copy; {new Date().getFullYear()} {APP_NAME}</p>
				<p class="mt-1 text-[11px] italic text-gray-300">Laundry Management System</p>
			</div>
		</div>
	</div>
{/if}

<style>
	.mobile-nav-panel {
		transform: translateX(0);
	}
	
	:global(.mobile-nav-panel) {
		animation: slideInFromLeft 0.3s ease-out;
	}
	
	@keyframes slideInFromLeft {
		from {
			transform: translateX(-100%);
		}
		to {
			transform: translateX(0);
		}
	}
</style>
