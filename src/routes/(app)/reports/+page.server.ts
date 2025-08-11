import type { PageServerLoad } from './$types';
import type { ReportsData } from '$lib/types/report';

export const load: PageServerLoad = async ({ params, url }) => {
	// Mock reports data based on the orders data structure
	const reportsData: ReportsData = {
		summary: {
			totalRevenue: 45275.42,
			totalOrders: 156,
			averageOrderValue: 290.35,
			period: "Last 30 Days",
			periodStart: "2024-07-01",
			periodEnd: "2024-07-31"
		},
		
		orderStatusDistribution: [
			{ status: 'completed', count: 89, percentage: 57.1, revenue: 28450.25 },
			{ status: 'pending', count: 32, percentage: 20.5, revenue: 9875.00 },
			{ status: 'processing', count: 21, percentage: 13.5, revenue: 5125.17 },
			{ status: 'ready', count: 14, percentage: 9.0, revenue: 1825.00 },
			{ status: 'cancelled', count: 0, percentage: 0, revenue: 0 }
		],
		
		paymentMethodAnalysis: [
			{ method: 'cash', count: 67, percentage: 43.0, totalAmount: 18945.50 },
			{ method: 'gcash', count: 45, percentage: 28.8, totalAmount: 13275.25 },
			{ method: 'bank_transfer', count: 28, percentage: 17.9, totalAmount: 8945.67 },
			{ method: 'paymaya', count: 12, percentage: 7.7, totalAmount: 3109.00 },
			{ method: 'credit_card', count: 4, percentage: 2.6, totalAmount: 1000.00 }
		],
		
		serviceTypePerformance: [
			{ 
				serviceType: 'Wash & Dry', 
				orderCount: 78, 
				totalRevenue: 22450.00, 
				averagePrice: 287.82,
				percentage: 49.6
			},
			{ 
				serviceType: 'Wash & Fold', 
				orderCount: 45, 
				totalRevenue: 14275.25, 
				averagePrice: 317.23,
				percentage: 31.5
			},
			{ 
				serviceType: 'Dry Cleaning', 
				orderCount: 23, 
				totalRevenue: 6825.17, 
				averagePrice: 296.75,
				percentage: 15.1
			},
			{ 
				serviceType: 'Ironing Only', 
				orderCount: 10, 
				totalRevenue: 1725.00, 
				averagePrice: 172.50,
				percentage: 3.8
			}
		],
		
		monthlyTrends: [
			{ month: 'January', year: 2024, revenue: 38250.75, orderCount: 125, averageOrderValue: 306.01 },
			{ month: 'February', year: 2024, revenue: 41275.50, orderCount: 142, averageOrderValue: 290.67 },
			{ month: 'March', year: 2024, revenue: 39825.25, orderCount: 138, averageOrderValue: 288.59 },
			{ month: 'April', year: 2024, revenue: 43150.00, orderCount: 149, averageOrderValue: 289.60 },
			{ month: 'May', year: 2024, revenue: 45275.42, orderCount: 156, averageOrderValue: 290.35 },
			{ month: 'June', year: 2024, revenue: 42850.75, orderCount: 147, averageOrderValue: 291.50 }
		],
		

		
		dateRange: {
			start: '2024-07-01',
			end: '2024-07-31'
		}
	};

	// Simulate loading delay for development
	await new Promise(resolve => setTimeout(resolve, 150));

	return {
		reports: reportsData
	};
};