<!-- mobile sidebar menu -->
<script lang="ts">
	import { page } from '$app/stores';
	import { 
		LayoutDashboard, 
		ClipboardList, 
		Users, 
		FileText, 
		BarChart3, 
		Settings,
		ChevronLeft,
		LogOut,
		Shield
	} from 'lucide-svelte';
	import { APP_NAME } from '$lib/utils/constants';
	import { createEventDispatcher } from 'svelte';
	import { fly } from 'svelte/transition';
	import { auth, authStore } from '$lib/stores/authStore';
	import { isAdmin } from '$lib/utils/auth';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';

	export let isOpen: boolean = false;
	const dispatch = createEventDispatcher();
	
	// menu links
	const navItems = [
		{
			label: 'Dashboard',
			href: '/dashboard',
			icon: LayoutDashboard,
			adminOnly: true
		},
		{
			label: 'Orders',
			href: '/orders',
			icon: ClipboardList,
			adminOnly: false
		},
		{
			label: 'Reports',
			href: '/reports',
			icon: BarChart3,
			adminOnly: true
		},
		{
			label: 'Settings',
			href: '/settings',
			icon: Settings,
			adminOnly: false
		}
	];

	// Check if current user is admin
	$: userIsAdmin = $authStore.user ? isAdmin($authStore.user) : false;

	// Check if current route is active
	$: currentPath = $page.url.pathname;

	function closeMobileNav() {
		console.log('MobileNav: Closing mobile navigation');
		dispatch('close');
	}

	function handleNavClick() {
		closeMobileNav();
	}

	// Handle logout
	async function handleLogout() {
		try {
			const result = await auth.signOut();
			if (result.success) {
				toast.success('Logged out successfully');
			} else {
				toast.error(result.error || 'Failed to logout');
			}
		} catch (error) {
			console.error('Logout error:', error);
			toast.error('An unexpected error occurred');
		}
	}
</script>

<!-- Mobile Navigation Overlay -->
{#if isOpen}
	<!-- Debug log -->
	{console.log('MobileNav: Rendering mobile navigation, isOpen =', isOpen)}
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
		class="fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white shadow-xl z-50 lg:hidden mobile-nav-panel flex flex-col"
		transition:fly="{{ x: -320, duration: 300, opacity: 1 }}"
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
				<ChevronLeft class="w-6 h-6" />
			</button>
		</div>

		<!-- Navigation Links -->
		<nav class="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
			{#each navItems as item}
				{#if !item.adminOnly || userIsAdmin}
					<a
						href={item.href}
						class="flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 {currentPath.startsWith(item.href) 
							? 'bg-gray-900 text-white shadow-sm' 
							: 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
						}"
						on:click={handleNavClick}
					>
						<svelte:component this={item.icon} class="w-6 h-6" />
						<span class="flex-1">{item.label}</span>
						{#if item.adminOnly}
							<Shield class="w-4 h-4 text-amber-500" />
						{/if}
					</a>
				{:else}
					<!-- Show grayed out admin-only items for non-admin users -->
					<div
						class="flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium opacity-50 cursor-not-allowed"
						title="Admin access required"
					>
						<svelte:component this={item.icon} class="w-6 h-6 text-gray-400" />
						<span class="flex-1 text-gray-400">{item.label}</span>
						<Shield class="w-4 h-4 text-gray-400" />
					</div>
				{/if}
			{/each}
		</nav>

		<!-- Logout Button -->
		<div class="p-4 border-t border-gray-200 mt-auto">
			<button 
				on:click={handleLogout}
				class="w-full py-3 px-4 rounded-xl border border-gray-900 text-gray-900 bg-white font-semibold hover:bg-gray-900 hover:text-white transition-colors text-base flex items-center justify-center gap-3"
			>
				<LogOut class="w-5 h-5" />
				Logout
			</button>
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
	/* Svelte transitions handle the animations now */
</style>
