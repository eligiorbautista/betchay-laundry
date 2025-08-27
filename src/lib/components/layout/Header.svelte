<script lang="ts">
	import { page } from '$app/stores';
	import { Menu, Settings, LogOut, User } from 'lucide-svelte';
	import { onMount } from 'svelte';
	import { createEventDispatcher } from 'svelte';
	import { authStore, auth, getUserEmail } from '$lib/stores/authStore';
	import { toast } from 'svelte-sonner';

	const dispatch = createEventDispatcher();

	let currentTime = new Date();
	let timeInterval: any;
	let showDropdown = false;

	onMount(() => {
		timeInterval = setInterval(() => {
			currentTime = new Date();
		}, 1000);

		return () => {
			if (timeInterval) clearInterval(timeInterval);
		};
	});
	function toggleSidebar() {
		dispatch('toggleSidebar');
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

	// User display info from auth state
	$: userEmail = getUserEmail($authStore) || 'Unknown User';
	$: avatarInitial = userEmail.charAt(0).toUpperCase();

	// figure out page title from current route
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

<!-- Updated header with responsive positioning to match sidebar -->
<header class="flex items-center justify-between bg-white shadow-sm border-b border-gray-200 fixed top-0 z-[50] h-10 md:h-10 lg:h-12 xl:h-16 px-2 md:px-3 lg:px-4 xl:px-6 transition-all duration-300
	left-0 right-0 md:left-40 md:right-0 lg:left-40 lg:right-0 xl:left-64 xl:right-0">
	<div class="flex items-center">
		<!-- hamburger menu -->
		<button
			class="p-1 md:p-1.5 lg:p-2 text-gray-600 hover:text-brand-900 hover:bg-gray-100 rounded-lg lg:hidden min-h-[32px] md:min-h-[36px] lg:min-h-[44px] min-w-[32px] md:min-w-[36px] lg:min-w-[44px] transition-colors"
			on:click={toggleSidebar}
			aria-label="Toggle sidebar"
			data-menu-button
		>
			<Menu class="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
		</button>

		<!-- page title for desktop -->
		<div class="hidden lg:flex items-center">
			<h1 class="text-lg md:text-xl lg:text-lg xl:text-xl font-semibold text-brand-900">{pageTitle}</h1>
		</div>
	</div>

	<div class="flex items-center lg:hidden">
		<!-- page title for mobile -->
		<h1 class="text-sm md:text-base lg:text-base xl:text-lg font-semibold text-brand-900">{pageTitle}</h1>
	</div>

	<div class="flex items-center gap-1 md:gap-2">
		<!-- current date/time (desktop only) -->
		<div class="hidden lg:flex flex-col items-end mr-3 md:mr-4 text-right">
			<div class="text-xs md:text-sm font-medium text-brand-900">{formattedDate}</div>
			<div class="text-[10px] md:text-xs text-gray-500">{formattedDay} • {formattedTime}</div>
		</div>

		<!-- user menu -->
		<div class="relative">
			<button 
				class="p-1 md:p-1.5 lg:p-2 rounded-full hover:bg-gray-100 transition-colors"
				on:click={() => showDropdown = !showDropdown}
				on:blur={() => setTimeout(() => showDropdown = false, 150)}
			>
				<div class="w-6 h-6 md:w-6 md:h-6 lg:w-7 lg:h-7 xl:w-8 xl:h-8 rounded-full bg-brand-800 text-white flex items-center justify-center hover:bg-brand-900 transition-colors">
					<span class="text-xs md:text-xs lg:text-xs xl:text-sm font-medium">
						{avatarInitial}
					</span>
				</div>
			</button>
			
			{#if showDropdown}
				<div class="absolute right-0 top-full mt-2 w-64 sm:w-72 z-50">
					<div class="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
						<!-- User Info Section -->
						<div class="px-4 py-3 border-b border-gray-100">
							<div class="flex items-center gap-3">
								<User class="w-4 h-4 text-gray-500 flex-shrink-0" />
								<span class="text-xs text-gray-600 truncate">
									{userEmail}
								</span>
							</div>
						</div>
						
						<!-- Menu Items -->
						<div class="py-1">
							<a 
								href="/settings" 
								class="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-brand-900 transition-colors"
								on:click={() => showDropdown = false}
							>
								<Settings class="w-4 h-4" />
								<span class="text-sm">Settings</span>
							</a>
							
							<button 
								on:click={() => { showDropdown = false; handleLogout(); }}
								class="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-brand-900 transition-colors w-full text-left"
							>
								<LogOut class="w-4 h-4" />
								<span class="text-sm">Logout</span>
							</button>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>
</header>
