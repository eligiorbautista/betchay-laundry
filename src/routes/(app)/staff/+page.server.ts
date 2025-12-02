import type { PageServerLoad, Actions } from './$types';
import type { Staff } from '$lib/types/staff';
import { createSupabaseServerClient } from '$lib/config/supabaseServer';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async (event) => {
	const supabase = createSupabaseServerClient(event);

	try {
		const { data, error } = await supabase
			.from('staff')
			.select('*')
			.order('full_name', { ascending: true });

		if (error) {
			console.error('Error fetching staff:', error);
			return { staff: [] as Staff[], error: 'Failed to load staff list' };
		}

		return {
			staff: (data || []) as Staff[]
		};
	} catch (err) {
		console.error('Unexpected error loading staff:', err);
		return {
			staff: [] as Staff[],
			error: 'Unexpected error loading staff list'
		};
	}
};

export const actions: Actions = {
	create: async (event) => {
		const supabase = createSupabaseServerClient(event);
		const formData = await event.request.formData();

		const full_name = (formData.get('full_name') as string)?.trim();
		const role = (formData.get('role') as string)?.trim();
		const phone = (formData.get('phone') as string)?.trim();
		const daily_rate_raw = formData.get('daily_rate') as string;
		const hired_at = formData.get('hired_at') as string;
		const notes = (formData.get('notes') as string)?.trim();

		if (!full_name) {
			return fail(400, { error: 'Staff name is required' });
		}

		const daily_rate = parseFloat(daily_rate_raw);
		if (!daily_rate || daily_rate < 0) {
			return fail(400, { error: 'Daily rate must be a positive number' });
		}

		try {
			const { error } = await supabase.from('staff').insert({
				full_name,
				role: role || null,
				phone: phone || null,
				daily_rate,
				hired_at: hired_at || null,
				notes: notes || null
			});

			if (error) {
				console.error('Error creating staff:', error);
				return fail(500, { error: error.message || 'Failed to create staff' });
			}

			return { success: true };
		} catch (err) {
			console.error('Unexpected error creating staff:', err);
			return fail(500, { error: 'Unexpected error creating staff' });
		}
	},

	update: async (event) => {
		const supabase = createSupabaseServerClient(event);
		const formData = await event.request.formData();

		const id = formData.get('staff_id') as string;
		const full_name = (formData.get('full_name') as string)?.trim();
		const role = (formData.get('role') as string)?.trim();
		const phone = (formData.get('phone') as string)?.trim();
		const daily_rate_raw = formData.get('daily_rate') as string;
		const hired_at = formData.get('hired_at') as string;
		const status = (formData.get('status') as string)?.trim();
		const notes = (formData.get('notes') as string)?.trim();

		if (!id) {
			return fail(400, { error: 'Missing staff id' });
		}

		if (!full_name) {
			return fail(400, { error: 'Staff name is required' });
		}

		const daily_rate = parseFloat(daily_rate_raw);
		if (!daily_rate || daily_rate < 0) {
			return fail(400, { error: 'Daily rate must be a positive number' });
		}

		try {
			const { error } = await supabase
				.from('staff')
				.update({
					full_name,
					role: role || null,
					phone: phone || null,
					daily_rate,
					hired_at: hired_at || null,
					status: status || 'active',
					notes: notes || null
				})
				.eq('id', id);

			if (error) {
				console.error('Error updating staff:', error);
				return fail(500, { error: error.message || 'Failed to update staff' });
			}

			return { success: true };
		} catch (err) {
			console.error('Unexpected error updating staff:', err);
			return fail(500, { error: 'Unexpected error updating staff' });
		}
	}
};


