-- Laundry Management System Database Schema
-- Generated for Supabase PostgreSQL

-- Enable UUID extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";



-- =====================================================
-- 2. SERVICE PRICING TABLE (already exists)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.service_pricing (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    service_name TEXT NOT NULL UNIQUE,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    unit TEXT DEFAULT 'kg' CHECK (unit IN ('kg', 'piece', 'set')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. CUSTOMERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,  
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. ORDERS TABLE (main orders table)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_number TEXT NOT NULL UNIQUE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT, 
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'ready', 'completed', 'cancelled')),
    service_type TEXT NOT NULL,
    quantity DECIMAL(8,2) NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
    payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('paid', 'unpaid', 'partial')),
    payment_method TEXT CHECK (payment_method IN ('cash', 'gcash', 'paymaya', 'bank_transfer', 'credit_card')),
    pickup_date TIMESTAMP WITH TIME ZONE,
    delivery_date TIMESTAMP WITH TIME ZONE,
    remarks TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 5. ORDER ITEMS TABLE (for multiple items per order)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    service_type TEXT NOT NULL,
    quantity DECIMAL(8,2) NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
    total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0),
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 6. PAYMENTS TABLE (for payment tracking)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'gcash', 'paymaya', 'bank_transfer', 'credit_card')),
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
    transaction_id TEXT,
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 7. ORDER STATUS HISTORY TABLE (for tracking status changes)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.order_status_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'ready', 'completed', 'cancelled')),
    remarks TEXT,
    changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);



-- =====================================================
-- 9. AUDIT LOG TABLE (for tracking important actions)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    table_name TEXT,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Orders table indexes
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_customer_name ON public.orders(customer_name);
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON public.orders(customer_phone);

-- Order items indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- Payments indexes
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON public.payments(payment_date);

-- Order status history indexes
CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON public.order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_history_created_at ON public.order_status_history(created_at);

-- Customers indexes
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_name ON public.customers(name);

-- Audit logs indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at

CREATE TRIGGER update_service_pricing_updated_at BEFORE UPDATE ON public.service_pricing FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables

ALTER TABLE public.service_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;



-- Service pricing policies (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view service pricing" ON public.service_pricing FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage service pricing" ON public.service_pricing FOR ALL USING (auth.role() = 'authenticated');

-- Customers policies
CREATE POLICY "Authenticated users can view customers" ON public.customers FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage customers" ON public.customers FOR ALL USING (auth.role() = 'authenticated');

-- Orders policies
CREATE POLICY "Authenticated users can view orders" ON public.orders FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage orders" ON public.orders FOR ALL USING (auth.role() = 'authenticated');

-- Order items policies
CREATE POLICY "Authenticated users can view order items" ON public.order_items FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage order items" ON public.order_items FOR ALL USING (auth.role() = 'authenticated');

-- Payments policies
CREATE POLICY "Authenticated users can view payments" ON public.payments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage payments" ON public.payments FOR ALL USING (auth.role() = 'authenticated');

-- Order status history policies
CREATE POLICY "Authenticated users can view order status history" ON public.order_status_history FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can manage order status history" ON public.order_status_history FOR ALL USING (auth.role() = 'authenticated');



-- Audit logs policies (authenticated users only)
CREATE POLICY "Authenticated users can view audit logs" ON public.audit_logs FOR SELECT USING (auth.role() = 'authenticated');

-- =====================================================
-- SAMPLE DATA INSERTION
-- =====================================================

-- Insert sample service pricing
-- INSERT INTO public.service_pricing (service_name, description, price, unit) VALUES
-- ('Wash & Fold', 'Basic wash and fold service', 50.00, 'kg'),
-- ('Wash & Dry', 'Wash, dry, and fold service', 50.00, 'kg'),
-- ('Dry Cleaning', 'Professional dry cleaning service', 75.00, 'kg'),
-- ('Express Wash', 'Same day service (extra charge)', 65.00, 'kg'),
-- ('Premium Cleaning', 'Premium wash with fabric softener', 80.00, 'kg'),
-- ('Delicate Care', 'Hand wash for delicate items', 100.00, 'kg'),
-- ('Ironing Only', 'Press and iron service only', 30.00, 'kg')
-- ON CONFLICT (service_name) DO NOTHING;



-- =====================================================
-- FUNCTIONS FOR COMMON OPERATIONS
-- =====================================================

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    prefix TEXT := 'ORD';
    year TEXT;
    month TEXT;
    day TEXT;
    sequence_num INTEGER;
    order_num TEXT;
BEGIN
    -- Get current date components
    year := EXTRACT(YEAR FROM NOW())::TEXT;
    month := LPAD(EXTRACT(MONTH FROM NOW())::TEXT, 2, '0');
    day := LPAD(EXTRACT(DAY FROM NOW())::TEXT, 2, '0');
    
    -- Get sequence number for today
    SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM LENGTH(prefix) + 9) AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM public.orders
    WHERE order_number LIKE prefix || year || month || day || '%';
    
    -- Format order number
    order_num := prefix || year || month || day || LPAD(sequence_num::TEXT, 3, '0');
    
    RETURN order_num;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate order total
CREATE OR REPLACE FUNCTION calculate_order_total(order_quantity DECIMAL, unit_price DECIMAL)
RETURNS DECIMAL AS $$
BEGIN
    RETURN order_quantity * unit_price;
END;
$$ LANGUAGE plpgsql;

-- Function to update order status with history
CREATE OR REPLACE FUNCTION update_order_status_with_history(
    p_order_id UUID,
    p_status TEXT,
    p_remarks TEXT DEFAULT NULL,
    p_user_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    -- Update order status
    UPDATE public.orders 
    SET status = p_status, updated_at = NOW()
    WHERE id = p_order_id;
    
    -- Insert status history
    INSERT INTO public.order_status_history (order_id, status, remarks, changed_by)
    VALUES (p_order_id, p_status, p_remarks, p_user_id);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMMENTS
-- =====================================================


COMMENT ON TABLE public.service_pricing IS 'Service pricing configuration';
COMMENT ON TABLE public.customers IS 'Customer information';
COMMENT ON TABLE public.orders IS 'Main orders table';
COMMENT ON TABLE public.order_items IS 'Individual items within an order';
COMMENT ON TABLE public.payments IS 'Payment transactions';
COMMENT ON TABLE public.order_status_history IS 'Order status change history';

COMMENT ON TABLE public.audit_logs IS 'Audit trail for important actions';

COMMENT ON COLUMN public.orders.order_number IS 'Unique order identifier (auto-generated)';
COMMENT ON COLUMN public.orders.status IS 'Order status: pending, processing, ready, completed, cancelled';
COMMENT ON COLUMN public.orders.payment_status IS 'Payment status: paid, unpaid, partial';
COMMENT ON COLUMN public.orders.payment_method IS 'Payment method: cash, gcash, paymaya, bank_transfer, credit_card';
