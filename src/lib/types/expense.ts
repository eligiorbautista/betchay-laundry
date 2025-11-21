export interface Expense {
	id: string;
	category: string;
	description?: string;
	amount: number;
	incurred_on: string; // YYYY-MM-DD
	notes?: string;
	created_by?: string | null;
	created_at: string;
	updated_at: string;
}


