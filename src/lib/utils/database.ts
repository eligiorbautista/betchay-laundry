import type { SupabaseClient } from '@supabase/supabase-js';
import type { Order } from '$lib/types/order';
import { logAuditEvent, getClientIP, getUserAgent } from './audit';

// database utility functions for common operations

/**
 * Validate and sanitize input data
 */
function validateOrderData(orderData: any) {
	if (!orderData.customer_name?.trim()) {
		throw new Error('Customer name is required');
	}
	
	if (!orderData.customer_phone?.trim()) {
		throw new Error('Customer phone is required');
	}
	
	// Validate phone number format (basic validation)
	const phoneRegex = /^[\+]?[0-9\s\-\(\)]{7,15}$/;
	if (!phoneRegex.test(orderData.customer_phone.trim())) {
		throw new Error('Invalid phone number format');
	}
	
	// Validate quantity
	if (!orderData.quantity || orderData.quantity <= 0) {
		throw new Error('Quantity must be greater than 0');
	}
	
	// Validate unit price
	if (!orderData.unit_price || orderData.unit_price < 0) {
		throw new Error('Unit price must be non-negative');
	}
	
	// Validate customer name length
	if (orderData.customer_name.trim().length > 100) {
		throw new Error('Customer name too long (max 100 characters)');
	}
	
	// Validate remarks length
	if (orderData.remarks && orderData.remarks.trim().length > 500) {
		throw new Error('Remarks too long (max 500 characters)');
	}
}

/**
 * fetch all orders from database with optional filters
 */
export async function fetchOrders(supabase: SupabaseClient, options?: {
	status?: string;
	payment_status?: string;
	limit?: number;
	orderBy?: string;
	page?: number;
	pageSize?: number;
}) {
	const query = supabase
		.from('orders')
		.select('*');

	// apply filters if provided
	if (options?.status && options.status !== 'all') {
		query.eq('status', options.status);
	}

	if (options?.payment_status && options.payment_status !== 'all') {
		query.eq('payment_status', options.payment_status);
	}

	// apply ordering
	const orderBy = options?.orderBy || 'created_at';
	query.order(orderBy, { ascending: false });

	// apply pagination if provided
	if (options?.page && options?.pageSize) {
		const from = (options.page - 1) * options.pageSize;
		const to = from + options.pageSize - 1;
		query.range(from, to);
	} else if (options?.limit) {
		query.limit(options.limit);
	}

	const { data, error } = await query;

	if (error) {
		console.error('Error fetching orders:', error);
		throw new Error('Failed to fetch orders');
	}

	return data || [];
}

/**
 * create a new order in the database
 */
export async function createOrder(supabase: SupabaseClient, orderData: {
	customer_name: string;
	customer_phone: string; // required now
	service_type: string;
	quantity: number;
	unit_price: number;
	payment_method: string;
	payment_status: string;
	status: string;
	pickup_date?: string;
	delivery_date?: string;
	remarks?: string;
}, request?: Request, userEmail?: string) {
	// Validate input data
	validateOrderData(orderData);

	// get current user for created_by field
	const { data: { user } } = await supabase.auth.getUser();

	// calculate total amount
	const total_amount = orderData.quantity * orderData.unit_price;

	// generate order number
	const { data: orderNumber, error: orderNumberError } = await supabase
		.rpc('generate_order_number');

	if (orderNumberError) {
		console.error('Error generating order number:', orderNumberError);
		throw new Error(`Failed to generate order number: ${orderNumberError.message}`);
	}

	// insert new order
	const { data: newOrder, error: insertError } = await supabase
		.from('orders')
		.insert({
			order_number: orderNumber,
			customer_name: orderData.customer_name.trim(),
			customer_phone: orderData.customer_phone.trim(),
			status: orderData.status,
			service_type: orderData.service_type,
			quantity: orderData.quantity,
			unit_price: orderData.unit_price,
			total_amount,
			payment_status: orderData.payment_status,
			payment_method: orderData.payment_method,
			pickup_date: orderData.pickup_date || null,
			delivery_date: orderData.delivery_date || null,
			remarks: orderData.remarks?.trim() || null,
			created_by: user?.id || null
		})
		.select()
		.single();

	if (insertError) {
		console.error('Error creating order:', insertError);
		throw new Error(`Failed to create order: ${insertError.message}`);
	}

	// log audit event for order creation
	await logAuditEvent(
		supabase,
		'order_created',
		`Order ${orderNumber} created for customer ${orderData.customer_name}`,
		'order',
		newOrder.id,
		request ? getClientIP(request) : undefined,
		request ? getUserAgent(request) : undefined,
		userEmail
	);

	return newOrder;
}

