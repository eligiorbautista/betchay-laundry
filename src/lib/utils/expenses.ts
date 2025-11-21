import type { SupabaseClient } from '@supabase/supabase-js';
import type { Expense } from '$lib/types/expense';

export async function fetchExpenses(
	supabase: SupabaseClient,
	options?: { startDate?: string; endDate?: string }
): Promise<Expense[]> {
	let query = supabase.from('expenses').select('*').order('incurred_on', { ascending: false });

	if (options?.startDate) {
		query = query.gte('incurred_on', options.startDate);
	}
	if (options?.endDate) {
		query = query.lte('incurred_on', options.endDate);
	}

	const { data, error } = await query;

	if (error) {
		console.error('Error fetching expenses:', error);
		return [];
	}

	return (data || []) as Expense[];
}

export async function createExpense(
	supabase: SupabaseClient,
	expense: { category: string; description?: string; amount: number; incurred_on: string; notes?: string },
	userId?: string | null
): Promise<{ success: boolean; error?: string }> {
	try {
		const { error } = await supabase.from('expenses').insert({
			category: expense.category,
			description: expense.description ?? null,
			amount: expense.amount,
			incurred_on: expense.incurred_on,
			notes: expense.notes ?? null,
			created_by: userId || null
		});

		if (error) {
			console.error('Error creating expense:', error);
			return { success: false, error: error.message };
		}

		return { success: true };
	} catch (err) {
		console.error('Unexpected error creating expense:', err);
		return { success: false, error: 'Unexpected error creating expense' };
	}
}


