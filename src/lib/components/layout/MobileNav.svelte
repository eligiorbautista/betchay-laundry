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
		Lock,
		Unlock,
		Activity
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
			label: 'Audit Logs',
			href: '/audit-logs',
			icon: Activity,
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
	
	// Debug log for admin status
	$: if ($authStore.user) {
		console.log('MobileNav Admin Check:', {
			userEmail: $authStore.user.email,
			isAdmin: userIsAdmin,
			adminEmail: import.meta.env.PUBLIC_ADMIN_EMAIL || 'betchaylaundryhub@gmail.com'
		});
	}

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
		class="fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-gradient-to-b from-gray-50 to-white shadow-2xl z-50 lg:hidden mobile-nav-panel flex flex-col"
		transition:fly="{{ x: -320, duration: 300, opacity: 1 }}"
	>
		<!-- Header -->
		<div class="flex items-center justify-between h-20 px-6 border-b border-gray-200 bg-white/90 backdrop-blur-sm">
			<div class="flex items-center space-x-3 flex-1">
				<img 
					src="/logo/logo_banner.png" 
					alt="Laundry Management System" 
					class="ml-1 h-14 w-auto object-contain bg-brand-900 py-1.5 px-2 rounded-lg shadow-sm"
				/>
			</div>
			<button
				class="p-2.5 rounded-xl text-brand-600 hover:text-brand-900 hover:bg-brand-100 transition-all duration-200 shadow-sm hover:shadow-md"
				on:click={closeMobileNav}
				aria-label="Close navigation"
			>
				<ChevronLeft class="w-6 h-6" />
			</button>
		</div>

		<!-- Navigation Links -->
		<nav class="flex-1 px-4 py-6 space-y-3 overflow-y-auto">
			{#each navItems as item}
				{#if !item.adminOnly || userIsAdmin}
					<a
						href={item.href}
						class="group flex items-center space-x-4 px-5 py-4 rounded-2xl text-base font-medium transition-all duration-200 relative {currentPath.startsWith(item.href) 
							? 'bg-brand-900 text-white shadow-lg shadow-brand-900/25 scale-[1.02]' 
							: 'text-brand-600 hover:bg-brand-50 hover:text-brand-900 hover:shadow-lg hover:scale-[1.01]'
						}"
						on:click={handleNavClick}
					>
						<svelte:component this={item.icon} class="w-6 h-6 transition-transform group-hover:scale-110" />
						<span class="flex-1 font-medium">{item.label}</span>
						{#if item.adminOnly}
							<Unlock class="w-4 h-4 {currentPath.startsWith(item.href) ? 'text-white' : 'text-gray-600 group-hover:text-gray-800'}" />
						{/if}
						{#if currentPath.startsWith(item.href)}
							<div class="absolute -right-1 top-1/2 transform -translate-y-1/2 w-1.5 h-10 bg-white rounded-full"></div>
						{/if}
					</a>
				{:else}
					<!-- Show grayed out admin-only items for non-admin users -->
					<div
						class="flex items-center space-x-4 px-5 py-4 rounded-2xl text-base font-medium opacity-50 cursor-not-allowed"
						title="Admin access required"
					>
						<svelte:component this={item.icon} class="w-6 h-6 text-brand-400" />
						<span class="flex-1 text-brand-400">{item.label}</span>
						<Lock class="w-4 h-4 text-gray-400" />
					</div>
				{/if}
			{/each}
		</nav>

		<!-- Logout Button -->
		<div class="p-4 border-t border-gray-200 mt-auto">
			<button 
				on:click={handleLogout}
				class="group w-full py-4 px-5 rounded-2xl border-2 border-brand-200 text-brand-700 bg-white font-medium hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-all duration-200 text-base flex items-center justify-center gap-3 shadow-sm hover:shadow-lg"
			>
				<LogOut class="w-5 h-5 transition-transform group-hover:scale-110" />
				Logout
			</button>
		</div>

		<!-- Footer -->
		<div class="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
			<div class="text-xs text-brand-500 text-center">
				<p class="font-semibold">&copy; {new Date().getFullYear()} {APP_NAME}</p>
				<p class="mt-1 text-[10px] text-brand-400">Laundry Management System</p>
			</div>
		</div>
	</div>
{/if}

<style>
	/* Svelte transitions handle the animations now */
</style>
