<script lang="ts">
	import { onMount } from 'svelte';
	import { Plus, Users, Phone, Edit3 } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import type { Staff } from '$lib/types/staff';
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';

	export let data: PageData;

	let staff: Staff[] = data.staff || [];
	let showModal = false;
	let isSubmitting = false;
	let errorMessage: string | null = data.error ?? null;
	let editingStaffId: string | null = null;

	let form_full_name = '';
	let form_role = '';
	let form_phone = '';
	let form_daily_rate: number | '' = '';
	let form_hired_at = '';
	let form_status: 'active' | 'inactive' = 'active';
	let form_notes = '';

	function resetForm() {
		form_full_name = '';
		form_role = '';
		form_phone = '';
		form_daily_rate = '';
		form_hired_at = '';
		form_status = 'active';
		form_notes = '';
		editingStaffId = null;
		errorMessage = null;
	}

	function openCreateModal() {
		resetForm();
		showModal = true;
	}

	function openEditModal(member: Staff) {
		editingStaffId = member.id;
		form_full_name = member.full_name;
		form_role = member.role ?? '';
		form_phone = member.phone ?? '';
		form_daily_rate = member.daily_rate;
		form_hired_at = member.hired_at ? member.hired_at.slice(0, 10) : '';
		form_status = member.status;
		form_notes = member.notes ?? '';
		errorMessage = null;
		showModal = true;
	}

	function closeModal() {
		if (isSubmitting) return;
		showModal = false;
	}

	function formatCurrency(amount: number) {
		return new Intl.NumberFormat('en-PH', {
			style: 'currency',
			currency: 'PHP'
		}).format(amount);
	}
</script>

<svelte:head>
	<title>Staff - Laundry Management System</title>
	<meta name="description" content="Manage staff and their daily rates" />
</svelte:head>

