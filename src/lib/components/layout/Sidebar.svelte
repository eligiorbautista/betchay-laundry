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
		Lock,
		Unlock,
		Activity,
		Wallet
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
			label: 'Expenses',
			href: '/expenses',
			icon: Wallet,
			adminOnly: false
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
	

	// Function to get responsive label
	function getResponsiveLabel(label: string) {
		if (label === 'Audit Logs') {
			return {
				md: 'Audit',
				lg: 'Audit',
				xl: 'Audit Logs'
			};
		}
		return {
			md: label,
			lg: label,
			xl: label
		};
	}

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
	class="fixed top-0 left-0 z-[60] h-full md:w-40 lg:w-40 xl:w-64 bg-gradient-to-b from-gray-50 to-white border-r border-gray-200 flex flex-col shadow-lg"
	data-sidebar
>
	<!-- company logo -->
	<div class="flex items-center h-22 px-4">
		<div class="flex items-center space-x-3 w-full">
			<a href="/" class="flex items-center w-full group">
				<img 
					src="/logo/logo_banner.png" 
					alt="Laundry Management System" 
					class="mt-2 h-18 w-auto object-contain px-2 md:px-1 lg:px-1 xl:px-2"
				/>
			</a>
		</div>
	</div>

	<!-- menu links -->
	<nav class="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
		{#each navItems as item}
			{#if !item.adminOnly || userIsAdmin}
				<a
					href={item.href}
					class="group flex items-center space-x-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 relative {currentPath.startsWith(item.href) 
						? 'bg-brand-900 text-white shadow-lg shadow-brand-900/25 scale-[1.02]' 
						: 'text-brand-600 hover:bg-brand-50 hover:text-brand-900 hover:shadow-md hover:scale-[1.01]'
					} md:px-3 md:py-2.5 md:space-x-2 lg:px-3 lg:py-2.5 lg:space-x-2 xl:px-4 xl:py-3.5 xl:space-x-3"
				>
					<svelte:component this={item.icon} class="w-5 h-5 transition-transform group-hover:scale-110 flex-shrink-0 md:w-4 md:h-4 lg:w-4 lg:h-4 xl:w-5 xl:h-5" />
					<span class="flex-1 font-medium md:text-xs lg:text-xs xl:text-sm">
						<span class="md:hidden lg:hidden xl:inline">{item.label}</span>
						<span class="hidden md:inline lg:inline xl:hidden">{getResponsiveLabel(item.label).md}</span>
					</span>
					{#if item.adminOnly}
						<Unlock class="w-3.5 h-3.5 flex-shrink-0 {currentPath.startsWith(item.href) ? 'text-white' : 'text-gray-600 group-hover:text-gray-800'} md:w-3 md:h-3 lg:w-3 lg:h-3 xl:w-3.5 xl:h-3.5" />
					{/if}
					{#if currentPath.startsWith(item.href)}
						<div class="absolute -right-1 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-full md:h-6 lg:h-6 xl:h-8"></div>
					{/if}
				</a>
			{:else}
				<!-- Show grayed out admin-only items for non-admin users -->
				<div
					class="flex items-center space-x-3 px-4 py-3.5 rounded-xl text-sm font-medium opacity-50 cursor-not-allowed md:px-3 md:py-2.5 md:space-x-2 lg:px-3 lg:py-2.5 lg:space-x-2 xl:px-4 xl:py-3.5 xl:space-x-3"
					title="Admin access required"
				>
					<svelte:component this={item.icon} class="w-5 h-5 text-brand-400 flex-shrink-0 md:w-4 md:h-4 lg:w-4 lg:h-4 xl:w-5 xl:h-5" />
					<span class="flex-1 text-brand-400 md:text-xs lg:text-xs xl:text-sm">
						<span class="md:hidden lg:hidden xl:inline">{item.label}</span>
						<span class="hidden md:inline lg:inline xl:hidden">{getResponsiveLabel(item.label).md}</span>
					</span>
					<Lock class="w-3.5 h-3.5 text-gray-400 flex-shrink-0 md:w-3 md:h-3 lg:w-3 lg:h-3 xl:w-3.5 xl:h-3.5" />
				</div>
			{/if}
		{/each}
	</nav>

	<!-- logout button -->
	<div class="px-4 mb-4 md:px-3 lg:px-3 xl:px-4">
		<button 
			on:click={handleLogout}
			class="group w-full py-3 px-4 rounded-xl border-2 border-brand-200 text-brand-700 bg-white font-medium hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-all duration-200 text-sm flex items-center justify-center gap-2 shadow-sm hover:shadow-md md:py-2.5 md:px-3 md:gap-1.5 lg:py-2.5 lg:px-3 lg:gap-1.5 xl:py-3 xl:px-4 xl:gap-2"
		>
			<LogOut class="w-4 h-4 transition-transform group-hover:scale-110 flex-shrink-0 md:w-3.5 md:h-3.5 lg:w-3.5 lg:h-3.5 xl:w-4 xl:h-4" />
			<span class="md:text-xs lg:text-xs xl:text-sm">Logout</span>
		</button>
	</div>

	<!-- Footer at the very bottom -->
	<div class="p-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
		<div class="text-xs text-brand-500 text-center">
			<p class="font-semibold md:text-[10px] lg:text-[10px] xl:text-xs">&copy; {new Date().getFullYear()} {APP_NAME}</p>
			<p class="mt-1 text-[10px] text-brand-400 md:text-[8px] lg:text-[8px] xl:text-[10px]">Laundry Management System</p>
		</div>
	</div>
</aside>