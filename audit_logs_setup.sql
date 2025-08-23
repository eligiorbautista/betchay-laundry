-- =====================================================
-- Audit Logs Setup for Laundry Management System
-- =====================================================
-- This file contains the audit_logs table and related functions
-- for tracking user activities and order changes.

-- =====================================================
-- AUDIT LOGS TABLE
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
-- AUDIT LOG FUNCTION
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
-- DISABLE ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE public.audit_logs DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- CREATE INDEXES FOR BETTER PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_email ON public.audit_logs(user_email);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_type ON public.audit_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON public.audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_id ON public.audit_logs(entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================
GRANT ALL ON public.audit_logs TO authenticated;

-- =====================================================
-- SETUP COMPLETE
-- =====================================================
-- Audit logs table and functions are now ready!
-- 
-- Features:
-- - Tracks login, logout, reset password events
-- - Tracks order creation, updates, status changes
-- - Stores user ID and email for better tracking
-- - Stores IP address and user agent for security
-- - Performance indexes for fast queries
-- - RLS disabled for authenticated users
