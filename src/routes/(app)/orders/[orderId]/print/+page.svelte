<script lang="ts">
	import { onMount } from 'svelte';
	import { Printer, ArrowLeft } from 'lucide-svelte';
	import type { PageData } from './$types';

	export let data: PageData;
	const order = data.order;
	const totalWeightDisplay = order.total_weight_kg ?? (order.load_count && order.kg_per_load ? order.load_count * order.kg_per_load : 0);

	// Parse load_details safely (in case it's a string from JSONB)
	$: parsedLoadDetails = (() => {
		if (!order?.load_details) return [];
		if (Array.isArray(order.load_details)) return order.load_details;
		if (typeof order.load_details === 'string') {
			try {
				return JSON.parse(order.load_details);
			} catch {
				return [];
			}
		}
		return [];
	})();

	// Receipt date formatting
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
		case 'others':
			return 'Other Method';
			default:
				return method;
		}
	}

	// Calculate subtotal and tax for receipt
	$: subtotal = order.total_amount;
	$: tax = 0; // Tax calculation disabled
	$: totalWithTax = subtotal + tax;
	// Start printing once page loads
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
					<Printer class="h-8 w-8 text-brand-800" />
					<h1 class="text-xl font-bold text-brand-900 sm:text-2xl">Print Receipt</h1>
				</div>
				<p class="text-sm text-gray-500">Order {order.order_number}</p>
			</div>
		</div>
		<button
			on:click={() => window.print()}
			class="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-800 px-4 py-2 text-sm text-white transition-colors hover:bg-brand-900 sm:w-auto sm:text-base"
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
	<div class="border-b border-black p-3 text-center print:p-2 print:pb-1">
		<div class="mb-1 print:mb-0.5">
			<img
				src="/logo/logo_banner.png"
				alt="Betchay Laundry Logo"
				class="mx-auto h-8 print:h-6"
			/>
		</div>
		<div class="space-y-0.5 text-[10px] text-black print:text-[9px]">
			<p class="font-bold print:text-[10px]">BETCHAY LAUNDRY</p>
			<p>Lucena City, Quezon Province</p>
			<p class="break-words text-gray-700">Tel: (02) 123-4567 | Mobile: +63 912 345 6789</p>
		</div>
	</div>
	<div class="space-y-2 p-3 print:space-y-1 print:p-2">
		<!-- Order & Customer Information (Combined) -->
		<div class="text-[10px] print:text-[9px]">
			<div class="grid grid-cols-2 gap-x-3 gap-y-1 border-b border-gray-300 pb-1 mb-1">
				<div>
					<span class="text-gray-600">Order #:</span>
					<span class="font-bold text-black ml-1">{order.order_number}</span>
				</div>
				<div>
					<span class="text-gray-600">Date:</span>
					<span class="font-bold text-black ml-1">{formatDateOnly(order.created_at)}</span>
				</div>
				<div>
					<span class="text-gray-600">Time:</span>
					<span class="font-bold text-black ml-1">{formatTime(order.created_at)}</span>
				</div>
				<div>
					<span class="text-gray-600">Customer:</span>
					<span class="font-bold text-black ml-1 break-words">{order.customer_name}</span>
				</div>
				{#if order.customer_phone}
					<div class="col-span-2">
						<span class="text-gray-600">Phone:</span>
						<span class="font-bold text-black ml-1">{order.customer_phone}</span>
					</div>
				{/if}
			</div>
		</div>
		<!-- Service Details -->
		<div class="text-[10px] print:text-[9px]">
			<div class="font-bold uppercase tracking-wide border-b border-black pb-0.5 mb-1">Service Details</div>
			<div class="space-y-1">
				<div class="flex justify-between">
					<span class="text-black">Service:</span>
					<span class="font-semibold text-black">{order.service_type}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-black">Loads:</span>
					<span class="font-semibold text-black">{Math.round(order.load_count || 0)} ({totalWeightDisplay.toFixed(2)} kg)</span>
				</div>
				{#if parsedLoadDetails && parsedLoadDetails.length > 0 && parsedLoadDetails.length <= 4}
					<div class="text-[9px] print:text-[8px] pl-2 border-l-2 border-gray-300">
						{#each parsedLoadDetails as loadDetail, index}
							<div class="flex justify-between">
								<span>L{index + 1}:</span>
								<span>{loadDetail.weight}kg</span>
							</div>
						{/each}
					</div>
				{:else if parsedLoadDetails && parsedLoadDetails.length > 4}
					<div class="text-[9px] print:text-[8px] pl-2 border-l-2 border-gray-300">
						{#each parsedLoadDetails.slice(0, 3) as loadDetail, index}
							<div class="flex justify-between">
								<span>L{index + 1}:</span>
								<span>{loadDetail.weight}kg</span>
							</div>
						{/each}
						<div class="text-gray-600 italic">+{parsedLoadDetails.length - 3} more loads</div>
					</div>
				{/if}
				<div class="flex justify-between">
					<span class="text-black">Rate:</span>
					<span class="font-semibold text-black">₱{order.unit_price.toFixed(2)}/load</span>
				</div>
			</div>

			<!-- Add-ons Section -->
			{#if order.order_add_ons && order.order_add_ons.length > 0}
				<div class="mt-1 pt-1 border-t border-gray-300">
					<div class="font-semibold text-[9px] print:text-[8px] mb-0.5">Add-ons:</div>
					<div class="space-y-0.5 text-[9px] print:text-[8px]">
						{#each order.order_add_ons as addOn}
							<div class="flex justify-between">
								<span>{addOn.add_on?.name || 'Unknown'} ({addOn.quantity}×):</span>
								<span class="font-semibold">₱{addOn.total_price.toFixed(2)}</span>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Pricing Breakdown -->
			<div class="mt-1 pt-1 border-t-2 border-black space-y-0.5">
				<div class="flex justify-between">
					<span>Subtotal:</span>
					<span class="font-semibold">₱{order.subtotal_amount?.toFixed(2) || (order.load_count * order.unit_price).toFixed(2)}</span>
				</div>
				{#if order.add_ons_amount && order.add_ons_amount > 0}
					<div class="flex justify-between">
						<span>Add-ons:</span>
						<span class="font-semibold">₱{order.add_ons_amount.toFixed(2)}</span>
					</div>
				{/if}
				<div class="flex justify-between border-t border-black pt-0.5 mt-0.5">
					<span class="font-bold text-[11px] print:text-[10px]">TOTAL:</span>
					<span class="font-bold text-[11px] print:text-[10px]">₱{totalWithTax.toFixed(2)}</span>
				</div>
			</div>
		</div>
		<!-- Payment & Schedule (Combined) -->
		<div class="text-[10px] print:text-[9px] border-t border-gray-300 pt-1">
			<div class="grid grid-cols-2 gap-x-3 gap-y-0.5">
				<div>
					<span class="text-gray-600">Payment:</span>
					<span class="font-semibold text-black ml-1">{getPaymentMethodText(order.payment_method)}</span>
				</div>
				<div>
					<span class="text-gray-600">Status:</span>
					<span class="font-bold text-black ml-1 {order.payment_status === 'paid' ? 'text-green-700' : 'text-red-700'}"
						>{order.payment_status === 'paid' ? '✓ PAID' : 'UNPAID'}</span
					>
				</div>
				{#if order.pickup_date}
					<div class="col-span-2">
						<span class="text-gray-600">Pickup:</span>
						<span class="font-semibold text-black ml-1">{formatDateOnly(order.pickup_date)} {formatTime(order.pickup_date)}</span>
					</div>
				{/if}
				{#if order.delivery_date}
					<div class="col-span-2">
						<span class="text-gray-600">Delivery:</span>
						<span class="font-semibold text-black ml-1">{formatDateOnly(order.delivery_date)} {formatTime(order.delivery_date)}</span>
					</div>
				{/if}
			</div>
		</div>
		
		<!-- Remarks -->
		{#if order.remarks}
			<div class="text-[10px] print:text-[9px] border-t border-gray-300 pt-1">
				<div class="font-semibold mb-0.5">Remarks:</div>
				<p class="break-words text-[9px] print:text-[8px] leading-tight">{order.remarks}</p>
			</div>
		{/if}
	</div>
	<!-- Clean Footer -->
	<div class="border-t border-black p-2 text-center print:p-1 print:pt-1">
		<div class="mx-auto h-0.5 w-12 bg-black print:w-10"></div>
		<div class="space-y-0.5 text-[9px] text-black print:text-[8px] mt-1">
			<p class="font-bold">Thank you for choosing Betchay Laundry!</p>
			<p>Keep this receipt for your records</p>
			<p class="break-words">For inquiries: (02) 123-4567</p>
		</div>
	</div>
</div>

<style>
	@page {
		size: 80mm auto;
		margin: 0.1in 0.08in;
	}
	
	@media print {
		* {
			margin: 0;
			padding: 0;
		}
		
		.print\:text-\[9px\] {
			font-size: 9px !important;
		}
		
		.print\:text-\[8px\] {
			font-size: 8px !important;
		}
		
		.print\:text-\[10px\] {
			font-size: 10px !important;
		}
		
		.print\:p-2 {
			padding: 0.5rem !important;
		}
		
		.print\:p-1 {
			padding: 0.25rem !important;
		}
		
		.print\:space-y-1 > * + * {
			margin-top: 0.25rem !important;
		}
	}
</style>
