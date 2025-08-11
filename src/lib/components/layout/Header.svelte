<script lang="ts">
	import { page } from '$app/stores';
	import { Menu, Bell, Settings, LogOut, User } from 'lucide-svelte';
	import { onMount } from 'svelte';

	import { createEventDispatcher } from 'svelte';
	

	const dispatch = createEventDispatcher();

	let currentTime = new Date();
	let timeInterval: any;

	onMount(() => {
		timeInterval = setInterval(() => {
			currentTime = new Date();
		}, 1000);

		return () => {
			if (timeInterval) clearInterval(timeInterval);
		};
	});
	function toggleSidebar() {
		console.log('Hamburger menu clicked - dispatching toggleSidebar event');
		dispatch('toggleSidebar');
	}

	// Get current page title based on route
	$: pageTitle = getPageTitle($page.route.id);
	$: currentPath = $page.url.pathname;

	function getPageTitle(routeId: string | null): string {
		if (!routeId) return 'Dashboard';
		
		const titles: Record<string, string> = {
			'/dashboard': 'Dashboard',
			'/orders': 'Orders',
			'/invoices': 'Invoices',
			'/reports': 'Reports',
			'/settings': 'Settings'
		};

		for (const [route, title] of Object.entries(titles)) {
			if (routeId.startsWith(route)) {
				return title;
			}
		}

		return 'Dashboard';
	}

	$: formattedDate = currentTime.toLocaleDateString('en-US', { 
		month: 'short', 
		day: 'numeric', 
		year: 'numeric' 
	});
	$: formattedDay = currentTime.toLocaleDateString('en-US', { weekday: 'long' });
	$: formattedTime = currentTime.toLocaleTimeString('en-US', { 
		hour: '2-digit', 
		minute: '2-digit',
		hour12: true 
	});
</script>

<header class="navbar bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-[50] h-20 px-4 md:px-6">
	<div class="navbar-start">		<!-- Mobile menu button -->
		<button
			class="btn btn-ghost btn-square text-gray-600 hover:text-gray-900 hover:bg-gray-100 lg:hidden min-h-[44px] min-w-[44px]"
			on:click={toggleSidebar}
			aria-label="Toggle sidebar"
			data-menu-button
		>
			<Menu class="w-6 h-6" />
		</button>

		<!-- Desktop page title -->
		<div class="hidden lg:flex items-center">
			<h1 class="text-xl font-semibold text-gray-900">{pageTitle}</h1>
		</div>
	</div>

	<div class="navbar-center lg:hidden">
		<!-- Mobile page title -->
		<h1 class="text-lg font-semibold text-gray-900">{pageTitle}</h1>
	</div>

	<div class="navbar-end gap-1 md:gap-2">
		<!-- Date and Time Display (show on large screens to avoid tablet crowding) -->
		<div class="hidden lg:flex flex-col items-end mr-4 text-right">
			<div class="text-sm font-medium text-gray-900">{formattedDate}</div>
			<div class="text-xs text-gray-500">{formattedDay} • {formattedTime}</div>
		</div>

		<!-- Notifications dropdown -->
		<div class="dropdown dropdown-end mr-2">
			<div tabindex="0" role="button" class="btn btn-ghost btn-circle text-gray-600 hover:text-gray-900 hover:bg-gray-100">
				<div class="indicator">
					<Bell class="w-5 h-5" />
					<span class="badge badge-xs indicator-item bg-blue-500 text-white border-blue-500">3</span>
				</div>
			</div>
			
			<ul class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow-lg bg-white rounded-lg w-64 sm:w-72 border border-gray-200">
				<li class="menu-title">
					<div class="flex items-center justify-between px-2 py-1">
						<span class="text-sm font-medium text-gray-900">Notifications</span>
						<button class="text-xs text-blue-600 hover:text-blue-800">Mark all read</button>
					</div>
				</li>
				<div class="divider my-1"></div>
				<li>
					<div class="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
						<div class="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
						<div class="flex-1 min-w-0">
							<p class="text-sm font-medium text-gray-900">Failed login attempt</p>
							<p class="text-xs text-gray-500">Invalid credentials detected</p>
							<p class="text-xs text-gray-400 mt-1">Today, 2:30 PM</p>
						</div>
					</div>
				</li>
				<li>
					<div class="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
						<div class="w-2 h-2 bg-yellow-500 rounded-full flex-shrink-0"></div>
						<div class="flex-1 min-w-0">
							<p class="text-sm font-medium text-gray-900">Password changed</p>
							<p class="text-xs text-gray-500">Your password was updated</p>
							<p class="text-xs text-gray-400 mt-1">Yesterday, 4:15 PM</p>
						</div>
					</div>
				</li>
				<li>
					<div class="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
						<div class="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
						<div class="flex-1 min-w-0">
							<p class="text-sm font-medium text-gray-900">New login</p>
							<p class="text-xs text-gray-500">Login from Chrome browser</p>
							<p class="text-xs text-gray-400 mt-1">Dec 15, 9:45 AM</p>
						</div>
					</div>
				</li>
			</ul>
		</div>

		<!-- User dropdown -->
		<div class="dropdown dropdown-end">
			<div tabindex="0" role="button" class="btn btn-ghost btn-circle">
				<div class="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 transition-colors">
					<span class="text-sm font-medium">
						A
					</span>
				</div>
			</div>
			
			<ul class="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow-lg bg-white rounded-lg w-72 sm:w-64 border border-gray-200">
				<li class="menu-title">
					<div class="flex items-center gap-2 px-2 py-2">
						<User class="w-4 h-4 text-gray-500 flex-shrink-0" />
						<span class="text-xs text-gray-500 truncate min-w-0 flex-1">
							betchaylaundryhub@gmail.com
						</span>
					</div>
				</li>
				<div class="divider my-1"></div>
				<li>
					<a href="/settings" class="flex items-center gap-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded px-2 py-2">
						<Settings class="w-4 h-4" />
						Settings
					</a>
				</li>
				<li>
					<a href="/" class="flex items-center gap-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded px-2 py-2">
						<LogOut class="w-4 h-4" />
						Logout
					</a>
				</li>
			</ul>
		</div>
	</div>
</header>
