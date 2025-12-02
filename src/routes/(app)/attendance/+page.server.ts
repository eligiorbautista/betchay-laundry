import type { PageServerLoad, Actions } from './$types';
import type { Staff, StaffAttendance, StaffSalary } from '$lib/types/staff';
import { createSupabaseServerClient } from '$lib/config/supabaseServer';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async (event) => {
	const supabase = createSupabaseServerClient(event);

	const url = new URL(event.request.url);
	const dateParam = url.searchParams.get('date');
	const today = new Date();
	const defaultDate = today.toISOString().slice(0, 10);
	const targetDate = dateParam || defaultDate;

	try {
		// Fetch active staff
		const { data: staffData, error: staffError } = await supabase
			.from('staff')
			.select('*')
			.eq('status', 'active')
			.order('full_name', { ascending: true });

		if (staffError) {
			console.error('Error fetching staff for attendance:', staffError);
			return { staff: [] as Staff[], attendance: [] as StaffAttendance[], date: targetDate, error: 'Failed to load staff attendance' };
		}

		// Fetch existing attendance for the date
		const { data: attendanceData, error: attendanceError } = await supabase
			.from('staff_attendance')
			.select('*')
			.eq('attendance_date', targetDate);

		if (attendanceError) {
			console.error('Error fetching staff attendance:', attendanceError);
			return { staff: staffData as Staff[], attendance: [] as StaffAttendance[], salaries: [] as StaffSalary[], date: targetDate, error: 'Failed to load attendance' };
		}

		// Fetch existing salaries for the date
		const { data: salaryData, error: salaryError } = await supabase
			.from('staff_salaries')
			.select('*')
			.eq('salary_date', targetDate);

		if (salaryError) {
			console.error('Error fetching staff salaries:', salaryError);
			return { staff: staffData as Staff[], attendance: (attendanceData || []) as StaffAttendance[], salaries: [] as StaffSalary[], date: targetDate, error: 'Failed to load salary data' };
		}

		return {
			staff: (staffData || []) as Staff[],
			attendance: (attendanceData || []) as StaffAttendance[],
			salaries: (salaryData || []) as StaffSalary[],
			date: targetDate
		};
	} catch (err) {
		console.error('Unexpected error loading attendance:', err);
		return {
			staff: [] as Staff[],
			attendance: [] as StaffAttendance[],
			date: targetDate,
			error: 'Unexpected error loading attendance'
		};
	}
};

