-- Add Add-ons columns to Orders table (Simplified)
-- This script adds nullable columns to store add-ons information directly in the orders table
-- for easier viewing in the UI - you can add data manually

-- =====================================================
-- 1. ADD NEW COLUMNS TO ORDERS TABLE
-- =====================================================

-- Add add_ons column to store add-ons as JSON (nullable)
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS add_ons JSONB;

-- Add add_ons_quantity column to store total quantity of add-ons (nullable)
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS add_ons_quantity INTEGER;

-- Add add_ons_list column to store human-readable add-ons list (nullable)
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS add_ons_list TEXT;

-- =====================================================
-- 2. CREATE INDEXES FOR NEW COLUMNS
-- =====================================================

-- Index for add_ons JSONB column for better query performance
CREATE INDEX IF NOT EXISTS idx_orders_add_ons ON public.orders USING GIN (add_ons);

-- Index for add_ons_quantity
CREATE INDEX IF NOT EXISTS idx_orders_add_ons_quantity ON public.orders(add_ons_quantity);

-- =====================================================
-- 3. ADD COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON COLUMN public.orders.add_ons IS 'JSON array of add-ons with details (id, name, quantity, unit_price, total_price) - nullable';
COMMENT ON COLUMN public.orders.add_ons_quantity IS 'Total quantity of all add-ons for this order - nullable';
COMMENT ON COLUMN public.orders.add_ons_list IS 'Human-readable list of add-ons with quantities - nullable';

-- =====================================================
-- 4. SUCCESS MESSAGE
-- =====================================================

SELECT 'Add-ons columns have been successfully added to the orders table!' as message;
SELECT 'You can now manually add add-ons data to these nullable columns.' as note;
