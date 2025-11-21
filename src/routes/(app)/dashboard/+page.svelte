<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { FileText, Clock, CheckCircle, Plus, Users, BarChart3, TrendingUp, Scale, LayoutDashboard, Package, XCircle, CreditCard, Banknote, Smartphone, Building2, AlertCircle, CheckCircle2, User, Eye, Edit, Edit3, ExternalLink, LogIn, LogOut, Key, Activity } from 'lucide-svelte';
	import LoadingSpinner from '$lib/components/common/LoadingSpinner.svelte';
	import AdminOnly from '$lib/components/common/AdminOnly.svelte';
	import Icon from '@iconify/svelte';
	import type { Order } from '$lib/types/order';
	import type { PageData } from './$types';

	export let data: PageData;
	
	// Load dashboard data from backend
	let stats = data.stats;
	let recentOrders: Order[] = data.recentOrders;
	let recentActivities = data.recentActivities.map((activity: any) => ({
		...activity,
		timestamp: new Date(activity.timestamp)
	}));

	// Dashboard loading animation
	let isLoading = true;
	
	onMount(async () => {
		// Brief loading animation for UX
		setTimeout(() => {
			isLoading = false;
		}, 1000);
	});

	// Map icon names to Lucide components
	function getIconComponent(iconName: string) {
		switch (iconName) {
			case 'FileText': return FileText;
			case 'Users': return Users;
			case 'CheckCircle': return CheckCircle;
			case 'LogIn': return LogIn;
			case 'LogOut': return LogOut;
			case 'Key': return Key;
			case 'Activity': return Activity;
			case 'Edit': return Edit;
			case 'CreditCard': return CreditCard;
			default: return FileText;
		}
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

	function getPaymentMethodIcon(paymentMethod: string) {
		switch (paymentMethod) {
			case 'cash': return Banknote;
			case 'gcash': return Smartphone;
		case 'others': return CreditCard;
			default: return CreditCard;
		}
	}

	function getPaymentStatusIcon(paymentStatus: string) {
		switch (paymentStatus) {
			case 'paid': return CheckCircle2;
			case 'unpaid': return AlertCircle;
			default: return AlertCircle;
		}
	}

	function getPaymentStatusColor(paymentStatus: string) {
		switch (paymentStatus) {
			case 'paid': return 'bg-emerald-100 text-emerald-800';
			case 'unpaid': return 'bg-red-100 text-red-800';
			default: return 'bg-brand-100 text-brand-800';
		}
	}

	function getPaymentMethodColor(paymentMethod: string) {
		switch (paymentMethod) {
			case 'cash': return 'bg-green-100 text-green-800';
			case 'gcash': return 'bg-gray-100 text-brand-800';
		case 'others': return 'bg-purple-100 text-purple-800';
			default: return 'bg-gray-100 text-brand-800';
		}
	}

	function getPaymentStatusText(paymentStatus: string) {
		switch (paymentStatus) {
			case 'paid': return 'Paid';
			case 'unpaid': return 'Unpaid';
			default: return paymentStatus;
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

<AdminOnly>
<div class="p-4 md:p-5 lg:p-6 w-full bg-gray-50 min-h-screen">
	<!-- Header -->
	<div class="mb-8">
    <div class="flex items-start sm:items-center justify-between gap-3 mb-4">
			<div>
            <div class="flex items-center gap-2 md:gap-3 mb-2">
                    <LayoutDashboard class="w-7 h-7 md:w-8 md:h-8 text-brand-800" />
                    <h1 class="text-xl md:text-2xl lg:text-3xl font-bold text-brand-900">Dashboard</h1>
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
						<p class="text-3xl font-bold text-brand-900">{stats.totalOrders}</p>
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
		<!-- Completed Orders -->
		<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm font-medium text-gray-600 mb-1">Completed Orders</p>
					{#if isLoading}
						<LoadingSpinner size="xl" color="primary" center={true} />
					{:else}
						<p class="text-3xl font-bold text-emerald-600">{stats.totalCompleted ?? 0}</p>
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
						<p class="text-2xl font-bold text-brand-900">{formatCurrency(stats.revenue)}</p>
					{/if}
				</div>
				<div class="p-3 bg-slate-50 rounded-xl">
					<Icon icon="mdi:currency-php" class="w-6 h-6 text-slate-600" />
				</div>
			</div>
		</div>
	</div>
		<!-- Main Content Grid -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
		<!-- Recent Orders -->
        <div class="xl:col-span-2 order-1">
			<div class="bg-white rounded-lg shadow-sm border border-gray-200">
				<!-- Simple Paper-like Header -->
				<div class="border-b border-gray-200 p-4 md:p-6 bg-gray-50">
					<div class="flex items-center justify-between">
						<div>
							<h2 class="text-lg font-semibold text-brand-900 mb-1">Recent Orders</h2>
							<p class="text-sm text-gray-600">Latest order activity</p>
						</div>
						<a href="/orders" class="inline-flex items-center gap-2 text-sm font-medium text-brand-800 hover:text-brand-900 transition-colors">
							<span class="hidden sm:inline">View All</span>
							<span class="sm:hidden">All</span>
							<Eye class="w-4 h-4" />
						</a>
					</div>
				</div>

				{#if isLoading}
					<div class="flex justify-center items-center min-h-32 p-8">
						<LoadingSpinner size="xl" color="primary" message="Loading recent orders..." center={true} />
					</div>
				{:else if recentOrders.length === 0}
					<div class="flex flex-col items-center justify-center min-h-32 p-8 text-center">
						<FileText class="w-12 h-12 text-gray-400 mb-4" />
						<h3 class="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
						<p class="text-gray-600 mb-4">Start by creating your first order</p>
						<a href="/orders/new" class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-brand-800 rounded-lg hover:bg-brand-900 transition-colors">
							<Plus class="w-4 h-4" />
							Create Order
						</a>
					</div>
				{:else}
					<!-- Simple Paper-like Order Rows -->
					<div class="divide-y divide-gray-200">
						{#each recentOrders.slice(0, 5) as order}
							<!-- Unified Simple Row Design matching orders page -->
							<div 
								class="p-4 md:p-5 hover:bg-gray-50 transition-colors border-l-4 {getStatusColor(order.status)}-500 cursor-pointer"
								on:click={() => goto(`/orders/${order.id}`)}
								on:keydown={(e) => {
									if (e.key === 'Enter' || e.key === ' ') {
										e.preventDefault();
										goto(`/orders/${order.id}`);
									}
								}}
								role="button"
								tabindex="0"
								title="Click to view order details"
							>
								<div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
									<!-- Left Side: Main Order Info -->
									<div class="flex-1 space-y-2">
										<!-- Row 1: Customer & Order Number -->
										<div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
											<h3 class="text-base font-semibold text-brand-900">{order.customer_name}</h3>
											<span class="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">{order.order_number}</span>
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
												{(order.total_weight_kg ?? (order.load_count * order.kg_per_load)).toFixed(2)} kg
											</span>
											<span>{formatDate(new Date(order.created_at))}</span>
										</div>
										
										<!-- Row 3: Status & Payment -->
										<div class="flex items-center gap-3">
											<span class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full {getStatusBadgeColor(order.status)}">
												<svelte:component this={getStatusIcon(order.status)} class="w-3 h-3" />
												{getStatusText(order.status)}
											</span>
											<span class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full {getPaymentStatusColor(order.payment_status)}">
												<svelte:component this={getPaymentStatusIcon(order.payment_status)} class="w-3 h-3" />
												{getPaymentStatusText(order.payment_status)}
											</span>
											<span class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full {getPaymentMethodColor(order.payment_method)}">
												<svelte:component this={getPaymentMethodIcon(order.payment_method)} class="w-3 h-3" />
												{getPaymentMethodText(order.payment_method)}
											</span>
										</div>
									</div>
									
									<!-- Right Side: Amount & Actions -->
									<div class="flex flex-col items-end gap-2">
										<div class="text-right">
											<p class="text-lg font-bold text-brand-900">{formatCurrency(order.total_amount)}</p>
										</div>
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

					<!-- Simple Footer with View All Link -->
					<div class="border-t border-gray-200 bg-gray-50 px-4 md:px-5 py-4 rounded-b-lg">
						<div class="text-center">
							<a 
								href="/orders" 
								class="inline-flex items-center gap-2 text-sm font-medium text-gray-800 hover:text-brand-900 transition-colors"
							>
								<span>View all {stats.totalOrders} orders</span>
								<ExternalLink class="w-4 h-4" />
							</a>
						</div>
					</div>
				{/if}
			</div>
		</div>
		<!-- Quick Actions & Recent Activities -->
		<div class="order-2 space-y-6">
			<!-- Quick Actions -->
			<div>
				<div class="bg-white rounded-xl shadow-sm border border-gray-100">
					<div class="p-4 sm:p-6 border-b border-gray-100">
						<h2 class="text-lg sm:text-xl font-semibold text-brand-900">Quick Actions</h2>
					</div>
					<div class="p-4 sm:p-6 space-y-3">
						<a href="/orders/new" class="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white bg-brand-800 rounded-lg hover:bg-brand-900 transition-all duration-200 shadow-sm hover:shadow-md">
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
						<div class="flex items-center justify-between">
							<h2 class="text-lg sm:text-xl font-semibold text-brand-900">Recent Activities</h2>
							<a 
								href="/audit-logs" 
								class="inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-900 transition-colors"
							>
								<span class="hidden sm:inline">View All</span>
								<span class="sm:hidden">All</span>
								<Eye class="w-4 h-4" />
							</a>
						</div>
					</div>
					<div class="p-4 sm:p-6 space-y-4">
						{#if recentActivities.length === 0}
							<div class="text-center py-8">
								<Activity class="w-12 h-12 text-gray-400 mx-auto mb-4" />
								<p class="text-gray-600 text-sm">No recent activities</p>
							</div>
						{:else}
							{#each recentActivities as activity}
								<div class="flex items-start gap-3 sm:gap-4">
									<!-- Activity Icon -->
									<div class={`w-8 h-8 sm:w-10 sm:h-10 rounded-md flex items-center justify-center text-white flex-shrink-0 ${activity.color}`}>
										{#if activity.type === 'payment_status_changed'}
											<CreditCard class="w-4 h-4 sm:w-5 sm:h-5" />
										{:else}
											<svelte:component this={getIconComponent(activity.icon)} class="w-4 h-4 sm:w-5 sm:h-5" />
										{/if}
									</div>
									
									<!-- Activity Content -->
									<div class="flex-1 min-w-0 space-y-1">
										<!-- Description -->
										<p class="text-sm text-brand-900 leading-relaxed break-words">
											{activity.description}
										</p>
										
										<!-- Timestamp and User Email -->
										<div class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs">
											<p class="text-gray-400 whitespace-nowrap">
												{formatDate(activity.timestamp)}
											</p>
											{#if activity.user_email}
												<div class="flex items-center gap-1">
													<span class="text-gray-500 hidden sm:inline">•</span>
													<p class="text-gray-500 truncate">
														{activity.user_email}
													</p>
												</div>
											{/if}
										</div>
									</div>
								</div>
							{/each}
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
</AdminOnly>
