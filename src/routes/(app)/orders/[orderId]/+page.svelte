<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import type { Order } from '$lib/types/order';
	import type { PageData } from './$types';	import {
		Edit2,
		Calendar,
		Phone,
		Package,
		Weight,
		DollarSign,
		Clock,
		User,
		FileText,
		Printer,
		ArrowLeft,
		Check,
		X,
		AlertCircle,
		CreditCard,
		Smartphone,
		CheckCircle,
		XCircle,
		Banknote,
		Building2,
		CheckCircle2,
		Eye
	} from 'lucide-svelte';

	export let data: PageData;

	const orderId = $page.params.orderId;
	const order = data.order;
	// Loading states
	let isUpdatingStatus = false;

	// Date formatting functions
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
		}).format(new Date(dateString));	} // Status and payment utilities
	function getStatusColor(status: string) {
		switch (status) {
			case 'pending':
				return 'bg-orange-100 text-orange-800 border border-orange-200';
			case 'processing':
				return 'bg-gray-100 text-gray-800 border border-gray-200';
			case 'ready':
				return 'bg-purple-100 text-purple-800 border border-purple-200';
			case 'completed':
				return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
			case 'cancelled':
				return 'bg-red-100 text-red-800 border border-red-200';
			default:
				return 'bg-gray-100 text-gray-800 border border-gray-200';
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
	function getPaymentStatusColor(status: string) {
		switch (status) {
			case 'paid':
				return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
			case 'unpaid':
				return 'bg-red-100 text-red-800 border border-red-200';
			default:
				return 'bg-gray-100 text-gray-800 border border-gray-200';
		}
	}

	function getPaymentStatusIcon(status: string) {
		switch (status) {
			case 'paid': return CheckCircle2;
			case 'unpaid': return AlertCircle;
			default: return AlertCircle;
		}
	}

	function getPaymentMethodText(method: string) {
		switch (method) {
			case 'cash':
				return 'Cash';
			case 'gcash':
				return 'GCash';
			case 'paymaya':
				return 'PayMaya';
			case 'bank_transfer':
				return 'Bank Transfer';
			case 'credit_card':
				return 'Credit Card';
			default:
				return method;
		}
	}
	function getPaymentMethodIcon(method: string) {
		switch (method) {
			case 'cash':
				return Banknote;
			case 'gcash':
			case 'paymaya':
				return Smartphone;
			case 'bank_transfer':
				return Building2;
			case 'credit_card':
				return CreditCard;
			default:
				return CreditCard;
		}
	}
	function getPaymentMethodColor(method: string) {
		switch (method) {
			case 'cash':
				return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
			case 'gcash':
				return 'bg-gray-100 text-gray-800 border border-gray-200';
			case 'paymaya':
				return 'bg-green-100 text-green-800 border border-green-200';
			case 'bank_transfer':
				return 'bg-purple-100 text-purple-800 border border-purple-200';
			case 'credit_card':
				return 'bg-indigo-100 text-indigo-800 border border-indigo-200';
			default:
				return 'bg-gray-100 text-gray-800 border border-gray-200';
		}
	}

	// Status update functions
	async function updateOrderStatus(newStatus: string) {
		if (isUpdatingStatus) return;

		isUpdatingStatus = true;
		try {
			// Mock API call - in real app, this would call your backend
			await new Promise((resolve) => setTimeout(resolve, 1000));

			// For now, we'll just show success and redirect to refresh
			console.log(`Updating order ${orderId} status to: ${newStatus}`);

			// In a real app, you'd update the order data here
			// For now, let's reload the page to simulate the update
			window.location.reload();
		} catch (error) {
			console.error('Failed to update status:', error);
			alert('Failed to update order status. Please try again.');
		} finally {
			isUpdatingStatus = false;
		}
	}

	async function updatePaymentStatus(newPaymentStatus: string) {
		if (isUpdatingStatus) return;

		isUpdatingStatus = true;
		try {
			// Mock API call
			await new Promise((resolve) => setTimeout(resolve, 1000));

			console.log(`Updating order ${orderId} payment status to: ${newPaymentStatus}`);
			window.location.reload();
		} catch (error) {
			console.error('Failed to update payment status:', error);
			alert('Failed to update payment status. Please try again.');
		} finally {
			isUpdatingStatus = false;
		}	}

	function printOrder() {
		// Navigate to the print page in a new tab/window
		window.open(`/orders/${orderId}/print`, '_blank');
	}
	// Navigation
	function goBack() {
		// Use browser history to go back to previous page
		if (window.history.length > 1) {
			window.history.back();
		} else {
			// Fallback to orders page if no history
			goto('/orders');
		}
	}

	function editOrder() {
		goto(`/orders/${orderId}/edit`);
	}
</script>

<svelte:head>
	<title>Order {order.order_number} - Laundry Management System</title>
</svelte:head>

<div class="min-h-screen w-full bg-gray-50 p-4 lg:p-6">
	<!-- Header -->
	<div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div class="flex items-center gap-3">
			<button
				on:click={goBack}
				class="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 bg-white transition-colors hover:bg-gray-50"
			>
				<ArrowLeft class="h-5 w-5 text-gray-600" />
			</button>			<div>
				<div class="flex items-center gap-3 mb-2">
					<Eye class="w-8 h-8 text-gray-600" />
					<h1 class="text-2xl font-bold text-gray-900">Order {order.order_number}</h1>
				</div>
				<p class="text-sm text-gray-500">Created on {formatDate(order.created_at)}</p>
			</div>
		</div>
		<div class="flex items-center gap-3">
			<button
				on:click={printOrder}
				class="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:border-transparent focus:ring-2 focus:ring-gray-500"
			>
				<Printer class="h-4 w-4" />
				Print Receipt
			</button>

			<button
				on:click={editOrder}
				class="inline-flex items-center gap-2 rounded-lg border border-transparent bg-gray-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700 focus:border-transparent focus:ring-2 focus:ring-gray-500"
			>
				<Edit2 class="h-4 w-4" />
				Edit Order
			</button>
		</div>
	</div>	<!-- Main Content -->
	<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
		<!-- Left Column: Order Details -->
		<div class="space-y-6 lg:col-span-2">
			<!-- Customer Information -->
			<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
				<h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
					<User class="h-5 w-5 text-gray-600" />
					Customer Information
				</h2>
				<div class="space-y-4">
					<div>
						<span class="block text-sm font-medium text-gray-500">Name</span>
						<p class="text-base font-medium text-gray-900">{order.customer_name}</p>
					</div>

					{#if order.customer_phone}
						<div>
							<span class="block text-sm font-medium text-gray-500">Phone</span>
							<div class="flex items-center gap-2">
								<Phone class="h-4 w-4 text-gray-400" />
								<p class="text-base text-gray-900">{order.customer_phone}</p>
							</div>
						</div>
					{/if}
				</div>
			</div>

			<!-- Service Details -->
			<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
				<h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
					<Package class="h-5 w-5 text-gray-600" />
					Service Details
				</h2>
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<div>
						<span class="block text-sm font-medium text-gray-500">Service Type</span>
						<p class="text-base font-medium text-gray-900">{order.service_type}</p>
					</div>

					<div>
						<span class="block text-sm font-medium text-gray-500">Weight</span>
						<div class="flex items-center gap-2">
							<Weight class="h-4 w-4 text-gray-400" />
							<p class="text-base text-gray-900">{order.quantity} kg</p>
						</div>
					</div>

					<div>
						<span class="block text-sm font-medium text-gray-500">Unit Price</span>
						<div class="flex items-center gap-2">
							<DollarSign class="h-4 w-4 text-gray-400" />
							<p class="text-base text-gray-900">₱{order.unit_price.toFixed(2)} per kg</p>
						</div>
					</div>

					<div>
						<span class="block text-sm font-medium text-gray-500">Total Amount</span>
						<p class="text-xl font-bold text-green-600">₱{order.total_amount.toFixed(2)}</p>
					</div>
				</div>
			</div>

			<!-- Schedule Information -->
			<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
				<h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
					<Calendar class="h-5 w-5 text-gray-600" />
					Schedule Information
				</h2>
				<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
					{#if order.pickup_date}
						<div>
							<span class="block text-sm font-medium text-gray-500">Expected Pickup</span>
							<div class="mt-1 flex items-center gap-2">
								<Clock class="h-4 w-4 text-gray-400" />
								<div>
									<p class="text-base font-medium text-gray-900">
										{formatDateOnly(order.pickup_date)}
									</p>
									<p class="text-sm text-gray-600">{formatTime(order.pickup_date)}</p>
								</div>
							</div>
						</div>
					{/if}

					{#if order.delivery_date}
						<div>
							<span class="block text-sm font-medium text-gray-500">Delivery Date</span>
							<div class="mt-1 flex items-center gap-2">
								<Clock class="h-4 w-4 text-gray-400" />
								<div>
									<p class="text-base font-medium text-gray-900">
										{formatDateOnly(order.delivery_date)}
									</p>
									<p class="text-sm text-gray-600">{formatTime(order.delivery_date)}</p>
								</div>
							</div>
						</div>
					{/if}
				</div>
			</div>

			<!-- Remarks -->
			{#if order.remarks}
				<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
					<h2 class="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
						<FileText class="h-5 w-5 text-gray-600" />
						Remarks
					</h2>
					<p class="leading-relaxed text-gray-700">{order.remarks}</p>
				</div>
			{/if}
		</div>

		<!-- Right Column: Status & Actions -->
		<div class="space-y-6">
			<!-- Current Status -->
			<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
				<h2 class="mb-4 text-lg font-semibold text-gray-900">Current Status</h2>
				<div class="space-y-4">
					<div>
						<span class="mb-2 block text-sm font-medium text-gray-500">Order Status</span>
						<span
							class="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium {getStatusColor(
								order.status
							)}"
						>
							<svelte:component this={getStatusIcon(order.status)} class="h-4 w-4" />
							{order.status.charAt(0).toUpperCase() + order.status.slice(1)}
						</span>
					</div>

					<div>
						<span class="mb-2 block text-sm font-medium text-gray-500">Payment Status</span>
						<span
							class="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium {getPaymentStatusColor(
								order.payment_status
							)}"
						>
							<svelte:component this={getPaymentStatusIcon(order.payment_status)} class="h-4 w-4" />
							{order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
						</span>
					</div>

					<div>
						<span class="mb-2 block text-sm font-medium text-gray-500">Payment Method</span>
						<span
							class="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium {getPaymentMethodColor(
								order.payment_method
							)}"
						>
							<svelte:component this={getPaymentMethodIcon(order.payment_method)} class="h-4 w-4" />
							{getPaymentMethodText(order.payment_method)}
						</span>
					</div>
				</div>
			</div>

			<!-- Quick Status Updates -->
			<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
				<h2 class="mb-4 text-lg font-semibold text-gray-900">Quick Actions</h2>

				<div class="space-y-4">
					<!-- Order Status Updates -->
					<div>
						<span class="mb-2 block text-sm font-medium text-gray-700">Update Order Status</span>
						<div class="grid grid-cols-2 gap-2">
							<button
								on:click={() => updateOrderStatus('processing')}
								disabled={isUpdatingStatus || order.status === 'processing'}
								class="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700 transition-colors hover:bg-blue-100 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
							>
								Mark Processing
							</button>

							<button
								on:click={() => updateOrderStatus('ready')}
								disabled={isUpdatingStatus || order.status === 'ready'}
								class="rounded-lg border border-purple-200 bg-purple-50 px-3 py-2 text-xs font-medium text-purple-700 transition-colors hover:bg-purple-100 focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
							>
								Mark Ready
							</button>

							<button
								on:click={() => updateOrderStatus('completed')}
								disabled={isUpdatingStatus || order.status === 'completed'}
								class="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100 focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
							>
								Mark Completed
							</button>

							<button
								on:click={() => updateOrderStatus('cancelled')}
								disabled={isUpdatingStatus || order.status === 'cancelled'}
								class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 focus:ring-2 focus:ring-red-500 disabled:opacity-50"
							>
								Cancel Order
							</button>
						</div>
					</div>

					<!-- Payment Status Updates -->
					<div>
						<span class="mb-2 block text-sm font-medium text-gray-700">Update Payment Status</span>
						<div class="grid grid-cols-2 gap-2">
							<button
								on:click={() => updatePaymentStatus('paid')}
								disabled={isUpdatingStatus || order.payment_status === 'paid'}
								class="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-100 focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
							>
								Mark Paid
							</button>

							<button
								on:click={() => updatePaymentStatus('unpaid')}
								disabled={isUpdatingStatus || order.payment_status === 'unpaid'}
								class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 transition-colors hover:bg-red-100 focus:ring-2 focus:ring-red-500 disabled:opacity-50"
							>
								Mark Unpaid
							</button>
						</div>
					</div>

					<!-- Loading indicator -->
					{#if isUpdatingStatus}
						<div class="flex items-center justify-center py-2">
							<div
								class="h-5 w-5 animate-spin rounded-full border-2 border-gray-600 border-t-transparent"
							></div>
							<span class="ml-2 text-sm text-gray-600">Updating...</span>
						</div>
					{/if}
				</div>
			</div>

			<!-- Order Metadata -->
			<div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
				<h2 class="mb-4 text-lg font-semibold text-gray-900">Order Information</h2>

				<div class="space-y-3 text-sm">
					<div class="flex justify-between">
						<span class="text-gray-500">Order ID:</span>
						<span class="font-medium text-gray-900">{order.id}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-gray-500">Created:</span>
						<span class="font-medium text-gray-900">{formatDate(order.created_at)}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-gray-500">Last Updated:</span>
						<span class="font-medium text-gray-900">{formatDate(order.updated_at)}</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
