<script lang="ts">
	import { onMount } from 'svelte';
	import { Search, Plus, Filter, Eye, Edit3, Package, Clock, CheckCircle, XCircle, Trash2, Phone, Calendar, Scale, CreditCard, Banknote, Smartphone, Building2, AlertCircle, CheckCircle2, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-svelte';
	import LoadingSpinner from '$lib/components/common/LoadingSpinner.svelte';
	import type { Order } from '$lib/types/order';
	import type { PageData } from './$types';
	export let data: PageData;
	
	let orders: Order[] = data.orders;
	let filteredOrders: Order[] = [];
	let loading = false;
	let searchQuery = '';
	let selectedStatus = 'all';
	let sortColumn = '';
	let sortDirection: 'asc' | 'desc' = 'desc';

	const statusOptions = [
		{ value: 'all', label: 'All Orders', count: 0, color: 'text-gray-600' },
		{ value: 'pending', label: 'Pending', count: 0, color: 'text-orange-600' },
		{ value: 'processing', label: 'Processing', count: 0, color: 'text-gray-700' },
		{ value: 'ready', label: 'Ready', count: 0, color: 'text-purple-600' },
		{ value: 'completed', label: 'Completed', count: 0, color: 'text-emerald-600' },
		{ value: 'cancelled', label: 'Cancelled', count: 0, color: 'text-red-600' }
	];	onMount(async () => {
		// Initialize with server data
		updateCounts();
		applyFilters();
	});

	function updateCounts() {
		statusOptions[0].count = orders.length; // All
		statusOptions[1].count = orders.filter(o => o.status === 'pending').length;
		statusOptions[2].count = orders.filter(o => o.status === 'processing').length;
		statusOptions[3].count = orders.filter(o => o.status === 'ready').length;
		statusOptions[4].count = orders.filter(o => o.status === 'completed').length;
		statusOptions[5].count = orders.filter(o => o.status === 'cancelled').length;
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

		// Sort orders by column if active, otherwise default to newest first
		if (sortColumn) {
			sortByColumn(filtered, sortColumn, sortDirection);
		} else {
			// Default sorting: newest first
			filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
		}
		
		filteredOrders = filtered;
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
			case 'pending': return 'bg-orange-50 text-orange-700 border-orange-200';
			case 'processing': return 'bg-gray-50 text-gray-700 border-gray-200';
			case 'ready': return 'bg-purple-50 text-purple-700 border-purple-200';
			case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
			case 'cancelled': return 'bg-red-50 text-red-700 border-red-200';
			default: return 'bg-gray-50 text-gray-700 border-gray-200';
		}
	}

	function getStatusBadgeColor(status: string) {
		switch (status) {
			case 'pending': return 'bg-orange-100 text-orange-800 border border-orange-200';
			case 'processing': return 'bg-gray-100 text-gray-800 border border-gray-200';
			case 'ready': return 'bg-purple-100 text-purple-800 border border-purple-200';
			case 'completed': return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
			case 'cancelled': return 'bg-red-100 text-red-800 border border-red-200';
			default: return 'bg-gray-100 text-gray-800 border border-gray-200';
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
			case 'gcash': return 'bg-gray-100 text-gray-800 border border-gray-200';
			case 'paymaya': return 'bg-pink-100 text-pink-800 border border-pink-200';
			case 'bank_transfer': return 'bg-purple-100 text-purple-800 border border-purple-200';
			case 'credit_card': return 'bg-indigo-100 text-indigo-800 border border-indigo-200';
			default: return 'bg-gray-100 text-gray-800 border border-gray-200';
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
			default: return 'bg-gray-100 text-gray-800 border border-gray-200';
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
	$: if (searchQuery !== '' || selectedStatus !== 'all' || sortColumn || sortDirection) {
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
					<Package class="w-6 h-6 md:w-8 md:h-8 text-gray-800" />
					<h1 class="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">Orders</h1>
				</div>
				<p class="text-gray-600 text-sm md:text-base">Manage all your laundry orders in one place.</p>
			</div>
			<div class="flex items-center gap-3">
				<a href="/orders/new" class="inline-flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors font-medium text-sm md:text-base">
					<Plus class="w-4 md:w-5 h-4 md:h-5 mr-2" />
					New Order
				</a>
			</div>
		</div>
	</div>	<!-- Filters and Search -->
	<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 mb-6">
		<div class="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
			<!-- Search -->
			<div class="relative">
				<Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
				<input
					type="text"
					placeholder="Search orders, customers, or phone..."
					bind:value={searchQuery}
					class="w-full pl-9 md:pl-10 pr-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-sm md:text-base"
				/>
			</div>
			
			<!-- Status Filter -->
			<div class="relative">
				<Filter class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
				<select
					bind:value={selectedStatus}
					class="w-full pl-9 md:pl-10 pr-8 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 appearance-none bg-white text-sm md:text-base"
				>
					{#each statusOptions as option}
						<option value={option.value} class={option.color}>{option.label} ({option.count})</option>
					{/each}
				</select>
			</div>
		</div>
		<!-- Mobile Sort Options -->
		<div class="lg:hidden mt-4 pt-4 border-t border-gray-200">
			<label for="mobile-sort" class="block text-sm font-medium text-gray-700 mb-2">Sort by:</label>
			<select
				id="mobile-sort"
				on:change={(e) => {
					const target = e.target as HTMLSelectElement;
					const value = target.value;
					if (value === 'none') {
						sortColumn = '';
					} else {
						const [column, direction] = value.split('-');
						sortColumn = column;
						sortDirection = direction as 'asc' | 'desc';
					}
					applyFilters();
				}}
				class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-sm"
			>
				<option value="none">Default (Newest first)</option>
				<option value="customer-asc" selected={sortColumn === 'customer' && sortDirection === 'asc'}>Customer (A-Z)</option>
				<option value="customer-desc" selected={sortColumn === 'customer' && sortDirection === 'desc'}>Customer (Z-A)</option>
				<option value="created_at-desc" selected={sortColumn === 'created_at' && sortDirection === 'desc'}>Date (Newest first)</option>
				<option value="created_at-asc" selected={sortColumn === 'created_at' && sortDirection === 'asc'}>Date (Oldest first)</option>
				<option value="amount-desc" selected={sortColumn === 'amount' && sortDirection === 'desc'}>Amount (High to Low)</option>
				<option value="amount-asc" selected={sortColumn === 'amount' && sortDirection === 'asc'}>Amount (Low to High)</option>
				<option value="status-asc" selected={sortColumn === 'status' && sortDirection === 'asc'}>Status (A-Z)</option>
				<option value="status-desc" selected={sortColumn === 'status' && sortDirection === 'desc'}>Status (Z-A)</option>
			</select>
		</div>
		
		<!-- Sort indicator -->
		{#if sortColumn}
			<div class="mt-3 flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-800">
				<div class="flex items-center gap-2">
					<svelte:component this={getSortIcon(sortColumn)} class="w-4 h-4" />
					<span>Sorted by {sortColumn.replace('_', ' ')} ({sortDirection === 'asc' ? 'ascending' : 'descending'})</span>
				</div>
				<button 
					on:click={() => { sortColumn = ''; applyFilters(); }}
					class="text-gray-500 hover:text-red-600 transition-colors text-sm flex items-center gap-1"
					title="Clear sorting"
				>
					<XCircle class="w-4 h-4" />
					Clear sorting
				</button>
			</div>
		{/if}
	</div>
	<!-- Orders List -->
	<div class="bg-white rounded-xl shadow-sm border border-gray-100">
		{#if loading}
			<div class="flex justify-center items-center min-h-64">
				<LoadingSpinner size="xl" color="primary" message="Loading orders..." center={true} />
			</div>
		{:else if filteredOrders.length === 0}
			<div class="text-center py-12 px-4">
				<Package class="w-12 md:w-16 h-12 md:h-16 text-gray-300 mx-auto mb-4" />
				<h3 class="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
				<p class="text-gray-600 mb-6 text-sm md:text-base">
					{searchQuery || selectedStatus !== 'all' 
						? 'Try adjusting your search or filters.' 
						: 'Get started by creating your first order.'}
				</p>
				{#if !searchQuery && selectedStatus === 'all'}
					<a href="/orders/new" class="inline-flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors text-sm md:text-base">
						<Plus class="w-4 md:w-5 h-4 md:h-5 mr-2" />
						Create First Order
					</a>
				{/if}
			</div>		{:else}
			<!-- Desktop Table Header -->
			<div class="hidden xl:block border-b border-gray-100 p-4 md:p-6">
				<div class="grid grid-cols-12 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wide">
					<!-- Customer - Sortable -->
					<div class="col-span-3">
						<button 
							class="flex items-center gap-1 hover:text-gray-700 transition-colors group"
							on:click={() => handleColumnSort('customer')}
						>
							Customer
							<svelte:component 
								this={getSortIcon('customer')} 
								class="w-3 h-3 {sortColumn === 'customer' ? 'text-gray-800' : 'text-gray-400 group-hover:text-gray-600'}" 
							/>
						</button>
					</div>
					
					<!-- Order Details - Sortable -->
					<div class="col-span-2">
						<button 
							class="flex items-center gap-1 hover:text-gray-700 transition-colors group"
							on:click={() => handleColumnSort('created_at')}
						>
							Order Details
							<svelte:component 
								this={getSortIcon('created_at')} 
								class="w-3 h-3 {sortColumn === 'created_at' ? 'text-gray-800' : 'text-gray-400 group-hover:text-gray-600'}" 
							/>
						</button>
					</div>
					
					<!-- Service - Sortable -->
					<div class="col-span-1">
						<button 
							class="flex items-center gap-1 hover:text-gray-700 transition-colors group"
							on:click={() => handleColumnSort('quantity')}
						>
							Service
							<svelte:component 
								this={getSortIcon('quantity')} 
								class="w-3 h-3 {sortColumn === 'quantity' ? 'text-gray-800' : 'text-gray-400 group-hover:text-gray-600'}" 
							/>
						</button>
					</div>
					
					<!-- Status - Sortable -->
					<div class="col-span-1">
						<button 
							class="flex items-center gap-1 hover:text-gray-700 transition-colors group"
							on:click={() => handleColumnSort('status')}
						>
							Status
							<svelte:component 
								this={getSortIcon('status')} 
								class="w-3 h-3 {sortColumn === 'status' ? 'text-gray-800' : 'text-gray-400 group-hover:text-gray-600'}" 
							/>
						</button>
					</div>
					
					<!-- Payment - Sortable -->
					<div class="col-span-2">
						<button 
							class="flex items-center gap-1 hover:text-gray-700 transition-colors group"
							on:click={() => handleColumnSort('amount')}
						>
							Payment
							<svelte:component 
								this={getSortIcon('amount')} 
								class="w-3 h-3 {sortColumn === 'amount' ? 'text-gray-800' : 'text-gray-400 group-hover:text-gray-600'}" 
							/>
						</button>
					</div>
					
					<!-- Dates - Non-sortable for now -->
					<div class="col-span-2">Dates</div>
					
					<!-- Actions - Non-sortable -->
					<div class="col-span-1">Actions</div>
				</div>
			</div>

			<!-- Tablet Table Header (Simplified Layout) -->
			<div class="hidden lg:block xl:hidden border-b border-gray-100 p-4 md:p-6">
				<div class="grid grid-cols-10 gap-3 text-xs font-medium text-gray-500 uppercase tracking-wide">
					<!-- Customer - Sortable -->
					<div class="col-span-3">
						<button 
							class="flex items-center gap-1 hover:text-gray-700 transition-colors group"
							on:click={() => handleColumnSort('customer')}
						>
							Customer
							<svelte:component 
								this={getSortIcon('customer')} 
								class="w-3 h-3 {sortColumn === 'customer' ? 'text-gray-800' : 'text-gray-400 group-hover:text-gray-600'}" 
							/>
						</button>
					</div>
					
					<!-- Order Details - Sortable -->
					<div class="col-span-2">
						<button 
							class="flex items-center gap-1 hover:text-gray-700 transition-colors group"
							on:click={() => handleColumnSort('created_at')}
						>
							Order Details
							<svelte:component 
								this={getSortIcon('created_at')} 
								class="w-3 h-3 {sortColumn === 'created_at' ? 'text-gray-800' : 'text-gray-400 group-hover:text-gray-600'}" 
							/>
						</button>
					</div>
					
					<!-- Status - Sortable -->
					<div class="col-span-2">
						<button 
							class="flex items-center gap-1 hover:text-gray-700 transition-colors group"
							on:click={() => handleColumnSort('status')}
						>
							Status
							<svelte:component 
								this={getSortIcon('status')} 
								class="w-3 h-3 {sortColumn === 'status' ? 'text-gray-800' : 'text-gray-400 group-hover:text-gray-600'}" 
							/>
						</button>
					</div>
					
					<!-- Payment - Sortable -->
					<div class="col-span-2">
						<button 
							class="flex items-center gap-1 hover:text-gray-700 transition-colors group"
							on:click={() => handleColumnSort('amount')}
						>
							Payment
							<svelte:component 
								this={getSortIcon('amount')} 
								class="w-3 h-3 {sortColumn === 'amount' ? 'text-gray-800' : 'text-gray-400 group-hover:text-gray-600'}" 
							/>
						</button>
					</div>
					
					<!-- Actions - Non-sortable -->
					<div class="col-span-1">Actions</div>
				</div>
			</div>			<!-- Orders List -->
			<div class="space-y-4">
				{#each filteredOrders as order}
					<!-- Desktop Layout (xl and up) -->
					<div class="hidden xl:block border border-gray-200 rounded-lg p-4 md:p-6 hover:border-gray-300 hover:shadow-md transition-all duration-200">
						<div class="grid grid-cols-12 gap-4 items-center">
							<!-- Customer -->
							<div class="col-span-3">
								<div class="flex items-center space-x-3">
									<div class="w-10 h-10 bg-gray-800 flex items-center justify-center text-white font-medium text-sm rounded-full">
										{order.customer_name.split(' ').map(n => n[0]).join('')}
									</div>
									<div>
										<p class="font-medium text-gray-900">{order.customer_name}</p>
										{#if order.customer_phone}
											<div class="flex items-center text-sm text-gray-500">
												<Phone class="w-3 h-3 mr-1" />
												{order.customer_phone}
											</div>
										{/if}
									</div>
								</div>
							</div>							<!-- Order Details -->
							<div class="col-span-2">
								<p class="font-medium text-gray-900">{order.order_number}</p>
								<div class="flex items-center text-sm text-gray-500">
									<Scale class="w-3 h-3 mr-1" />
									{getTotalWeight(order).toFixed(1)} kg
								</div>
								<p class="text-xs text-gray-400">
									{formatDateOnly(order.created_at)} at {formatTime(order.created_at)}
								</p>
							</div>

							<!-- Service -->
							<div class="col-span-1">
								<p class="font-medium text-gray-900 text-sm">{order.service_type}</p>
								<p class="text-xs text-gray-500">{order.quantity} kg</p>
							</div>

							<!-- Status -->
							<div class="col-span-1">
								<div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium {getStatusBadgeColor(order.status)}">
									<svelte:component this={getStatusIcon(order.status)} class="w-3 h-3" />
									{getStatusBadgeText(order.status)}
								</div>
							</div>

							<!-- Payment -->
							<div class="col-span-2">
								<div class="space-y-1">
									<p class="font-semibold text-gray-900 text-sm">{formatCurrency(order.total_amount)}</p>
									<div class="flex items-center gap-1">
										<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium {getPaymentStatusColor(order.payment_status)}">
											<svelte:component this={getPaymentStatusIcon(order.payment_status)} class="w-3 h-3" />
											{getPaymentStatusText(order.payment_status)}
										</span>
									</div>
									<div class="flex items-center gap-1">
										<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium {getPaymentMethodColor(order.payment_method)}">
											<svelte:component this={getPaymentMethodIcon(order.payment_method)} class="w-3 h-3" />
											{getPaymentMethodText(order.payment_method)}
										</span>
									</div>
								</div>
							</div>							<!-- Dates -->
							<div class="col-span-2">
								{#if order.pickup_date}
									<div class="flex items-center text-sm text-gray-600 mb-1">
										<Calendar class="w-3 h-3 mr-1" />
										<span class="text-xs text-gray-500">Expected pickup:</span>
									</div>
									<p class="text-sm font-medium text-gray-700 ml-4">
										{formatDateOnly(order.pickup_date)} at {formatTime(order.pickup_date)}
									</p>
								{/if}
								{#if order.delivery_date && (order.status === 'completed' || order.status === 'ready')}
									<div class="flex items-center text-sm text-emerald-600 mb-1 {order.pickup_date ? 'mt-2' : ''}">
										<Calendar class="w-3 h-3 mr-1" />
										<span class="text-xs text-emerald-500">Completed:</span>
									</div>
									<p class="text-sm font-medium text-emerald-700 ml-4">
										{formatDateOnly(order.delivery_date)} at {formatTime(order.delivery_date)}
									</p>
								{/if}
								{#if !order.pickup_date && !order.delivery_date}
									<div class="flex items-center text-sm text-gray-500 mb-1">
										<Calendar class="w-3 h-3 mr-1" />
										<span class="text-xs text-gray-400">Ordered:</span>
									</div>
									<p class="text-sm font-medium text-gray-600 ml-4">
										{formatDateOnly(order.created_at)} at {formatTime(order.created_at)}
									</p>
								{/if}
							</div>							<!-- Actions -->
							<div class="col-span-1">
								<div class="flex items-center gap-2">
									<a href="/orders/{order.id}" class="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors" title="View Order">
										<Eye class="w-4 h-4" />
									</a>
									<a href="/orders/{order.id}/edit" class="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Edit Order">
										<Edit3 class="w-4 h-4" />
									</a>
									{#if order.status === 'cancelled'}
										<button class="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete Order">
											<Trash2 class="w-4 h-4" />
										</button>
									{/if}
								</div>
							</div>						</div>						<!-- Remarks -->
						{#if order.remarks}
							<div class="mt-3 text-xs text-gray-600 italic">
								<div class="bg-gray-50 rounded p-2 border-l-2 border-gray-300">
									<strong>Remarks:</strong> "{order.remarks}"
								</div>
							</div>
						{/if}
					</div>

					<!-- Tablet Layout (lg to xl) -->
					<div class="hidden lg:block xl:hidden border border-gray-200 rounded-lg p-4 md:p-5 hover:border-gray-300 hover:shadow-md transition-all duration-200">
						<div class="grid grid-cols-10 gap-3 items-start">
							<!-- Customer -->
							<div class="col-span-3">
								<div class="flex items-center space-x-3">
									<div class="w-10 h-10 bg-gray-800 flex items-center justify-center text-white font-medium text-sm rounded-full">
										{order.customer_name.split(' ').map(n => n[0]).join('')}
									</div>
									<div class="min-w-0 flex-1">
										<p class="font-medium text-gray-900 text-sm truncate">{order.customer_name}</p>
										{#if order.customer_phone}
											<div class="flex items-center text-xs text-gray-500 mt-1">
												<Phone class="w-3 h-3 mr-1 flex-shrink-0" />
												<span class="truncate">{order.customer_phone}</span>
											</div>
										{/if}
									</div>
								</div>
							</div>

							<!-- Order Details -->
							<div class="col-span-2">
								<p class="font-medium text-gray-900 text-sm">{order.order_number}</p>
								<div class="flex items-center text-xs text-gray-500 mt-1">
									<Scale class="w-3 h-3 mr-1" />
									{getTotalWeight(order).toFixed(1)} kg
								</div>
								<p class="text-xs text-gray-400 mt-1">
									{formatDateOnly(order.created_at)}
								</p>
							</div>

							<!-- Status -->
							<div class="col-span-2">
								<div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium {getStatusBadgeColor(order.status)}">
									<svelte:component this={getStatusIcon(order.status)} class="w-3 h-3" />
									<span class="truncate">{getStatusBadgeText(order.status)}</span>
								</div>
								<p class="text-xs text-gray-500 mt-1">{order.service_type}</p>
							</div>

							<!-- Payment -->
							<div class="col-span-2">
								<div class="space-y-1">
									<p class="font-semibold text-gray-900 text-sm">{formatCurrency(order.total_amount)}</p>
									<div class="space-y-1">
										<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium {getPaymentStatusColor(order.payment_status)} block w-fit">
											<svelte:component this={getPaymentStatusIcon(order.payment_status)} class="w-3 h-3" />
											<span class="truncate">{getPaymentStatusText(order.payment_status)}</span>
										</span>
										<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium {getPaymentMethodColor(order.payment_method)} block w-fit">
											<svelte:component this={getPaymentMethodIcon(order.payment_method)} class="w-3 h-3" />
											<span class="truncate">{getPaymentMethodText(order.payment_method)}</span>
										</span>
									</div>
								</div>
							</div>

							<!-- Actions -->
							<div class="col-span-1">
								<div class="flex items-center gap-1">
									<a href="/orders/{order.id}" class="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors" title="View Order">
										<Eye class="w-4 h-4" />
									</a>
									<a href="/orders/{order.id}/edit" class="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Edit Order">
										<Edit3 class="w-4 h-4" />
									</a>
									{#if order.status === 'cancelled'}
										<button class="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete Order">
											<Trash2 class="w-4 h-4" />
										</button>
									{/if}
								</div>
							</div>
						</div>

						<!-- Dates section for tablet -->
						<div class="mt-3 pt-3 border-t border-gray-100">
							<div class="grid grid-cols-2 gap-4 text-xs">
								{#if order.pickup_date}
									<div>
										<div class="flex items-center text-gray-500 mb-1">
											<Calendar class="w-3 h-3 mr-1" />
											<span class="text-xs">Expected pickup:</span>
										</div>
										<p class="text-xs font-medium text-gray-700 ml-4">
											{formatDateOnly(order.pickup_date)} at {formatTime(order.pickup_date)}
										</p>
									</div>
								{/if}
								{#if order.delivery_date && (order.status === 'completed' || order.status === 'ready')}
									<div>
										<div class="flex items-center text-emerald-600 mb-1">
											<Calendar class="w-3 h-3 mr-1" />
											<span class="text-xs">Completed:</span>
										</div>
										<p class="text-xs font-medium text-emerald-700 ml-4">
											{formatDateOnly(order.delivery_date)} at {formatTime(order.delivery_date)}
										</p>
									</div>
								{/if}
							</div>
						</div>

						<!-- Remarks for tablet -->
						{#if order.remarks}
							<div class="mt-3 text-xs text-gray-600 italic">
								<div class="bg-gray-50 rounded p-2 border-l-2 border-gray-300">
									<strong>Remarks:</strong> "{order.remarks}"
								</div>
							</div>
						{/if}
					</div>										<!-- Mobile Card Layout -->
					<div class="lg:hidden border border-gray-200 rounded-lg p-4 md:p-5 hover:border-gray-300 hover:shadow-md transition-all duration-200">
						<div class="space-y-3 md:space-y-4">
						<!-- Header with Customer and Order Number -->
						<div class="flex items-start justify-between gap-4 md:gap-6">
							<div class="flex items-center space-x-3 min-w-0 flex-1">
								<div class="w-10 h-10 md:w-12 md:h-12 bg-gray-800 flex items-center justify-center text-white font-medium text-sm md:text-base rounded-full shrink-0">
									{order.customer_name.split(' ').map(n => n[0]).join('')}
								</div>
								<div class="min-w-0 flex-1">
									<p class="font-medium text-gray-900 text-base md:text-lg truncate">{order.customer_name}</p>
									<p class="text-sm md:text-base font-medium text-gray-800">{order.order_number}</p>
									{#if order.customer_phone}
										<div class="flex items-center text-sm md:text-base text-gray-500 mt-1">
											<Phone class="w-3 h-3 md:w-4 md:h-4 mr-1 flex-shrink-0" />
											<span class="truncate">{order.customer_phone}</span>
										</div>
									{/if}
								</div>
							</div>
														<div class="flex flex-col items-end space-y-2 shrink-0">
								<p class="font-semibold text-gray-900 text-base md:text-lg">{formatCurrency(order.total_amount)}</p>
								<div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs md:text-sm font-medium {getStatusBadgeColor(order.status)}">
									<svelte:component this={getStatusIcon(order.status)} class="w-3 h-3 md:w-4 md:h-4" />
									{getStatusBadgeText(order.status)}
								</div>
							</div>
							</div>

														<!-- Service and Payment Info -->
							<div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 text-sm md:text-base">
								<div class="space-y-2">
									<p class="text-gray-500 text-xs md:text-sm uppercase tracking-wide font-medium">Service</p>
									<p class="font-medium text-gray-900 text-sm md:text-base">{order.service_type}</p>
									<div class="flex items-center text-gray-500 text-sm md:text-base">
										<Scale class="w-3 h-3 md:w-4 md:h-4 mr-1" />
										{order.quantity} kg
									</div>
								</div>
								<div class="space-y-2">
									<p class="text-gray-500 text-xs md:text-sm uppercase tracking-wide font-medium">Payment</p>
									<div class="flex flex-col gap-2">
										<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs md:text-sm font-medium {getPaymentStatusColor(order.payment_status)} w-fit">
											<svelte:component this={getPaymentStatusIcon(order.payment_status)} class="w-3 h-3 md:w-4 md:h-4" />
											{getPaymentStatusText(order.payment_status)}
										</span>
										<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs md:text-sm font-medium {getPaymentMethodColor(order.payment_method)} w-fit">
											<svelte:component this={getPaymentMethodIcon(order.payment_method)} class="w-3 h-3 md:w-4 md:h-4" />
											{getPaymentMethodText(order.payment_method)}
										</span>
									</div>
								</div>
							</div>							<!-- Dates -->
							<div class="space-y-2 md:space-y-3 text-sm md:text-base">
								<div class="bg-gray-50 rounded-lg p-3 md:p-4">
									<div class="flex items-center text-gray-600 mb-1">
										<Calendar class="w-3 h-3 md:w-4 md:h-4 mr-1" />
										<span class="text-xs md:text-sm font-medium uppercase tracking-wide">Order Created</span>
									</div>
									<p class="text-sm md:text-base font-medium text-gray-800 ml-4 md:ml-5">
										{formatDateOnly(order.created_at)} at {formatTime(order.created_at)}
									</p>
								</div>
									{#if order.pickup_date}
									<div class="bg-gray-50 rounded-lg p-3 md:p-4">
										<div class="flex items-center text-gray-800 mb-1">
											<Calendar class="w-3 h-3 md:w-4 md:h-4 mr-1" />
											<span class="text-xs md:text-sm font-medium uppercase tracking-wide">Expected Pickup</span>
										</div>
										<p class="text-sm md:text-base font-medium text-gray-800 ml-4 md:ml-5">
											{formatDateOnly(order.pickup_date)} at {formatTime(order.pickup_date)}
										</p>
									</div>
								{/if}
								
								{#if order.delivery_date && (order.status === 'completed' || order.status === 'ready')}
									<div class="bg-emerald-50 rounded-lg p-3 md:p-4">
										<div class="flex items-center text-emerald-600 mb-1">
											<Calendar class="w-3 h-3 md:w-4 md:h-4 mr-1" />
											<span class="text-xs md:text-sm font-medium uppercase tracking-wide">Completed</span>
										</div>
										<p class="text-sm md:text-base font-medium text-emerald-800 ml-4 md:ml-5">
											{formatDateOnly(order.delivery_date)} at {formatTime(order.delivery_date)}
										</p>
									</div>
								{/if}
							</div>							<!-- Actions -->
							<div class="flex items-center justify-end gap-2 md:gap-3 pt-3 md:pt-4 border-t border-gray-100">
								<a href="/orders/{order.id}" class="flex items-center gap-1 px-3 py-2 md:px-4 md:py-2.5 text-gray-800 hover:bg-gray-50 rounded-lg transition-colors text-sm md:text-base">
									<Eye class="w-4 h-4 md:w-5 md:h-5" />
									View
								</a>
								<a href="/orders/{order.id}/edit" class="flex items-center gap-1 px-3 py-2 md:px-4 md:py-2.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors text-sm md:text-base">
									<Edit3 class="w-4 h-4 md:w-5 md:h-5" />
									Edit
								</a>
								{#if order.status === 'cancelled'}
									<button class="flex items-center gap-1 px-3 py-2 md:px-4 md:py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm md:text-base">
										<Trash2 class="w-4 h-4 md:w-5 md:h-5" />
										Delete
									</button>
								{/if}							</div>							<!-- Remarks -->
							{#if order.remarks}
								<div class="mt-3 md:mt-4 text-xs md:text-sm text-gray-600 italic">
									<div class="bg-gray-50 rounded p-2 md:p-3 border-l-2 border-gray-300">
										<strong>Remarks:</strong> "{order.remarks}"
									</div>
								</div>
							{/if}
						</div>
					</div>
				{/each}
			</div>			<!-- Footer with count -->
			<div class="border-t border-gray-100 px-4 md:px-6 py-4">
				<p class="text-sm text-gray-600">
					Showing {filteredOrders.length} of {orders.length} orders
				</p>
			</div>		{/if}
	</div>
</div>
