-- Migration script to add add-ons functionality to existing orders
-- Run this after updating the database schema

-- Add new columns to existing orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS subtotal_amount DECIMAL(10,2) DEFAULT 0 CHECK (subtotal_amount >= 0),
ADD COLUMN IF NOT EXISTS add_ons_amount DECIMAL(10,2) DEFAULT 0 CHECK (add_ons_amount >= 0);

-- Update existing orders to set subtotal_amount based on current total_amount
-- (assuming existing orders don't have add-ons yet)
UPDATE public.orders 
SET subtotal_amount = total_amount,
    add_ons_amount = 0
WHERE subtotal_amount IS NULL OR subtotal_amount = 0;

-- Make the new columns NOT NULL after setting default values
ALTER TABLE public.orders 
ALTER COLUMN subtotal_amount SET NOT NULL,
ALTER COLUMN add_ons_amount SET NOT NULL;

-- Update the payment_status enum to include 'partial'
-- Note: This might need to be done differently depending on your PostgreSQL version
-- For PostgreSQL 9.6+, you can use:
ALTER TYPE text CHECK (payment_status IN ('paid', 'unpaid', 'partial'));

-- If the above doesn't work, you may need to recreate the constraint:
-- ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_payment_status_check;
-- ALTER TABLE public.orders ADD CONSTRAINT orders_payment_status_check CHECK (payment_status IN ('paid', 'unpaid', 'partial'));