/**
 * update order status
 */
export async function updateOrderStatus(supabase: SupabaseClient, orderId: string, newStatus: string, request?: Request, userEmail?: string) {
	// Validate status
	const validStatuses = ['pending', 'processing', 'ready', 'completed', 'cancelled'];
	if (!validStatuses.includes(newStatus)) {
		throw new Error('Invalid order status');
	}

	// get order details for audit log and payment status check
	const { data: order } = await supabase
		.from('orders')
		.select('order_number, customer_name, payment_status')
		.eq('id', orderId)
		.single();

	// Prevent marking as completed if payment is unpaid
	if (newStatus === 'completed' && order?.payment_status === 'unpaid') {
		throw new Error('Cannot mark order as completed when payment status is unpaid. Please update payment status first.');
	}

	// update order status
	const { error: updateError } = await supabase
		.from('orders')
		.update({ 
			status: newStatus,
			updated_at: new Date().toISOString()
		})
		.eq('id', orderId);

	if (updateError) {
		console.error('Error updating order status:', updateError);
		throw new Error(`Failed to update order status: ${updateError.message}`);
	}

	// log audit event for status change
	await logAuditEvent(
		supabase,
		'order_status_changed',
		`Order ${order?.order_number || orderId} status changed to ${newStatus}`,
		'order',
		orderId,
		request ? getClientIP(request) : undefined,
		request ? getUserAgent(request) : undefined,
		userEmail
	);

	return { success: true };
}

/**
 * update payment status
 */
export async function updatePaymentStatus(supabase: SupabaseClient, orderId: string, newPaymentStatus: string, request?: Request, userEmail?: string) {
	// Validate payment status
	const validPaymentStatuses = ['paid', 'unpaid', 'partial'];
	if (!validPaymentStatuses.includes(newPaymentStatus)) {
		throw new Error('Invalid payment status');
	}

	// get order details for audit log
	const { data: order } = await supabase
		.from('orders')
		.select('order_number, customer_name')
		.eq('id', orderId)
		.single();

	// update payment status
	const { error: updateError } = await supabase
		.from('orders')
		.update({ 
			payment_status: newPaymentStatus,
			updated_at: new Date().toISOString()
		})
		.eq('id', orderId);

	if (updateError) {
		console.error('Error updating payment status:', updateError);
		throw new Error(`Failed to update payment status: ${updateError.message}`);
	}

	// log audit event for payment status change
	await logAuditEvent(
		supabase,
		'payment_status_changed',
		`Order ${order?.order_number || orderId} payment status changed to ${newPaymentStatus}`,
		'order',
		orderId,
		request ? getClientIP(request) : undefined,
		request ? getUserAgent(request) : undefined,
		userEmail
	);

	return { success: true };
}

/**
 * fetch order by id with all related data
 */
export async function fetchOrderById(supabase: SupabaseClient, orderId: string) {
	// Validate UUID format
	const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
	if (!uuidRegex.test(orderId)) {
		throw new Error('Invalid order ID format');
	}

	const { data: order, error } = await supabase
		.from('orders')
		.select('*')
		.eq('id', orderId)
		.single();

	if (error) {
		console.error('Error fetching order:', error);
		throw new Error('Failed to fetch order');
	}

	return order;
}

/**
 * Generate comprehensive reports data from database
 */
