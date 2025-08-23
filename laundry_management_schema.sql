-- =====================================================
-- Laundry Management System - Complete Database Schema
-- =====================================================
-- This file contains all necessary tables, functions, and setup
-- for the laundry management system.
-- Run this file in your Supabase SQL editor to set up the complete database.

-- =====================================================
-- 1. ORDERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_number VARCHAR(20) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'ready', 'completed', 'cancelled')),
    service_type VARCHAR(100) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_status VARCHAR(50) NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('paid', 'unpaid')),
    payment_method VARCHAR(50) CHECK (payment_method IN ('cash', 'gcash', 'paymaya', 'bank_transfer', 'credit_card')),
    pickup_date TIMESTAMP WITH TIME ZONE,
    delivery_date TIMESTAMP WITH TIME ZONE,
    remarks TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. SERVICE PRICING TABLE (if not already exists)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.service_pricing (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    service_name VARCHAR(100) NOT NULL UNIQUE,
    price_per_kg DECIMAL(10,2) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. AUDIT LOGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('login', 'logout', 'reset_password', 'order_created', 'order_updated', 'order_status_changed', 'payment_status_changed')),
    entity_type VARCHAR(50) CHECK (entity_type IN ('order', 'user', 'system')),
    entity_id UUID,
    description TEXT NOT NULL,
    user_email VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 4. CREATE ORDER NUMBER GENERATION FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS VARCHAR(20) AS $$
DECLARE
    next_number INTEGER;
    order_num VARCHAR(20);
BEGIN
    -- Get the next number by finding the highest existing order number
    SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 5) AS INTEGER)), 0) + 1
    INTO next_number
    FROM public.orders
    WHERE order_number IS NOT NULL AND order_number ~ '^ORD-[0-9]+$';
    
    -- Format the order number
    order_num := 'ORD-' || next_number;
    
    RETURN order_num;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 5. CREATE AUDIT LOG FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION log_audit_event(
    p_user_id UUID,
    p_action_type VARCHAR(50),
    p_description TEXT,
    p_user_email VARCHAR(255) DEFAULT NULL,
    p_entity_type VARCHAR(50) DEFAULT NULL,
    p_entity_id UUID DEFAULT NULL,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.audit_logs (
        user_id,
        action_type,
        entity_type,
        entity_id,
        description,
        user_email,
        ip_address,
        user_agent
    ) VALUES (
        p_user_id,
        p_action_type,
        p_entity_type,
        p_entity_id,
        p_description,
        p_user_email,
        p_ip_address,
        p_user_agent
    );
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. CREATE UPDATED_AT TRIGGER FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 7. CREATE TRIGGERS FOR UPDATED_AT
-- =====================================================
-- Create trigger for orders table
DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for service_pricing table
DROP TRIGGER IF EXISTS update_service_pricing_updated_at ON public.service_pricing;
CREATE TRIGGER update_service_pricing_updated_at
    BEFORE UPDATE ON public.service_pricing
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 8. INSERT DEFAULT SERVICE PRICING (if table is empty)
-- =====================================================
INSERT INTO public.service_pricing (service_name, price_per_kg, description)
VALUES 
    ('Wash and Fold', 50.00, 'Basic wash and fold service'),
    ('Wash and Iron', 80.00, 'Wash and iron service'),
    ('Dry Clean', 120.00, 'Professional dry cleaning'),
    ('Express Service', 100.00, 'Same day service (wash and fold)'),
    ('Bulk Service', 40.00, 'Bulk laundry service (min 10kg)')
ON CONFLICT (service_name) DO NOTHING;

-- =====================================================
-- 9. DISABLE ROW LEVEL SECURITY (RLS)
-- =====================================================
-- Disable RLS on all tables to allow authenticated users full access
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_pricing DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- 10. CREATE INDEXES FOR BETTER PERFORMANCE
-- =====================================================
-- Indexes for orders table
CREATE INDEX IF NOT EXISTS idx_orders_customer_name ON public.orders(customer_name);
CREATE INDEX IF NOT EXISTS idx_orders_customer_phone ON public.orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON public.orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);

-- Indexes for service_pricing table
CREATE INDEX IF NOT EXISTS idx_service_pricing_service_name ON public.service_pricing(service_name);
CREATE INDEX IF NOT EXISTS idx_service_pricing_is_active ON public.service_pricing(is_active);

-- Indexes for audit_logs table
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_email ON public.audit_logs(user_email);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_type ON public.audit_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON public.audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_id ON public.audit_logs(entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);

-- =====================================================
-- 11. GRANT PERMISSIONS
-- =====================================================
-- Grant all permissions to authenticated users
GRANT ALL ON public.orders TO authenticated;
GRANT ALL ON public.service_pricing TO authenticated;
GRANT ALL ON public.audit_logs TO authenticated;

-- Grant usage on sequences (if any)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =====================================================
-- SETUP COMPLETE
-- =====================================================
-- Your laundry management system database is now ready!
-- 
-- Tables created:
-- - orders: Main orders table with order_number generation
-- - service_pricing: Service types and pricing
-- - audit_logs: For tracking user activities and order changes (includes user_email)
--
-- Functions created:
-- - generate_order_number(): Automatically generates ORD-1, ORD-2, etc.
-- - log_audit_event(): Logs audit events for tracking (includes user_email)
-- - update_updated_at_column(): Updates timestamps automatically
--
-- Features:
-- - Automatic order number generation
-- - Default service pricing
-- - Audit logging for security and tracking (with user email)
-- - RLS disabled for authenticated users
-- - Performance indexes
-- - Automatic timestamp updates
