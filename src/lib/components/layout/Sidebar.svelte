<!-- Desktop Sidebar Component -->
<script lang="ts">
	import { page } from '$app/stores';
	import { 
		LayoutDashboard, 
		ClipboardList, 
		FileText, 
		BarChart3, 
		Settings,
		LogOut
	} from 'lucide-svelte';
	import { APP_NAME } from '$lib/utils/constants';
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

	// Reactive active route check
	$: currentPath = $page.url.pathname;
</script>

<!-- Desktop Sidebar -->
<aside 
	class="fixed top-0 left-0 z-[60] h-full w-64 bg-white border-r border-gray-200 flex flex-col"
	data-sidebar
>
	<!-- Logo/Brand -->
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

	<!-- Navigation -->
	<nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
		{#each navItems as item}
			<a
				href={item.href}
				class="flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 {currentPath.startsWith(item.href) 
					? 'bg-gray-900 text-white shadow-sm' 
					: 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
				}"
			>
				<svelte:component this={item.icon} class="w-5 h-5" />
				<span>{item.label}</span>
			</a>
		{/each}
	</nav>

	<!-- Logout Button above Footer -->
	<form action="/auth/logout" method="POST" class="px-4 mb-2">
		<button 
			type="submit" 
			class="w-full py-2 px-4 rounded border border-gray-900 text-gray-900 bg-white font-semibold hover:bg-gray-900 hover:text-white transition-colors text-sm flex items-center justify-center gap-2"
		>
			<LogOut class="w-4 h-4" />
			Logout
		</button>
	</form>

	<!-- Footer at the very bottom -->
	<div class="p-4 border-t border-gray-200 bg-gray-50">
		<div class="text-xs text-gray-400 text-center">
			<p class="font-semibold">&copy; {new Date().getFullYear()} {APP_NAME}</p>
			<p class="mt-1 text-[11px] italic text-gray-300">Laundry Management System</p>
		</div>
	</div>
</aside>