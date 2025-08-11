import { writable } from 'svelte/store';
import type { Order } from '$lib/types/order';

// Create the writable store - initialize with empty array
// Mock data is now handled in +page.server.ts files
export const ordersStore = writable<Order[]>([]);

// Actions for managing orders (for client-side state management)
export const orderActions = {
    // Initialize store with data from server
    initialize: (orders: Order[]): void => {
        ordersStore.set(orders);
    },

    // Get all orders
    getAll: (): Order[] => {
        let orders: Order[] = [];
        ordersStore.subscribe(value => {
            orders = value;
        })();
        return orders;
    },

    // Get order by ID
    getById: (id: string): Order | undefined => {
        let orders: Order[] = [];
        ordersStore.subscribe(value => {
            orders = value;
        })();
        return orders.find(order => order.id === id);
    },

    // Add new order
    add: (order: Order): void => {
        ordersStore.update(orders => [...orders, order]);
    },

    // Update order
    update: (id: string, updatedOrder: Partial<Order>): void => {
        ordersStore.update(orders =>
            orders.map(order =>
                order.id === id ? { ...order, ...updatedOrder, updated_at: new Date().toISOString() } : order
            )
        );
    },

    // Update order status
    updateStatus: (id: string, status: Order['status']): void => {
        ordersStore.update(orders =>
            orders.map(order =>
                order.id === id ? { ...order, status, updated_at: new Date().toISOString() } : order
            )
        );
    },

    // Update payment status
    updatePaymentStatus: (id: string, paymentStatus: Order['payment_status']): void => {
        ordersStore.update(orders =>
            orders.map(order =>
                order.id === id ? { ...order, payment_status: paymentStatus, updated_at: new Date().toISOString() } : order
            )
        );
    },

    // Delete order
    delete: (id: string): void => {
        ordersStore.update(orders => orders.filter(order => order.id !== id));
    },

    // Search orders
    search: (query: string): Order[] => {
        let orders: Order[] = [];
        ordersStore.subscribe(value => {
            orders = value;
        })();

        const searchLower = query.toLowerCase();
        return orders.filter(order =>
            order.customer_name.toLowerCase().includes(searchLower) ||
            order.customer_phone?.includes(searchLower) ||
            order.order_number.toLowerCase().includes(searchLower)
        );
    },

    // Get orders by status
    getByStatus: (status: Order['status']): Order[] => {
        let orders: Order[] = [];
        ordersStore.subscribe(value => {
            orders = value;
        })();
        return orders.filter(order => order.status === status);
    },

    // Get orders by payment status
    getByPaymentStatus: (paymentStatus: Order['payment_status']): Order[] => {
        let orders: Order[] = [];
        ordersStore.subscribe(value => {
            orders = value;
        })();
        return orders.filter(order => order.payment_status === paymentStatus);
    }
};