<!-- main sidebar -->
<script lang="ts">
	import { page } from '$app/stores';
	import { 
		LayoutDashboard, 
		ClipboardList, 
		FileText, 
		BarChart3, 
		Settings,
		LogOut,
		Shield
	} from 'lucide-svelte';
	import { APP_NAME } from '$lib/utils/constants';
	import { auth, authStore } from '$lib/stores/authStore';
	import { isAdmin } from '$lib/utils/auth';
	import { toast } from 'svelte-sonner';
	
	// nav menu items
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

	// track current page for highlighting
	$: currentPath = $page.url.pathname;

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

<!-- navigation sidebar -->
<aside 
	class="fixed top-0 left-0 z-[60] h-full w-64 bg-white border-r border-gray-200 flex flex-col"
	data-sidebar
>
	<!-- company logo -->
	<div class="flex items-center h-16 px-6 border-b border-gray-200 bg-white">
		<div class="flex items-center space-x-3">
			<a href="/">
				<img 
					src="/logo/logo_banner.png" 
					alt="Laundry Management System" 
					class="ml-5 h-12 w-auto object-contain"
				/>
			</a>
		</div>
	</div>

	<!-- menu links -->
	<nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
		{#each navItems as item}
			{#if !item.adminOnly || userIsAdmin}
				<a
					href={item.href}
					class="flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 {currentPath.startsWith(item.href) 
						? 'bg-gray-900 text-white shadow-sm' 
						: 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
					}"
				>
					<svelte:component this={item.icon} class="w-5 h-5" />
					<span class="flex-1">{item.label}</span>
					{#if item.adminOnly}
						<Shield class="w-3 h-3 text-amber-500" />
					{/if}
				</a>
			{:else}
				<!-- Show grayed out admin-only items for non-admin users -->
				<div
					class="flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium opacity-50 cursor-not-allowed"
					title="Admin access required"
				>
					<svelte:component this={item.icon} class="w-5 h-5 text-gray-400" />
					<span class="flex-1 text-gray-400">{item.label}</span>
					<Shield class="w-3 h-3 text-gray-400" />
				</div>
			{/if}
		{/each}
	</nav>

	<!-- logout button -->
	<div class="px-4 mb-2">
		<button 
			on:click={handleLogout}
			class="w-full py-2 px-4 rounded border border-gray-900 text-gray-900 bg-white font-semibold hover:bg-gray-900 hover:text-white transition-colors text-sm flex items-center justify-center gap-2"
		>
			<LogOut class="w-4 h-4" />
			Logout
		</button>
	</div>

	<!-- Footer at the very bottom -->
	<div class="p-4 border-t border-gray-200 bg-gray-50">
		<div class="text-xs text-gray-400 text-center">
			<p class="font-semibold">&copy; {new Date().getFullYear()} {APP_NAME}</p>
			<p class="mt-1 text-[11px] italic text-gray-300">Laundry Management System</p>
		</div>
	</div>
</aside>