export async function generateReportsData(supabase: SupabaseClient, startDate?: string, endDate?: string) {
	try {
		// fetch all orders for the period
		let query = supabase.from('orders').select('*');
		if (startDate && endDate) {
			// Validate date format
			const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
			if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
				throw new Error('Invalid date format. Use YYYY-MM-DD');
			}
			
			// convert date strings to proper datetime format for supabase
			const startDateTime = `${startDate} 00:00:00`;
			const endDateTime = `${endDate} 23:59:59`;
			
			query = query
				.gte('created_at', startDateTime)
				.lte('created_at', endDateTime);
		}
		
		const { data: orders, error: ordersError } = await query;
		
		if (ordersError) {
			console.error('Error fetching orders for reports:', ordersError);
			throw new Error('Failed to fetch orders for reports');
		}

		const ordersData = orders || [];

		// calculate summary statistics
		const completedOrders = ordersData.filter(order => order.status === 'completed');
		const totalRevenue = completedOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
		const totalOrders = ordersData.length;
		const completedOrdersCount = completedOrders.length;
		const averageOrderValue = completedOrdersCount > 0 ? totalRevenue / completedOrdersCount : 0;

		// calculate order status distribution
		const statusCounts: Record<string, { count: number; revenue: number }> = {};
		ordersData.forEach(order => {
			const status = order.status || 'unknown';
			if (!statusCounts[status]) {
				statusCounts[status] = { count: 0, revenue: 0 };
			}
			statusCounts[status].count++;
			statusCounts[status].revenue += order.total_amount || 0;
		});

		const orderStatusDistribution = Object.entries(statusCounts).map(([status, data]) => ({
			status,
			count: data.count,
			percentage: totalOrders > 0 ? (data.count / totalOrders) * 100 : 0,
			revenue: data.revenue
		}));

		// calculate payment method analysis
		const paymentCounts: Record<string, { count: number; totalAmount: number }> = {};
		ordersData.forEach(order => {
			const method = order.payment_method || 'unknown';
			if (!paymentCounts[method]) {
				paymentCounts[method] = { count: 0, totalAmount: 0 };
			}
			paymentCounts[method].count++;
			paymentCounts[method].totalAmount += order.total_amount || 0;
		});

		const paymentMethodAnalysis = Object.entries(paymentCounts).map(([method, data]) => ({
			method,
			count: data.count,
			percentage: totalOrders > 0 ? (data.count / totalOrders) * 100 : 0,
			totalAmount: data.totalAmount
		}));

		// calculate service type performance
		const serviceCounts: Record<string, { count: number; revenue: number; prices: number[] }> = {};
		ordersData.forEach(order => {
			const serviceType = order.service_type || 'unknown';
			if (!serviceCounts[serviceType]) {
				serviceCounts[serviceType] = { count: 0, revenue: 0, prices: [] };
			}
			serviceCounts[serviceType].count++;
			serviceCounts[serviceType].revenue += order.total_amount || 0;
			serviceCounts[serviceType].prices.push(order.unit_price || 0);
		});

		const serviceTypePerformance = Object.entries(serviceCounts).map(([serviceType, data]) => ({
			serviceType,
			orderCount: data.count,
			totalRevenue: data.revenue,
			averagePrice: data.prices.length > 0 ? data.prices.reduce((sum, price) => sum + price, 0) / data.prices.length : 0,
			percentage: totalOrders > 0 ? (data.count / totalOrders) * 100 : 0
		}));

		// calculate monthly trends based on actual data range
		const monthlyTrends: Array<{
			month: string;
			year: number;
			revenue: number;
			orderCount: number;
			averageOrderValue: number;
		}> = [];
		
		// get available years for filtering
		const availableYears = new Set<number>();
		
		if (ordersData.length > 0) {
			// get the actual date range from the data
			const orderDates = ordersData.map(order => new Date(order.created_at)).sort((a, b) => a.getTime() - b.getTime());
			const earliestDate = orderDates[0];
			const latestDate = orderDates[orderDates.length - 1];
			
			// create monthly buckets from earliest to latest month
			const monthsMap = new Map<string, {month: string, year: number, orders: any[]}>();
			
			// initialize all months in the range
			const currentMonth = new Date(earliestDate.getFullYear(), earliestDate.getMonth(), 1);
			const endMonth = new Date(latestDate.getFullYear(), latestDate.getMonth(), 1);
			
			while (currentMonth <= endMonth) {
				const monthKey = `${currentMonth.getFullYear()}-${currentMonth.getMonth()}`;
				monthsMap.set(monthKey, {
					month: currentMonth.toLocaleDateString('en-US', { month: 'long' }),
					year: currentMonth.getFullYear(),
					orders: []
				});
				currentMonth.setMonth(currentMonth.getMonth() + 1);
			}
			
			// distribute orders into monthly buckets
			ordersData.forEach(order => {
				const orderDate = new Date(order.created_at);
				const monthKey = `${orderDate.getFullYear()}-${orderDate.getMonth()}`;
				const monthData = monthsMap.get(monthKey);
				if (monthData) {
					monthData.orders.push(order);
				}
				// add year to available years set
				availableYears.add(orderDate.getFullYear());
			});
			
			// convert to final format and calculate statistics
			Array.from(monthsMap.values()).forEach(monthData => {
				const monthRevenue = monthData.orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
				const monthOrderCount = monthData.orders.length;
				const monthAverageOrderValue = monthOrderCount > 0 ? monthRevenue / monthOrderCount : 0;

				monthlyTrends.push({
					month: monthData.month,
					year: monthData.year,
					revenue: monthRevenue,
					orderCount: monthOrderCount,
					averageOrderValue: monthAverageOrderValue
				});
			});
		}

		// set period information
		const today = new Date();
		let periodStart, periodEnd, period;
		
		if (startDate && endDate) {
			periodStart = startDate;
			periodEnd = endDate;
			const start = new Date(startDate);
			const end = new Date(endDate);
			const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
			
			if (daysDiff === 7) {
				period = "Last 7 Days";
			} else if (daysDiff === 30) {
				period = "Last 30 Days";
			} else if (daysDiff === 90) {
				period = "Last 90 Days";
			} else {
				period = `${daysDiff} Days (${formatDate(start)} - ${formatDate(end)})`;
			}
		} else {
			// for demo purposes, if no dates specified, get the actual date range from the data
			if (ordersData.length > 0) {
				const orderDates = ordersData.map(order => new Date(order.created_at)).sort((a, b) => a.getTime() - b.getTime());
				const earliestDate = orderDates[0];
				const latestDate = orderDates[orderDates.length - 1];
				
				periodStart = earliestDate.toISOString().split('T')[0];
				periodEnd = latestDate.toISOString().split('T')[0];
				
				const daysDiff = Math.ceil((latestDate.getTime() - earliestDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
				period = `All Data (${daysDiff} days)`;
			} else {
				// fallback to last 30 days if no data
				const thirtyDaysAgo = new Date(today);
				thirtyDaysAgo.setDate(today.getDate() - 30);
				periodStart = thirtyDaysAgo.toISOString().split('T')[0];
				periodEnd = today.toISOString().split('T')[0];
				period = "Last 30 Days";
			}
		}
		
		function formatDate(date: Date): string {
			return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
		}

		return {
			summary: {
				totalRevenue,
				totalOrders,
				completedOrdersCount,
				averageOrderValue,
				period,
				periodStart,
				periodEnd
			},
			orderStatusDistribution,
			paymentMethodAnalysis,
			serviceTypePerformance,
			monthlyTrends,
			availableYears: Array.from(availableYears).sort((a, b) => b - a), // sort years descending
			dateRange: {
				start: periodStart,
				end: periodEnd
			}
		};

	} catch (error) {
		console.error('Error generating reports data:', error);
		throw new Error('Failed to generate reports data');
	}
}


