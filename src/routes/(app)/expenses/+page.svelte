<script lang="ts">
	import { onMount } from 'svelte';
	import { Plus, Wallet, Calendar, FileText, XCircle, Filter, Search } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import type { Expense } from '$lib/types/expense';
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';

	export let data: PageData;

	let expenses: Expense[] = data.expenses;
	let filteredExpenses: Expense[] = expenses;
	let totalExpenses = 0;
	let todayExpenses = 0;
	let monthExpenses = 0;
	let expenseCount = 0;
	let activeDateFilter: 'all' | 'today' | 'last7days' = 'all';

	// Filter state
	let searchQuery = '';
	let selectedCategory = 'all';
	let startDate = '';
	let endDate = '';
	let showModal = false;
	let editingExpenseId: string | null = null;
	let isSubmitting = false;
	let errorMessage: string | null = data.error ?? null;

	let formCategory = '';
	let formDescription = '';
	let formAmount: number | '' = '';
	let formIncurredOn = '';
	let formNotes = '';

	function openModal() {
		resetForm();
		editingExpenseId = null;
		showModal = true;
	}

	function closeModal() {
		if (isSubmitting) return;
		showModal = false;
		errorMessage = null;
	}

	function resetForm() {
		formCategory = '';
		formDescription = '';
		formAmount = '';
		formIncurredOn = new Date().toISOString().slice(0, 10);
		formNotes = '';
	}

	function openEditModal(exp: Expense) {
		editingExpenseId = exp.id;
		formCategory = exp.category;
		formDescription = exp.description ?? '';
		formAmount = Number(exp.amount) || '';
		formIncurredOn = exp.incurred_on.slice(0, 10);
		formNotes = exp.notes ?? '';
		errorMessage = null;
		showModal = true;
	}

	onMount(() => {
		if (!formIncurredOn) {
			formIncurredOn = new Date().toISOString().slice(0, 10);
		}
	});

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
			year: 'numeric'
		}).format(new Date(dateString));
	}

	// Predefined expense categories for selection
	const baseExpenseCategories = [
		'Rent',
		'Utilities',
		'Detergent & Supplies',
		'Payroll',
		'Maintenance & Repairs',
		'Marketing',
		'Transportation',
		'Miscellaneous',
		'Other'
	];

	// Category options for filtering (All + known categories + any extra existing categories)
	$: categoryOptions = [
		{ value: 'all', label: 'All Categories' },
		...Array.from(
			new Set([
				...baseExpenseCategories,
				...expenses.map((e) => e.category)
			])
		)
			.filter(Boolean)
			.sort()
			.map((cat) => ({ value: cat, label: cat }))
	];

	function applyFilters() {
		let filtered = [...expenses];

		// Search by category, description, notes
		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase();
			filtered = filtered.filter((exp) =>
				(exp.category || '').toLowerCase().includes(q) ||
				(exp.description || '').toLowerCase().includes(q) ||
				(exp.notes || '').toLowerCase().includes(q)
			);
		}

		// Category filter
		if (selectedCategory !== 'all') {
			filtered = filtered.filter((exp) => exp.category === selectedCategory);
		}

		// Date range filter (client-side)
		if (startDate || endDate) {
			filtered = filtered.filter((exp) => {
				const d = new Date(exp.incurred_on);
				const ds = d.toLocaleDateString('en-CA'); // YYYY-MM-DD

				if (startDate && endDate) {
					return ds >= startDate && ds <= endDate;
				} else if (startDate) {
					return ds >= startDate;
				} else if (endDate) {
					return ds <= endDate;
				}
				return true;
			});
		}

		filteredExpenses = filtered;

		// Summary stats based on filtered expenses
		expenseCount = filteredExpenses.length;
		totalExpenses =
			filteredExpenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0) || 0;

		const today = new Date();
		const todayStr = today.toLocaleDateString('en-CA'); // YYYY-MM-DD
		const thisMonth = today.getMonth();
		const thisYear = today.getFullYear();

		todayExpenses =
			filteredExpenses
				.filter((exp) => {
					const d = new Date(exp.incurred_on);
					const ds = d.toLocaleDateString('en-CA');
					return ds === todayStr;
				})
				.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0) || 0;

		monthExpenses =
			filteredExpenses
				.filter((exp) => {
					const d = new Date(exp.incurred_on);
					return d.getFullYear() === thisYear && d.getMonth() === thisMonth;
				})
				.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0) || 0;
	}

	function clearAllFilters() {
		searchQuery = '';
		selectedCategory = 'all';
		startDate = '';
		endDate = '';
		activeDateFilter = 'all';
		applyFilters();
	}

	function setTodayFilter() {
		const today = new Date();
		const ds = today.toISOString().slice(0, 10);
		startDate = ds;
		endDate = ds;
		activeDateFilter = 'today';
		applyFilters();
	}

	function setLast7DaysFilter() {
		const today = new Date();
		const last7 = new Date();
		last7.setDate(today.getDate() - 6);

		startDate = last7.toISOString().slice(0, 10);
		endDate = today.toISOString().slice(0, 10);
		activeDateFilter = 'last7days';
		applyFilters();
	}

	function setAllDatesFilter() {
		startDate = '';
		endDate = '';
		activeDateFilter = 'all';
		applyFilters();
	}

	// Keep filtered list & summary in sync
	$: applyFilters();

