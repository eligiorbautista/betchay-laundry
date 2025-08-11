<script lang="ts">
	import { onMount } from 'svelte';
	import { Printer, ArrowLeft } from 'lucide-svelte';
	import type { PageData } from './$types';

	export let data: PageData;
	const order = data.order;

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
		}).format(new Date(dateString));
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

	// Calculate subtotal and tax for receipt
	$: subtotal = order.total_amount;
	$: tax = 0; // No tax for now, but can be calculated if needed
	$: totalWithTax = subtotal + tax;
	// Auto-trigger print dialog when page loads
	onMount(() => {
		// Small delay to ensure page is fully rendered
		setTimeout(() => {
			window.print();
		}, 500);
	});

	// Navigation
	function goBack() {
		// Use browser history to go back to previous page
		if (window.history.length > 1) {
			window.history.back();
		} else {
			// Fallback to order view page if no history
			window.location.href = `/orders/${order.id}`;
		}
	}
</script>

<svelte:head>
	<title>Print Receipt - Order {order.order_number}</title>
</svelte:head>

<!-- Hide header and navigation in print mode -->
<div class="w-full bg-gray-50 p-3 sm:p-4 lg:p-6 print:hidden">
	<div class="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
		<div class="flex w-full items-center gap-3 sm:w-auto">
			<button
				on:click={goBack}
				class="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 bg-white transition-colors hover:bg-gray-50"
			>
				<ArrowLeft class="h-5 w-5 text-gray-600" />
			</button>
			<div class="flex-1 sm:flex-none">
				<div class="mb-2 flex items-center gap-3">
					<Printer class="h-8 w-8 text-blue-600" />
					<h1 class="text-xl font-bold text-gray-900 sm:text-2xl">Print Receipt</h1>
				</div>
				<p class="text-sm text-gray-500">Order {order.order_number}</p>
			</div>
		</div>
		<button
			on:click={() => window.print()}
			class="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700 sm:w-auto sm:text-base"
		>
			<svg class="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
				/>
			</svg>
			<span class="hidden sm:inline">Print Receipt</span>
			<span class="sm:hidden">Print</span>
		</button>
	</div>
</div>

<!-- Receipt Container -->
<div
	class="mx-3 mx-auto my-4 max-w-md border border-gray-300 bg-white sm:mx-auto sm:my-8 print:mx-0 print:my-0 print:max-w-full print:break-inside-avoid print:border-gray-400 print:shadow-none"
