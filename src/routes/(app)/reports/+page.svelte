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
	import { enhance } from '$app/forms';

	export let data: PageData;
	
	let reports: ReportsData = data.reports;
	let loading = false;
	let selectedPeriod = '30days';
	
	// Date filter variables
	let startDate = '';
	let endDate = '';
	let showCustomDateFilter = false;
	
	// Year filter for monthly trends
	let selectedYear = new Date().getFullYear();
	let yearManuallySelected = false;
	
	// Initialize dates from URL params or defaults
	onMount(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const urlStartDate = urlParams.get('startDate');
		const urlEndDate = urlParams.get('endDate');
		
		if (urlStartDate && urlEndDate) {
			startDate = urlStartDate;
			endDate = urlEndDate;
			
			// Determine which period button should be selected
			const start = new Date(urlStartDate);
			const end = new Date(urlEndDate);
			const today = new Date();
			
			// Calculate difference more accurately
			const timeDiff = end.getTime() - start.getTime();
			const daysDiff = Math.round(timeDiff / (1000 * 60 * 60 * 24)) + 1;
			
			// Check if this matches one of our preset periods
			const todayStr = today.toISOString().split('T')[0];
			const sevenDaysAgoStr = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
			const thirtyDaysAgoStr = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
			const ninetyDaysAgoStr = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
			
			if (urlStartDate === sevenDaysAgoStr && urlEndDate === todayStr) {
				selectedPeriod = '7days';
			} else if (urlStartDate === thirtyDaysAgoStr && urlEndDate === todayStr) {
				selectedPeriod = '30days';
			} else if (urlStartDate === ninetyDaysAgoStr && urlEndDate === todayStr) {
				selectedPeriod = '90days';
			} else {
				selectedPeriod = 'custom';
				showCustomDateFilter = true;
			}
		} else {
			// No URL params - this means we're showing all data initially
			// Set form values to current 30-day range for the custom filter
			const today = new Date();
			const thirtyDaysAgo = new Date(today);
			thirtyDaysAgo.setDate(today.getDate() - 30);
			
			endDate = today.toISOString().split('T')[0];
			startDate = thirtyDaysAgo.toISOString().split('T')[0];
			selectedPeriod = 'all'; // Show "All Data" as selected
		}
		
		loading = false;
	});

	// Update selectedYear to current year or most recent available year when reports data loads
	$: if (reports.availableYears && reports.availableYears.length > 0 && !yearManuallySelected) {
		const currentYear = new Date().getFullYear();
		const availableYears = reports.availableYears;
		
		// If current year is available, use it; otherwise use the most recent year
		if (availableYears.includes(currentYear)) {
			selectedYear = currentYear;
		} else {
			selectedYear = availableYears[0]; // Most recent year (already sorted descending)
		}
	}

	// Reactive statement to filter monthly trends by year
	$: filteredMonthlyTrends = reports.monthlyTrends.filter(trend => trend.year === selectedYear);

	// Get display period text based on selected filter
	$: displayPeriod = (() => {
		if (selectedPeriod === 'all') {
			return 'All Data';
		} else if (selectedPeriod === '7days') {
			return 'Last 7 Days';
		} else if (selectedPeriod === '30days') {
			return 'Last 30 Days';
		} else if (selectedPeriod === '90days') {
			return 'Last 90 Days';
		} else if (selectedPeriod === 'custom') {
			return reports.summary.period;
		} else {
			return reports.summary.period;
		}
	})();

	// Browser print dialog for reports
	function printReport() {
		window.print();
	}
	
	// Update date range based on period selection
	async function handlePeriodChange(period: string) {
		selectedPeriod = period;
		const today = new Date();
		
		switch (period) {
			case 'all':
				// Navigate to page without date parameters to show all data
				window.location.href = window.location.pathname;
				return;
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
				return; // Don't apply filter for custom until user clicks apply
		}
		
		if (period !== 'custom') {
			await applyDateFilter();
		}
	}
	
	async function applyDateFilter() {
		if (!startDate || !endDate) return;
		
		loading = true;
		
		try {
			// Navigate to the page with new date parameters
			const url = new URL(window.location.href);
			url.searchParams.set('startDate', startDate);
			url.searchParams.set('endDate', endDate);
			
			// Use goto to refresh with new params
			window.location.href = url.toString();
		} catch (error) {
			console.error('Error applying date filter:', error);
			loading = false;
		}
	}
	
	// Handle year filter change for monthly trends
	function handleYearChange() {
		yearManuallySelected = true;
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
			case 'completed': return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
			case 'cancelled': return 'bg-red-100 text-red-800 border border-red-200';
			default: return 'bg-gray-100 text-gray-800 border border-gray-200';
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

	function getPaymentMethodIcon(method: string) {
		switch (method) {
			case 'cash': return Banknote;
			case 'gcash': return Smartphone;
			case 'others': return CreditCard;
			default: return CreditCard;
		}
	}

	function getStatusText(status: string): string {
		switch (status) {
			case 'pending': return 'Pending';
			case 'completed': return 'Completed';
			case 'cancelled': return 'Cancelled';
			default: return status;
		}
	}

	function getPaymentMethodText(method: string): string {
		switch (method) {
			case 'cash': return 'Cash';
			case 'gcash': return 'GCash';
			case 'others': return 'Other Method';
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
					class="px-3 py-2 text-sm font-medium rounded-lg transition-colors {selectedPeriod === 'all' 
						? 'bg-brand-800 text-white' 
						: 'bg-gray-100 text-gray-700 hover:bg-gray-200'}"
					on:click={() => handlePeriodChange('all')}
				>
					All Data
				</button>
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
				<form 
					method="POST" 
					action="?/filterByDate"
					use:enhance={() => {
						loading = true;
						return async ({ result }) => {
							loading = false;
							if (result.type === 'success' && result.data) {
								const data = result.data as { reports: ReportsData };
								reports = data.reports;
							}
						};
					}}
				>
					<div class="flex flex-col sm:flex-row gap-4 items-end">
						<div class="flex-1">
							<label for="start-date" class="block text-sm font-medium text-gray-700 mb-2">
								Start Date
							</label>
							<input
								id="start-date"
								name="startDate"
								type="date"
								bind:value={startDate}
								required
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors"
							/>
						</div>
						<div class="flex-1">
							<label for="end-date" class="block text-sm font-medium text-gray-700 mb-2">
								End Date
							</label>
							<input
								id="end-date"
								name="endDate"
								type="date"
								bind:value={endDate}
								required
								class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors"
							/>
						</div>
						<div>
							<button
								type="submit"
								disabled={!startDate || !endDate}
								class="px-4 py-2 bg-brand-800 text-white rounded-lg hover:bg-brand-900 focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
							>
								Apply Filter
							</button>
							<button
								type="button"
								on:click={applyDateFilter}
								disabled={!startDate || !endDate}
								class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
							>
								Refresh
							</button>
						</div>
					</div>
				</form>
			</div>
		{/if}

		<!-- Current Filter Display -->
		<div class="mt-4 pt-4 border-t border-gray-200">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-2 text-sm text-gray-600">
					<Calendar class="w-4 h-4" />
					<span>Showing data for: <strong class="text-brand-900">{displayPeriod}</strong></span>
				</div>
				<button
					on:click={() => applyDateFilter()}
					disabled={loading}
					class="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-brand-700 bg-brand-50 border border-brand-200 rounded-lg hover:bg-brand-100 focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
				>
					<TrendingUp class="w-4 h-4" />
					Refresh
				</button>
			</div>
		</div>
	</div>

	<!-- No Data State (currently disabled so stats always show) -->
	{#if false}
		<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 md:p-12 mb-6 md:mb-8">
			<div class="text-center">
				<BarChart3 class="w-16 h-16 text-gray-400 mx-auto mb-4" />
				<h3 class="text-lg font-semibold text-gray-900 mb-2">No Data Available</h3>
				<p class="text-gray-600 mb-4">No orders found for the selected period. Try adjusting your date range or check back later.</p>
				<button
					on:click={() => handlePeriodChange('30days')}
					class="inline-flex items-center gap-2 px-4 py-2 bg-brand-800 text-white rounded-lg hover:bg-brand-900 transition-colors"
				>
					<Calendar class="w-4 h-4" />
					View Last 30 Days
				</button>
			</div>
		</div>
	{:else}
		<!-- Summary Cards -->
		<div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
		<!-- Gross Revenue -->
		<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm font-medium text-gray-600 mb-1">Gross Revenue (Completed Orders)</p>
					{#if loading}
						<LoadingSpinner size="xl" color="primary" center={true} />
					{:else}
						<p class="text-2xl font-bold text-brand-900">{formatCurrency(reports.summary.grossRevenue)}</p>
						{#if reports.summary.grossRevenue === 0}
							<p class="text-xs text-gray-500 mt-1">No revenue recorded for this period yet.</p>
						{/if}
					{/if}
				</div>
				<div class="p-3 bg-indigo-50 rounded-xl">
					<Icon icon="mdi:currency-php" class="w-6 h-6 text-indigo-600" />
				</div>
			</div>
		</div>

		<!-- Net Revenue -->
		<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm font-medium text-gray-600 mb-1">Net Revenue</p>
					{#if loading}
						<LoadingSpinner size="xl" color="primary" center={true} />
					{:else}
						<p class="text-2xl font-bold {reports.summary.netRevenue < 0 ? 'text-red-600' : 'text-brand-900'}">
							{reports.summary.netRevenue < 0 ? '-' : ''}{formatCurrency(Math.abs(reports.summary.netRevenue))}
						</p>
						{#if reports.summary.netRevenue === 0 && reports.summary.grossRevenue === 0 && reports.summary.totalExpenses === 0}
							<p class="text-xs text-gray-500 mt-1">Net revenue is zero because no revenue or expenses have been recorded yet.</p>
						{/if}
					{/if}
				</div>
				<div class="p-3 bg-slate-50 rounded-xl">
					<Icon icon="mdi:currency-php" class="w-6 h-6 text-slate-600" />
				</div>
			</div>
		</div>

		<!-- Average Order Value -->
		<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm font-medium text-gray-600 mb-1">Avg Order Value (Completed)</p>
					{#if loading}
						<LoadingSpinner size="xl" color="primary" center={true} />
					{:else}
						<p class="text-2xl font-bold text-brand-900">{formatCurrency(reports.summary.averageOrderValue)}</p>
						{#if reports.summary.averageOrderValue === 0}
							<p class="text-xs text-gray-500 mt-1">Average order value is zero because no completed orders exist for this period.</p>
						{/if}
					{/if}
				</div>
				<div class="p-3 bg-purple-50 rounded-xl">
					<TrendingUp class="w-6 h-6 text-purple-600" />
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
						{#if reports.summary.totalOrders === 0}
							<p class="text-xs text-gray-500 mt-1">No orders have been created for this period.</p>
						{/if}
					{/if}
				</div>
				<div class="p-3 bg-emerald-50 rounded-xl">
					<FileText class="w-6 h-6 text-emerald-600" />
				</div>
			</div>
		</div>
	</div>

	<!-- Revenue & Expense Breakdown -->
	<div class="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 md:mb-8">
		<div class="p-4 sm:p-6 border-b border-gray-100 flex items-center justify-between">
			<h2 class="text-base sm:text-lg md:text-xl font-semibold text-brand-900">Revenue & Expense Breakdown</h2>
		</div>
		<div class="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
			<div>
				<h3 class="text-sm font-semibold text-gray-700 mb-3">Summary</h3>
				<div class="space-y-2 text-sm">
					<div class="flex justify-between">
						<span class="text-gray-600">Gross Revenue (Completed Orders)</span>
						<span class="font-semibold text-brand-900">{formatCurrency(reports.summary.grossRevenue)}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-gray-600">Total Expenses (excluding Payroll)</span>
						<span class="font-semibold {reports.summary.totalExpenses < 0 ? 'text-red-600' : 'text-brand-900'}">
							{reports.summary.totalExpenses < 0 ? '-' : ''}{formatCurrency(Math.abs(reports.summary.totalExpenses))}
						</span>
					</div>
					<div class="flex justify-between">
						<span class="text-gray-600">Staff Salary (Payroll)</span>
						<span class="font-semibold {reports.summary.totalPayroll < 0 ? 'text-red-600' : 'text-brand-900'}">
							{reports.summary.totalPayroll < 0 ? '-' : ''}{formatCurrency(Math.abs(reports.summary.totalPayroll))}
						</span>
					</div>
					<div class="flex justify-between border-t border-dashed border-gray-200 pt-2 mt-1">
						<span class="text-gray-800 font-semibold">Net Revenue</span>
						<span class="font-bold {reports.summary.netRevenue < 0 ? 'text-red-600' : 'text-emerald-600'}">
							{reports.summary.netRevenue < 0 ? '-' : ''}{formatCurrency(Math.abs(reports.summary.netRevenue))}
						</span>
					</div>
				</div>
			</div>
			<div>
				<h3 class="text-sm font-semibold text-gray-700 mb-3">Expenses by Category</h3>
				{#if reports.expenseBreakdown && reports.expenseBreakdown.length > 0}
					<div class="space-y-2 text-sm">
						{#each reports.expenseBreakdown as expCat}
							<div class="flex items-center justify-between border border-gray-100 rounded-lg px-3 py-2 hover:border-red-200 hover:bg-red-50/50 transition-colors">
								<span class="text-gray-700">{expCat.category}</span>
								<span class="font-semibold {expCat.totalAmount < 0 ? 'text-red-600' : 'text-brand-900'}">
									{expCat.totalAmount < 0 ? '-' : ''}{formatCurrency(Math.abs(expCat.totalAmount))}
								</span>
							</div>
						{/each}
					</div>
				{:else}
					<p class="text-xs text-gray-500 italic">No expenses recorded for this period.</p>
				{/if}
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
						{#if reports.orderStatusDistribution && reports.orderStatusDistribution.length > 0}
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
						{:else}
							<p class="text-sm text-gray-500 italic">No order status data available for this period.</p>
						{/if}
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
					{#if reports.paymentMethodAnalysis && reports.paymentMethodAnalysis.length > 0}
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
					{:else}
						<p class="text-sm text-gray-500 italic">No payment method data available for this period.</p>
					{/if}
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
			{#if reports.serviceTypePerformance && reports.serviceTypePerformance.length > 0}
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
			{:else}
				<p class="text-sm text-gray-500 italic">No service performance data available for this period.</p>
			{/if}
		</div>
	</div>

	<!-- Monthly Trends -->
	<div class="bg-white rounded-xl shadow-sm border border-gray-100 mt-6">
		<div class="p-4 sm:p-5 md:p-6 border-b border-gray-100">
			<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<h2 class="text-base sm:text-lg md:text-xl font-semibold text-brand-900">Monthly Performance Trends</h2>
				
				<!-- Year Filter -->
				{#if reports.availableYears && reports.availableYears.length > 0}
					<div class="flex items-center gap-3">
						<label for="yearFilter" class="text-sm font-medium text-gray-700">Filter by Year:</label>
						<select 
							id="yearFilter"
							bind:value={selectedYear}
							on:change={handleYearChange}
							class="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
						>
							{#each reports.availableYears as year}
								<option value={year}>{year}</option>
							{/each}
						</select>
					</div>
				{/if}
			</div>
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
						{#if filteredMonthlyTrends.length > 0}
							{#each filteredMonthlyTrends as trend}
								<tr class="hover:bg-gray-50 transition-colors">
									<td class="py-4 font-semibold text-brand-900">{trend.month} {trend.year}</td>
									<td class="py-4 text-gray-700 text-center font-medium">{trend.orderCount}</td>
									<td class="py-4 text-gray-700 text-right font-medium">{formatCurrency(trend.revenue)}</td>
									<td class="py-4 text-gray-700 text-right font-medium">{formatCurrency(trend.averageOrderValue)}</td>
								</tr>
							{/each}
						{:else}
							<tr>
								<td colspan="4" class="py-8 text-center text-gray-500">
									No monthly trends data available for the selected year.
								</td>
							</tr>
						{/if}
					</tbody>
				</table>
			</div>
		</div>
	</div>
	{/if}

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