</script>

<svelte:head>
	<title>Expenses - Laundry Management System</title>
	<meta name="description" content="Manage shop expenses" />
</svelte:head>

<div class="min-h-screen w-full bg-gray-50 p-4 lg:p-6">
	<!-- Header -->
	<div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<div class="flex items-center gap-3 mb-2">
				<Wallet class="w-8 h-8 text-gray-700" />
				<h1 class="text-2xl font-bold text-brand-900">Expenses</h1>
			</div>
			<p class="text-sm text-gray-500">
				Track your shop expenses. These will be deducted from your total revenue.
			</p>
		</div>

		<div class="flex items-center gap-3">
			<button
				type="button"
				on:click={openModal}
				class="inline-flex items-center gap-2 rounded-lg border border-brand-900 bg-brand-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-800 hover:border-brand-800 focus:border-transparent focus:ring-2 focus:ring-brand-500 shadow-sm hover:shadow-md"
			>
				<Plus class="h-4 w-4" />
				Add Expense
			</button>
		</div>
	</div>

	<!-- Quick Summary Cards -->
	<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
		<!-- Total Expenses (filtered) -->
		<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm font-medium text-gray-600">Total Expenses (Filtered)</p>
					<p class="text-2xl font-bold {totalExpenses < 0 ? 'text-red-600' : 'text-brand-900'}">
						{totalExpenses < 0 ? '-' : ''}{formatCurrency(Math.abs(totalExpenses))}
					</p>
				</div>
				<div class="p-3 {totalExpenses < 0 ? 'bg-red-50' : 'bg-brand-50'} rounded-full">
					<Wallet class="w-6 h-6 {totalExpenses < 0 ? 'text-red-600' : 'text-brand-800'}" />
				</div>
			</div>
		</div>

		<!-- This Month -->
		<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm font-medium text-gray-600">This Month</p>
					<p class="text-2xl font-bold {monthExpenses < 0 ? 'text-red-600' : 'text-brand-900'}">
						{monthExpenses < 0 ? '-' : ''}{formatCurrency(Math.abs(monthExpenses))}
					</p>
				</div>
				<div class="p-3 bg-brand-50 rounded-full">
					<Calendar class="w-6 h-6 text-brand-800" />
				</div>
			</div>
		</div>

		<!-- Today & Count -->
		<div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
			<div class="flex items-center justify-between mb-2">
				<div>
					<p class="text-sm font-medium text-gray-600">Today</p>
					<p class="text-xl font-bold {todayExpenses < 0 ? 'text-red-600' : 'text-brand-900'}">
						{todayExpenses < 0 ? '-' : ''}{formatCurrency(Math.abs(todayExpenses))}
					</p>
				</div>
			</div>
			<p class="text-xs text-gray-500 mt-1">
				{expenseCount} {expenseCount === 1 ? 'expense' : 'expenses'} in current view
			</p>
		</div>
	</div>

	<!-- Quick Date Filters -->
	<div class="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
		<div class="p-4 sm:p-6">
			<div class="flex items-center gap-3 mb-4">
				<Calendar class="w-5 h-5 text-brand-800" />
				<h3 class="text-lg font-medium text-gray-900">Quick Date Filters</h3>
			</div>
			<div class="flex flex-wrap gap-3">
				<button
					type="button"
					on:click={setTodayFilter}
					class="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 {activeDateFilter === 'today' 
						? 'bg-brand-800 text-white shadow-md' 
						: 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'}"
				>
					<Calendar class="w-4 h-4" />
					Today
				</button>
				<button
					type="button"
					on:click={setLast7DaysFilter}
					class="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 {activeDateFilter === 'last7days' 
						? 'bg-brand-800 text-white shadow-md' 
						: 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm'}"
				>
					<Calendar class="w-4 h-4" />
					Last 7 Days
				</button>
				<button
					type="button"
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

	<!-- Filters -->
	<div class="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
		<div class="p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between gap-4">
			<div class="flex items-center gap-2">
				<Filter class="w-5 h-5 text-gray-600" />
				<h2 class="text-lg font-medium text-gray-900">Filters</h2>
			</div>
		</div>

		<div class="p-4 sm:p-6">
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				<!-- Search -->
				<div>
					<label for="searchExpenses" class="block text-sm font-medium text-gray-700 mb-2">
						Search
					</label>
					<div class="relative">
						<Search class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
						<input
							id="searchExpenses"
							type="text"
							placeholder="Search category or notes"
							bind:value={searchQuery}
							on:input={applyFilters}
							class="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
						/>
					</div>
				</div>

				<!-- Category -->
				<div>
					<label for="categoryFilter" class="block text-sm font-medium text-gray-700 mb-2">
						Category
					</label>
					<select
						id="categoryFilter"
						bind:value={selectedCategory}
						on:change={applyFilters}
						class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
					>
						{#each categoryOptions as option}
							<option value={option.value}>{option.label}</option>
						{/each}
					</select>
				</div>

				<!-- Date Range -->
				<div class="lg:col-span-2">
					<label for="startDate" class="block text-sm font-medium text-gray-700 mb-2">
						Date Range
					</label>
					<div class="grid grid-cols-2 gap-2">
						<div>
							<input
								id="startDate"
								type="date"
								bind:value={startDate}
								on:change={applyFilters}
								class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
							/>
						</div>
						<div>
							<input
								id="endDate"
								type="date"
								bind:value={endDate}
								on:change={applyFilters}
								class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
							/>
						</div>
					</div>
				</div>
			</div>

			<!-- Filter Actions -->
			{#if searchQuery || selectedCategory !== 'all' || startDate || endDate}
				<div class="flex items-center gap-3 mt-6">
					<button
						type="button"
						on:click={clearAllFilters}
						class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
					>
						Clear All
					</button>
				</div>
			{/if}
		</div>

		<!-- Applied Filters Chips -->
		{#if searchQuery || selectedCategory !== 'all' || startDate || endDate}
			<div class="p-4 sm:p-6 border-t border-gray-200 bg-gray-50">
				<div class="flex flex-wrap items-center gap-3 text-sm">
					<span class="text-gray-600">Applied filters:</span>

					{#if searchQuery}
						<span class="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full">
							Search: "{searchQuery}"
							<button
								type="button"
								on:click={() => { searchQuery = ''; applyFilters(); }}
								class="text-blue-500 hover:text-blue-800"
								title="Clear search"
							>
								<XCircle class="w-4 h-4" />
							</button>
						</span>
					{/if}

					{#if selectedCategory !== 'all'}
						<span class="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
							{categoryOptions.find((o) => o.value === selectedCategory)?.label}
							<button
								type="button"
								on:click={() => { selectedCategory = 'all'; applyFilters(); }}
								class="text-gray-500 hover:text-brand-800"
								title="Clear category filter"
							>
								<XCircle class="w-4 h-4" />
							</button>
						</span>
					{/if}

					{#if startDate || endDate}
						<span class="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
							{startDate || 'Any'} - {endDate || 'Any'}
							<button
								type="button"
								on:click={() => { startDate = ''; endDate = ''; applyFilters(); }}
								class="text-gray-500 hover:text-brand-800"
								title="Clear date range"
							>
								<XCircle class="w-4 h-4" />
							</button>
						</span>
					{/if}
				</div>
			</div>
		{/if}
	</div>

	<!-- Expenses Table -->
	<div class="bg-white rounded-xl shadow-sm border border-gray-100">
		<div class="border-b border-gray-200 p-4 md:p-5 bg-gray-50 flex items-center justify-between">
			<div>
				<h2 class="text-sm font-semibold text-brand-900 flex items-center gap-2">
					<FileText class="w-4 h-4 text-gray-600" />
					Expense List
				</h2>
				<p class="text-xs text-gray-500 mt-1">
					Overview of your recorded shop expenses.
				</p>
			</div>
		</div>

		{#if !filteredExpenses || filteredExpenses.length === 0}
			<div class="flex flex-col items-center justify-center min-h-40 p-8 text-center">
				<FileText class="w-10 h-10 text-gray-300 mb-3" />
				<p class="text-sm font-medium text-gray-700 mb-1">No expenses recorded yet</p>
				<p class="text-xs text-gray-500 mb-3">
					Click &quot;Add Expense&quot; above to record your first shop expense.
				</p>
			</div>
		{:else}
			<div class="overflow-x-auto">
				<table class="min-w-full divide-y divide-gray-200 text-sm">
					<thead class="bg-gray-50">
						<tr>
							<th class="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
								Date
							</th>
							<th class="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
								Category
							</th>
							<th class="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
								Description
							</th>
							<th class="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">
								Amount
							</th>
							<th class="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">
								Actions
							</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-100 bg-white">
						{#each filteredExpenses as exp}
							<tr class="hover:bg-gray-50">
								<td class="px-4 py-2 whitespace-nowrap text-gray-700">
									{formatDate(exp.incurred_on)}
								</td>
								<td class="px-4 py-2 whitespace-nowrap text-gray-900 font-medium">
									{exp.category}
								</td>
								<td class="px-4 py-2 text-gray-600 max-w-xs">
									{exp.description || exp.notes || '—'}
								</td>
								<td class="px-4 py-2 text-right font-semibold text-red-600">
									-{formatCurrency(Number(exp.amount) || 0)}
								</td>
								<td class="px-4 py-2 text-right">
									<div class="flex justify-end gap-2">
										<button
											type="button"
											on:click={() => openEditModal(exp)}
											class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-brand-900 bg-brand-50 border border-brand-200 rounded-lg hover:bg-brand-100 hover:border-brand-300 transition-colors"
										>
											Edit
										</button>
										<form
											method="POST"
											action="?/delete"
											class="inline-block"
											on:submit|preventDefault={async (e) => {
												if (!confirm('Delete this expense?')) return;
												const form = e.currentTarget as HTMLFormElement;
												const formData = new FormData(form);
												const response = await fetch('?/delete', {
													method: 'POST',
													body: formData
												});
												if (response.ok) {
													toast.success('Expense deleted successfully');
													location.reload();
												} else {
													toast.error('Failed to delete expense');
												}
											}}
										>
											<input type="hidden" name="expense_id" value={exp.id} />
											<button
												type="submit"
												class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 transition-colors"
											>
												Delete
											</button>
										</form>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>

	<!-- Add Expense Modal -->
	{#if showModal}
		<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
			<div class="w-full max-w-lg rounded-xl bg-white shadow-xl border border-gray-200">
				<div class="flex items-center justify-between border-b border-gray-200 px-5 py-3">
					<h2 class="text-base font-semibold text-brand-900 flex items-center gap-2">
						<Wallet class="w-4 h-4 text-gray-700" />
						Add New Expense
					</h2>
					<button
						type="button"
						on:click={closeModal}
						class="p-1 rounded-full hover:bg-gray-100"
						aria-label="Close"
					>
						<XCircle class="w-5 h-5 text-gray-500" />
					</button>
				</div>

				<form
					method="POST"
					action={editingExpenseId ? '?/update' : '?/create'}
					use:enhance={() => {
						isSubmitting = true;
						errorMessage = null;

						return async ({ result }) => {
							isSubmitting = false;

							if (result.type === 'failure') {
								// result.data comes from the server action's fail(...)
								// @ts-ignore - result.data shape depends on action
								errorMessage = result.data?.error ?? 'Failed to save expense';
								return;
							}

							if (result.type === 'success') {
								showModal = false;
								toast.success(
									editingExpenseId
										? 'Expense updated successfully'
										: 'Expense added successfully'
								);
								// Reload to reflect latest data and updated summaries
								location.reload();
							}
						};
					}}
					class="px-5 py-4 space-y-4"
				>
					{#if errorMessage}
						<div class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
							{errorMessage}
						</div>
					{/if}

					{#if editingExpenseId}
						<input type="hidden" name="expense_id" value={editingExpenseId} />
					{/if}

					<div class="grid grid-cols-1 md:grid-cols-2 gap-3">
						<div>
							<label class="block text-xs font-medium text-gray-500 mb-1" for="category">
								Category *
							</label>
							<select
								id="category"
								name="category"
								bind:value={formCategory}
								required
								class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-white"
							>
								<option value="" disabled selected>Choose a category</option>
								{#each baseExpenseCategories as cat}
									<option value={cat}>{cat}</option>
								{/each}
							</select>
						</div>
						<div>
							<label class="block text-xs font-medium text-gray-500 mb-1" for="amount">
								Amount (₱) *
							</label>
							<input
								id="amount"
								name="amount"
								type="number"
								min="0.01"
								step="0.01"
								bind:value={formAmount}
								required
								class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-500 focus:border-transparent"
								placeholder="0.00"
							/>
						</div>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-3">
						<div>
							<label class="block text-xs font-medium text-gray-500 mb-1" for="incurred_on">
								Incurred On *
							</label>
							<input
								id="incurred_on"
								name="incurred_on"
								type="date"
								bind:value={formIncurredOn}
								required
								class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-500 focus:border-transparent"
							/>
						</div>
						<div>
							<label class="block text-xs font-medium text-gray-500 mb-1" for="description">
								Description
							</label>
							<input
								id="description"
								name="description"
								type="text"
								bind:value={formDescription}
								class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-500 focus:border-transparent"
								placeholder="Short description (optional)"
							/>
						</div>
					</div>

					<div>
						<label class="block text-xs font-medium text-gray-500 mb-1" for="notes">
							Notes
						</label>
						<textarea
							id="notes"
							name="notes"
							rows="3"
							bind:value={formNotes}
							class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-500 focus:border-transparent"
							placeholder="Any additional notes for this expense (optional)"
						></textarea>
					</div>

					<div class="flex justify-end gap-2 pt-2">
						<button
							type="button"
							on:click={closeModal}
							class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:border-transparent"
							disabled={isSubmitting}
						>
							Cancel
						</button>
						<button
							type="submit"
							class="px-4 py-2 text-sm font-medium text-white bg-brand-900 border border-brand-900 rounded-lg hover:bg-brand-800 hover:border-brand-800 focus:ring-2 focus:ring-brand-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
							disabled={isSubmitting}
						>
							{isSubmitting ? 'Saving...' : 'Save Expense'}
						</button>
					</div>
				</form>
			</div>
		</div>
	{/if}
</div>


