<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Search, Plus, Filter, Eye, Edit3, Package, Clock, CheckCircle, XCircle, Trash2, Phone, Calendar, Scale, CreditCard, Banknote, Smartphone, Building2, AlertCircle, CheckCircle2, ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-svelte';
	import LoadingSpinner from '$lib/components/common/LoadingSpinner.svelte';
	import type { Order } from '$lib/types/order';
	import type { PageData } from './$types';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { invalidate, afterNavigate } from '$app/navigation';
	
	export let data: PageData;
	
	let orders: Order[] = data.orders;
	let filteredOrders: Order[] = [];
	let paginatedOrders: Order[] = [];
	let loading = false;
	
	// Filter state management with localStorage
	const STORAGE_KEY = 'orders-filters';
	
	// Load saved filters from localStorage or use defaults
	function loadFilters() {
		if (browser) {
			const saved = localStorage.getItem(STORAGE_KEY);
			if (saved) {
				try {
					const filters = JSON.parse(saved);
					return {
						searchQuery: filters.searchQuery || '',
						selectedStatus: filters.selectedStatus || 'all',
						selectedPaymentStatus: filters.selectedPaymentStatus || 'all',
						startDate: filters.startDate || '',
						endDate: filters.endDate || '',
						sortColumn: filters.sortColumn || '',
						sortDirection: filters.sortDirection || 'desc',
						currentPage: filters.currentPage || 1,
						itemsPerPage: filters.itemsPerPage || 10
					};
				} catch (e) {
					console.warn('Failed to parse saved filters:', e);
				}
			}
		}
		return {
			searchQuery: '',
			selectedStatus: 'all',
			selectedPaymentStatus: 'all',
			startDate: '',
			endDate: '',
			sortColumn: '',
			sortDirection: 'desc',
			currentPage: 1,
			itemsPerPage: 10
		};
	}
	
	function saveFilters() {
		if (browser) {
			const filters = {
				searchQuery,
				selectedStatus,
				selectedPaymentStatus,
				startDate,
				endDate,
				sortColumn,
				sortDirection,
				currentPage,
				itemsPerPage
			};
			localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
		}
	}
	
	function clearFilters() {
		if (browser) {
			localStorage.removeItem(STORAGE_KEY);
		}
	}
	
	// Initialize filter state
	const initialFilters = loadFilters();
	let searchQuery = initialFilters.searchQuery;
	let selectedStatus = initialFilters.selectedStatus;
	let selectedPaymentStatus = initialFilters.selectedPaymentStatus;
	let startDate = initialFilters.startDate;
	let endDate = initialFilters.endDate;
	let sortColumn = initialFilters.sortColumn;
	let sortDirection: 'asc' | 'desc' = initialFilters.sortDirection;
	let currentPage = initialFilters.currentPage;
	let itemsPerPage = initialFilters.itemsPerPage;
	
	// Pagination state
	let totalPages = 1;
	let totalItems = 0;

	// Summary statistics - reactive to filtered orders
	$: summaryStats = {
		totalCompleted: filteredOrders.filter(o => o.status === 'completed').length,
		totalPending: filteredOrders.filter(o => o.status === 'pending').length,
		totalCompletedAmount: filteredOrders
			.filter(o => o.status === 'completed')
			.reduce((sum, order) => sum + order.total_amount, 0)
	};

