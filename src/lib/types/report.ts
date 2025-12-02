export interface ReportSummary {
	grossRevenue: number;
	totalRevenue: number;
	totalExpenses: number; // excludes staff salary (Payroll)
	totalPayroll: number; // staff salary (Payroll) only
	netRevenue: number;
	totalOrders: number;
	completedOrdersCount: number;
	averageOrderValue: number;
	period: string;
	periodStart: string;
	periodEnd: string;
}

export interface OrderStatusReport {
	status: string;
	count: number;
	percentage: number;
	revenue: number;
}

export interface PaymentMethodReport {
	method: string;
	count: number;
	percentage: number;
	totalAmount: number;
}

export interface ServiceTypeReport {
	serviceType: string;
	orderCount: number;
	totalRevenue: number;
	averagePrice: number;
	percentage: number;
}

export interface MonthlyTrend {
	month: string;
	year: number;
	revenue: number;
	orderCount: number;
	averageOrderValue: number;
}

export interface ExpenseCategoryReport {
	category: string;
	totalAmount: number;
}


export interface ReportsData {
	summary: ReportSummary;
	orderStatusDistribution: OrderStatusReport[];
	paymentMethodAnalysis: PaymentMethodReport[];
	serviceTypePerformance: ServiceTypeReport[];
	monthlyTrends: MonthlyTrend[];
	availableYears: number[];
	expenseBreakdown: ExpenseCategoryReport[];
	dateRange: {
		start: string;
		end: string;
	};
}