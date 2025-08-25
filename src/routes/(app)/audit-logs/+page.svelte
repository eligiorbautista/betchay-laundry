<script lang="ts">
	import { goto } from '$app/navigation';
	import {
		Activity,
		LogIn,
		LogOut,
		FileText,
		Edit,
		CheckCircle,
		CreditCard,
		Key,
		ChevronLeft,
		ChevronRight
	} from 'lucide-svelte';
	import AdminOnly from '$lib/components/common/AdminOnly.svelte';
	import LoadingSpinner from '$lib/components/common/LoadingSpinner.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	// reactive variables with default values
	$: ({ auditLogs, pagination } = data || {
		auditLogs: [],
		pagination: {
			page: 1,
			limit: 20,
			totalCount: 0,
			totalPages: 0,
			hasNextPage: false,
			hasPrevPage: false
		}
	});

	// Pagination state (client-side like orders page)
	let currentPage = 1;
	let itemsPerPage = 10;
	let totalPages = 1;
	let totalItems = 0;
	let paginatedAuditLogs: typeof auditLogs = [];

	// loading state
	let isLoading = false;

	// Items per page options
	const itemsPerPageOptions = [
		{ value: 5, label: '5 per page' },
		{ value: 10, label: '10 per page' },
		{ value: 20, label: '20 per page' },
		{ value: 50, label: '50 per page' }
	];

	// Update pagination when auditLogs change
	$: {
		if (auditLogs) {
			updatePagination();
		}
	}

	function updatePagination() {
		totalItems = auditLogs.length;
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
		paginatedAuditLogs = auditLogs.slice(startIndex, endIndex);
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

	/**
	 * format date for display
	 */
	function formatDate(dateString: string): string {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			hour12: true
		});
	}

	/**
	 * get icon component based on action type
	 */
	function getIconComponent(actionType: string) {
		switch (actionType) {
			case 'login':
				return LogIn;
			case 'logout':
				return LogOut;
			case 'order_created':
				return FileText;
			case 'order_updated':
				return Edit;
			case 'order_status_changed':
				return CheckCircle;
			case 'payment_status_changed':
				return CreditCard;
			case 'reset_password':
			case 'password_changed':
				return Key;
			default:
				return Activity;
		}
	}

	/**
	 * get color class based on action type
	 */
	function getActionColor(actionType: string): string {
		switch (actionType) {
			case 'login':
				return 'bg-blue-100 text-blue-800';
			case 'logout':
				return 'bg-gray-100 text-gray-800';
			case 'order_created':
				return 'bg-indigo-100 text-indigo-800';
			case 'order_updated':
				return 'bg-yellow-100 text-yellow-800';
			case 'order_status_changed':
				return 'bg-emerald-100 text-emerald-800';
			case 'payment_status_changed':
				return 'bg-green-100 text-green-800';
			case 'reset_password':
			case 'password_changed':
				return 'bg-orange-100 text-orange-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	}

	/**
	 * get display text for action type
	 */
	function getActionText(actionType: string): string {
		switch (actionType) {
			case 'login':
				return 'Login';
			case 'logout':
				return 'Logout';
			case 'order_created':
				return 'Order Created';
			case 'order_updated':
				return 'Order Updated';
			case 'order_status_changed':
				return 'Status Changed';
			case 'payment_status_changed':
				return 'Payment Changed';
			case 'reset_password':
				return 'Password Reset';
			case 'password_changed':
				return 'Password Changed';
			default:
				return actionType.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
		}
	}






</script>

<svelte:head>
	<title>Audit Logs - Laundry Management System</title>
</svelte:head>

<AdminOnly>
	<div class="min-h-screen w-full bg-gray-50 p-4 md:p-5 lg:p-6">
		<!-- Header -->
		<div class="mb-6 md:mb-8">
			<div class="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center sm:gap-4">
				<div>
					<div class="mb-2 flex items-center gap-2 md:gap-3">
						<Activity class="h-6 w-6 text-brand-800 md:h-8 md:w-8" />
						<h1 class="text-xl font-bold text-brand-900 md:text-2xl lg:text-3xl">Audit Logs</h1>
					</div>
					<p class="text-sm text-gray-600 md:text-base">System activity and user actions</p>
				</div>

			</div>
		</div>

		<!-- Audit Logs Table -->
		<div class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
			{#if isLoading}
				<div class="flex items-center justify-center py-12">
					<LoadingSpinner size="lg" color="primary" message="Loading audit logs..." />
				</div>
			{:else if paginatedAuditLogs.length === 0}
				<div class="py-12 text-center">
					<Activity class="mx-auto mb-4 h-16 w-16 text-gray-400" />
					<h3 class="mb-2 text-lg font-medium text-gray-900">No audit logs found</h3>
					<p class="text-gray-600">Try adjusting your filters or check back later.</p>
				</div>
			{:else}
				<div class="overflow-x-auto">
					<table class="min-w-full divide-y divide-gray-200">
						<thead class="bg-gray-50">
							<tr>
								<th
									class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
								>
									Date & Time
								</th>
								<th
									class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
								>
									Action
								</th>
								<th
									class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
								>
									Description
								</th>
								<th
									class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
								>
									User
								</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-gray-200 bg-white">
							{#each paginatedAuditLogs as log}
								<tr class="hover:bg-gray-50">
									<td class="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
										{formatDate(log.created_at)}
									</td>
									<td class="whitespace-nowrap px-6 py-4">
										<span
											class="inline-flex items-center gap-2 rounded-full px-2.5 py-0.5 text-xs font-medium {getActionColor(
												log.action_type
											)}"
										>
											<svelte:component this={getIconComponent(log.action_type)} class="h-3 w-3" />
											{getActionText(log.action_type)}
										</span>
									</td>
									<td class="max-w-md px-6 py-4 text-sm text-gray-900">
										<div class="truncate" title={log.description}>
											{log.description}
										</div>
									</td>
									<td class="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
										{log.user_email || '-'}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</div>

		<!-- Simple Footer -->
		<div class="border-t border-gray-200 bg-gray-50 px-4 md:px-6 py-4 rounded-b-lg">
			<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
				<!-- Results count -->
				<div class="text-sm text-gray-600">
					{#if totalItems > 0}
						Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} audit logs
					{:else}
						No audit logs found
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
		</div>


	</div>
</AdminOnly>
