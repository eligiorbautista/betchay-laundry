<script lang="ts">
	import { Calendar, Users, CheckCircle, XCircle, MinusCircle, Banknote } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import type { Staff, StaffAttendance, AttendanceStatus, StaffSalary } from '$lib/types/staff';
	import type { PageData } from './$types';
	import { enhance } from '$app/forms';

	export let data: PageData;

	const staff: Staff[] = data.staff || [];
	const attendance: StaffAttendance[] = data.attendance || [];
	const salaries: StaffSalary[] = data.salaries || [];
	let attendanceDate: string = data.date;
	let isSubmitting = false;
	let errorMessage: string | null = data.error ?? null;

	type Row = {
		staff: Staff;
		status: AttendanceStatus;
		salaryPaid: boolean;
	};

	let rows: Row[] = [];

	function initRows() {
		rows = staff.map((member) => {
			const existing = attendance.find((a) => a.staff_id === member.id);
			const existingSalary = salaries.find((s) => s.staff_id === member.id && s.salary_date === attendanceDate);
			return {
				staff: member,
				status: existing ? existing.status : 'present',
				salaryPaid: !!existingSalary && existingSalary.payment_status === 'paid'
			};
		});
	}

	initRows();

	function setAll(status: AttendanceStatus) {
		rows = rows.map((row) => ({ ...row, status }));
	}
</script>

<svelte:head>
	<title>Attendance - Laundry Management System</title>
	<meta name="description" content="Daily staff attendance tracking" />
</svelte:head>

