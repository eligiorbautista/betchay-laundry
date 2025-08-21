<script lang="ts">
	import { onMount } from 'svelte';
	import { 
		BarChart3, 
		TrendingUp, 
		Package, 
		CreditCard,
		Clock,
		CheckCircle,
		XCircle,
		Banknote,
		Smartphone,
		Building2,
		FileText,
		Printer,
		Calendar,
		Filter
	} from 'lucide-svelte';
	import LoadingSpinner from '$lib/components/common/LoadingSpinner.svelte';
	import AdminOnly from '$lib/components/common/AdminOnly.svelte';
	import Icon from '@iconify/svelte';
	import type { ReportsData } from '$lib/types/report';
	import type { PageData } from './$types';

	export let data: PageData;
	
	let reports: ReportsData = data.reports;
	let loading = false;
	let selectedPeriod = '30days';
	
	// Date filter variables
	let startDate = '';
	let endDate = '';
	let showCustomDateFilter = false;
	
	// Initialize default dates (last 30 days)
	onMount(() => {
		const today = new Date();
		const thirtyDaysAgo = new Date(today);
		thirtyDaysAgo.setDate(today.getDate() - 30);
		
		endDate = today.toISOString().split('T')[0];
		startDate = thirtyDaysAgo.toISOString().split('T')[0];
	});

	onMount(async () => {
		// Setup report filters and state
		loading = false;
	});

	// Browser print dialog for reports
	function printReport() {
		window.print();
	}
	
	// Update date range based on period selection
	function handlePeriodChange(period: string) {
		selectedPeriod = period;
		const today = new Date();
		
		switch (period) {
			case '7days':
				const sevenDaysAgo = new Date(today);
				sevenDaysAgo.setDate(today.getDate() - 7);
				startDate = sevenDaysAgo.toISOString().split('T')[0];
				endDate = today.toISOString().split('T')[0];
				showCustomDateFilter = false;
				break;
			case '30days':
				const thirtyDaysAgo = new Date(today);
				thirtyDaysAgo.setDate(today.getDate() - 30);
				startDate = thirtyDaysAgo.toISOString().split('T')[0];
				endDate = today.toISOString().split('T')[0];
				showCustomDateFilter = false;
				break;
			case '90days':
				const ninetyDaysAgo = new Date(today);
				ninetyDaysAgo.setDate(today.getDate() - 90);
				startDate = ninetyDaysAgo.toISOString().split('T')[0];
				endDate = today.toISOString().split('T')[0];
				showCustomDateFilter = false;
				break;
			case 'custom':
				showCustomDateFilter = true;
				break;
		}
		
		if (period !== 'custom') {
			applyDateFilter();
		}
	}
	
	function applyDateFilter() {
		if (!startDate || !endDate) return;
		
		loading = true;
		// In a real app, this would make an API call with the date parameters
		// TODO: Replace with actual API call for date filtering
		setTimeout(() => {
			// Update the summary period display
			reports.summary.period = `${formatDate(startDate)} - ${formatDate(endDate)}`;
			reports.summary.periodStart = startDate;
			reports.summary.periodEnd = endDate;
			loading = false;
		}, 500);
	}

	// Format utilities for display
	function formatCurrency(amount: number): string {
		return new Intl.NumberFormat('en-PH', {
			style: 'currency',
			currency: 'PHP'
		}).format(amount);
	}

	function formatDate(dateString: string): string {
		return new Intl.DateTimeFormat('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		}).format(new Date(dateString));
	}

	function formatPercentage(value: number): string {
		return `${value.toFixed(1)}%`;
	}

	function getStatusColor(status: string): string {
		switch (status) {
			case 'pending': return 'bg-orange-100 text-orange-800 border border-orange-200';
			case 'processing': return 'bg-blue-100 text-blue-800 border border-blue-200';
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

	function getPaymentMethodIcon(method: string) {
		switch (method) {
			case 'cash': return Banknote;
			case 'gcash': return Smartphone;
			case 'paymaya': return Smartphone;
			case 'bank_transfer': return Building2;
			case 'credit_card': return CreditCard;
			default: return CreditCard;
		}
	}

	function getStatusText(status: string): string {
		switch (status) {
			case 'pending': return 'Pending';
			case 'processing': return 'In Progress';
			case 'ready': return 'Ready for Pickup';
			case 'completed': return 'Completed';
			case 'cancelled': return 'Cancelled';
			default: return status;
		}
	}

	function getPaymentMethodText(method: string): string {
		switch (method) {
			case 'cash': return 'Cash';
			case 'gcash': return 'GCash';
			case 'paymaya': return 'PayMaya';
			case 'bank_transfer': return 'Bank Transfer';
			case 'credit_card': return 'Credit Card';
			default: return method;
		}
	}
</script>

<svelte:head>
	<title>Reports - Laundry Management System</title>
	<meta name="description" content="Business analytics and reports dashboard" />
</svelte:head>

<AdminOnly>
<div class="p-4 md:p-5 lg:p-6 w-full bg-gray-50 min-h-screen">
	<!-- Header -->
	<div class="mb-8">
		<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
			<div class="flex-1">
				<div class="flex items-center gap-2 md:gap-3 mb-2">
					<BarChart3 class="w-7 h-7 md:w-8 md:h-8 text-brand-800" />
					<h1 class="text-xl md:text-2xl lg:text-3xl font-bold text-brand-900">Reports & Analytics</h1>
				</div>
				<p class="text-gray-600 text-sm md:text-base mt-1">Comprehensive business insights and performance metrics.</p>
			</div>
			
			<!-- Actions and Info -->
			<div class="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
				<!-- Print Button - More Prominent -->
				<button 
					on:click={printReport}
					class="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-brand-800 border border-brand-800 rounded-lg hover:bg-brand-900 hover:shadow-md transition-all duration-200 print:hidden shadow-sm"
				>
					<Printer class="w-4 h-4" />
					<span>Print Report</span>
				</button>
				
				<!-- Last Updated Info -->
				<div class="flex items-center gap-2 text-xs md:text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
					<TrendingUp class="w-4 h-4" />
					<span>Updated: {new Date().toLocaleTimeString()}</span>
				</div>
			</div>
		</div>
	</div>

	<!-- Date Filter Section -->
	<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 mb-6 md:mb-8">
		<div class="flex flex-col sm:flex-row sm:items-center gap-4">
			<div class="flex items-center gap-2">
				<Filter class="w-5 h-5 text-gray-600" />
				<h3 class="text-lg font-semibold text-brand-900">Filter Reports</h3>
			</div>
			
			<!-- Period Selection -->
			<div class="flex flex-wrap gap-2">
				<button
					class="px-3 py-2 text-sm font-medium rounded-lg transition-colors {selectedPeriod === '7days' 
						? 'bg-brand-800 text-white' 
						: 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
					on:click={() => handlePeriodChange('7days')}
				>
					Last 7 Days
				</button>
				<button
					class="px-3 py-2 text-sm font-medium rounded-lg transition-colors {selectedPeriod === '30days' 
						? 'bg-brand-800 text-white' 
						: 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
					on:click={() => handlePeriodChange('30days')}
				>
					Last 30 Days
				</button>
				<button
					class="px-3 py-2 text-sm font-medium rounded-lg transition-colors {selectedPeriod === '90days' 
						? 'bg-brand-800 text-white' 
						: 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
					on:click={() => handlePeriodChange('90days')}
				>
					Last 90 Days
				</button>
				<button
					class="px-3 py-2 text-sm font-medium rounded-lg transition-colors {selectedPeriod === 'custom' 
						? 'bg-brand-800 text-white' 
						: 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
					on:click={() => handlePeriodChange('custom')}
				>
					<Calendar class="w-4 h-4 mr-1 inline" />
					Custom Range
				</button>
			</div>
		</div>

		<!-- Custom Date Range Inputs -->
		{#if showCustomDateFilter}
			<div class="mt-4 pt-4 border-t border-gray-200">
				<div class="flex flex-col sm:flex-row gap-4 items-end">
					<div class="flex-1">
						<label for="start-date" class="block text-sm font-medium text-gray-700 mb-2">
							Start Date
						</label>
						<input
							id="start-date"
							type="date"
							bind:value={startDate}
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors"
						/>
					</div>
					<div class="flex-1">
						<label for="end-date" class="block text-sm font-medium text-gray-700 mb-2">
							End Date
						</label>
						<input
							id="end-date"
							type="date"
							bind:value={endDate}
							class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors"
						/>
					</div>
					<div>
						<button
							on:click={applyDateFilter}
							disabled={!startDate || !endDate}
							class="px-4 py-2 bg-brand-800 text-white rounded-lg hover:bg-brand-900 focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
						>
							Apply Filter
						</button>
					</div>
				</div>
			</div>
		{/if}

		<!-- Current Filter Display -->
		<div class="mt-4 pt-4 border-t border-gray-200">
			<div class="flex items-center gap-2 text-sm text-gray-600">
				<Calendar class="w-4 h-4" />
				<span>Showing data for: <strong class="text-brand-900">{reports.summary.period}</strong></span>
			</div>
		</div>
	</div>

	<!-- Summary Cards -->
	<div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
		<!-- Total Revenue -->
		<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm font-medium text-gray-600 mb-1">Total Revenue</p>
					{#if loading}
						<LoadingSpinner size="xl" color="primary" center={true} />
					{:else}
						<p class="text-2xl font-bold text-brand-900">{formatCurrency(reports.summary.totalRevenue)}</p>
					{/if}
				</div>
				<div class="p-3 bg-slate-50 rounded-xl">
					<Icon icon="mdi:currency-php" class="w-6 h-6 text-slate-600" />
				</div>
			</div>
		</div>

		<!-- Total Orders -->
		<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm font-medium text-gray-600 mb-1">Total Orders</p>
					{#if loading}
						<LoadingSpinner size="xl" color="primary" center={true} />
					{:else}
						<p class="text-3xl font-bold text-brand-900">{reports.summary.totalOrders}</p>
					{/if}
				</div>
				<div class="p-3 bg-indigo-50 rounded-xl">
					<FileText class="w-6 h-6 text-indigo-600" />
				</div>
			</div>
		</div>

		<!-- Average Order Value -->
		<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm font-medium text-gray-600 mb-1">Avg Order Value</p>
					{#if loading}
						<LoadingSpinner size="xl" color="primary" center={true} />
					{:else}
						<p class="text-2xl font-bold text-brand-900">{formatCurrency(reports.summary.averageOrderValue)}</p>
					{/if}
				</div>
				<div class="p-3 bg-purple-50 rounded-xl">
					<TrendingUp class="w-6 h-6 text-purple-600" />
				</div>
			</div>
		</div>

		<!-- Completed Orders -->
		<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm font-medium text-gray-600 mb-1">Completed Orders</p>
					{#if loading}
						<LoadingSpinner size="xl" color="primary" center={true} />
					{:else}
						<p class="text-3xl font-bold text-emerald-600">{reports.orderStatusDistribution.find(status => status.status === 'completed')?.count || 0}</p>
					{/if}
				</div>
				<div class="p-3 bg-emerald-50 rounded-xl">
					<CheckCircle class="w-6 h-6 text-emerald-600" />
				</div>
			</div>
		</div>
	</div>

	<!-- Main Content Grid -->
	<div class="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
		<!-- Order Status Distribution -->
		<div class="lg:col-span-2 order-1">
			<div class="bg-white rounded-xl shadow-sm border border-gray-100">
				<div class="p-4 sm:p-5 md:p-6 border-b border-gray-100">
					<h2 class="text-base sm:text-lg md:text-xl font-semibold text-brand-900">Order Status Distribution</h2>
				</div>
				<div class="p-4 sm:p-5 md:p-6">
					<div class="space-y-4">
						{#each reports.orderStatusDistribution as statusReport}
							<div class="group border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all duration-200">
								<div class="flex items-center justify-between">
									<div class="flex items-center gap-3">
										<div class="w-10 h-10 {getStatusColor(statusReport.status)} flex items-center justify-center rounded-lg shadow-sm flex-shrink-0">
											<svelte:component this={getStatusIcon(statusReport.status)} class="w-5 h-5" />
										</div>
										<div class="flex-1 min-w-0">
											<p class="font-semibold text-brand-900 group-hover:text-blue-900 transition-colors">{getStatusText(statusReport.status)}</p>
											<p class="text-sm text-gray-600">{statusReport.count} orders • {formatCurrency(statusReport.revenue)}</p>
										</div>
									</div>
									<div class="text-right flex-shrink-0 ml-2">
										<p class="text-lg font-bold text-brand-900">{formatPercentage(statusReport.percentage)}</p>
									</div>
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>
		</div>

		<!-- Payment Methods Analysis -->
		<div class="order-2">
			<div class="bg-white rounded-xl shadow-sm border border-gray-100">
				<div class="p-4 sm:p-6 border-b border-gray-100">
					<h2 class="text-lg sm:text-xl font-semibold text-brand-900">Payment Methods</h2>
				</div>
				<div class="p-4 sm:p-6 space-y-3">
					{#each reports.paymentMethodAnalysis as payment}
						<div class="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all duration-200">
							<div class="w-8 h-8 bg-gray-100 flex items-center justify-center rounded-lg flex-shrink-0">
								<svelte:component this={getPaymentMethodIcon(payment.method)} class="w-4 h-4 text-gray-600" />
							</div>
							<div class="flex-1 min-w-0">
								<p class="font-medium text-brand-900 text-sm">{getPaymentMethodText(payment.method)}</p>
								<p class="text-xs text-gray-500">{payment.count} transactions</p>
							</div>
							<div class="text-right flex-shrink-0">
								<p class="font-semibold text-brand-900 text-sm">{formatCurrency(payment.totalAmount)}</p>
								<p class="text-xs text-gray-500">{formatPercentage(payment.percentage)}</p>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>

	<!-- Service Performance -->
	<div class="bg-white rounded-xl shadow-sm border border-gray-100 mt-6">
		<div class="p-4 sm:p-5 md:p-6 border-b border-gray-100">
			<h2 class="text-base sm:text-lg md:text-xl font-semibold text-brand-900">Service Performance</h2>
		</div>
		<div class="p-4 sm:p-5 md:p-6">
			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				{#each reports.serviceTypePerformance as service}
					<div class="group border border-gray-200 rounded-lg p-5 hover:border-blue-300 hover:shadow-md transition-all duration-200">
						<div class="flex items-start justify-between mb-4">
							<h3 class="font-semibold text-brand-900 group-hover:text-blue-900 transition-colors">{service.serviceType}</h3>
							<span class="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">{formatPercentage(service.percentage)}</span>
						</div>
						<div class="grid grid-cols-3 gap-3 text-sm">
							<div class="text-center">
								<p class="text-xs text-gray-500 mb-1">Orders</p>
								<p class="text-lg font-bold text-brand-900">{service.orderCount}</p>
							</div>
							<div class="text-center">
								<p class="text-xs text-gray-500 mb-1">Revenue</p>
								<p class="text-sm font-semibold text-brand-900">{formatCurrency(service.totalRevenue)}</p>
							</div>
							<div class="text-center">
								<p class="text-xs text-gray-500 mb-1">Avg Price</p>
								<p class="text-sm font-semibold text-brand-900">{formatCurrency(service.averagePrice)}</p>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>

	<!-- Monthly Trends -->
	<div class="bg-white rounded-xl shadow-sm border border-gray-100 mt-6">
		<div class="p-4 sm:p-5 md:p-6 border-b border-gray-100">
			<h2 class="text-base sm:text-lg md:text-xl font-semibold text-brand-900">Monthly Performance Trends</h2>
		</div>
		<div class="p-4 sm:p-5 md:p-6">
			<div class="overflow-x-auto">
				<table class="w-full text-sm">
					<thead>
						<tr class="text-left border-b-2 border-gray-200">
							<th class="pb-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">Month</th>
							<th class="pb-4 text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">Orders</th>
							<th class="pb-4 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Revenue</th>
							<th class="pb-4 text-xs font-semibold text-gray-600 uppercase tracking-wider text-right">Avg Order Value</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-100">
						{#each reports.monthlyTrends as trend}
							<tr class="hover:bg-gray-50 transition-colors">
								<td class="py-4 font-semibold text-brand-900">{trend.month} {trend.year}</td>
								<td class="py-4 text-gray-700 text-center font-medium">{trend.orderCount}</td>
								<td class="py-4 text-gray-700 text-right font-medium">{formatCurrency(trend.revenue)}</td>
								<td class="py-4 text-gray-700 text-right font-medium">{formatCurrency(trend.averageOrderValue)}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>

	<!-- Print Header - Only visible when printing -->
	<div class="hidden print:block print:text-center print:mb-6">
		<img 
			src="/logo/logo_banner.png" 
			alt="Betchay Laundry" 
			class="print:mx-auto print:h-12 print:mb-4"
		/>
		<h1 class="print:text-2xl print:font-bold print:text-black print:mb-2">Business Reports & Analytics</h1>
		<p class="print:text-sm print:text-gray-700">
			Period: {reports.summary.period} ({formatDate(reports.summary.periodStart)} - {formatDate(reports.summary.periodEnd)})
		</p>
		<p class="print:text-xs print:text-gray-600 print:mt-1">
			Generated on: {new Date().toLocaleDateString('en-US', { 
				weekday: 'long', 
				year: 'numeric', 
				month: 'long', 
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit'
			})}
		</p>
	</div>
</div>
</AdminOnly>

<style>
	@media print {
		/* Page setup and global styles */
		:global(*) {
			-webkit-print-color-adjust: exact !important;
			print-color-adjust: exact !important;
		}
		
		:global(body) {
			background: white !important;
			color: black !important;
			margin: 0 !important;
			padding: 0 !important;
		}
		
		/* Hide elements that shouldn't be printed */
		.print\\:hidden {
			display: none !important;
		}
		
		/* Main container adjustments */
		:global(.min-h-screen) {
			min-height: auto !important;
		}
		
		:global(.bg-gray-50) {
			background: white !important;
		}
		
		/* Adjust padding and margins for better print spacing */
		:global(.p-4), :global(.p-5), :global(.p-6),
		:global(.md\\:p-5), :global(.md\\:p-6),
		:global(.sm\\:p-5), :global(.sm\\:p-6) {
			padding: 8px !important;
		}
		
		:global(.mb-8), :global(.md\\:mb-8) {
			margin-bottom: 16px !important;
		}
		
		:global(.mb-6), :global(.md\\:mb-6) {
			margin-bottom: 12px !important;
		}
		
		:global(.mt-6) {
			margin-top: 16px !important;
		}
		
		:global(.gap-4), :global(.gap-6), :global(.md\\:gap-6) {
			gap: 8px !important;
		}
		
		/* Card and component styling */
		:global(.bg-white) {
			background: white !important;
			border: 0.5px solid #6b7280 !important;
			margin-bottom: 12px !important;
		}
		
		:global(.shadow-sm), :global(.hover\\:shadow-md) {
			box-shadow: none !important;
		}
		
		:global(.rounded-xl), :global(.rounded-lg) {
			border-radius: 4px !important;
		}
		
		/* Inner content borders - make them lighter */
		:global(.border-gray-200) {
			border-color: #e5e7eb !important;
			border-width: 0.5px !important;
		}
		
		:global(.border-gray-100) {
			border-color: #f3f4f6 !important;
			border-width: 0.5px !important;
		}
		
		/* Typography adjustments */
		:global(.text-brand-900) {
			color: black !important;
		}
		
		:global(.text-gray-700) {
			color: #374151 !important;
		}
		
		:global(.text-gray-600) {
			color: #4b5563 !important;
		}
		
		:global(.text-gray-500) {
			color: #6b7280 !important;
		}
		
		/* Text size adjustments for print */
		:global(.text-xl), :global(.text-2xl), :global(.text-3xl),
		:global(.md\\:text-2xl), :global(.lg\\:text-3xl) {
			font-size: 14px !important;
			line-height: 1.2 !important;
		}
		
		:global(.text-lg) {
			font-size: 12px !important;
			line-height: 1.2 !important;
		}
		
		:global(.text-sm) {
			font-size: 10px !important;
			line-height: 1.2 !important;
		}
		
		:global(.text-xs) {
			font-size: 8px !important;
			line-height: 1.2 !important;
		}
		
		/* Grid layout fixes */
		:global(.grid) {
			display: block !important;
		}
		
		/* Summary cards - stack vertically for print */
		:global(.grid.grid-cols-1.sm\\:grid-cols-2.xl\\:grid-cols-4) {
			display: block !important;
		}
		
		:global(.grid.grid-cols-1.sm\\:grid-cols-2.xl\\:grid-cols-4) > :global(*) {
			width: 48% !important;
			display: inline-block !important;
			vertical-align: top !important;
			margin-right: 2% !important;
			margin-bottom: 8px !important;
		}
		
		/* Main content grid - force single column */
		:global(.grid.grid-cols-1.lg\\:grid-cols-3) {
			display: block !important;
		}
		
		:global(.lg\\:col-span-2), :global(.order-1), :global(.order-2) {
			width: 100% !important;
			display: block !important;
			margin-bottom: 16px !important;
		}
		
		/* Service performance grid */
		:global(.grid.grid-cols-1.md\\:grid-cols-2) {
			display: block !important;
		}
		
		:global(.grid.grid-cols-1.md\\:grid-cols-2) > :global(*) {
			width: 48% !important;
			display: inline-block !important;
			vertical-align: top !important;
			margin-right: 2% !important;
			margin-bottom: 8px !important;
		}
		
		/* Space-y adjustments */
		:global(.space-y-4) > :global(* + *) {
			margin-top: 6px !important;
		}
		
		:global(.space-y-3) > :global(* + *) {
			margin-top: 5px !important;
		}
		
		/* Table styling */
		:global(table) {
			font-size: 9px !important;
			width: 100% !important;
			border-collapse: collapse !important;
		}
		
		:global(th), :global(td) {
			padding: 2px 4px !important;
			border: 0.5px solid #9ca3af !important;
			text-align: left !important;
		}
		
		:global(thead tr) {
			background: #f3f4f6 !important;
		}
		
		/* Page break controls */
		:global(.bg-white) {
			break-inside: avoid !important;
			page-break-inside: avoid !important;
		}
		
		/* Ensure proper table breaks */
		:global(table) {
			break-inside: auto !important;
		}
		
		:global(thead) {
			display: table-header-group !important;
		}
		
		:global(tbody tr) {
			break-inside: avoid !important;
			page-break-inside: avoid !important;
		}
		
		/* Icon and image sizing */
		:global(.w-4), :global(.h-4), :global(.w-5), :global(.h-5),
		:global(.w-6), :global(.h-6), :global(.w-7), :global(.h-7),
		:global(.w-8), :global(.h-8), :global(.w-10), :global(.h-10) {
			width: 12px !important;
			height: 12px !important;
		}
		
		/* Remove hover effects and transitions */
		:global(.hover\\:border-blue-300), :global(.hover\\:shadow-md),
		:global(.group-hover\\:text-blue-900), :global(.transition-all),
		:global(.transition-colors) {
			transition: none !important;
		}
		
		/* Print header styling */
		.print\\:block {
			display: block !important;
			text-align: center !important;
			margin-bottom: 20px !important;
			padding-bottom: 12px !important;
			border-bottom: 1px solid #374151 !important;
		}
	}
</style>