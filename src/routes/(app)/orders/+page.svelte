<script lang="ts">
	import { onMount } from 'svelte';
	import { Search, Plus, Filter, Eye, Edit3, Package, Clock, CheckCircle, XCircle, Trash2, Phone, Calendar, Scale, CreditCard, Banknote, Smartphone, Building2, AlertCircle, CheckCircle2, ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-svelte';
	import LoadingSpinner from '$lib/components/common/LoadingSpinner.svelte';
	import type { Order } from '$lib/types/order';
	import type { PageData } from './$types';
	export let data: PageData;
	
	let orders: Order[] = data.orders;
	let filteredOrders: Order[] = [];
	let paginatedOrders: Order[] = [];
	let loading = false;
	let searchQuery = '';
	let selectedStatus = 'all';
	let selectedPaymentStatus = 'all';
	let sortColumn = '';
	let sortDirection: 'asc' | 'desc' = 'desc';
	
	// Pagination state
	let currentPage = 1;
	let itemsPerPage = 10;
	let totalPages = 1;
	let totalItems = 0;

	const statusOptions = [
		{ value: 'all', label: 'All Orders', count: 0, color: 'text-gray-600' },
		{ value: 'pending', label: 'Pending', count: 0, color: 'text-orange-600' },
		{ value: 'processing', label: 'Processing', count: 0, color: 'text-blue-700' },
		{ value: 'ready', label: 'Ready', count: 0, color: 'text-purple-600' },
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
	];	onMount(async () => {
		// Setup order counts and filtering
		updateCounts();
		applyFilters();
	});

	function updateCounts() {
		// Status counts
		statusOptions[0].count = orders.length; // All
		statusOptions[1].count = orders.filter(o => o.status === 'pending').length;
		statusOptions[2].count = orders.filter(o => o.status === 'processing').length;
		statusOptions[3].count = orders.filter(o => o.status === 'ready').length;
		statusOptions[4].count = orders.filter(o => o.status === 'completed').length;
		statusOptions[5].count = orders.filter(o => o.status === 'cancelled').length;

		// Payment status counts
		paymentStatusOptions[0].count = orders.length; // All
		paymentStatusOptions[1].count = orders.filter(o => o.payment_status === 'paid').length;
		paymentStatusOptions[2].count = orders.filter(o => o.payment_status === 'unpaid').length;
	}	function applyFilters() {
		let filtered = [...orders];

		// Filter by search query
		if (searchQuery.trim()) {
			const searchLower = searchQuery.toLowerCase();
			filtered = filtered.filter(order =>
				order.customer_name.toLowerCase().includes(searchLower) ||
				order.customer_phone?.includes(searchLower) ||
				order.order_number.toLowerCase().includes(searchLower)
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
		}
	}
	
	function changeItemsPerPage(newItemsPerPage: number) {
		itemsPerPage = newItemsPerPage;
		currentPage = 1; // Reset to first page
		updatePagination();
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

	function sortByColumn(orders: Order[], column: string, direction: 'asc' | 'desc') {
		orders.sort((a, b) => {
			let aValue: any;
			let bValue: any;

			switch (column) {
				case 'customer':
					aValue = a.customer_name.toLowerCase();
					bValue = b.customer_name.toLowerCase();
					break;
				case 'order_number':
					aValue = a.order_number;
					bValue = b.order_number;
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
					aValue = a.quantity || 0;
					bValue = b.quantity || 0;
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
			case 'processing': return 'border-blue';
			case 'ready': return 'border-purple';
			case 'completed': return 'border-emerald';
			case 'cancelled': return 'border-red';
			default: return 'border-gray';
		}
	}

	function getStatusBadgeColor(status: string) {
		switch (status) {
			case 'pending': return 'bg-orange-100 text-orange-800 border border-orange-200';
			case 'processing': return 'bg-blue-100 text-blue-800 border border-blue-200';
			case 'ready': return 'bg-purple-100 text-purple-800 border border-purple-200';
			case 'completed': return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
			case 'cancelled': return 'bg-red-100 text-red-800 border border-red-200';
			default: return 'bg-gray-100 text-brand-800 border border-gray-200';
		}
	}
	function getStatusIcon(status: string) {
		switch (status) {
			case 'pending': return Clock;
			case 'processing': return Package;
			case 'ready': return CheckCircle;
			case 'completed': return CheckCircle;
			case 'cancelled': return XCircle;
			default: return Clock;
		}
	}	function getStatusText(status: string) {
		switch (status) {
			case 'pending': return 'Pending';
			case 'processing': return 'Processing';
			case 'ready': return 'Ready for Pickup';
			case 'completed': return 'Completed';
			case 'cancelled': return 'Cancelled';
			default: return status;
		}
	}

	function getStatusBadgeText(status: string) {
		switch (status) {
			case 'pending': return 'Pending';
			case 'processing': return 'Processing';
			case 'ready': return 'Ready';
			case 'completed': return 'Completed';
			case 'cancelled': return 'Cancelled';
			default: return status;
		}
	}

	function getPaymentMethodIcon(paymentMethod: string) {
		switch (paymentMethod) {
			case 'cash': return Banknote;
			case 'gcash': return Smartphone;
			case 'paymaya': return Smartphone;
			case 'bank_transfer': return Building2;
			case 'credit_card': return CreditCard;
			default: return CreditCard;
		}
	}

	function getPaymentMethodText(paymentMethod: string) {
		switch (paymentMethod) {
			case 'cash': return 'Cash';
			case 'gcash': return 'GCash';
			case 'paymaya': return 'PayMaya';
			case 'bank_transfer': return 'Bank Transfer';
			case 'credit_card': return 'Credit Card';
			default: return paymentMethod;
		}
	}

	function getPaymentMethodColor(paymentMethod: string) {
		switch (paymentMethod) {
			case 'cash': return 'bg-green-100 text-green-800 border border-green-200';
			case 'gcash': return 'bg-gray-100 text-brand-800 border border-gray-200';
			case 'paymaya': return 'bg-pink-100 text-pink-800 border border-pink-200';
			case 'bank_transfer': return 'bg-purple-100 text-purple-800 border border-purple-200';
			case 'credit_card': return 'bg-indigo-100 text-indigo-800 border border-indigo-200';
			default: return 'bg-gray-100 text-brand-800 border border-gray-200';
		}
	}

	function getPaymentStatusIcon(paymentStatus: string) {
		switch (paymentStatus) {
			case 'paid': return CheckCircle2;
			case 'unpaid': return AlertCircle;
			case 'partial': return Clock;
			default: return AlertCircle;
		}
	}

	function getPaymentStatusText(paymentStatus: string) {
		switch (paymentStatus) {
			case 'paid': return 'Paid';
			case 'unpaid': return 'Unpaid';
			case 'partial': return 'Partial';
			default: return paymentStatus;
		}
	}

	function getPaymentStatusColor(paymentStatus: string) {
		switch (paymentStatus) {
			case 'paid': return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
			case 'unpaid': return 'bg-red-100 text-red-800 border border-red-200';
			case 'partial': return 'bg-amber-100 text-amber-800 border border-amber-200';
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
		return order.quantity || 0;
	}	// Reactive statements
	$: if (searchQuery !== '' || selectedStatus !== 'all' || selectedPaymentStatus !== 'all' || sortColumn || sortDirection) {
		currentPage = 1; // Reset to first page when filters change
		applyFilters();
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
				<a href="/orders/new" class="inline-flex items-center px-4 py-2 bg-brand-800 text-white rounded-lg hover:bg-brand-900 transition-colors font-medium text-sm md:text-base">
					<Plus class="w-4 md:w-5 h-4 md:h-5 mr-2" />
					New Order
				</a>
			</div>
		</div>
	</div>	<!-- Simple Search and Filters -->
	<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 mb-6">
		<div class="flex flex-col md:flex-row gap-4 md:gap-6">
			<!-- Search -->
			<div class="flex-1">
				<div class="relative">
					<Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
					<input
						type="text"
						placeholder="Search by customer name, phone, or order number..."
						bind:value={searchQuery}
						class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
					/>
				</div>
			</div>
			
			<!-- Status Filter -->
			<div class="md:w-48">
				<select
					bind:value={selectedStatus}
					class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-base"
				>
					{#each statusOptions as option}
						<option value={option.value}>{option.label} ({option.count})</option>
					{/each}
				</select>
			</div>

			<!-- Payment Status Filter -->
			<div class="md:w-40">
				<select
					bind:value={selectedPaymentStatus}
					class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white text-base"
				>
					{#each paymentStatusOptions as option}
						<option value={option.value}>{option.label}</option>
					{/each}
				</select>
			</div>
		</div>
		
		<!-- Simple Filter Status -->
		{#if selectedStatus !== 'all' || selectedPaymentStatus !== 'all' || searchQuery}
			<div class="mt-4 pt-4 border-t border-gray-200">
				<div class="flex flex-wrap items-center gap-3 text-sm">
					<span class="text-gray-600">Applied filters:</span>
					
					{#if searchQuery}
						<span class="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full">
							Search: "{searchQuery}"
							<button 
								on:click={() => { searchQuery = ''; }}
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
								on:click={() => { selectedStatus = 'all'; }}
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
								on:click={() => { selectedPaymentStatus = 'all'; }}
								class="text-gray-500 hover:text-brand-800"
								title="Clear payment filter"
							>
								<XCircle class="w-4 h-4" />
							</button>
						</span>
					{/if}
					
					<button 
						on:click={() => { 
							searchQuery = '';
							selectedStatus = 'all'; 
							selectedPaymentStatus = 'all'; 
						}}
						class="text-red-600 hover:text-red-800 text-sm font-medium"
					>
						Clear All
					</button>
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
					{searchQuery || selectedStatus !== 'all' || selectedPaymentStatus !== 'all'
						? 'Try adjusting your search or filters.' 
						: 'Get started by creating your first order.'}
				</p>
				{#if !searchQuery && selectedStatus === 'all' && selectedPaymentStatus === 'all'}
					<a href="/orders/new" class="inline-flex items-center px-4 py-2 bg-brand-800 text-white rounded-lg hover:bg-brand-900 transition-colors text-sm md:text-base">
						<Plus class="w-4 md:w-5 h-4 md:h-5 mr-2" />
						Create First Order
					</a>
				{/if}
			</div>		{:else}
			<!-- Simple Paper-like Header -->
			<div class="border-b border-gray-200 p-4 md:p-6 bg-gray-50">
				<h2 class="text-lg font-semibold text-brand-900 mb-2">Order List</h2>
				<p class="text-sm text-gray-600">
					Showing {paginatedOrders.length} of {totalItems} orders
					{#if totalItems !== orders.length}(filtered from {orders.length} total){/if}
				</p>
			</div>			<!-- Simple Paper-like Order Rows -->
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
								<!-- Row 1: Customer & Order Number -->
								<div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
									<h3 class="text-lg font-semibold text-brand-900">{order.customer_name}</h3>
									<span class="text-sm font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">{order.order_number}</span>
								</div>
								
								<!-- Row 2: Service & Weight -->
								<div class="flex items-center gap-4 text-sm text-gray-600">
									<span>{order.service_type}</span>
									<span class="flex items-center gap-1">
										<Scale class="w-4 h-4" />
										{order.quantity} kg
									</span>
									<span>{formatDateOnly(order.created_at)}</span>
								</div>
								
								<!-- Row 3: Phone (if available) -->
								{#if order.customer_phone}
									<div class="flex items-center gap-1 text-sm text-gray-500">
										<Phone class="w-4 h-4" />
										{order.customer_phone}
									</div>
								{/if}
							</div>							<!-- Right Side: Status, Payment & Actions -->
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
									<p class="text-sm text-gray-500">₱{order.unit_price}/kg</p>
								</div>
								
								<!-- Simple Actions -->
								<div class="flex items-center gap-2">
									<a 
										href="/orders/{order.id}" 
										class="text-blue-600 hover:text-blue-800 text-sm font-medium"
										on:click|stopPropagation
									>
										View
									</a>
									<span class="text-gray-300">|</span>
									<a 
										href="/orders/{order.id}/edit" 
										class="text-green-600 hover:text-green-800 text-sm font-medium"
										on:click|stopPropagation
									>
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
			</div>			<!-- Simple Footer -->
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
			</div>		{/if}
	</div>
</div>