<div class="min-h-screen w-full bg-gray-50 p-4 lg:p-6">
	<!-- Header -->
	<div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<div class="flex items-center gap-3 mb-2">
				<Users class="w-8 h-8 text-gray-700" />
				<h1 class="text-2xl font-bold text-brand-900">Attendance</h1>
			</div>
			<p class="text-sm text-gray-500">
				Set daily attendance for your staff. Present is the default and you can toggle off for absences or off days.
			</p>
		</div>

		<div class="flex items-center gap-3">
			<div>
				<label for="attendance_date" class="block text-xs font-medium text-gray-500 mb-1">
					Date
				</label>
				<input
					id="attendance_date"
					type="date"
					bind:value={attendanceDate}
					on:change={() => {
						// reload page with new date param
						const url = new URL(window.location.href);
						url.searchParams.set('date', attendanceDate);
						window.location.href = url.toString();
					}}
					class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white"
				/>
			</div>
		</div>
	</div>

	<!-- Attendance Card -->
	<div class="bg-white rounded-xl shadow-sm border border-gray-100">
		<div class="border-b border-gray-200 p-4 md:p-5 bg-gray-50 flex items-center justify-between">
			<div>
				<h2 class="text-sm font-semibold text-brand-900 flex items-center gap-2">
					<Calendar class="w-4 h-4 text-gray-600" />
					Attendance for {attendanceDate}
				</h2>
				<p class="text-xs text-gray-500 mt-1">
					Use the quick buttons to set all staff to Present, Absent, or Off, then adjust individually if needed.
				</p>
			</div>
			<div class="flex items-center gap-2">
				<button
					type="button"
					on:click={() => setAll('present')}
					class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300"
				>
					<CheckCircle class="w-3.5 h-3.5" />
					All Present
				</button>
				<button
					type="button"
					on:click={() => setAll('absent')}
					class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 hover:border-red-300"
				>
					<XCircle class="w-3.5 h-3.5" />
					All Absent
				</button>
				<button
					type="button"
					on:click={() => setAll('off')}
					class="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 hover:border-gray-300"
				>
					<MinusCircle class="w-3.5 h-3.5" />
					All Off
				</button>
			</div>
		</div>

		<form
			method="POST"
			action="?/save"
			use:enhance={() => {
				isSubmitting = true;
				errorMessage = null;

				return async ({ result }) => {
					isSubmitting = false;

					if (result.type === 'failure') {
						// @ts-ignore
						errorMessage = result.data?.error ?? 'Failed to save attendance';
						toast.error(errorMessage);
						return;
					}

					if (result.type === 'success') {
						toast.success('Attendance saved successfully');
						location.reload();
					}
				};
			}}
		>
			<input type="hidden" name="attendance_date" value={attendanceDate} />

			{#if errorMessage}
				<div class="m-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
					{errorMessage}
				</div>
			{/if}

			{#if !rows || rows.length === 0}
				<div class="flex flex-col items-center justify-center min-h-40 p-8 text-center">
					<Users class="w-10 h-10 text-gray-300 mb-3" />
					<p class="text-sm font-medium text-gray-700 mb-1">No active staff</p>
					<p class="text-xs text-gray-500 mb-3">
						Add staff first from the Staff page to start tracking attendance.
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
									Status
								</th>
								<th class="px-4 py-2 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">
									Salary
								</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-gray-100 bg-white">
							{#each rows as row, index}
								<tr class="hover:bg-gray-50">
									<td class="px-4 py-2 whitespace-nowrap text-gray-900 font-medium">
										<input type="hidden" name="staff_id" value={row.staff.id} />
										{row.staff.full_name}
									</td>
									<td class="px-4 py-2 whitespace-nowrap text-gray-600">
										{row.staff.role || '—'}
									</td>
									<td class="px-4 py-2 whitespace-nowrap">
										<div class="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-0.5">
											<button
												type="button"
												class="px-2 py-1 text-xs font-medium rounded-md flex items-center gap-1 {row.status === 'present' ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-100'}"
												on:click={() => (rows[index].status = 'present')}
											>
												<CheckCircle class="w-3 h-3" />
												Present
											</button>
											<button
												type="button"
												class="px-2 py-1 text-xs font-medium rounded-md flex items-center gap-1 {row.status === 'absent' ? 'bg-red-600 text-white' : 'text-gray-600 hover:bg-gray-100'}"
												on:click={() => (rows[index].status = 'absent')}
											>
												<XCircle class="w-3 h-3" />
												Absent
											</button>
											<button
												type="button"
												class="px-2 py-1 text-xs font-medium rounded-md flex items-center gap-1 {row.status === 'off' ? 'bg-gray-700 text-white' : 'text-gray-600 hover:bg-gray-100'}"
												on:click={() => (rows[index].status = 'off')}
											>
												<MinusCircle class="w-3 h-3" />
												Off
											</button>
										</div>
										<input type="hidden" name="status" value={row.status} />
									</td>
									<td class="px-4 py-2 whitespace-nowrap text-right">
										{#if row.status !== 'present'}
											<span class="text-xs text-gray-400 italic">Not present</span>
										{:else if row.salaryPaid}
											<div class="flex items-center justify-end gap-2">
												<span class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
													<Banknote class="w-3 h-3" />
													Paid
												</span>
												<form
													method="POST"
													action="?/unpay"
													class="inline-block"
													on:submit|preventDefault={async (e) => {
														const form = e.currentTarget as HTMLFormElement;
														const formData = new FormData(form);
														const response = await fetch('?/unpay', {
															method: 'POST',
															body: formData
														});
														if (response.ok) {
															toast.success(`Salary marked as unpaid for ${row.staff.full_name}`);
															location.reload();
														} else {
															const text = await response.text();
															toast.error('Failed to mark salary as unpaid');
															console.error('Unpay salary error response:', text);
														}
													}}
												>
													<input type="hidden" name="staff_id" value={row.staff.id} />
													<input type="hidden" name="salary_date" value={attendanceDate} />
													<button
														type="submit"
														class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-brand-900 bg-white border border-brand-200 rounded-lg hover:bg-brand-50 hover:border-brand-300 transition-colors"
													>
														Unpaid
													</button>
												</form>
											</div>
										{:else}
											<form
												method="POST"
												action="?/pay"
												class="inline-block"
												on:submit|preventDefault={async (e) => {
													const form = e.currentTarget as HTMLFormElement;
													const formData = new FormData(form);
													const response = await fetch('?/pay', {
														method: 'POST',
														body: formData
													});
													if (response.ok) {
														toast.success(`Salary marked as paid for ${row.staff.full_name}`);
														location.reload();
													} else {
														const text = await response.text();
														toast.error('Failed to mark salary as paid');
														console.error('Pay salary error response:', text);
													}
												}}
											>
												<input type="hidden" name="staff_id" value={row.staff.id} />
												<input type="hidden" name="salary_date" value={attendanceDate} />
												<button
													type="submit"
													class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-brand-900 bg-brand-50 border border-brand-200 rounded-lg hover:bg-brand-100 hover:border-brand-300 transition-colors"
												>
													<Banknote class="w-3 h-3" />
													Mark Paid
												</button>
											</form>
										{/if}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>

				<div class="flex justify-end gap-2 px-5 py-4 border-t border-gray-100 bg-gray-50">
					<button
						type="submit"
						class="px-4 py-2 text-sm font-medium text-white bg-brand-900 border border-brand-900 rounded-lg hover:bg-brand-800 hover:border-brand-800 focus:ring-2 focus:ring-brand-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
						disabled={isSubmitting}
					>
						{isSubmitting ? 'Saving...' : 'Save Attendance'}
					</button>
				</div>
			{/if}
		</form>
	</div>
</div>


