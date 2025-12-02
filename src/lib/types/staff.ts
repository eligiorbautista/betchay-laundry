export type StaffStatus = 'active' | 'inactive';

export interface Staff {
	id: string;
	full_name: string;
	role?: string;
	phone?: string;
	status: StaffStatus;
	daily_rate: number;
	hired_at?: string;
	notes?: string;
	created_at: string;
	updated_at: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'off';

export interface StaffAttendance {
	id: string;
	staff_id: string;
	attendance_date: string; // YYYY-MM-DD
	status: AttendanceStatus;
	notes?: string;
	created_at: string;
	updated_at: string;
}

export type SalaryPaymentStatus = 'unpaid' | 'paid';

export interface StaffSalary {
	id: string;
	staff_id: string;
	salary_date: string; // YYYY-MM-DD
	days_worked: number;
	rate: number;
	gross_amount: number;
	deductions: number;
	net_amount: number;
	payment_status: SalaryPaymentStatus;
	payment_date?: string | null;
	remarks?: string;
	created_at: string;
	updated_at: string;
}


