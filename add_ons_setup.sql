-- Add-ons Feature Setup Script
-- This script adds the add-ons functionality to your laundry management system
-- Run this script on your database to enable add-ons

-- 1. Create the add_ons table
CREATE TABLE IF NOT EXISTS public.add_ons (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    unit TEXT DEFAULT 'piece' CHECK (unit IN ('piece', 'kg', 'set', 'order')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create the order_add_ons junction table
CREATE TABLE IF NOT EXISTS public.order_add_ons (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
    add_on_id UUID REFERENCES public.add_ons(id) ON DELETE CASCADE NOT NULL,
    quantity DECIMAL(8,2) NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
    total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(order_id, add_on_id)
);

-- 3. Add new columns to the orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS subtotal_amount DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (subtotal_amount >= 0);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS add_ons_amount DECIMAL(10,2) NOT NULL DEFAULT 0 CHECK (add_ons_amount >= 0);

-- 4. Update existing orders to have proper values
UPDATE public.orders 
SET subtotal_amount = total_amount, add_ons_amount = 0 
WHERE subtotal_amount IS NULL OR subtotal_amount = 0;

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_order_add_ons_order_id ON public.order_add_ons(order_id);
CREATE INDEX IF NOT EXISTS idx_order_add_ons_add_on_id ON public.order_add_ons(add_on_id);

-- 6. Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_add_ons_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_add_ons_updated_at
    BEFORE UPDATE ON public.add_ons
    FOR EACH ROW
    EXECUTE FUNCTION update_add_ons_updated_at();

-- 7. Add comments for documentation
COMMENT ON TABLE public.add_ons IS 'Available add-ons that can be added to orders';
COMMENT ON TABLE public.order_add_ons IS 'Junction table linking orders with their selected add-ons';

-- 8. Insert sample add-ons data
INSERT INTO public.add_ons (name, description, price, unit) VALUES
('Fabric Conditioner', 'Add fabric conditioner for extra softness and freshness', 3.00, 'order'),
('Premium Detergent', 'High-quality detergent for better cleaning results', 4.50, 'order'),
('Eco-Friendly Detergent', 'Environmentally friendly detergent option', 5.00, 'order'),
('Scented Fabric Conditioner', 'Fabric conditioner with long-lasting fragrance', 3.50, 'order'),
('Hypoallergenic Detergent', 'Gentle detergent for sensitive skin', 6.00, 'order')
ON CONFLICT (name) DO NOTHING;

-- 9. Update payment_status enum to include 'partial' (if not already present)
-- Note: This might need to be done manually if the enum already exists
-- ALTER TYPE payment_status ADD VALUE IF NOT EXISTS 'partial';

-- Success message
SELECT 'Add-ons feature has been successfully added to your database!' as message;
