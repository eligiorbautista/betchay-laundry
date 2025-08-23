-- Disable RLS on orders table for full authenticated user access
-- Run this in your Supabase SQL editor

-- Disable RLS on orders table
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;

-- Disable RLS on order_status_history table
ALTER TABLE public.order_status_history DISABLE ROW LEVEL SECURITY;

-- Disable RLS on service_pricing table (if needed)
ALTER TABLE public.service_pricing DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('orders', 'order_status_history', 'service_pricing');