const statusOptions = [
	{ value: 'all', label: 'All Orders', count: 0, color: 'text-gray-600' },
	{ value: 'pending', label: 'Pending', count: 0, color: 'text-orange-600' },
	{ value: 'completed', label: 'Completed', count: 0, color: 'text-emerald-600' },
	{ value: 'cancelled', label: 'Cancelled', count: 0, color: 'text-red-600' }
];

	const paymentStatusOptions = [
		{ value: 'all', label: 'All Payments', count: 0, color: 'text-gray-600' },
		{ value: 'paid', label: 'Paid', count: 0, color: 'text-emerald-600' },
		{ value: 'unpaid', label: 'Unpaid', count: 0, color: 'text-red-600' }
	];

	const itemsPerPageOptions = [
		{ value: 5, label: '5 per page' },
		{ value: 10, label: '10 per page' },
		{ value: 20, label: '20 per page' },
		{ value: 50, label: '50 per page' }
	];

	// Function to refetch orders data
	async function refetchOrders() {
		loading = true;
		try {
			// Invalidate the current page data to trigger a fresh load
			await invalidate('/orders');
			// Force a small delay to ensure the data is updated
			await new Promise(resolve => setTimeout(resolve, 100));
			// Update the orders array with fresh data
			orders = [...data.orders]; // Create a new array to trigger reactivity
			updateCounts();
			activeDateFilter = determineActiveDateFilter();
			applyFilters();
		} catch (error) {
			console.error('Error refetching orders:', error);
		} finally {
			loading = false;
		}
	}

	onMount(async () => {
		// Refetch orders on mount to ensure we have the latest data
		await refetchOrders();
	});

	// Navigation lifecycle handler - refetch data when we navigate to the orders page
	afterNavigate(() => {
		// If we're on the orders page, refetch data
		if ($page.url.pathname === '/orders') {
			setTimeout(() => {
				refetchOrders();
			}, 100);
		}
	});

	// Reactive statement to update active date filter when date values change
	$: {
		if (startDate !== undefined || endDate !== undefined) {
			activeDateFilter = determineActiveDateFilter();
		}
	}

	// Reactive statement to update orders when page data changes (after invalidation)
	$: {
		if (data.orders && data.orders.length >= 0) {
			orders = [...data.orders]; // Create a new array to ensure reactivity
			updateCounts();
			applyFilters();
		}
	}

	function updateCounts() {
		// Status counts
		statusOptions[0].count = orders.length; // All
		statusOptions[1].count = orders.filter(o => o.status === 'pending').length;
		statusOptions[2].count = orders.filter(o => o.status === 'completed').length;
		statusOptions[3].count = orders.filter(o => o.status === 'cancelled').length;

		// Payment status counts
		paymentStatusOptions[0].count = orders.length; // All
		paymentStatusOptions[1].count = orders.filter(o => o.payment_status === 'paid').length;
		paymentStatusOptions[2].count = orders.filter(o => o.payment_status === 'unpaid').length;
	}

	function applyFilters() {
		let filtered = [...orders];

		// Filter by search query
		if (searchQuery.trim()) {
			const searchLower = searchQuery.toLowerCase();
			filtered = filtered.filter(order =>
				order.customer_name.toLowerCase().includes(searchLower) ||
				order.customer_phone?.includes(searchLower) ||
				order.order_number.toLowerCase().includes(searchLower) ||
				order.service_type.toLowerCase().includes(searchLower) ||
				order.payment_method?.toLowerCase().includes(searchLower) ||
				order.status.toLowerCase().includes(searchLower) ||
				order.payment_status.toLowerCase().includes(searchLower) ||
				order.remarks?.toLowerCase().includes(searchLower) ||
				order.total_amount.toString().includes(searchLower) ||
				order.unit_price.toString().includes(searchLower) ||
				(order.load_count?.toString() || '').includes(searchLower) ||
				(order.total_weight_kg?.toString() || '').includes(searchLower)
			);
		}

		// Filter by status
		if (selectedStatus !== 'all') {
			filtered = filtered.filter(order => order.status === selectedStatus);
		}

		// Filter by payment status
		if (selectedPaymentStatus !== 'all') {
			filtered = filtered.filter(order => order.payment_status === selectedPaymentStatus);
		}

		// Filter by date range
		if (startDate || endDate) {
			filtered = filtered.filter(order => {
				// Parse the order date and convert to local date string for comparison
				const orderDate = new Date(order.created_at);
				const orderDateString = orderDate.toLocaleDateString('en-CA'); // YYYY-MM-DD format
				
				if (startDate && endDate) {
					// Compare date strings directly to avoid timezone issues
					return orderDateString >= startDate && orderDateString <= endDate;
				} else if (startDate) {
					return orderDateString >= startDate;
				} else if (endDate) {
					return orderDateString <= endDate;
				}
				return true;
			});
		}

		// Sort orders by column if active, otherwise default to newest first
		if (sortColumn) {
			sortByColumn(filtered, sortColumn, sortDirection);
		} else {
			// Default sorting: newest first
			filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
		}
		
		filteredOrders = filtered;
		
		// Update pagination
		updatePagination();
		
		// Save filters to localStorage
		saveFilters();
	}
	
	function updatePagination() {
		totalItems = filteredOrders.length;
		totalPages = Math.ceil(totalItems / itemsPerPage);
		
		// Ensure current page is valid
		if (currentPage > totalPages && totalPages > 0) {
			currentPage = totalPages;
		} else if (currentPage < 1) {
			currentPage = 1;
		}
		
		// Calculate pagination slice
		const startIndex = (currentPage - 1) * itemsPerPage;
		const endIndex = startIndex + itemsPerPage;
		paginatedOrders = filteredOrders.slice(startIndex, endIndex);
	}
	
	function goToPage(page: number) {
		if (page >= 1 && page <= totalPages) {
			currentPage = page;
			updatePagination();
			saveFilters(); // Save pagination state
		}
	}
	
	function changeItemsPerPage(newItemsPerPage: number) {
		itemsPerPage = newItemsPerPage;
		currentPage = 1; // Reset to first page
		updatePagination();
		saveFilters(); // Save pagination state
	}
	
	function getPageNumbers() {
		const delta = 2; // Number of pages to show on each side of current page
		const range = [];
		const rangeWithDots = [];
		
		for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
			range.push(i);
		}
		
		if (currentPage - delta > 2) {
			rangeWithDots.push(1, '...');
		} else {
			rangeWithDots.push(1);
		}
		
		rangeWithDots.push(...range);
		
		if (currentPage + delta < totalPages - 1) {
			rangeWithDots.push('...', totalPages);
		} else if (totalPages > 1) {
			rangeWithDots.push(totalPages);
		}
		
		return rangeWithDots.filter((item, index, array) => array.indexOf(item) === index);
	}

	function handleColumnSort(column: string) {
		if (sortColumn === column) {
			// Toggle direction if same column
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			// Set new column and default to ascending
			sortColumn = column;
			sortDirection = 'asc';
		}
		applyFilters();
	}
	
	function clearAllFilters() {
		searchQuery = '';
		selectedStatus = 'all';
		selectedPaymentStatus = 'all';
		startDate = '';
		endDate = '';
		sortColumn = '';
		sortDirection = 'desc';
		currentPage = 1;
		activeDateFilter = 'all';
		clearFilters(); // Clear localStorage
		applyFilters();
	}

	// Active date filter tracking
	let activeDateFilter: 'today' | 'last7days' | 'all' = 'all';

	// Function to determine which filter is currently active based on date values
	function determineActiveDateFilter() {
		const today = new Date().toLocaleDateString('en-CA');
		const sevenDaysAgo = new Date();
		sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
		const sevenDaysAgoString = sevenDaysAgo.toLocaleDateString('en-CA');
		
		if (!startDate && !endDate) {
			return 'all'; // All Dates is selected when no dates are set
		} else if (startDate === today && endDate === today) {
			return 'today';
		} else if (startDate === sevenDaysAgoString && endDate === today) {
			return 'last7days';
		} else {
			return 'all'; // Custom date range or other
		}
	}

	// Quick date filter functions
	function setTodayFilter() {
		const today = new Date().toLocaleDateString('en-CA');
		startDate = today;
		endDate = today;
		activeDateFilter = 'today';
		applyFilters();
	}

	function setLast7DaysFilter() {
		const today = new Date();
		const sevenDaysAgo = new Date(today);
		sevenDaysAgo.setDate(today.getDate() - 7);
		startDate = sevenDaysAgo.toLocaleDateString('en-CA');
		endDate = today.toLocaleDateString('en-CA');
		activeDateFilter = 'last7days';
		applyFilters();
	}

	function setAllDatesFilter() {
		startDate = '';
		endDate = '';
		activeDateFilter = 'all';
		applyFilters();
	}



	function sortByColumn(orders: Order[], column: string, direction: 'asc' | 'desc') {
		orders.sort((a, b) => {
			let aValue: any;
			let bValue: any;

			switch (column) {
				case 'customer':
					aValue = a.customer_name.toLowerCase();
					bValue = b.customer_name.toLowerCase();
					break;
				case 'id':
					aValue = a.id;
					bValue = b.id;
					break;
				case 'amount':
					aValue = a.total_amount;
					bValue = b.total_amount;
					break;
				case 'status':
					aValue = a.status;
					bValue = b.status;
					break;
				case 'payment_status':
					aValue = a.payment_status;
					bValue = b.payment_status;
					break;
				case 'created_at':
					aValue = new Date(a.created_at).getTime();
					bValue = new Date(b.created_at).getTime();
					break;
				case 'quantity':
				aValue = getTotalWeight(a);
				bValue = getTotalWeight(b);
					break;
				default:
					return 0;
			}

			if (aValue < bValue) return direction === 'asc' ? -1 : 1;
			if (aValue > bValue) return direction === 'asc' ? 1 : -1;
			return 0;
		});
	}

	function getSortIcon(column: string) {
		if (sortColumn !== column) return ChevronsUpDown;
		return sortDirection === 'asc' ? ChevronUp : ChevronDown;
	}

	function getStatusColor(status: string) {
		switch (status) {
			case 'pending': return 'border-orange';
			case 'completed': return 'border-emerald';
			case 'cancelled': return 'border-red';
			default: return 'border-gray';
		}
	}

	function getStatusBadgeColor(status: string) {
		switch (status) {
			case 'pending': return 'bg-orange-100 text-orange-800 border border-orange-200';
			case 'completed': return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
			case 'cancelled': return 'bg-red-100 text-red-800 border border-red-200';
			default: return 'bg-gray-100 text-brand-800 border border-gray-200';
		}
	}

	function getStatusIcon(status: string) {
		switch (status) {
			case 'pending': return Clock;
			case 'completed': return CheckCircle;
			case 'cancelled': return XCircle;
			default: return Clock;
		}
	}

	function getStatusText(status: string) {
		switch (status) {
			case 'pending': return 'Pending';
			case 'completed': return 'Completed';
			case 'cancelled': return 'Cancelled';
			default: return status;
		}
	}

	function getStatusBadgeText(status: string) {
		switch (status) {
			case 'pending': return 'Pending';
			case 'completed': return 'Completed';
			case 'cancelled': return 'Cancelled';
			default: return status;
		}
	}

	function getPaymentMethodIcon(paymentMethod: string) {
		switch (paymentMethod) {
			case 'cash': return Banknote;
			case 'gcash': return Smartphone;
		case 'others': return CreditCard;
			default: return CreditCard;
		}
	}

	function getPaymentMethodText(paymentMethod: string) {
		switch (paymentMethod) {
			case 'cash': return 'Cash';
			case 'gcash': return 'GCash';
		case 'others': return 'Other Method';
			default: return paymentMethod;
		}
	}

	function getPaymentMethodColor(paymentMethod: string) {
		switch (paymentMethod) {
			case 'cash': return 'bg-green-100 text-green-800 border border-green-200';
			case 'gcash': return 'bg-gray-100 text-brand-800 border border-gray-200';
		case 'others': return 'bg-purple-100 text-purple-800 border border-purple-200';
			default: return 'bg-gray-100 text-brand-800 border border-gray-200';
		}
	}

	function getPaymentStatusIcon(paymentStatus: string) {
		switch (paymentStatus) {
			case 'paid': return CheckCircle2;
			case 'unpaid': return AlertCircle;
			default: return AlertCircle;
		}
	}

	function getPaymentStatusText(paymentStatus: string) {
		switch (paymentStatus) {
			case 'paid': return 'Paid';
			case 'unpaid': return 'Unpaid';
			default: return paymentStatus;
		}
	}

	function getPaymentStatusColor(paymentStatus: string) {
		switch (paymentStatus) {
			case 'paid': return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
			case 'unpaid': return 'bg-red-100 text-red-800 border border-red-200';
			default: return 'bg-gray-100 text-brand-800 border border-gray-200';
		}
	}

	function formatCurrency(amount: number) {
		return new Intl.NumberFormat('en-PH', {
			style: 'currency',
			currency: 'PHP'
		}).format(amount);
	}

	function formatDate(dateString: string) {
		return new Intl.DateTimeFormat('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			hour12: true
		}).format(new Date(dateString));
	}

	function formatDateOnly(dateString: string) {
		return new Intl.DateTimeFormat('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		}).format(new Date(dateString));
	}

	function formatTime(dateString: string) {
		return new Intl.DateTimeFormat('en-US', {
			hour: '2-digit',
			minute: '2-digit',
			hour12: true
		}).format(new Date(dateString));
	}

function getTotalWeight(order: Order) {
	if (typeof order.total_weight_kg === 'number') {
		return order.total_weight_kg;
	}
	if (typeof order.load_count === 'number' && typeof order.kg_per_load === 'number') {
		return order.load_count * order.kg_per_load;
	}
	return 0;
}
</script>

<svelte:head>
	<title>Orders - Laundry Management System</title>
	<meta name="description" content="Manage all laundry orders" />
</svelte:head>

<div class="p-4 md:p-5 lg:p-6 w-full bg-gray-50 min-h-screen">
	<!-- Header -->
	<div class="mb-6 md:mb-8">
		<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4">
			<div>
				<div class="flex items-center gap-2 md:gap-3 mb-2">
					<Package class="w-6 h-6 md:w-8 md:h-8 text-brand-800" />
					<h1 class="text-xl md:text-2xl lg:text-3xl font-bold text-brand-900">Orders</h1>
				</div>
				<p class="text-gray-600 text-sm md:text-base">Manage all your laundry orders in one place.</p>
			</div>
			<div class="flex items-center gap-3">
				<button
					on:click={refetchOrders}
					disabled={loading}
					class="inline-flex items-center px-4 py-2 text-brand-800 bg-white border border-brand-800 rounded-lg hover:bg-brand-50 transition-colors font-medium text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
					title="Refresh orders"
				>
					{#if loading}
						<LoadingSpinner size="sm" color="primary" />
					{:else}
						<svg class="w-4 md:w-5 h-4 md:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
						</svg>
					{/if}
					Refresh
				</button>
				<a href="/orders/new" class="inline-flex items-center px-4 py-2 bg-brand-800 text-white rounded-lg hover:bg-brand-900 transition-colors font-medium text-sm md:text-base">
					<Plus class="w-4 md:w-5 h-4 md:h-5 mr-2" />
					New Order
				</a>
			</div>
		</div>
	</div>

	<!-- Summary Statistics -->
	<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
		<!-- Total Completed Orders -->
		<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm font-medium text-gray-600">Completed Orders</p>
					<p class="text-2xl font-bold text-emerald-600">{summaryStats.totalCompleted}</p>
				</div>
				<div class="p-3 bg-emerald-100 rounded-full">
					<CheckCircle class="w-6 h-6 text-emerald-600" />
				</div>
			</div>
		</div>

		<!-- Total Pending Orders -->
		<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm font-medium text-gray-600">Pending Orders</p>
					<p class="text-2xl font-bold text-orange-600">{summaryStats.totalPending}</p>
				</div>
				<div class="p-3 bg-orange-100 rounded-full">
					<Clock class="w-6 h-6 text-orange-600" />
				</div>
			</div>
		</div>

		<!-- Total Amount from Completed Orders -->
		<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm font-medium text-gray-600">Completed Revenue</p>
					<p class="text-2xl font-bold text-brand-600">{formatCurrency(summaryStats.totalCompletedAmount)}</p>
				</div>
				<div class="p-3 bg-brand-100 rounded-full">
					<Scale class="w-6 h-6 text-brand-600" />
				</div>
			</div>
		</div>
	</div>

	<!-- Quick Date Actions -->
	<div class="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
		<div class="p-4 sm:p-6">
			<div class="flex items-center gap-3 mb-4">
				<Calendar class="w-5 h-5 text-brand-800" />
				<h3 class="text-lg font-medium text-gray-900">Quick Date Filters</h3>
			</div>
			<div class="flex flex-wrap gap-3">
				<button
					on:click={setTodayFilter}
					class="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 {activeDateFilter === 'today' 
						? 'bg-brand-800 text-white shadow-md' 
						: 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'}"
				>
					<Calendar class="w-4 h-4" />
					Today
				</button>
				<button
					on:click={setLast7DaysFilter}
					class="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 {activeDateFilter === 'last7days' 
						? 'bg-brand-800 text-white shadow-md' 
						: 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'}"
				>
					<Calendar class="w-4 h-4" />
					Last 7 Days
				</button>
				<button
					on:click={setAllDatesFilter}
					class="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 {activeDateFilter === 'all' 
						? 'bg-brand-800 text-white shadow-md' 
						: 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'}"
				>
					<Calendar class="w-4 h-4" />
					All Dates
				</button>
			</div>
		</div>
	</div>

	<!-- Filters Section -->
	<div class="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
		<div class="p-4 sm:p-6 border-b border-gray-200">
			<div class="flex items-center gap-2">
				<Filter class="w-5 h-5 text-gray-600" />
				<h2 class="text-lg font-medium text-gray-900">Filters</h2>
			</div>
		</div>
		
		<div class="p-4 sm:p-6">
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<!-- Search Filter -->
				<div>
					<label for="searchQuery" class="block text-sm font-medium text-gray-700 mb-2">
						Search
					</label>
					<div class="relative">
						<Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
						<input
							id="searchQuery"
							type="text"
							placeholder="Search"
							bind:value={searchQuery}
							on:input={applyFilters}
							class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
						/>
					</div>
				</div>
				
				<!-- Status Filter -->
				<div>
					<label for="statusFilter" class="block text-sm font-medium text-gray-700 mb-2">
						Order Status
					</label>
					<select
						id="statusFilter"
						bind:value={selectedStatus}
						on:change={applyFilters}
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
					>
						{#each statusOptions as option}
							<option value={option.value}>{option.label} ({option.count})</option>
						{/each}
					</select>
				</div>

				<!-- Payment Status Filter -->
				<div>
					<label for="paymentStatusFilter" class="block text-sm font-medium text-gray-700 mb-2">
						Payment Status
					</label>
					<select
						id="paymentStatusFilter"
						bind:value={selectedPaymentStatus}
						on:change={applyFilters}
						class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
					>
						{#each paymentStatusOptions as option}
							<option value={option.value}>{option.label} ({option.count})</option>
						{/each}
					</select>
				</div>

				<!-- Date Range Filter -->
				<div>
					<label for="startDate" class="block text-sm font-medium text-gray-700 mb-2">
						Date Range
					</label>
					<div class="grid grid-cols-2 gap-2">
						<div>
							<input
								id="startDate"
								type="date"
								bind:value={startDate}
								on:change={() => {
									activeDateFilter = determineActiveDateFilter();
									applyFilters();
								}}
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm"
								placeholder="Start date"
							/>
						</div>
						<div>
							<input
								id="endDate"
								type="date"
								bind:value={endDate}
								on:change={() => {
									activeDateFilter = determineActiveDateFilter();
									applyFilters();
								}}
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm"
								placeholder="End date"
							/>
						</div>
					</div>
				</div>
			</div>

			<!-- Filter Actions -->
			{#if searchQuery || selectedStatus !== 'all' || selectedPaymentStatus !== 'all' || startDate || endDate}
				<div class="flex items-center gap-3 mt-6">
					<button
						on:click={clearAllFilters}
						class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
					>
						Clear All
					</button>
				</div>
			{/if}
		</div>
		
		<!-- Filter Status Display -->
		{#if selectedStatus !== 'all' || selectedPaymentStatus !== 'all' || searchQuery || startDate || endDate}
			<div class="p-4 sm:p-6 border-t border-gray-200 bg-gray-50">
				<div class="flex flex-wrap items-center gap-3 text-sm">
					<span class="text-gray-600">Applied filters:</span>
					
					{#if searchQuery}
						<span class="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full">
							Search: "{searchQuery}"
							<button 
								on:click={() => { searchQuery = ''; applyFilters(); }}
								class="text-blue-500 hover:text-blue-800"
								title="Clear search"
							>
								<XCircle class="w-4 h-4" />
							</button>
						</span>
					{/if}
					
					{#if selectedStatus !== 'all'}
						<span class="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
							{statusOptions.find(o => o.value === selectedStatus)?.label}
							<button 
								on:click={() => { selectedStatus = 'all'; applyFilters(); }}
								class="text-gray-500 hover:text-brand-800"
								title="Clear status filter"
							>
								<XCircle class="w-4 h-4" />
							</button>
						</span>
					{/if}
					
					{#if selectedPaymentStatus !== 'all'}
						<span class="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
							{paymentStatusOptions.find(o => o.value === selectedPaymentStatus)?.label}
							<button 
								on:click={() => { selectedPaymentStatus = 'all'; applyFilters(); }}
								class="text-gray-500 hover:text-brand-800"
								title="Clear payment filter"
							>
								<XCircle class="w-4 h-4" />
							</button>
						</span>
					{/if}

					{#if startDate || endDate}
						<span class="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full">
							<Calendar class="w-4 h-4" />
							{startDate && endDate ? `${formatDateOnly(startDate)} to ${formatDateOnly(endDate)}` : startDate ? `From ${formatDateOnly(startDate)}` : `Until ${formatDateOnly(endDate)}`}
							<button 
								on:click={() => { 
									startDate = ''; 
									endDate = ''; 
									activeDateFilter = 'all'; 
									applyFilters(); 
								}}
								class="text-green-500 hover:text-green-800"
								title="Clear date filter"
							>
								<XCircle class="w-4 h-4" />
							</button>
						</span>
					{/if}
				</div>
			</div>
		{/if}
	</div>

	<!-- Orders List - Simple Paper-like Design -->
	<div class="bg-white rounded-lg shadow-sm border border-gray-200">
		{#if loading}
			<div class="flex justify-center items-center min-h-64">
				<LoadingSpinner size="xl" color="primary" message="Loading orders..." center={true} />
			</div>
		{:else if filteredOrders.length === 0}
			<div class="text-center py-12 px-4">
				<Package class="w-12 md:w-16 h-12 md:h-16 text-gray-300 mx-auto mb-4" />
				<h3 class="text-lg font-medium text-brand-900 mb-2">No orders found</h3>
				<p class="text-gray-600 mb-6 text-sm md:text-base">
					{searchQuery || selectedStatus !== 'all' || selectedPaymentStatus !== 'all' || startDate || endDate
						? 'Try adjusting your search or filters.' 
						: 'Get started by creating your first order.'}
				</p>
				{#if !searchQuery && selectedStatus === 'all' && selectedPaymentStatus === 'all' && !startDate && !endDate}
					<a href="/orders/new" class="inline-flex items-center px-4 py-2 bg-brand-800 text-white rounded-lg hover:bg-brand-900 transition-colors text-sm md:text-base">
						<Plus class="w-4 md:w-5 h-4 md:h-5 mr-2" />
						Create First Order
					</a>
				{/if}
			</div>
		{:else}
			<!-- Simple Paper-like Header -->
			<div class="border-b border-gray-200 p-4 md:p-6 bg-gray-50">
				<h2 class="text-lg font-semibold text-brand-900 mb-2">Order List</h2>
				<p class="text-sm text-gray-600">
					Showing {paginatedOrders.length} of {totalItems} orders
					{#if totalItems !== orders.length}(filtered from {orders.length} total){/if}
				</p>
			</div>

			<!-- Simple Paper-like Order Rows -->
			<div class="divide-y divide-gray-200">
				{#each paginatedOrders as order}
					<!-- Unified Simple Row Design -->
					<div 
						class="p-4 md:p-6 hover:bg-gray-50 transition-colors border-l-4 {getStatusColor(order.status)}-500 cursor-pointer"
						on:click={() => window.location.href = `/orders/${order.id}`}
						on:keydown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault();
								window.location.href = `/orders/${order.id}`;
							}
						}}
						role="button"
						tabindex="0"
						title="Click to view order details"
					>
						<div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
							<!-- Left Side: Main Order Info -->
							<div class="flex-1 space-y-2">
								<!-- Row 1: Customer & Order ID -->
								<div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
									<h3 class="text-lg font-semibold text-brand-900">{order.customer_name}</h3>
									<span class="text-sm font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">{order.order_number}</span>
								</div>
								
								<!-- Row 2: Service & Weight -->
								<div class="flex items-center gap-4 text-sm text-gray-600">
									<span>{order.service_type}</span>
									<span class="flex items-center gap-1">
										<Package class="w-4 h-4" />
										{Math.round(order.load_count || 0)} {Math.round(order.load_count || 0) === 1 ? 'load' : 'loads'}
									</span>
									<span class="flex items-center gap-1">
										<Scale class="w-4 h-4" />
										{getTotalWeight(order).toFixed(2)} kg
									</span>
									<span>{formatDate(order.created_at)}</span>
								</div>
								
								<!-- Row 3: Add-ons (if any) -->
								{#if order.add_ons_list && order.add_ons_list.length > 0}
									<div class="flex items-center gap-1 text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
										<Plus class="w-4 h-4" />
										{order.add_ons_list}
									</div>
								{/if}
								
								<!-- Row 4: Phone (if available) -->
								{#if order.customer_phone}
									<div class="flex items-center gap-1 text-sm text-gray-500">
										<Phone class="w-4 h-4" />
										{order.customer_phone}
									</div>
								{/if}
							</div>

							<!-- Right Side: Status, Payment & Actions -->
							<div class="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
								<!-- Status & Payment Badges -->
								<div class="flex flex-col gap-2">
									<!-- Order Status -->
									<span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium {getStatusBadgeColor(order.status)}">
										<svelte:component this={getStatusIcon(order.status)} class="w-4 h-4" />
										{getStatusBadgeText(order.status)}
									</span>
									<!-- Payment Status -->
									<span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium {getPaymentStatusColor(order.payment_status)}">
										<svelte:component this={getPaymentStatusIcon(order.payment_status)} class="w-4 h-4" />
										{getPaymentStatusText(order.payment_status)}
									</span>
								</div>
								
								<!-- Payment Amount -->
								<div class="text-right">
									<p class="text-xl font-bold text-brand-900">{formatCurrency(order.total_amount)}</p>
									<p class="text-sm text-gray-500">₱{order.unit_price}/load</p>
								</div>
								
								<!-- Action Buttons -->
								<div class="flex items-center gap-2">
									<a 
										href="/orders/{order.id}" 
										class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-brand-900 border border-brand-900 rounded-lg hover:bg-brand-800 hover:border-brand-800 transition-colors shadow-sm hover:shadow-md"
										on:click|stopPropagation
										title="View order details"
									>
										<Eye class="w-3.5 h-3.5" />
										View
									</a>
									<a 
										href="/orders/{order.id}/edit" 
										class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-brand-900 border border-brand-900 rounded-lg hover:bg-brand-800 hover:border-brand-800 transition-colors shadow-sm hover:shadow-md"
										on:click|stopPropagation
										title="Edit order"
									>
										<Edit3 class="w-3.5 h-3.5" />
										Edit
									</a>
								</div>
							</div>
						</div>
						
						<!-- Remarks (if any) -->
						{#if order.remarks}
							<div class="mt-3 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
								<p class="text-sm text-yellow-800"><strong>Note:</strong> {order.remarks}</p>
							</div>
						{/if}
					</div>
				{/each}
			</div>

			<!-- Simple Footer -->
			<div class="border-t border-gray-200 bg-gray-50 px-4 md:px-6 py-4 rounded-b-lg">
				<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<!-- Results count -->
					<div class="text-sm text-gray-600">
						{#if totalItems > 0}
							Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} orders
							{#if totalItems !== orders.length} (filtered){/if}
						{:else}
							No orders found
						{/if}
					</div>

					<!-- Simple Pagination -->
					{#if totalPages > 1}
						<div class="flex items-center gap-2">
							<button
								on:click={() => goToPage(currentPage - 1)}
								disabled={currentPage <= 1}
								class="px-3 py-2 text-sm font-medium text-gray-600 hover:text-brand-900 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								← Previous
							</button>
							
							<span class="px-3 py-2 text-sm font-medium text-brand-900 bg-white border border-gray-300 rounded">
								Page {currentPage} of {totalPages}
							</span>
							
							<button
								on:click={() => goToPage(currentPage + 1)}
								disabled={currentPage >= totalPages}
								class="px-3 py-2 text-sm font-medium text-gray-600 hover:text-brand-900 disabled:opacity-50 disabled:cursor-not-allowed"
							>
								Next →
							</button>
						</div>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</div>