export const actions: Actions = {
	save: async (event) => {
		const supabase = createSupabaseServerClient(event);
		const formData = await event.request.formData();

		const date = (formData.get('attendance_date') as string) || new Date().toISOString().slice(0, 10);
		const staffIds = formData.getAll('staff_id') as string[];
		const statuses = formData.getAll('status') as string[];

		if (!staffIds || staffIds.length === 0) {
			return fail(400, { error: 'No staff selected for attendance' });
		}

		const rows = [];
		for (let i = 0; i < staffIds.length; i++) {
			const staff_id = staffIds[i];
			const status = (statuses[i] || 'present') as 'present' | 'absent' | 'off';

			rows.push({
				staff_id,
				attendance_date: date,
				status
			});
		}

		try {
			// Upsert attendance rows for the date
			const { error } = await supabase
				.from('staff_attendance')
				.upsert(rows, { onConflict: 'staff_id,attendance_date' });

			if (error) {
				console.error('Error saving attendance:', error);
				return fail(500, { error: error.message || 'Failed to save attendance' });
			}

			return { success: true };
		} catch (err) {
			console.error('Unexpected error saving attendance:', err);
			return fail(500, { error: 'Unexpected error saving attendance' });
		}
	},

	pay: async (event) => {
		const supabase = createSupabaseServerClient(event);
		const formData = await event.request.formData();

		const staff_id = formData.get('staff_id') as string;
		const salary_date = (formData.get('salary_date') as string) || new Date().toISOString().slice(0, 10);

		if (!staff_id) {
			return fail(400, { error: 'Missing staff id' });
		}

		try {
			// Get staff to know the daily_rate
			const { data: staffRow, error: staffError } = await supabase
				.from('staff')
				.select('*')
				.eq('id', staff_id)
				.single();

			if (staffError || !staffRow) {
				console.error('Error fetching staff for salary payment:', staffError);
				return fail(404, { error: 'Staff not found' });
			}

			const daily_rate = Number(staffRow.daily_rate) || 0;
			if (daily_rate <= 0) {
				return fail(400, { error: 'Daily rate must be greater than 0 to pay salary.' });
			}

			// Check if salary already paid for that day
			const { data: existingSalary, error: salaryCheckError } = await supabase
				.from('staff_salaries')
				.select('*')
				.eq('staff_id', staff_id)
				.eq('salary_date', salary_date)
				.single();

			if (salaryCheckError && salaryCheckError.code !== 'PGRST116') {
				// PGRST116 = no rows found
				console.error('Error checking existing salary:', salaryCheckError);
				return fail(500, { error: 'Failed to check existing salary' });
			}

			if (existingSalary && existingSalary.payment_status === 'paid') {
				return fail(400, { error: 'Salary for this staff and date has already been marked as paid.' });
			}

			const days_worked = 1;
			const gross_amount = daily_rate * days_worked;
			const deductions = 0;
			const net_amount = gross_amount - deductions;
			const now = new Date().toISOString();

			// Upsert salary record
			const { error: upsertError } = await supabase.from('staff_salaries').upsert(
				{
					id: existingSalary?.id,
					staff_id,
					salary_date,
					days_worked,
					rate: daily_rate,
					gross_amount,
					deductions,
					net_amount,
					payment_status: 'paid',
					payment_date: now,
					updated_at: now
				},
				{ onConflict: 'staff_id,salary_date' }
			);

			if (upsertError) {
				console.error('Error saving salary:', upsertError);
				return fail(500, { error: upsertError.message || 'Failed to save salary' });
			}

			// Also insert a Payroll expense entry
			const description = `Salary for ${staffRow.full_name} on ${salary_date}`;
			const { error: expenseError } = await supabase.from('expenses').insert({
				category: 'Payroll',
				description,
				amount: net_amount,
				incurred_on: salary_date
			});

			if (expenseError) {
				console.error('Error creating payroll expense:', expenseError);
				// We won't fail the whole action here to avoid double-charging salary, but we log it.
			}

			return { success: true };
		} catch (err) {
			console.error('Unexpected error paying salary:', err);
			return fail(500, { error: 'Unexpected error paying salary' });
		}
	},

	unpay: async (event) => {
		const supabase = createSupabaseServerClient(event);
		const formData = await event.request.formData();

		const staff_id = formData.get('staff_id') as string;
		const salary_date = (formData.get('salary_date') as string) || new Date().toISOString().slice(0, 10);

		if (!staff_id) {
			return fail(400, { error: 'Missing staff id' });
		}

		try {
			// Get staff for description matching
			const { data: staffRow, error: staffError } = await supabase
				.from('staff')
				.select('*')
				.eq('id', staff_id)
				.single();

			if (staffError || !staffRow) {
				console.error('Error fetching staff for salary unpayment:', staffError);
				return fail(404, { error: 'Staff not found' });
			}

			// Check existing salary
			const { data: existingSalary, error: salaryCheckError } = await supabase
				.from('staff_salaries')
				.select('*')
				.eq('staff_id', staff_id)
				.eq('salary_date', salary_date)
				.single();

			if (salaryCheckError && salaryCheckError.code !== 'PGRST116') {
				console.error('Error checking existing salary for unpay:', salaryCheckError);
				return fail(500, { error: 'Failed to check existing salary' });
			}

			if (!existingSalary) {
				// Nothing to unpay, treat as success
				return { success: true };
			}

			// Update salary back to unpaid
			const { error: updateError } = await supabase
				.from('staff_salaries')
				.update({
					payment_status: 'unpaid',
					payment_date: null
				})
				.eq('id', existingSalary.id);

			if (updateError) {
				console.error('Error updating salary to unpaid:', updateError);
				return fail(500, { error: updateError.message || 'Failed to update salary' });
			}

			// Delete matching Payroll expense entry
			const description = `Salary for ${staffRow.full_name} on ${salary_date}`;
			const { error: deleteError } = await supabase
				.from('expenses')
				.delete()
				.eq('category', 'Payroll')
				.eq('description', description)
				.eq('incurred_on', salary_date);

			if (deleteError) {
				console.error('Error deleting payroll expense:', deleteError);
				// Don't fail entire operation; salary is already marked unpaid.
			}

			return { success: true };
		} catch (err) {
			console.error('Unexpected error unpaying salary:', err);
			return fail(500, { error: 'Unexpected error unpaying salary' });
		}
	}
};


