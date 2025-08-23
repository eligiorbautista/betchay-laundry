-- Update orders table to make order_number optional
-- Run this in your Supabase SQL editor

-- Make order_number nullable
ALTER TABLE public.orders ALTER COLUMN order_number DROP NOT NULL;

-- Remove the unique constraint on order_number
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_order_number_key;

-- Remove the index on order_number since we won't use it
DROP INDEX IF EXISTS idx_orders_order_number;
