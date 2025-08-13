<script lang="ts">
	import { onMount } from 'svelte';
	import { FileText, Clock, CheckCircle, Plus, Users, BarChart3, TrendingUp, Scale, LayoutDashboard, Package, XCircle, CreditCard, Banknote, Smartphone, Building2, AlertCircle, CheckCircle2, User, Eye, Edit, ExternalLink } from 'lucide-svelte';
	import LoadingSpinner from '$lib/components/common/LoadingSpinner.svelte';
	import Icon from '@iconify/svelte';
	import type { Order } from '$lib/types/order';
	import type { PageData } from './$types';

	export let data: PageData;
	
	// Extract data from server
	let stats = data.stats;
	let recentOrders: Order[] = data.recentOrders;
	let recentActivities = data.recentActivities.map(activity => ({
		...activity,
		timestamp: new Date(activity.timestamp)
	}));

	// Add loading state for demonstration
	let isLoading = true;	onMount(async () => {
		// Simulate loading for demonstration
		setTimeout(() => {
			isLoading = false;
		}, 1000);
	});

	// Helper function to get icon component from string name
	function getIconComponent(iconName: string) {
		switch (iconName) {
			case 'FileText': return FileText;
			case 'Users': return Users;
			case 'CheckCircle': return CheckCircle;
			default: return FileText;
		}
	}

	function getStatusColor(status: string) {
		switch (status) {
			case 'pending': return 'bg-orange-100 text-orange-800 border border-orange-200';
			case 'processing': return 'bg-gray-100 text-gray-800 border border-gray-200';
			case 'ready': return 'bg-purple-100 text-purple-800 border border-purple-200';
			case 'completed': return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
			case 'cancelled': return 'bg-red-100 text-red-800 border border-red-200';
			default: return 'bg-gray-100 text-gray-800 border border-gray-200';
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
	}
	function getStatusText(status: string) {
		switch (status) {
			case 'pending': return 'Pending';
			case 'processing': return 'In Progress';
			case 'ready': return 'Ready for Pickup';
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

	function getPaymentStatusIcon(paymentStatus: string) {
		switch (paymentStatus) {
			case 'paid': return CheckCircle2;
			case 'unpaid': return AlertCircle;
			case 'partial': return Clock;
			default: return AlertCircle;
		}
	}
	function getPaymentStatusColor(paymentStatus: string) {
		switch (paymentStatus) {
			case 'paid': return 'bg-emerald-100 text-emerald-800';
			case 'unpaid': return 'bg-red-100 text-red-800';
			case 'partial': return 'bg-amber-100 text-amber-800';
			default: return 'bg-gray-100 text-gray-800';
		}
	}

	function getPaymentMethodColor(paymentMethod: string) {
		switch (paymentMethod) {
			case 'cash': return 'bg-green-100 text-green-800';
			case 'gcash': return 'bg-gray-100 text-gray-800';
			case 'bank_transfer': return 'bg-purple-100 text-purple-800';
			case 'credit_card': return 'bg-indigo-100 text-indigo-800';
			case 'paymaya': return 'bg-pink-100 text-pink-800';
			default: return 'bg-gray-100 text-gray-800';
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

	function getPaymentMethodText(paymentMethod: string) {		switch (paymentMethod) {
			case 'cash': return 'Cash';
			case 'gcash': return 'GCash';
			case 'bank_transfer': return 'Bank Transfer';
			case 'credit_card': return 'Credit Card';
			case 'paymaya': return 'PayMaya';
			default: return paymentMethod;
		}
	}

	function formatCurrency(amount: number) {
		return new Intl.NumberFormat('en-PH', {
			style: 'currency',
			currency: 'PHP'
		}).format(amount);
	}

	function formatDate(date: Date) {
		return new Intl.DateTimeFormat('en-US', {
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		}).format(date);
	}
</script>

<svelte:head>
	<title>Dashboard - Laundry Management System</title>
	<meta name="description" content="Laundry management dashboard overview" />
</svelte:head>

<div class="p-4 md:p-5 lg:p-6 w-full bg-gray-50 min-h-screen">
	<!-- Header -->
	<div class="mb-8">
    <div class="flex items-start sm:items-center justify-between gap-3 mb-4">
			<div>
            <div class="flex items-center gap-2 md:gap-3 mb-2">
                    <LayoutDashboard class="w-7 h-7 md:w-8 md:h-8 text-gray-800" />
                    <h1 class="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">Dashboard</h1>
				</div>
            <p class="text-gray-600 text-sm md:text-base mt-1">Welcome back! Here's your business overview.</p>
			</div>
            <div class="flex items-center gap-2 text-xs md:text-sm text-gray-500">
				<TrendingUp class="w-4 h-4" />
				<span>Last updated: {new Date().toLocaleTimeString()}</span>
			</div>
		</div>
	</div>
	<!-- Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
		<!-- Total Orders -->
		<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm font-medium text-gray-600 mb-1">Total Orders</p>
					{#if isLoading}
						<LoadingSpinner size="xl" color="primary" center={true} />
					{:else}
						<p class="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
					{/if}
				</div>
				<div class="p-3 bg-indigo-50 rounded-xl">
					<FileText class="w-6 h-6 text-indigo-600" />
				</div>
			</div>
		</div>
		<!-- Pending Orders -->
		<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm font-medium text-gray-600 mb-1">Pending Orders</p>
					{#if isLoading}
						<LoadingSpinner size="xl" color="primary" center={true} />
					{:else}
						<p class="text-3xl font-bold text-amber-600">{stats.pendingOrders}</p>
					{/if}
				</div>
				<div class="p-3 bg-amber-50 rounded-xl">
					<Clock class="w-6 h-6 text-amber-600" />
				</div>
			</div>
		</div>
		<!-- Completed Today -->
		<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm font-medium text-gray-600 mb-1">Completed Today</p>
					{#if isLoading}
						<LoadingSpinner size="xl" color="primary" center={true} />
					{:else}
						<p class="text-3xl font-bold text-emerald-600">{stats.completedToday}</p>
					{/if}
				</div>
				<div class="p-3 bg-emerald-50 rounded-xl">
					<CheckCircle class="w-6 h-6 text-emerald-600" />
				</div>
			</div>
		</div>
		<!-- Revenue -->
		<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm font-medium text-gray-600 mb-1">Revenue</p>
					{#if isLoading}
						<LoadingSpinner size="xl" color="primary" center={true} />
					{:else}
						<p class="text-2xl font-bold text-gray-900">{formatCurrency(stats.revenue)}</p>
					{/if}
				</div>
				<div class="p-3 bg-slate-50 rounded-xl">
					<Icon icon="mdi:currency-php" class="w-6 h-6 text-slate-600" />				</div>
			</div>
		</div>
	</div>
		<!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
		<!-- Recent Orders -->
        <div class="lg:col-span-2 order-1">
			<div class="bg-white rounded-xl shadow-sm border border-gray-100">
                <div class="p-4 sm:p-5 md:p-6 border-b border-gray-100 flex items-start sm:items-center justify-between gap-3">
                    <h2 class="text-base sm:text-lg md:text-xl font-semibold text-gray-900">Recent Orders</h2>
					<a href="/orders" class="inline-flex items-center gap-2 text-sm font-medium text-gray-800 hover:text-gray-900 transition-colors">
						<span class="hidden sm:inline">View All</span>
						<span class="sm:hidden">All</span>
						<Eye class="w-4 h-4" />					</a>
				</div>
                <div class="p-4 sm:p-5 md:p-6">
					{#if isLoading}
						<div class="flex justify-center items-center min-h-32">
							<LoadingSpinner size="xl" color="primary" message="Loading recent orders..." center={true} />						</div>
					{:else}
						<div class="space-y-4">
							{#each recentOrders.slice(0, 3) as order}
								<div class="group border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-md transition-all duration-200">
									<!-- Mobile-First Layout -->
									<div class="space-y-3">
										<!-- Header Row: Customer + Order Number + Actions -->
										<div class="flex items-start gap-3">
											<!-- Customer Avatar -->											<div class="w-10 h-10 bg-gray-800 flex items-center justify-center text-white font-semibold text-sm rounded-full shadow-sm flex-shrink-0">
												{order.customer_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
											</div>
											
											<!-- Customer Info -->
											<div class="flex-1 min-w-0">
												<div class="flex flex-col sm:flex-row sm:items-center sm:gap-2">
													<h3 class="font-semibold text-gray-900 group-hover:text-gray-900 transition-colors truncate">
														{order.customer_name}
													</h3>
													<div class="flex items-center gap-2 text-xs">
														<span class="hidden sm:inline text-gray-500">•</span>
														<span class="font-medium text-gray-600">{order.order_number}</span>
													</div>
												</div>
												<div class="text-xs text-gray-500 mt-1">
													Created: {formatDate(new Date(order.created_at))}
												</div>
											</div>
											
											<!-- Action Buttons -->
											<div class="flex items-center gap-1 flex-shrink-0">
												<a 
													href="/orders/{order.id}"
													class="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-all duration-200 group"
													title="View Order"
												>
													<Eye class="w-4 h-4" />
												</a>
												<a 
													href="/orders/{order.id}/edit"
													class="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200"
													title="Edit Order"
												>
													<Edit class="w-4 h-4" />
												</a>
											</div>
											
											<!-- Amount (Desktop) -->
											<div class="hidden sm:block text-right flex-shrink-0 ml-2">
												<p class="text-lg font-bold text-gray-900">{formatCurrency(order.total_amount)}</p>
												<p class="text-xs text-gray-500">₱{order.unit_price}/kg</p>
											</div>
										</div>
										
										<!-- Service Details Row -->
										<div class="flex flex-wrap items-center gap-3 text-sm text-gray-600">
											<div class="flex items-center gap-1">
												<Package class="w-4 h-4 text-gray-400 flex-shrink-0" />
												<span class="truncate">{order.service_type}</span>
											</div>
											<div class="flex items-center gap-1">
												<Scale class="w-4 h-4 text-gray-400 flex-shrink-0" />
												<span>{order.quantity} kg</span>
											</div>
											{#if order.customer_phone}
												<div class="flex items-center gap-1">
													<Smartphone class="w-4 h-4 text-gray-400 flex-shrink-0" />
													<span class="text-xs truncate">{order.customer_phone}</span>
												</div>
											{/if}
										</div>
										
										<!-- Amount (Mobile) -->
										<div class="sm:hidden">
											<p class="text-lg font-bold text-gray-900">{formatCurrency(order.total_amount)}</p>
											<p class="text-xs text-gray-500">₱{order.unit_price}/kg</p>
										</div>
										
										<!-- Status Badges Row -->
										<div class="flex flex-wrap gap-2">
											<!-- Order Status -->
											<span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium {getStatusBadgeColor(order.status)}">
												<svelte:component this={getStatusIcon(order.status)} class="w-3 h-3" />
												{getStatusText(order.status)}
											</span>
											
											<!-- Payment Status -->
											<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium {getPaymentStatusColor(order.payment_status)}">
												<svelte:component this={getPaymentStatusIcon(order.payment_status)} class="w-3 h-3" />
												{getPaymentStatusText(order.payment_status)}
											</span>
											
											<!-- Payment Method -->
											<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium {getPaymentMethodColor(order.payment_method)}">
												<svelte:component this={getPaymentMethodIcon(order.payment_method)} class="w-3 h-3" />
												{getPaymentMethodText(order.payment_method)}
											</span>
										</div>
												<!-- Remarks (if exists) -->
										{#if order.remarks}
											<div class="text-xs text-gray-600 italic">
												<div class="bg-gray-50 rounded p-2 border-l-2 border-gray-300">
													<span class="font-medium text-gray-700">Remarks:</span> "{order.remarks}"
												</div>
											</div>
										{/if}
												<!-- Pickup Date (if exists) -->
										{#if order.pickup_date}
											<div class="flex items-center gap-2 text-xs text-gray-600 pt-2 border-t border-gray-100">
												<Clock class="w-3 h-3 text-gray-400 flex-shrink-0" />
												<span>Pickup: {formatDate(new Date(order.pickup_date))}</span>
											</div>
										{/if}

										<!-- Action Buttons (Mobile) -->
										<div class="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 sm:hidden">
											<a 
												href="/orders/{order.id}"
												class="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-800 bg-gray-50 hover:bg-gray-100 rounded-md transition-all duration-200"
											>
												<Eye class="w-3 h-3" />
												View
											</a>
											<a 
												href="/orders/{order.id}/edit"
												class="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-all duration-200"
											>
												<Edit class="w-3 h-3" />
												Edit
											</a>
										</div>
									</div>
								</div>
							{/each}

							<!-- Show More Link -->
							{#if recentOrders.length > 3}
								<div class="text-center pt-2">
									<a 
										href="/orders" 
										class="inline-flex items-center gap-2 text-sm font-medium text-gray-800 hover:text-gray-900 transition-colors"
									>
										<span>View {recentOrders.length - 3} more orders</span>
										<ExternalLink class="w-4 h-4" />
									</a>
								</div>
							{/if}
						</div>
					{/if}
				</div>
			</div>
		</div>
		<!-- Quick Actions & Recent Activities -->
		<div class="order-2 space-y-6">
			<!-- Quick Actions -->
			<div>
				<div class="bg-white rounded-xl shadow-sm border border-gray-100">					<div class="p-4 sm:p-6 border-b border-gray-100">
						<h2 class="text-lg sm:text-xl font-semibold text-gray-900">Quick Actions</h2>
					</div>
					<div class="p-4 sm:p-6 space-y-3">
						<a href="/orders/new" class="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white bg-gray-800 rounded-lg hover:bg-gray-900 transition-all duration-200 shadow-sm hover:shadow-md">
							<Plus class="w-5 h-5 mr-2 flex-shrink-0" />
							<span>New Order</span>
						</a>
						
						<a href="/orders" class="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200">
							<FileText class="w-5 h-5 mr-2 flex-shrink-0" />
							<span>View Orders</span>
						</a>
						
						<a href="/reports" class="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all duration-200">
							<BarChart3 class="w-5 h-5 mr-2 flex-shrink-0" />
							<span>Reports</span>
						</a>
					</div>
				</div>
			</div>

			<!-- Recent Activities -->
			<div>
				<div class="bg-white rounded-xl shadow-sm border border-gray-100">
					<div class="p-4 sm:p-6 border-b border-gray-100">
						<h2 class="text-lg sm:text-xl font-semibold text-gray-900">Recent Activities</h2>
					</div>					<div class="p-4 sm:p-6 space-y-4">
						{#each recentActivities as activity}
							<div class="flex items-start gap-3 sm:gap-4">
								<div class={`w-8 h-8 sm:w-10 sm:h-10 rounded-md flex items-center justify-center text-white flex-shrink-0 ${activity.color}`}>
									{#if activity.type === 'payment'}
										<Icon icon="mdi:currency-php" class="w-4 h-4 sm:w-5 sm:h-5" />
									{:else if activity.icon === 'mdi:currency-php'}
										<Icon icon={activity.icon} class="w-4 h-4 sm:w-5 sm:h-5" />
									{:else}
										<svelte:component this={getIconComponent(activity.icon)} class="w-4 h-4 sm:w-5 sm:h-5" />
									{/if}
								</div>
								<div class="flex-1 min-w-0">
									<p class="text-sm text-gray-900 leading-relaxed">{activity.description}</p>
									<p class="text-xs text-gray-400 mt-0.5">{formatDate(activity.timestamp)}</p>
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
