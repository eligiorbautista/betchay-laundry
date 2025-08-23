-- Make order_number column nullable
-- Run this in your Supabase SQL editor

-- Make order_number nullable
ALTER TABLE public.orders ALTER COLUMN order_number DROP NOT NULL;

-- Verify the change
SELECT column_name, is_nullable, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders' AND column_name = 'order_number';