>
	<!-- Clean Header with Logo -->
	<div class="border-b border-black p-4 text-center sm:p-6">
		<div class="mb-3 sm:mb-4">
			<img
				src="/logo/logo_banner.png"
				alt="Betchay Laundry Logo"
				class="mx-auto mb-2 h-10 sm:mb-3 sm:h-12 print:h-10"
			/>
		</div>
		<div class="space-y-1 text-xs text-black sm:text-sm print:text-[10px]">
			<p class="font-medium">Lucena City, Quezon Province</p>
			<p class="break-words">Tel: (02) 123-4567 | Mobile: +63 912 345 6789</p>
		</div>
	</div>
	<div class="space-y-4 p-4 sm:space-y-6 sm:p-6 print:space-y-2 print:p-2">
		<!-- Order Information -->
		<div class="bg-gray-50 p-3 sm:p-4">
			<h3
				class="mb-2 text-xs font-bold uppercase tracking-wider text-black sm:mb-3 sm:text-sm print:text-[10px]"
			>
				Order Information
			</h3>
			<div class="grid grid-cols-2 gap-2 text-xs sm:gap-3 sm:text-sm print:text-[10px]">
				<div>
					<span class="text-black">Order #</span>
					<p class="break-words font-bold text-black">{order.order_number}</p>
				</div>
				<div>
					<span class="text-black">Date</span>
					<p class="font-bold text-black">{formatDateOnly(order.created_at)}</p>
				</div>
				<div class="col-span-2">
					<span class="text-black">Time</span>
					<p class="font-bold text-black">{formatTime(order.created_at)}</p>
				</div>
			</div>
		</div>
		<!-- Customer Details -->
		<div>
			<h3
				class="mb-2 text-xs font-bold uppercase tracking-wider text-black sm:mb-3 sm:text-sm print:text-[10px]"
			>
				Customer Details
			</h3>
			<div class="space-y-2 text-xs sm:text-sm print:text-[10px]">
				<div class="flex items-start justify-between sm:items-center">
					<span class="text-black">Name:</span>
					<span class="max-w-[60%] break-words text-right font-medium text-black"
						>{order.customer_name}</span
					>
				</div>
				{#if order.customer_phone}
					<div class="flex items-start justify-between sm:items-center">
						<span class="text-black">Phone:</span>
						<span class="max-w-[60%] break-words text-right font-medium text-black"
							>{order.customer_phone}</span
						>
					</div>
				{/if}
			</div>
		</div>
		<!-- Service Details -->
		<div>
			<h3
				class="mb-2 text-xs font-bold uppercase tracking-wider text-black sm:mb-3 sm:text-sm print:text-[10px]"
			>
				Service Details
			</h3>
			<div class="space-y-3 text-xs sm:text-sm print:text-[10px]">
				<div class="flex items-center justify-between py-2">
					<span class="font-medium text-black">{order.service_type}</span>
					<span class="text-black">{order.quantity} kg</span>
				</div>
				<div class="flex items-center justify-between">
					<span class="text-black">Rate per kg:</span>
					<span class="font-medium text-black">₱{order.unit_price.toFixed(2)}</span>
				</div>

				<!-- Pricing Breakdown -->
				<div class="space-y-2 bg-gray-50 p-2 sm:p-3">
					<div class="flex items-center justify-between">
						<span class="text-black">Subtotal:</span>
						<span class="font-medium text-black">₱{subtotal.toFixed(2)}</span>
					</div>
					{#if tax > 0}
						<div class="flex items-center justify-between">
							<span class="text-black">Tax:</span>
							<span class="font-medium text-black">₱{tax.toFixed(2)}</span>
						</div>
					{/if}
					<div class="border-t border-black pt-2">
						<div class="flex items-center justify-between">
							<span class="text-base font-bold text-black sm:text-lg print:text-sm">TOTAL</span>
							<span class="text-base font-bold text-black sm:text-lg print:text-sm"
								>₱{totalWithTax.toFixed(2)}</span
							>
						</div>
					</div>
				</div>
			</div>
		</div>
		<!-- Payment Information -->
		<div>
			<h3
				class="mb-2 text-xs font-bold uppercase tracking-wider text-black sm:mb-3 sm:text-sm print:text-[10px]"
			>
				Payment Information
			</h3>
			<div class="space-y-2 text-xs sm:text-sm print:text-[10px]">
				<div class="flex items-start justify-between sm:items-center">
					<span class="text-black">Method:</span>
					<span class="text-right font-medium text-black"
						>{getPaymentMethodText(order.payment_method)}</span
					>
				</div>
				<div class="flex items-start justify-between sm:items-center">
					<span class="text-black">Status:</span>
					<span class="text-right font-bold uppercase text-black">{order.payment_status}</span>
				</div>
			</div>
		</div>
		<!-- Schedule Information -->
		{#if order.pickup_date || order.delivery_date}
			<div>
				<h3
					class="mb-2 text-xs font-bold uppercase tracking-wider text-black sm:mb-3 sm:text-sm print:text-[10px]"
				>
					Schedule
				</h3>
				<div class="space-y-2 text-xs sm:text-sm print:text-[10px]">
					{#if order.pickup_date}
						<div
							class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-0"
						>
							<span class="text-black">Expected Pickup:</span>
							<span class="break-words text-right font-medium text-black"
								>{formatDateOnly(order.pickup_date)} at {formatTime(order.pickup_date)}</span
							>
						</div>
					{/if}
					{#if order.delivery_date}
						<div
							class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-0"
						>
							<span class="text-black">Delivery Date:</span>
							<span class="break-words text-right font-medium text-black"
								>{formatDateOnly(order.delivery_date)} at {formatTime(order.delivery_date)}</span
							>
						</div>
					{/if}
				</div>
			</div>
		{/if}
		<!-- Remarks -->
		{#if order.remarks}
			<div>
				<h3
					class="mb-2 text-xs font-bold uppercase tracking-wider text-black sm:mb-3 sm:text-sm print:text-[10px]"
				>
					Special Instructions
				</h3>
				<div class="bg-gray-50 p-2 sm:p-3">
					<p class="break-words text-xs text-black sm:text-sm print:text-[10px]">{order.remarks}</p>
				</div>
			</div>
		{/if}
	</div>
	<!-- Clean Footer -->
	<div class="space-y-2 border-t border-black p-4 text-center sm:space-y-3 sm:p-6 print:p-2">
		<div class="mx-auto h-0.5 w-12 bg-black sm:w-16"></div>
		<div class="space-y-1 text-xs text-black sm:space-y-2 sm:text-sm print:text-[10px]">
			<p class="font-bold text-black">Thank you for choosing Betchay Laundry!</p>
			<p>Keep this receipt for your records</p>
			<p class="break-words">For inquiries, call us at (02) 123-4567</p>
		</div>
		<div class="pt-1 sm:pt-2">
			<p class="break-words text-[10px] text-black sm:text-xs print:text-[8px]">
				Generated on {formatDate(new Date().toISOString())}
			</p>
		</div>
	</div>
</div>

<style>
	@page {
		size: 80mm auto;
		margin: 0.2in 0.1in;
	}
</style>
