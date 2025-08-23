import type { PageServerLoad } from './$types';
import type { Order } from '$lib/types/order';
import { createSupabaseServerClient } from '$lib/config/supabaseServer';

export const load: PageServerLoad = async (event) => {
	try {
		const supabase = createSupabaseServerClient(event);

		// fetch dashboard statistics
		const stats = await getDashboardStats(supabase);

		// fetch recent orders (last 10)
		const recentOrders = await getRecentOrders(supabase);

		// fetch recent activities from audit logs
		const recentActivities = await getRecentActivities(supabase);

		return {
			stats,
			recentOrders,
			recentActivities
		};
	} catch (error) {
		console.error('Error loading dashboard data:', error);
		// return empty data on error
		return {
			stats: {
				totalOrders: 0,
				pendingOrders: 0,
				completedToday: 0,
				revenue: 0,
				loading: false
			},
			recentOrders: [],
			recentActivities: []
		};
	}
};

/**
 * get dashboard statistics from database
 */
async function getDashboardStats(supabase: any) {
	try {
		// get total orders count
		const { count: totalOrders } = await supabase
			.from('orders')
			.select('*', { count: 'exact', head: true });

		// get pending orders count
		const { count: pendingOrders } = await supabase
			.from('orders')
			.select('*', { count: 'exact', head: true })
			.eq('status', 'pending');

		// get completed orders today
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const { count: completedToday } = await supabase
			.from('orders')
			.select('*', { count: 'exact', head: true })
			.eq('status', 'completed')
			.gte('updated_at', today.toISOString());

		// get total revenue (sum of all completed orders)
		const { data: revenueData } = await supabase
			.from('orders')
			.select('total_amount')
			.eq('status', 'completed');

		const revenue = revenueData?.reduce((sum: number, order: any) => sum + parseFloat(order.total_amount), 0) || 0;

		return {
			totalOrders: totalOrders || 0,
			pendingOrders: pendingOrders || 0,
			completedToday: completedToday || 0,
			revenue: parseFloat(revenue.toFixed(2)),
			loading: false
		};
	} catch (error) {
		console.error('Error fetching dashboard stats:', error);
		return {
			totalOrders: 0,
			pendingOrders: 0,
			completedToday: 0,
			revenue: 0,
			loading: false
		};
	}
}

/**
 * get recent orders from database
 */
async function getRecentOrders(supabase: any): Promise<Order[]> {
	try {
		const { data: orders, error } = await supabase
			.from('orders')
			.select('*')
			.order('created_at', { ascending: false })
			.limit(10);

		if (error) {
			console.error('Error fetching recent orders:', error);
			return [];
		}

		// transform database data to match our Order interface
		return orders.map((order: any): Order => ({
			id: order.id,
			order_number: order.order_number,
			customer_name: order.customer_name,
			customer_phone: order.customer_phone,
			status: order.status,
			payment_status: order.payment_status,
			payment_method: order.payment_method,
			service_type: order.service_type,
			quantity: order.quantity,
			unit_price: order.unit_price,
			total_amount: order.total_amount,
			pickup_date: order.pickup_date,
			delivery_date: order.delivery_date,
			remarks: order.remarks,
			created_at: order.created_at,
			updated_at: order.updated_at
		}));
	} catch (error) {
		console.error('Error fetching recent orders:', error);
		return [];
	}
}

/**
 * get recent activities from audit logs
 */
async function getRecentActivities(supabase: any) {
	try {
		const { data: auditLogs, error } = await supabase
			.from('audit_logs')
			.select('*')
			.order('created_at', { ascending: false })
			.limit(5);

		if (error) {
			console.error('Error fetching recent activities:', error);
			return [];
		}

		// transform audit logs to activity format
		return auditLogs.map((log: any) => {
			let icon = 'FileText';
			let color = 'bg-gray-600';

			// determine icon and color based on action type
			switch (log.action_type) {
				case 'login':
					icon = 'LogIn';
					color = 'bg-blue-600';
					break;
				case 'logout':
					icon = 'LogOut';
					color = 'bg-gray-600';
					break;
				case 'order_created':
					icon = 'FileText';
					color = 'bg-indigo-600';
					break;
				case 'order_updated':
					icon = 'Edit';
					color = 'bg-yellow-600';
					break;
				case 'order_status_changed':
					icon = 'CheckCircle';
					color = 'bg-emerald-600';
					break;
				case 'payment_status_changed':
					icon = 'CreditCard';
					color = 'bg-green-600';
					break;
				case 'reset_password':
					icon = 'Key';
					color = 'bg-orange-600';
					break;
				default:
					icon = 'Activity';
					color = 'bg-gray-600';
			}

			return {
				type: log.action_type,
				icon,
				color,
				description: log.description,
				timestamp: log.created_at,
				user_email: log.user_email
			};
		});
	} catch (error) {
		console.error('Error fetching recent activities:', error);
		return [];
	}
}
