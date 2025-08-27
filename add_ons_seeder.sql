-- Add-ons Seeder for Laundry Management System
-- This file contains sample add-ons data

-- Insert sample add-ons
INSERT INTO public.add_ons (name, description, price, unit) VALUES
('Fabric Softener', 'Add fabric softener to your laundry for a fresh, soft feel', 10.00, 'order'),
('Starch', 'Add starch for crisp finish and professional appearance', 15.00, 'order'),
('Express Service', 'Same day service (2-4 hours turnaround)', 50.00, 'order'),
('Hanger Service', 'Clothes returned on hangers for convenience', 5.00, 'order'),
('Dry Clean Press', 'Professional pressing after dry cleaning', 20.00, 'order'),
('Spot Treatment', 'Special stain removal treatment for tough stains', 25.00, 'order'),
('Fragrance Boost', 'Extra fragrance added to laundry', 8.00, 'order'),
('Wrinkle Free', 'Anti-wrinkle treatment for smooth finish', 12.00, 'order'),
('Color Protection', 'Special treatment to protect colors from fading', 18.00, 'order'),
('Delicate Care', 'Extra gentle handling for delicate fabrics', 30.00, 'order'),
('Ironing Service', 'Professional ironing and pressing', 15.00, 'order'),
('Packaging', 'Special packaging for gifts or special occasions', 10.00, 'order')
ON CONFLICT (name) DO NOTHING;
