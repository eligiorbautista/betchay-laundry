import type { PageServerLoad, Actions } from './$types';
import type { Expense } from '$lib/types/expense';
import { createSupabaseServerClient } from '$lib/config/supabaseServer';
import { fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async (event) => {
	const supabase = createSupabaseServerClient(event);

	// Optional date filters from query params
	const url = new URL(event.request.url);
	const startDate = url.searchParams.get('startDate') || '';
	const endDate = url.searchParams.get('endDate') || '';

	try {
		let query = supabase
			.from('expenses')
			.select('*')
			.order('incurred_on', { ascending: false });

		if (startDate) {
			query = query.gte('incurred_on', startDate);
		}
		if (endDate) {
			query = query.lte('incurred_on', endDate);
		}

		const { data, error } = await query;

		if (error) {
			console.error('Error fetching expenses:', error);
			return {
				expenses: [] as Expense[],
				summary: {
					totalExpenses: 0
				},
				filters: { startDate, endDate },
				error: 'Failed to load expenses'
			};
		}

		const expenses = (data || []) as Expense[];
		const totalExpenses =
			expenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0) || 0;

		return {
			expenses,
			summary: {
				totalExpenses
			},
			filters: { startDate, endDate }
		};
	} catch (err) {
		console.error('Unexpected error loading expenses:', err);
		return {
			expenses: [] as Expense[],
			summary: {
				totalExpenses: 0
			},
			filters: { startDate, endDate },
			error: 'Unexpected error loading expenses'
		};
	}
};

export const actions: Actions = {
	create: async (event) => {
		const supabase = createSupabaseServerClient(event);
		const formData = await event.request.formData();

		const category = (formData.get('category') as string)?.trim();
		const description = (formData.get('description') as string)?.trim();
		const amountRaw = formData.get('amount') as string;
		const incurred_on = formData.get('incurred_on') as string;
		const notes = (formData.get('notes') as string)?.trim();

		if (!category) {
			return fail(400, { error: 'Category is required' });
		}

		const amount = parseFloat(amountRaw);
		if (!amount || amount <= 0) {
			return fail(400, { error: 'Amount must be greater than 0' });
		}

		if (!incurred_on) {
			return fail(400, { error: 'Incurred date is required' });
		}

		try {
			// Get current user for created_by
			const {
				data: { user }
			} = await supabase.auth.getUser();

			const { error } = await supabase.from('expenses').insert({
				category,
				description: description || null,
				amount,
				incurred_on,
				notes: notes || null,
				created_by: user?.id || null
			});

			if (error) {
				console.error('Error creating expense:', error);
				return fail(500, { error: error.message || 'Failed to create expense' });
			}

			// Let the client handle success (close modal, toast, refresh)
			return { success: true };
		} catch (err) {
			// Let SvelteKit Redirect/Error bubble up instead of treating as an unexpected error
			if (err && typeof err === 'object' && 'status' in err) {
				throw err;
			}

			console.error('Unexpected error creating expense:', err);
			return fail(500, { error: 'Unexpected error creating expense' });
		}
	},

	update: async (event) => {
		const supabase = createSupabaseServerClient(event);
		const formData = await event.request.formData();

		const id = formData.get('expense_id') as string;
		const category = (formData.get('category') as string)?.trim();
		const description = (formData.get('description') as string)?.trim();
		const amountRaw = formData.get('amount') as string;
		const incurred_on = formData.get('incurred_on') as string;
		const notes = (formData.get('notes') as string)?.trim();

		if (!id) {
			return fail(400, { error: 'Missing expense id' });
		}

		if (!category) {
			return fail(400, { error: 'Category is required' });
		}

		const amount = parseFloat(amountRaw);
		if (!amount || amount <= 0) {
			return fail(400, { error: 'Amount must be greater than 0' });
		}

		if (!incurred_on) {
			return fail(400, { error: 'Incurred date is required' });
		}

		try {
			const { error } = await supabase
				.from('expenses')
				.update({
					category,
					description: description || null,
					amount,
					incurred_on,
					notes: notes || null
				})
				.eq('id', id);

			if (error) {
				console.error('Error updating expense:', error);
				return fail(500, { error: error.message || 'Failed to update expense' });
			}

			return { success: true };
		} catch (err) {
			console.error('Unexpected error updating expense:', err);
			return fail(500, { error: 'Unexpected error updating expense' });
		}
	},

	delete: async (event) => {
		const supabase = createSupabaseServerClient(event);
		const formData = await event.request.formData();
		const id = formData.get('expense_id') as string;

		if (!id) {
			return fail(400, { error: 'Missing expense id' });
		}

		try {
			const { error } = await supabase.from('expenses').delete().eq('id', id);

			if (error) {
				console.error('Error deleting expense:', error);
				return fail(500, { error: error.message || 'Failed to delete expense' });
			}

			return { success: true };
		} catch (err) {
			console.error('Unexpected error deleting expense:', err);
			return fail(500, { error: 'Unexpected error deleting expense' });
		}
	}
};


