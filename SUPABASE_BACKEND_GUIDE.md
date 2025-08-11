# Supabase Backend Implementation Guide

## Overview
This guide provides the backend implementation for the Laundry Management System using Supabase. All server-side logic, database operations, and API endpoints will be implemented here.

## Table of Contents
1. [Database Schema](#database-schema)
2. [Authentication](#authentication)
3. [API Endpoints](#api-endpoints)
4. [Server-Side Functions](#server-side-functions)
5. [Database Operations](#database-operations)
6. [Security & Permissions](#security--permissions)

## Database Schema

### Tables Structure

```sql
-- Profiles table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  user_id UUID REFERENCES public.profiles(id),
  order_number TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'ready', 'completed', 'cancelled')),
  total_amount DECIMAL(10,2) DEFAULT 0,
  pickup_date DATE,
  delivery_date DATE,
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table
CREATE TABLE public.order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  service_type TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoices table
CREATE TABLE public.invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  invoice_number TEXT UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  due_date DATE,
  paid_date DATE,
  payment_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table
CREATE TABLE public.payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL,
  transaction_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Authentication

### Server-Side Authentication Functions

```typescript
// src/routes/+layout.server.ts
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
  const session = await locals.getSession();
  
  if (!session) {
    throw redirect(303, '/auth/login');
  }
  
  return {
    user: session.user
  };
};
```

```typescript
// src/hooks.server.ts
import { createSupabaseServerClient } from '@supabase/auth-helpers-sveltekit';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.supabase = createSupabaseServerClient({
    supabaseUrl: PUBLIC_SUPABASE_URL,
    supabaseKey: PUBLIC_SUPABASE_ANON_KEY,
    event
  });

  event.locals.getSession = async () => {
    const {
      data: { session }
    } = await event.locals.supabase.auth.getSession();
    return session;
  };

  return resolve(event, {
    filterSerializedResponseHeaders(name) {
      return name === 'content-range';
    }
  });
};
```

## API Endpoints



### Order Management

```typescript
// src/routes/(app)/orders/+page.server.ts
import type { PageServerLoad, Actions } from './$types';
import { supabase } from '$lib/config/supabaseClient';

export const load: PageServerLoad = async ({ locals }) => {
  const session = await locals.getSession();
  
  const { data: orders, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items (
        id,
        service_type,
        quantity,
        unit_price,
        total_price
      )
    `)
    .eq('user_id', session?.user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  return { orders };
};

export const actions: Actions = {
  create: async ({ request, locals }) => {
    const session = await locals.getSession();
    const formData = await request.formData();
    
    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const orderData = {
      customer_name: formData.get('customer_name') as string,
      customer_phone: formData.get('customer_phone') as string,
      user_id: session?.user.id,
      order_number: orderNumber,
      pickup_date: formData.get('pickup_date') as string,
      delivery_date: formData.get('delivery_date') as string,
      remarks: formData.get('remarks') as string
    };

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (orderError) throw orderError;

    // Handle order items
    const items = JSON.parse(formData.get('items') as string);
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      service_type: item.service_type,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.quantity * item.unit_price
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    return { success: true, order };
  },

  updateStatus: async ({ request, params }) => {
    const orderId = params.orderId;
    const formData = await request.formData();
    const status = formData.get('status') as string;

    const { data, error } = await supabase
      .from('orders')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, order: data };
  }
};
```

### Invoice Management

```typescript
// src/routes/(app)/invoices/+page.server.ts
import type { PageServerLoad, Actions } from './$types';
import { supabase } from '$lib/config/supabaseClient';

export const load: PageServerLoad = async ({ locals }) => {
  const session = await locals.getSession();
  
  const { data: invoices, error } = await supabase
    .from('invoices')
    .select(`
      *,
      orders (
        id,
        order_number,
        customer_name
      )
    `)
    .eq('orders.user_id', session?.user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  
  return { invoices };
};

export const actions: Actions = {
  generate: async ({ request, locals }) => {
    const session = await locals.getSession();
    const formData = await request.formData();
    
    const orderId = formData.get('order_id') as string;
    const amount = parseFloat(formData.get('amount') as string);
    const dueDate = formData.get('due_date') as string;
    
    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const invoiceData = {
      order_id: orderId,
      invoice_number: invoiceNumber,
      amount,
      due_date: dueDate
    };

    const { data, error } = await supabase
      .from('invoices')
      .insert(invoiceData)
      .select()
      .single();

    if (error) throw error;
    return { success: true, invoice: data };
  },

  markAsPaid: async ({ request, params }) => {
    const invoiceId = params.invoiceId;
    const formData = await request.formData();
    
    const paymentData = {
      invoice_id: invoiceId,
      amount: parseFloat(formData.get('amount') as string),
      payment_method: formData.get('payment_method') as string,
      transaction_id: formData.get('transaction_id') as string,
      status: 'completed'
    };

    // Create payment record
    const { error: paymentError } = await supabase
      .from('payments')
      .insert(paymentData);

    if (paymentError) throw paymentError;

    // Update invoice status
    const { data, error } = await supabase
      .from('invoices')
      .update({ 
        status: 'paid',
        paid_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', invoiceId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, invoice: data };
  }
};
```

### Reports and Analytics

```typescript
// src/routes/(app)/reports/+page.server.ts
import type { PageServerLoad } from './$types';
import { supabase } from '$lib/config/supabaseClient';

export const load: PageServerLoad = async ({ locals, url }) => {
  const session = await locals.getSession();
  const startDate = url.searchParams.get('startDate') || new Date(new Date().getFullYear(), 0, 1).toISOString();
  const endDate = url.searchParams.get('endDate') || new Date().toISOString();

  // Get orders summary
  const { data: ordersSummary, error: ordersError } = await supabase
    .from('orders')
    .select('status, total_amount, created_at')
    .eq('user_id', session?.user.id)
    .gte('created_at', startDate)
    .lte('created_at', endDate);

  if (ordersError) throw ordersError;

  // Get revenue data
  const { data: revenueData, error: revenueError } = await supabase
    .from('invoices')
    .select('amount, status, created_at')
    .eq('orders.user_id', session?.user.id)
    .eq('status', 'paid')
    .gte('created_at', startDate)
    .lte('created_at', endDate);

  if (revenueError) throw revenueError;

  // Calculate statistics
  const totalOrders = ordersSummary.length;
  const completedOrders = ordersSummary.filter(o => o.status === 'completed').length;
  const totalRevenue = revenueData.reduce((sum, inv) => sum + inv.amount, 0);
  const pendingOrders = ordersSummary.filter(o => o.status === 'pending').length;

  return {
    ordersSummary,
    revenueData,
    statistics: {
      totalOrders,
      completedOrders,
      totalRevenue,
      pendingOrders
    },
    dateRange: { startDate, endDate }
  };
};
```

## Database Operations

### Helper Functions

```typescript
// src/lib/utils/database.ts
import { supabase } from '$lib/config/supabaseClient';

export class DatabaseService {
  // Order operations
  static async getOrders(userId: string) {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          service_type,
          quantity,
          unit_price,
          total_price
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  static async createOrder(orderData: any, items: any[]) {
    // Start transaction
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (orderError) throw orderError;

    // Add order items
    const orderItems = items.map(item => ({
      order_id: order.id,
      ...item
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    return order;
  }

  // Invoice operations
  static async getInvoices(userId: string) {
    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        orders (
          id,
          order_number,
          customer_name
        )
      `)
      .eq('orders.user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  static async generateInvoice(invoiceData: any) {
    const { data, error } = await supabase
      .from('invoices')
      .insert(invoiceData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
}
```

## Security & Permissions

### Row Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);



-- Orders policies
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own orders" ON public.orders
  FOR UPDATE USING (auth.uid() = user_id);

-- Order items policies (through orders)
CREATE POLICY "Users can view order items for own orders" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert order items for own orders" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- Invoices policies (through orders)
CREATE POLICY "Users can view invoices for own orders" ON public.invoices
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = invoices.order_id 
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert invoices for own orders" ON public.invoices
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = invoices.order_id 
      AND orders.user_id = auth.uid()
    )
  );

-- Payments policies (through invoices)
CREATE POLICY "Users can view payments for own invoices" ON public.payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.invoices 
      JOIN public.orders ON orders.id = invoices.order_id
      WHERE invoices.id = payments.invoice_id 
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert payments for own invoices" ON public.payments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.invoices 
      JOIN public.orders ON orders.id = invoices.order_id
      WHERE invoices.id = payments.invoice_id 
      AND orders.user_id = auth.uid()
    )
  );
```

## Environment Variables

Create a `.env` file in your project root:

```env
PUBLIC_SUPABASE_URL=your_supabase_project_url
PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Implementation Steps

1. **Set up Supabase project** and get your project URL and API keys
2. **Create the database schema** using the SQL provided above
3. **Enable Row Level Security** and create the policies
4. **Implement the server-side functions** in the appropriate route files
5. **Update your stores** to use the new server-side functions instead of direct Supabase calls
6. **Test all CRUD operations** for each entity
7. **Implement error handling** and loading states
8. **Add proper validation** for all form inputs

## Notes

- All server-side functions should be placed in `+page.server.ts` files
- Use form actions for POST/PUT/DELETE operations
- Use load functions for GET operations
- Always validate user permissions using the session
- Implement proper error handling and user feedback
- Consider implementing caching for frequently accessed data
- Use transactions for operations that affect multiple tables 