<div class="min-h-screen w-full bg-gray-50 p-4 lg:p-6">
	<!-- Header -->
	<div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<div class="flex items-center gap-3 mb-2">
				<Users class="w-8 h-8 text-gray-700" />
				<h1 class="text-2xl font-bold text-brand-900">Staff</h1>
			</div>
			<p class="text-sm text-gray-500">
				Manage your staff information and daily rates for salary calculations.
			</p>
		</div>

		<button
			type="button"
			on:click={openCreateModal}
			class="inline-flex items-center gap-2 rounded-lg border border-brand-900 bg-brand-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-800 hover:border-brand-800 focus:border-transparent focus:ring-2 focus:ring-brand-500 shadow-sm hover:shadow-md"
		>
			<Plus class="h-4 w-4" />
			Add Staff
		</button>
	</div>

	<!-- Staff Table -->
	<div class="bg-white rounded-xl shadow-sm border border-gray-100">
		<div class="border-b border-gray-200 p-4 md:p-5 bg-gray-50 flex items-center justify-between">
			<div>
				<h2 class="text-sm font-semibold text-brand-900 flex items-center gap-2">
					<Users class="w-4 h-4 text-gray-600" />
					Staff List
				</h2>
				<p class="text-xs text-gray-500 mt-1">
					All staff members with their roles, contact information, and daily rates.
				</p>
			</div>
		</div>

		{#if !staff || staff.length === 0}
			<div class="flex flex-col items-center justify-center min-h-40 p-8 text-center">
				<Users class="w-10 h-10 text-gray-300 mb-3" />
				<p class="text-sm font-medium text-gray-700 mb-1">No staff added yet</p>
				<p class="text-xs text-gray-500 mb-3">
					Click "Add Staff" above to register your first staff member.
				</p>
			</div>
		{:else}
			<div class="overflow-x-auto">
				<table class="min-w-full divide-y divide-gray-200 text-sm">
					<thead class="bg-gray-50">
						<tr>
							<th class="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
								Name
							</th>
							<th class="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
								Role
							</th>
							<th class="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
								Contact
							</th>
							<th class="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
								Status
							</th>
							<th class="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">
								Daily Rate
							</th>
							<th class="px-4 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
								Hired
							</th>
							<th class="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">
								Actions
							</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-100 bg-white">
						{#each staff as member}
							<tr class="hover:bg-gray-50">
								<td class="px-4 py-2 whitespace-nowrap text-gray-900 font-medium">
									{member.full_name}
								</td>
								<td class="px-4 py-2 whitespace-nowrap text-gray-600">
									{member.role || '—'}
								</td>
								<td class="px-4 py-2 whitespace-nowrap text-gray-600 flex items-center gap-1">
									{#if member.phone}
										<Phone class="w-4 h-4 text-gray-400" />
										<span>{member.phone}</span>
									{:else}
										<span class="text-gray-400 text-xs italic">No phone</span>
									{/if}
								</td>
								<td class="px-4 py-2 whitespace-nowrap">
									<span class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium {member.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'}">
										<span
											class="w-2 h-2 rounded-full {member.status === 'active' ? 'bg-emerald-500' : 'bg-gray-400'}" />
										{member.status === 'active' ? 'Active' : 'Inactive'}
									</span>
								</td>
								<td class="px-4 py-2 whitespace-nowrap text-right font-semibold text-brand-900">
									{formatCurrency(member.daily_rate)}
								</td>
								<td class="px-4 py-2 whitespace-nowrap text-gray-600">
									{member.hired_at ? member.hired_at.slice(0, 10) : '—'}
								</td>
								<td class="px-4 py-2 whitespace-nowrap text-right">
									<button
										type="button"
										on:click={() => openEditModal(member)}
										class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-brand-900 bg-brand-50 border border-brand-200 rounded-lg hover:bg-brand-100 hover:border-brand-300 transition-colors"
									>
										<Edit3 class="w-3.5 h-3.5" />
										Edit
									</button>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>

	<!-- Add/Edit Staff Modal -->
	{#if showModal}
		<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
			<div class="w-full max-w-xl rounded-xl bg-white shadow-xl border border-gray-200">
				<div class="flex items-center justify-between border-b border-gray-200 px-5 py-3">
					<h2 class="text-base font-semibold text-brand-900 flex items-center gap-2">
						<Users class="w-4 h-4 text-gray-700" />
						{editingStaffId ? 'Edit Staff' : 'Add Staff'}
					</h2>
					<button
						type="button"
						on:click={closeModal}
						class="p-1 rounded-full hover:bg-gray-100"
						aria-label="Close"
					>
						<span class="sr-only">Close</span>
						&times;
					</button>
				</div>

				<form
					method="POST"
					action={editingStaffId ? '?/update' : '?/create'}
					use:enhance={() => {
						isSubmitting = true;
						errorMessage = null;

						return async ({ result }) => {
							isSubmitting = false;

							if (result.type === 'failure') {
								// @ts-ignore
								errorMessage = result.data?.error ?? 'Failed to save staff';
								return;
							}

							if (result.type === 'success') {
								showModal = false;
								toast.success(editingStaffId ? 'Staff updated successfully' : 'Staff added successfully');
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

					{#if editingStaffId}
						<input type="hidden" name="staff_id" value={editingStaffId} />
					{/if}

					<div class="grid grid-cols-1 md:grid-cols-2 gap-3">
						<div>
							<label class="block text-xs font-medium text-gray-500 mb-1" for="full_name">
								Full Name *
							</label>
							<input
								id="full_name"
								name="full_name"
								type="text"
								bind:value={form_full_name}
								required
								class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-500 focus:border-transparent"
							/>
						</div>
						<div>
							<label class="block text-xs font-medium text-gray-500 mb-1" for="role">
								Role
							</label>
							<input
								id="role"
								name="role"
								type="text"
								bind:value={form_role}
								class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-500 focus:border-transparent"
								placeholder="e.g. Attendant, Cashier"
							/>
						</div>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-3">
						<div>
							<label class="block text-xs font-medium text-gray-500 mb-1" for="phone">
								Phone
							</label>
							<input
								id="phone"
								name="phone"
								type="text"
								bind:value={form_phone}
								class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-500 focus:border-transparent"
								placeholder="+63..."
							/>
						</div>
						<div>
							<label class="block text-xs font-medium text-gray-500 mb-1" for="daily_rate">
								Daily Rate (₱) *
							</label>
							<input
								id="daily_rate"
								name="daily_rate"
								type="number"
								min="0"
								step="0.01"
								bind:value={form_daily_rate}
								required
								class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-500 focus:border-transparent"
							/>
						</div>
					</div>

					<div class="grid grid-cols-1 md:grid-cols-2 gap-3">
						<div>
							<label class="block text-xs font-medium text-gray-500 mb-1" for="hired_at">
								Hired Date
							</label>
							<input
								id="hired_at"
								name="hired_at"
								type="date"
								bind:value={form_hired_at}
								class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-500 focus:border-transparent"
							/>
						</div>
						<div>
							<label class="block text-xs font-medium text-gray-500 mb-1" for="status">
								Status
							</label>
							<select
								id="status"
								name="status"
								bind:value={form_status}
								class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-white"
							>
								<option value="active">Active</option>
								<option value="inactive">Inactive</option>
							</select>
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
							bind:value={form_notes}
							class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-gray-500 focus:border-transparent"
							placeholder="Additional details about this staff member (optional)"
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
							{isSubmitting ? 'Saving...' : editingStaffId ? 'Save Changes' : 'Add Staff'}
						</button>
					</div>
				</form>
			</div>
		</div>
	{/if}
</div>


