-- Sample Orders Data for Laundry Management System
-- Run this in your Supabase SQL Editor to populate the database with test data

-- Sample Orders Data
-- Orders from the last 30 days (various dates)
INSERT INTO orders (
    order_number, 
    customer_name, 
    customer_phone, 
    status, 
    service_type, 
    quantity, 
    unit_price, 
    total_amount, 
    payment_status, 
    payment_method, 
    pickup_date, 
    delivery_date, 
    remarks, 
    created_at
) VALUES 
-- Last 7 days orders
('ORD-2024-001', 'Juan Dela Cruz', '+639123456789', 'completed', 'Wash, Dry & Fold', 5.0, 150.00, 750.00, 'paid', 'cash', '2024-01-15', '2024-01-16', 'Handle with care', '2024-01-15 09:30:00'),
('ORD-2024-002', 'Maria Santos', '+639234567890', 'completed', 'Wash, Dry & Fold', 3.5, 120.00, 420.00, 'paid', 'gcash', '2024-01-16', '2024-01-17', 'Fragile items', '2024-01-16 14:20:00'),
('ORD-2024-003', 'Pedro Martinez', '+639345678901', 'ready', 'Dry Cleaning', 2.0, 200.00, 400.00, 'paid', 'bank_transfer', '2024-01-17', '2024-01-18', 'Business suit', '2024-01-17 11:15:00'),
('ORD-2024-004', 'Ana Garcia', '+639456789012', 'processing', 'Wash, Dry & Fold', 4.0, 150.00, 600.00, 'unpaid', 'cash', '2024-01-18', '2024-01-19', 'Heavy items', '2024-01-18 16:45:00'),
('ORD-2024-005', 'Luis Rodriguez', '+639567890123', 'pending', 'Wash, Dry & Fold', 8.0, 80.00, 640.00, 'unpaid', 'paymaya', '2024-01-19', '2024-01-20', 'Formal shirts', '2024-01-19 08:30:00'),

-- Last 14 days orders
('ORD-2024-006', 'Carmen Lopez', '+639678901234', 'completed', 'Wash, Dry & Fold', 6.0, 120.00, 720.00, 'paid', 'cash', '2024-01-10', '2024-01-11', 'Bed sheets', '2024-01-10 13:20:00'),
('ORD-2024-007', 'Roberto Silva', '+639789012345', 'completed', 'Dry Cleaning', 1.5, 200.00, 300.00, 'paid', 'gcash', '2024-01-11', '2024-01-12', 'Wedding dress', '2024-01-11 10:45:00'),
('ORD-2024-008', 'Isabel Torres', '+639890123456', 'completed', 'Wash, Dry & Fold', 7.0, 150.00, 1050.00, 'paid', 'gcash', '2024-01-12', '2024-01-13', 'Heavy blankets', '2024-01-12 15:30:00'),
('ORD-2024-009', 'Miguel Hernandez', '+639901234567', 'ready', 'Wash, Dry & Fold', 5.0, 80.00, 400.00, 'paid', 'bank_transfer', '2024-01-13', '2024-01-14', 'Work uniforms', '2024-01-13 09:15:00'),
('ORD-2024-010', 'Elena Morales', '+639012345678', 'processing', 'Wash, Dry & Fold', 4.5, 120.00, 540.00, 'paid', 'cash', '2024-01-14', '2024-01-15', 'Baby clothes', '2024-01-14 12:00:00'),

-- Last 30 days orders
('ORD-2024-011', 'Carlos Jimenez', '+639123456780', 'completed', 'Wash, Dry & Fold', 8.0, 150.00, 1200.00, 'paid', 'gcash', '2024-01-01', '2024-01-02', 'Curtains', '2024-01-01 14:30:00'),
('ORD-2024-012', 'Sofia Vargas', '+639234567801', 'completed', 'Dry Cleaning', 3.0, 200.00, 600.00, 'paid', 'paymaya', '2024-01-02', '2024-01-03', 'Winter coats', '2024-01-02 11:20:00'),
('ORD-2024-013', 'Diego Moreno', '+639345678012', 'completed', 'Wash, Dry & Fold', 5.5, 120.00, 660.00, 'paid', 'cash', '2024-01-03', '2024-01-04', 'Towels', '2024-01-03 16:45:00'),
('ORD-2024-014', 'Valentina Ruiz', '+639456789023', 'completed', 'Wash, Dry & Fold', 6.0, 80.00, 480.00, 'paid', 'paymaya', '2024-01-04', '2024-01-05', 'Dress shirts', '2024-01-04 08:15:00'),
('ORD-2024-015', 'Fernando Castro', '+639567890134', 'completed', 'Wash, Dry & Fold', 6.5, 150.00, 975.00, 'paid', 'bank_transfer', '2024-01-05', '2024-01-06', 'Jeans', '2024-01-05 13:40:00'),

-- More orders for better data distribution
('ORD-2024-016', 'Lucia Ortega', '+639678901245', 'completed', 'Wash, Dry & Fold', 4.0, 120.00, 480.00, 'paid', 'cash', '2024-01-06', '2024-01-07', 'Pillowcases', '2024-01-06 10:30:00'),
('ORD-2024-017', 'Rafael Mendoza', '+639789012356', 'completed', 'Dry Cleaning', 2.5, 200.00, 500.00, 'paid', 'gcash', '2024-01-07', '2024-01-08', 'Leather jacket', '2024-01-07 15:20:00'),
('ORD-2024-018', 'Adriana Flores', '+639890123467', 'completed', 'Wash, Dry & Fold', 9.0, 150.00, 1350.00, 'paid', 'paymaya', '2024-01-08', '2024-01-09', 'Comforters', '2024-01-08 12:10:00'),
('ORD-2024-019', 'Javier Reyes', '+639901234578', 'completed', 'Wash, Dry & Fold', 7.0, 80.00, 560.00, 'paid', 'cash', '2024-01-09', '2024-01-10', 'Polo shirts', '2024-01-09 09:45:00'),
('ORD-2024-020', 'Camila Soto', '+639012345689', 'ready', 'Wash, Dry & Fold', 3.0, 120.00, 360.00, 'paid', 'paymaya', '2024-01-20', '2024-01-21', 'Handkerchiefs', '2024-01-20 14:25:00'),

-- Orders with different statuses for testing
('ORD-2024-021', 'Ricardo Vega', '+639123456791', 'processing', 'Wash, Dry & Fold', 5.5, 150.00, 825.00, 'unpaid', 'cash', '2024-01-21', '2024-01-22', 'Heavy items', '2024-01-21 11:30:00'),
('ORD-2024-022', 'Patricia Rios', '+639234567802', 'pending', 'Dry Cleaning', 1.0, 200.00, 200.00, 'unpaid', 'gcash', '2024-01-22', '2024-01-23', 'Silk dress', '2024-01-22 16:15:00'),
('ORD-2024-023', 'Hector Luna', '+639345678013', 'processing', 'Wash, Dry & Fold', 4.0, 120.00, 480.00, 'paid', 'bank_transfer', '2024-01-23', '2024-01-24', 'Baby clothes', '2024-01-23 08:50:00'),
('ORD-2024-024', 'Gabriela Herrera', '+639456789024', 'ready', 'Wash, Dry & Fold', 6.5, 80.00, 520.00, 'paid', 'gcash', '2024-01-24', '2024-01-25', 'Formal wear', '2024-01-24 13:20:00'),
('ORD-2024-025', 'Oscar Guzman', '+639567890135', 'pending', 'Wash, Dry & Fold', 7.5, 150.00, 1125.00, 'unpaid', 'cash', '2024-01-25', '2024-01-26', 'Work clothes', '2024-01-25 10:40:00'),

-- Orders from previous months for monthly trends
('ORD-2024-026', 'Natalia Paredes', '+639678901246', 'completed', 'Wash, Dry & Fold', 6.0, 150.00, 900.00, 'paid', 'cash', '2023-12-15', '2023-12-16', 'Holiday clothes', '2023-12-15 14:30:00'),
('ORD-2024-027', 'Alejandro Miranda', '+639789012357', 'completed', 'Dry Cleaning', 2.0, 200.00, 400.00, 'paid', 'gcash', '2023-12-20', '2023-12-21', 'Party dress', '2023-12-20 11:15:00'),
('ORD-2024-028', 'Daniela Cordova', '+639890123468', 'completed', 'Wash, Dry & Fold', 5.0, 120.00, 600.00, 'paid', 'paymaya', '2023-12-25', '2023-12-26', 'Christmas linens', '2023-12-25 16:45:00'),
('ORD-2024-029', 'Emilio Salazar', '+639901234579', 'completed', 'Wash, Dry & Fold', 8.0, 80.00, 640.00, 'paid', 'bank_transfer', '2023-12-30', '2023-12-31', 'New Year clothes', '2023-12-30 09:20:00'),
('ORD-2024-030', 'Renata Espinoza', '+639012345690', 'completed', 'Wash, Dry & Fold', 4.5, 150.00, 675.00, 'paid', 'paymaya', '2023-12-31', '2024-01-01', 'Year-end cleaning', '2023-12-31 12:30:00'),

-- 2025 Data - Recent orders for current year testing
-- January 2025 orders
('ORD-2025-001', 'Sofia Rodriguez', '+639123456795', 'completed', 'Wash, Dry & Fold', 5.5, 150.00, 825.00, 'paid', 'cash', '2025-01-05', '2025-01-06', 'New Year laundry', '2025-01-05 10:30:00'),
('ORD-2025-002', 'Carlos Mendoza', '+639234567806', 'completed', 'Dry Cleaning', 3.0, 200.00, 600.00, 'paid', 'gcash', '2025-01-08', '2025-01-09', 'Business suits', '2025-01-08 14:15:00'),
('ORD-2025-003', 'Elena Torres', '+639345678017', 'completed', 'Wash, Dry & Fold', 7.0, 120.00, 840.00, 'paid', 'paymaya', '2025-01-12', '2025-01-13', 'Bedding and towels', '2025-01-12 11:45:00'),
('ORD-2025-004', 'Miguel Santos', '+639456789028', 'ready', 'Wash, Dry & Fold', 4.0, 80.00, 320.00, 'paid', 'bank_transfer', '2025-01-15', '2025-01-16', 'Work uniforms', '2025-01-15 16:20:00'),
('ORD-2025-005', 'Ana Lopez', '+639567890139', 'processing', 'Wash, Dry & Fold', 6.5, 150.00, 975.00, 'unpaid', 'paymaya', '2025-01-18', '2025-01-19', 'Heavy items', '2025-01-18 09:30:00'),

-- February 2025 orders
('ORD-2025-006', 'Roberto Garcia', '+639678901240', 'completed', 'Wash, Dry & Fold', 8.0, 150.00, 1200.00, 'paid', 'cash', '2025-02-03', '2025-02-04', 'Bulk order', '2025-02-03 13:25:00'),
('ORD-2025-007', 'Carmen Vega', '+639789012351', 'completed', 'Dry Cleaning', 2.5, 200.00, 500.00, 'paid', 'gcash', '2025-02-07', '2025-02-08', 'Formal dresses', '2025-02-07 15:40:00'),
('ORD-2025-008', 'Luis Hernandez', '+639890123462', 'completed', 'Wash, Dry & Fold', 5.0, 120.00, 600.00, 'paid', 'paymaya', '2025-02-10', '2025-02-11', 'Regular service', '2025-02-10 10:15:00'),
('ORD-2025-009', 'Isabel Morales', '+639901234573', 'ready', 'Wash, Dry & Fold', 3.5, 80.00, 280.00, 'paid', 'bank_transfer', '2025-02-14', '2025-02-15', 'Valentine prep', '2025-02-14 12:30:00'),
('ORD-2025-010', 'Diego Silva', '+639012345684', 'pending', 'Wash, Dry & Fold', 9.0, 150.00, 1350.00, 'unpaid', 'cash', '2025-02-17', '2025-02-18', 'Large order', '2025-02-17 08:45:00'),

-- March 2025 orders
('ORD-2025-011', 'Valentina Cruz', '+639123456796', 'completed', 'Wash, Dry & Fold', 6.0, 150.00, 900.00, 'paid', 'cash', '2025-03-05', '2025-03-06', 'Spring cleaning', '2025-03-05 14:20:00'),
('ORD-2025-012', 'Fernando Ruiz', '+639234567807', 'completed', 'Dry Cleaning', 1.8, 200.00, 360.00, 'paid', 'gcash', '2025-03-08', '2025-03-09', 'Wedding attire', '2025-03-08 11:10:00'),
('ORD-2025-013', 'Lucia Ortega', '+639345678018', 'completed', 'Wash, Dry & Fold', 7.5, 120.00, 900.00, 'paid', 'paymaya', '2025-03-12', '2025-03-13', 'Heavy blankets', '2025-03-12 16:35:00'),
('ORD-2025-014', 'Rafael Luna', '+639456789029', 'ready', 'Wash, Dry & Fold', 4.5, 80.00, 360.00, 'paid', 'bank_transfer', '2025-03-15', '2025-03-16', 'Work clothes', '2025-03-15 09:50:00'),
('ORD-2025-015', 'Adriana Castro', '+639567890140', 'processing', 'Wash, Dry & Fold', 5.0, 150.00, 750.00, 'unpaid', 'paymaya', '2025-03-18', '2025-03-19', 'Regular service', '2025-03-18 13:15:00'),

-- April 2025 orders
('ORD-2025-016', 'Javier Flores', '+639678901241', 'completed', 'Wash, Dry & Fold', 8.5, 150.00, 1275.00, 'paid', 'cash', '2025-04-02', '2025-04-03', 'Bulk order', '2025-04-02 10:25:00'),
('ORD-2025-017', 'Camila Soto', '+639789012352', 'completed', 'Dry Cleaning', 3.2, 200.00, 640.00, 'paid', 'gcash', '2025-04-06', '2025-04-07', 'Special garments', '2025-04-06 15:30:00'),
('ORD-2025-018', 'Leonardo Fuentes', '+639890123463', 'completed', 'Wash, Dry & Fold', 6.0, 120.00, 720.00, 'paid', 'paymaya', '2025-04-09', '2025-04-10', 'Regular service', '2025-04-09 12:40:00'),
('ORD-2025-019', 'Victoria Carrillo', '+639901234574', 'ready', 'Wash, Dry & Fold', 3.0, 80.00, 240.00, 'paid', 'bank_transfer', '2025-04-13', '2025-04-14', 'Light items', '2025-04-13 08:20:00'),
('ORD-2025-020', 'Andres Mendez', '+639012345685', 'pending', 'Wash, Dry & Fold', 7.0, 150.00, 1050.00, 'unpaid', 'cash', '2025-04-16', '2025-04-17', 'Heavy items', '2025-04-16 14:55:00'),

-- May 2025 orders
('ORD-2025-021', 'Mariana Aguilar', '+639123456797', 'completed', 'Wash, Dry & Fold', 5.5, 150.00, 825.00, 'paid', 'cash', '2025-05-01', '2025-05-02', 'Regular service', '2025-05-01 11:30:00'),
('ORD-2025-022', 'Roberto Diaz', '+639234567808', 'completed', 'Dry Cleaning', 2.0, 200.00, 400.00, 'paid', 'gcash', '2025-05-04', '2025-05-05', 'Business attire', '2025-05-04 16:15:00'),
('ORD-2025-023', 'Carmen Torres', '+639345678019', 'completed', 'Wash, Dry & Fold', 8.0, 120.00, 960.00, 'paid', 'paymaya', '2025-05-08', '2025-05-09', 'Bulk order', '2025-05-08 13:45:00'),
('ORD-2025-024', 'Miguel Luna', '+639456789030', 'ready', 'Wash, Dry & Fold', 4.0, 80.00, 320.00, 'paid', 'bank_transfer', '2025-05-12', '2025-05-13', 'Work uniforms', '2025-05-12 09:10:00'),
('ORD-2025-025', 'Ana Vega', '+639567890141', 'processing', 'Wash, Dry & Fold', 6.5, 150.00, 975.00, 'unpaid', 'paymaya', '2025-05-15', '2025-05-16', 'Heavy items', '2025-05-15 15:20:00'),

-- June 2025 orders
('ORD-2025-026', 'Luis Morales', '+639678901242', 'completed', 'Wash, Dry & Fold', 7.0, 150.00, 1050.00, 'paid', 'cash', '2025-06-03', '2025-06-04', 'Summer clothes', '2025-06-03 12:30:00'),
('ORD-2025-027', 'Isabel Silva', '+639789012353', 'completed', 'Dry Cleaning', 2.8, 200.00, 560.00, 'paid', 'gcash', '2025-06-07', '2025-06-08', 'Formal wear', '2025-06-07 14:25:00'),
('ORD-2025-028', 'Diego Cruz', '+639890123464', 'completed', 'Wash, Dry & Fold', 5.5, 120.00, 660.00, 'paid', 'paymaya', '2025-06-10', '2025-06-11', 'Regular service', '2025-06-10 10:40:00'),
('ORD-2025-029', 'Valentina Ruiz', '+639901234575', 'ready', 'Wash, Dry & Fold', 3.5, 80.00, 280.00, 'paid', 'bank_transfer', '2025-06-14', '2025-06-15', 'Light items', '2025-06-14 16:15:00'),
('ORD-2025-030', 'Fernando Ortega', '+639012345686', 'pending', 'Wash, Dry & Fold', 8.5, 150.00, 1275.00, 'unpaid', 'cash', '2025-06-17', '2025-06-18', 'Large order', '2025-06-17 11:50:00'),

-- July 2025 orders (recent)
('ORD-2025-031', 'Lucia Luna', '+639123456798', 'completed', 'Wash, Dry & Fold', 6.0, 150.00, 900.00, 'paid', 'cash', '2025-07-01', '2025-07-02', 'Regular service', '2025-07-01 13:20:00'),
('ORD-2025-032', 'Rafael Castro', '+639234567809', 'completed', 'Dry Cleaning', 2.5, 200.00, 500.00, 'paid', 'gcash', '2025-07-05', '2025-07-06', 'Business suits', '2025-07-05 15:30:00'),
('ORD-2025-033', 'Adriana Flores', '+639345678020', 'completed', 'Wash, Dry & Fold', 7.5, 120.00, 900.00, 'paid', 'paymaya', '2025-07-08', '2025-07-09', 'Heavy items', '2025-07-08 10:15:00'),
('ORD-2025-034', 'Javier Soto', '+639456789031', 'ready', 'Wash, Dry & Fold', 4.0, 80.00, 320.00, 'paid', 'bank_transfer', '2025-07-12', '2025-07-13', 'Work clothes', '2025-07-12 14:45:00'),
('ORD-2025-035', 'Camila Fuentes', '+639567890142', 'processing', 'Wash, Dry & Fold', 5.5, 150.00, 825.00, 'unpaid', 'paymaya', '2025-07-15', '2025-07-16', 'Regular service', '2025-07-15 09:30:00'),

-- August 2025 orders (current month)
('ORD-2025-036', 'Leonardo Carrillo', '+639678901243', 'completed', 'Wash, Dry & Fold', 8.0, 150.00, 1200.00, 'paid', 'cash', '2025-08-01', '2025-08-02', 'Bulk order', '2025-08-01 11:25:00'),
('ORD-2025-037', 'Victoria Mendez', '+639789012354', 'completed', 'Dry Cleaning', 3.0, 200.00, 600.00, 'paid', 'gcash', '2025-08-05', '2025-08-06', 'Formal dresses', '2025-08-05 16:20:00'),
('ORD-2025-038', 'Andres Aguilar', '+639890123465', 'completed', 'Wash, Dry & Fold', 6.5, 120.00, 780.00, 'paid', 'paymaya', '2025-08-08', '2025-08-09', 'Regular service', '2025-08-08 12:10:00'),
('ORD-2025-039', 'Mariana Diaz', '+639901234576', 'ready', 'Wash, Dry & Fold', 3.5, 80.00, 280.00, 'paid', 'bank_transfer', '2025-08-12', '2025-08-13', 'Light items', '2025-08-12 15:35:00'),
('ORD-2025-040', 'Roberto Torres', '+639012345687', 'pending', 'Wash, Dry & Fold', 7.0, 150.00, 1050.00, 'unpaid', 'cash', '2025-08-15', '2025-08-16', 'Heavy items', '2025-08-15 10:40:00'),

-- Very recent orders (last few days)
('ORD-2025-041', 'Carmen Luna', '+639123456799', 'completed', 'Wash, Dry & Fold', 5.0, 150.00, 750.00, 'paid', 'cash', '2025-08-20', '2025-08-21', 'Quick service', '2025-08-20 14:30:00'),
('ORD-2025-042', 'Miguel Castro', '+639234567810', 'completed', 'Dry Cleaning', 2.0, 200.00, 400.00, 'paid', 'gcash', '2025-08-21', '2025-08-22', 'Business attire', '2025-08-21 11:15:00'),
('ORD-2025-043', 'Ana Flores', '+639345678021', 'completed', 'Wash, Dry & Fold', 6.0, 120.00, 720.00, 'paid', 'paymaya', '2025-08-22', '2025-08-23', 'Regular service', '2025-08-22 16:45:00'),
('ORD-2025-044', 'Luis Soto', '+639456789032', 'ready', 'Wash, Dry & Fold', 4.5, 80.00, 360.00, 'paid', 'bank_transfer', '2025-08-23', '2025-08-24', 'Work uniforms', '2025-08-23 09:20:00'),
('ORD-2025-045', 'Isabel Fuentes', '+639567890143', 'processing', 'Wash, Dry & Fold', 5.5, 150.00, 825.00, 'unpaid', 'paymaya', '2025-08-24', '2025-08-25', 'Heavy items', '2025-08-24 13:10:00'),

-- November 2023 orders
('ORD-2024-031', 'Felipe Navarro', '+639123456792', 'completed', 'Wash, Dry & Fold', 3.5, 120.00, 420.00, 'paid', 'cash', '2023-11-15', '2023-11-16', 'Regular laundry', '2023-11-15 10:30:00'),
('ORD-2024-032', 'Valeria Molina', '+639234567803', 'completed', 'Dry Cleaning', 1.5, 200.00, 300.00, 'paid', 'gcash', '2023-11-20', '2023-11-21', 'Business attire', '2023-11-20 14:15:00'),
('ORD-2024-033', 'Sebastian Acosta', '+639345678014', 'completed', 'Wash, Dry & Fold', 8.0, 150.00, 1200.00, 'paid', 'paymaya', '2023-11-25', '2023-11-26', 'Bulk order', '2023-11-25 16:20:00'),
('ORD-2024-034', 'Isabella Figueroa', '+639456789025', 'completed', 'Wash, Dry & Fold', 5.0, 80.00, 400.00, 'paid', 'bank_transfer', '2023-11-30', '2023-12-01', 'Formal shirts', '2023-11-30 11:45:00'),

-- October 2023 orders
('ORD-2024-035', 'Mateo Rojas', '+639567890136', 'completed', 'Wash, Dry & Fold', 6.5, 150.00, 975.00, 'paid', 'cash', '2023-10-15', '2023-10-16', 'Seasonal clothes', '2023-10-15 13:30:00'),
('ORD-2024-036', 'Sara Campos', '+639678901247', 'completed', 'Wash, Dry & Fold', 4.0, 120.00, 480.00, 'paid', 'gcash', '2023-10-20', '2023-10-21', 'Bedding', '2023-10-20 09:15:00'),
('ORD-2024-037', 'Leonardo Fuentes', '+639789012358', 'completed', 'Dry Cleaning', 2.5, 200.00, 500.00, 'paid', 'paymaya', '2023-10-25', '2023-10-26', 'Special garments', '2023-10-25 15:40:00'),

-- September 2023 orders
('ORD-2024-038', 'Victoria Carrillo', '+639890123469', 'completed', 'Wash, Dry & Fold', 7.0, 150.00, 1050.00, 'paid', 'cash', '2023-09-15', '2023-09-16', 'Heavy items', '2023-09-15 12:20:00'),
('ORD-2024-039', 'Andres Mendez', '+639901234580', 'completed', 'Wash, Dry & Fold', 6.0, 80.00, 480.00, 'paid', 'bank_transfer', '2023-09-20', '2023-09-21', 'Work uniforms', '2023-09-20 10:30:00'),
('ORD-2024-040', 'Mariana Aguilar', '+639012345691', 'completed', 'Wash, Dry & Fold', 5.5, 120.00, 660.00, 'paid', 'paymaya', '2023-09-25', '2023-09-26', 'Regular service', '2023-09-25 14:50:00'),

-- August 2023 orders (for testing custom range)
('ORD-2024-041', 'Roberto Diaz', '+639123456793', 'completed', 'Wash, Dry & Fold', 6.0, 150.00, 900.00, 'paid', 'cash', '2023-08-10', '2023-08-11', 'Summer clothes', '2023-08-10 15:30:00'),
('ORD-2024-042', 'Carmen Vega', '+639234567804', 'completed', 'Dry Cleaning', 2.0, 200.00, 400.00, 'paid', 'gcash', '2023-08-15', '2023-08-16', 'Formal dress', '2023-08-15 11:45:00'),
('ORD-2024-043', 'Miguel Torres', '+639345678015', 'completed', 'Wash, Dry & Fold', 4.5, 120.00, 540.00, 'paid', 'paymaya', '2023-08-20', '2023-08-21', 'Bedding', '2023-08-20 14:20:00'),
('ORD-2024-044', 'Ana Morales', '+639456789026', 'completed', 'Wash, Dry & Fold', 5.5, 80.00, 440.00, 'paid', 'bank_transfer', '2023-08-25', '2023-08-26', 'Work shirts', '2023-08-25 09:15:00'),
('ORD-2024-045', 'Luis Herrera', '+639567890137', 'completed', 'Wash, Dry & Fold', 8.5, 150.00, 1275.00, 'paid', 'paymaya', '2023-08-30', '2023-08-31', 'Bulk order', '2023-08-30 16:40:00'),

-- July 2023 orders
('ORD-2024-046', 'Isabel Rios', '+639678901248', 'completed', 'Wash, Dry & Fold', 3.0, 120.00, 360.00, 'paid', 'cash', '2023-07-05', '2023-07-06', 'Light items', '2023-07-05 10:30:00'),
('ORD-2024-047', 'Carlos Luna', '+639789012359', 'completed', 'Dry Cleaning', 1.8, 200.00, 360.00, 'paid', 'gcash', '2023-07-10', '2023-07-11', 'Wedding suit', '2023-07-10 13:25:00'),
('ORD-2024-048', 'Elena Castro', '+639890123470', 'completed', 'Wash, Dry & Fold', 7.5, 150.00, 1125.00, 'paid', 'paymaya', '2023-07-15', '2023-07-16', 'Heavy blankets', '2023-07-15 15:50:00'),
('ORD-2024-049', 'Pedro Silva', '+639901234581', 'completed', 'Wash, Dry & Fold', 6.0, 80.00, 480.00, 'paid', 'bank_transfer', '2023-07-20', '2023-07-21', 'Formal wear', '2023-07-20 11:10:00'),
('ORD-2024-050', 'Maria Gonzalez', '+639012345692', 'completed', 'Wash, Dry & Fold', 5.0, 120.00, 600.00, 'paid', 'cash', '2023-07-25', '2023-07-26', 'Regular service', '2023-07-25 14:35:00'),

-- June 2023 orders
('ORD-2024-051', 'Jose Martinez', '+639123456794', 'completed', 'Wash, Dry & Fold', 6.5, 150.00, 975.00, 'paid', 'gcash', '2023-06-08', '2023-06-09', 'Seasonal clothes', '2023-06-08 12:15:00'),
('ORD-2024-052', 'Rosa Fernandez', '+639234567805', 'completed', 'Dry Cleaning', 2.2, 200.00, 440.00, 'paid', 'paymaya', '2023-06-12', '2023-06-13', 'Business attire', '2023-06-12 16:20:00'),
('ORD-2024-053', 'Antonio Lopez', '+639345678016', 'completed', 'Wash, Dry & Fold', 4.0, 120.00, 480.00, 'paid', 'cash', '2023-06-18', '2023-06-19', 'Towels', '2023-06-18 09:45:00'),
('ORD-2024-054', 'Lucia Ramirez', '+639456789027', 'completed', 'Wash, Dry & Fold', 7.5, 80.00, 600.00, 'paid', 'bank_transfer', '2023-06-22', '2023-06-23', 'Dress shirts', '2023-06-22 13:30:00'),
('ORD-2024-055', 'Francisco Cruz', '+639567890138', 'completed', 'Wash, Dry & Fold', 9.0, 150.00, 1350.00, 'paid', 'paymaya', '2023-06-28', '2023-06-29', 'Comforters', '2023-06-28 17:15:00'),

-- May 2023 orders
('ORD-2024-056', 'Dolores Ortiz', '+639678901249', 'completed', 'Wash, Dry & Fold', 3.5, 120.00, 420.00, 'paid', 'cash', '2023-05-03', '2023-05-04', 'Baby clothes', '2023-05-03 10:20:00'),
('ORD-2024-057', 'Manuel Reyes', '+639789012360', 'completed', 'Dry Cleaning', 1.5, 200.00, 300.00, 'paid', 'gcash', '2023-05-08', '2023-05-09', 'Leather jacket', '2023-05-08 14:40:00'),
('ORD-2024-058', 'Teresa Moreno', '+639890123471', 'completed', 'Wash, Dry & Fold', 8.0, 150.00, 1200.00, 'paid', 'paymaya', '2023-05-15', '2023-05-16', 'Heavy items', '2023-05-15 11:55:00'),
('ORD-2024-059', 'Alberto Jimenez', '+639901234582', 'completed', 'Wash, Dry & Fold', 5.0, 80.00, 400.00, 'paid', 'bank_transfer', '2023-05-20', '2023-05-21', 'Polo shirts', '2023-05-20 16:25:00'),
('ORD-2024-060', 'Sofia Vargas', '+639012345693', 'completed', 'Wash, Dry & Fold', 6.0, 120.00, 720.00, 'paid', 'cash', '2023-05-25', '2023-05-26', 'Bed sheets', '2023-05-25 12:10:00'),

-- April 2023 orders
('ORD-2024-061', 'Ramon Delgado', '+639123456795', 'completed', 'Wash, Dry & Fold', 7.0, 150.00, 1050.00, 'paid', 'gcash', '2023-04-05', '2023-04-06', 'Curtains', '2023-04-05 15:30:00'),
('ORD-2024-062', 'Concepcion Ruiz', '+639234567806', 'completed', 'Dry Cleaning', 2.8, 200.00, 560.00, 'paid', 'paymaya', '2023-04-10', '2023-04-11', 'Winter coats', '2023-04-10 09:45:00'),
('ORD-2024-063', 'Felipe Mendoza', '+639345678017', 'completed', 'Wash, Dry & Fold', 4.5, 120.00, 540.00, 'paid', 'cash', '2023-04-15', '2023-04-16', 'Pillowcases', '2023-04-15 13:20:00'),
('ORD-2024-064', 'Gloria Aguilar', '+639456789028', 'completed', 'Wash, Dry & Fold', 6.5, 80.00, 520.00, 'paid', 'bank_transfer', '2023-04-20', '2023-04-21', 'Formal wear', '2023-04-20 11:35:00'),
('ORD-2024-065', 'Hector Flores', '+639567890139', 'completed', 'Wash, Dry & Fold', 8.5, 150.00, 1275.00, 'paid', 'paymaya', '2023-04-25', '2023-04-26', 'Jeans', '2023-04-25 17:50:00'),

-- March 2023 orders
('ORD-2024-066', 'Adriana Soto', '+639678901250', 'completed', 'Wash, Dry & Fold', 3.0, 120.00, 360.00, 'paid', 'cash', '2023-03-02', '2023-03-03', 'Handkerchiefs', '2023-03-02 10:15:00'),
('ORD-2024-067', 'Eduardo Campos', '+639789012361', 'completed', 'Dry Cleaning', 1.2, 200.00, 240.00, 'paid', 'gcash', '2023-03-07', '2023-03-08', 'Silk dress', '2023-03-07 14:25:00'),
('ORD-2024-068', 'Beatriz Fuentes', '+639890123472', 'completed', 'Wash, Dry & Fold', 6.0, 150.00, 900.00, 'paid', 'paymaya', '2023-03-12', '2023-03-13', 'Regular clothes', '2023-03-12 12:40:00'),
('ORD-2024-069', 'Ricardo Carrillo', '+639901234583', 'completed', 'Wash, Dry & Fold', 5.5, 80.00, 440.00, 'paid', 'bank_transfer', '2023-03-17', '2023-03-18', 'Work uniforms', '2023-03-17 16:10:00'),
('ORD-2024-070', 'Patricia Mendez', '+639012345694', 'completed', 'Wash, Dry & Fold', 5.0, 120.00, 600.00, 'paid', 'cash', '2023-03-22', '2023-03-23', 'Regular service', '2023-03-22 09:30:00'),

-- February 2023 orders
('ORD-2024-071', 'Guillermo Vega', '+639123456796', 'completed', 'Wash, Dry & Fold', 7.5, 150.00, 1125.00, 'paid', 'gcash', '2023-02-05', '2023-02-06', 'Heavy items', '2023-02-05 15:45:00'),
('ORD-2024-072', 'Margarita Rios', '+639234567807', 'completed', 'Dry Cleaning', 2.5, 200.00, 500.00, 'paid', 'paymaya', '2023-02-10', '2023-02-11', 'Special garments', '2023-02-10 11:20:00'),
('ORD-2024-073', 'Alfonso Luna', '+639345678018', 'completed', 'Wash, Dry & Fold', 4.0, 120.00, 480.00, 'paid', 'cash', '2023-02-15', '2023-02-16', 'Bedding', '2023-02-15 13:55:00'),
('ORD-2024-074', 'Rosario Castro', '+639456789029', 'completed', 'Wash, Dry & Fold', 6.0, 80.00, 480.00, 'paid', 'bank_transfer', '2023-02-20', '2023-02-21', 'Formal shirts', '2023-02-20 10:25:00'),
('ORD-2024-075', 'Jorge Silva', '+639567890140', 'completed', 'Wash, Dry & Fold', 8.0, 150.00, 1200.00, 'paid', 'paymaya', '2023-02-25', '2023-02-26', 'Bulk order', '2023-02-25 17:30:00'),

-- January 2023 orders
('ORD-2024-076', 'Carmen Gonzalez', '+639678901251', 'completed', 'Wash, Dry & Fold', 3.5, 120.00, 420.00, 'paid', 'cash', '2023-01-08', '2023-01-09', 'Light items', '2023-01-08 12:15:00'),
('ORD-2024-077', 'Roberto Martinez', '+639789012362', 'completed', 'Dry Cleaning', 1.8, 200.00, 360.00, 'paid', 'gcash', '2023-01-12', '2023-01-13', 'Business suit', '2023-01-12 14:40:00'),
('ORD-2024-078', 'Isabel Fernandez', '+639890123473', 'completed', 'Wash, Dry & Fold', 6.5, 150.00, 975.00, 'paid', 'paymaya', '2023-01-18', '2023-01-19', 'Seasonal clothes', '2023-01-18 16:20:00'),
('ORD-2024-079', 'Miguel Lopez', '+639901234584', 'completed', 'Wash, Dry & Fold', 5.0, 80.00, 400.00, 'paid', 'bank_transfer', '2023-01-22', '2023-01-23', 'Work clothes', '2023-01-22 11:35:00'),
('ORD-2024-080', 'Ana Ramirez', '+639012345695', 'completed', 'Wash, Dry & Fold', 4.5, 120.00, 540.00, 'paid', 'cash', '2023-01-28', '2023-01-29', 'Regular service', '2023-01-28 13:50:00');

-- Update the created_at timestamps to be more realistic (spread across different times)
UPDATE orders SET created_at = '2024-01-15 09:30:00' WHERE order_number = 'ORD-2024-001';
UPDATE orders SET created_at = '2024-01-16 14:20:00' WHERE order_number = 'ORD-2024-002';
UPDATE orders SET created_at = '2024-01-17 11:15:00' WHERE order_number = 'ORD-2024-003';
UPDATE orders SET created_at = '2024-01-18 16:45:00' WHERE order_number = 'ORD-2024-004';
UPDATE orders SET created_at = '2024-01-19 08:30:00' WHERE order_number = 'ORD-2024-005';
UPDATE orders SET created_at = '2024-01-10 13:20:00' WHERE order_number = 'ORD-2024-006';
UPDATE orders SET created_at = '2024-01-11 10:45:00' WHERE order_number = 'ORD-2024-007';
UPDATE orders SET created_at = '2024-01-12 15:30:00' WHERE order_number = 'ORD-2024-008';
UPDATE orders SET created_at = '2024-01-13 09:15:00' WHERE order_number = 'ORD-2024-009';
UPDATE orders SET created_at = '2024-01-14 12:00:00' WHERE order_number = 'ORD-2024-010';
UPDATE orders SET created_at = '2024-01-01 14:30:00' WHERE order_number = 'ORD-2024-011';
UPDATE orders SET created_at = '2024-01-02 11:20:00' WHERE order_number = 'ORD-2024-012';
UPDATE orders SET created_at = '2024-01-03 16:45:00' WHERE order_number = 'ORD-2024-013';
UPDATE orders SET created_at = '2024-01-04 08:15:00' WHERE order_number = 'ORD-2024-014';
UPDATE orders SET created_at = '2024-01-05 13:40:00' WHERE order_number = 'ORD-2024-015';
UPDATE orders SET created_at = '2024-01-06 10:30:00' WHERE order_number = 'ORD-2024-016';
UPDATE orders SET created_at = '2024-01-07 15:20:00' WHERE order_number = 'ORD-2024-017';
UPDATE orders SET created_at = '2024-01-08 12:10:00' WHERE order_number = 'ORD-2024-018';
UPDATE orders SET created_at = '2024-01-09 09:45:00' WHERE order_number = 'ORD-2024-019';
UPDATE orders SET created_at = '2024-01-20 14:25:00' WHERE order_number = 'ORD-2024-020';
UPDATE orders SET created_at = '2024-01-21 11:30:00' WHERE order_number = 'ORD-2024-021';
UPDATE orders SET created_at = '2024-01-22 16:15:00' WHERE order_number = 'ORD-2024-022';
UPDATE orders SET created_at = '2024-01-23 08:50:00' WHERE order_number = 'ORD-2024-023';
UPDATE orders SET created_at = '2024-01-24 13:20:00' WHERE order_number = 'ORD-2024-024';
UPDATE orders SET created_at = '2024-01-25 10:40:00' WHERE order_number = 'ORD-2024-025';

-- Update timestamps for additional orders (August 2023 - January 2023)
UPDATE orders SET created_at = '2023-08-10 15:30:00' WHERE order_number = 'ORD-2024-041';
UPDATE orders SET created_at = '2023-08-15 11:45:00' WHERE order_number = 'ORD-2024-042';
UPDATE orders SET created_at = '2023-08-20 14:20:00' WHERE order_number = 'ORD-2024-043';
UPDATE orders SET created_at = '2023-08-25 09:15:00' WHERE order_number = 'ORD-2024-044';
UPDATE orders SET created_at = '2023-08-30 16:40:00' WHERE order_number = 'ORD-2024-045';

UPDATE orders SET created_at = '2023-07-05 10:30:00' WHERE order_number = 'ORD-2024-046';
UPDATE orders SET created_at = '2023-07-10 13:25:00' WHERE order_number = 'ORD-2024-047';
UPDATE orders SET created_at = '2023-07-15 15:50:00' WHERE order_number = 'ORD-2024-048';
UPDATE orders SET created_at = '2023-07-20 11:10:00' WHERE order_number = 'ORD-2024-049';
UPDATE orders SET created_at = '2023-07-25 14:35:00' WHERE order_number = 'ORD-2024-050';

UPDATE orders SET created_at = '2023-06-08 12:15:00' WHERE order_number = 'ORD-2024-051';
UPDATE orders SET created_at = '2023-06-12 16:20:00' WHERE order_number = 'ORD-2024-052';
UPDATE orders SET created_at = '2023-06-18 09:45:00' WHERE order_number = 'ORD-2024-053';
UPDATE orders SET created_at = '2023-06-22 13:30:00' WHERE order_number = 'ORD-2024-054';
UPDATE orders SET created_at = '2023-06-28 17:15:00' WHERE order_number = 'ORD-2024-055';

UPDATE orders SET created_at = '2023-05-03 10:20:00' WHERE order_number = 'ORD-2024-056';
UPDATE orders SET created_at = '2023-05-08 14:40:00' WHERE order_number = 'ORD-2024-057';
UPDATE orders SET created_at = '2023-05-15 11:55:00' WHERE order_number = 'ORD-2024-058';
UPDATE orders SET created_at = '2023-05-20 16:25:00' WHERE order_number = 'ORD-2024-059';
UPDATE orders SET created_at = '2023-05-25 12:10:00' WHERE order_number = 'ORD-2024-060';

UPDATE orders SET created_at = '2023-04-05 15:30:00' WHERE order_number = 'ORD-2024-061';
UPDATE orders SET created_at = '2023-04-10 09:45:00' WHERE order_number = 'ORD-2024-062';
UPDATE orders SET created_at = '2023-04-15 13:20:00' WHERE order_number = 'ORD-2024-063';
UPDATE orders SET created_at = '2023-04-20 11:35:00' WHERE order_number = 'ORD-2024-064';
UPDATE orders SET created_at = '2023-04-25 17:50:00' WHERE order_number = 'ORD-2024-065';

UPDATE orders SET created_at = '2023-03-02 10:15:00' WHERE order_number = 'ORD-2024-066';
UPDATE orders SET created_at = '2023-03-07 14:25:00' WHERE order_number = 'ORD-2024-067';
UPDATE orders SET created_at = '2023-03-12 12:40:00' WHERE order_number = 'ORD-2024-068';
UPDATE orders SET created_at = '2023-03-17 16:10:00' WHERE order_number = 'ORD-2024-069';
UPDATE orders SET created_at = '2023-03-22 09:30:00' WHERE order_number = 'ORD-2024-070';

UPDATE orders SET created_at = '2023-02-05 15:45:00' WHERE order_number = 'ORD-2024-071';
UPDATE orders SET created_at = '2023-02-10 11:20:00' WHERE order_number = 'ORD-2024-072';
UPDATE orders SET created_at = '2023-02-15 13:55:00' WHERE order_number = 'ORD-2024-073';
UPDATE orders SET created_at = '2023-02-20 10:25:00' WHERE order_number = 'ORD-2024-074';
UPDATE orders SET created_at = '2023-02-25 17:30:00' WHERE order_number = 'ORD-2024-075';

UPDATE orders SET created_at = '2023-01-08 12:15:00' WHERE order_number = 'ORD-2024-076';
UPDATE orders SET created_at = '2023-01-12 14:40:00' WHERE order_number = 'ORD-2024-077';
UPDATE orders SET created_at = '2023-01-18 16:20:00' WHERE order_number = 'ORD-2024-078';
UPDATE orders SET created_at = '2023-01-22 11:35:00' WHERE order_number = 'ORD-2024-079';
UPDATE orders SET created_at = '2023-01-28 13:50:00' WHERE order_number = 'ORD-2024-080';

-- Verify the data was inserted correctly
SELECT 
    COUNT(*) as total_orders,
    SUM(total_amount) as total_revenue,
    AVG(total_amount) as avg_order_value,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
    COUNT(CASE WHEN status = 'processing' THEN 1 END) as processing_orders,
    COUNT(CASE WHEN status = 'ready' THEN 1 END) as ready_orders
FROM orders;

-- Check distribution by payment method
SELECT 
    payment_method,
    COUNT(*) as order_count,
    SUM(total_amount) as total_amount,
    ROUND(AVG(total_amount), 2) as avg_amount
FROM orders 
GROUP BY payment_method 
ORDER BY order_count DESC;

-- Check distribution by service type
SELECT 
    service_type,
    COUNT(*) as order_count,
    SUM(total_amount) as total_revenue,
    ROUND(AVG(total_amount), 2) as avg_amount
FROM orders 
GROUP BY service_type 
ORDER BY order_count DESC;

-- Check monthly trends
SELECT 
    DATE_TRUNC('month', created_at) as month,
    COUNT(*) as order_count,
    SUM(total_amount) as revenue,
    ROUND(AVG(total_amount), 2) as avg_order_value
FROM orders 
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;

-- Test queries for custom date ranges
-- Example 1: Last 6 months
SELECT 
    'Last 6 Months' as period,
    COUNT(*) as total_orders,
    SUM(total_amount) as total_revenue,
    ROUND(AVG(total_amount), 2) as avg_order_value
FROM orders 
WHERE created_at >= CURRENT_DATE - INTERVAL '6 months';

-- Example 2: Specific date range (March 2023 to August 2023)
SELECT 
    'March-August 2023' as period,
    COUNT(*) as total_orders,
    SUM(total_amount) as total_revenue,
    ROUND(AVG(total_amount), 2) as avg_order_value
FROM orders 
WHERE created_at >= '2023-03-01' AND created_at <= '2023-08-31';

-- Example 3: Q1 2023 (January to March)
SELECT 
    'Q1 2023' as period,
    COUNT(*) as total_orders,
    SUM(total_amount) as total_revenue,
    ROUND(AVG(total_amount), 2) as avg_order_value
FROM orders 
WHERE created_at >= '2023-01-01' AND created_at <= '2023-03-31';

-- Example 4: Summer months (June to August 2023)
SELECT 
    'Summer 2023' as period,
    COUNT(*) as total_orders,
    SUM(total_amount) as total_revenue,
    ROUND(AVG(total_amount), 2) as avg_order_value
FROM orders 
WHERE created_at >= '2023-06-01' AND created_at <= '2023-08-31';

-- Example 5: Last year vs this year comparison
SELECT 
    '2023 Total' as period,
    COUNT(*) as total_orders,
    SUM(total_amount) as total_revenue,
    ROUND(AVG(total_amount), 2) as avg_order_value
FROM orders 
WHERE created_at >= '2023-01-01' AND created_at <= '2023-12-31';

-- Example 6: Orders from specific months for testing
SELECT 
    'January 2023' as period,
    COUNT(*) as total_orders,
    SUM(total_amount) as total_revenue,
    ROUND(AVG(total_amount), 2) as avg_order_value
FROM orders 
WHERE created_at >= '2023-01-01' AND created_at <= '2023-01-31';

SELECT 
    'December 2023' as period,
    COUNT(*) as total_orders,
    SUM(total_amount) as total_revenue,
    ROUND(AVG(total_amount), 2) as avg_order_value
FROM orders 
WHERE created_at >= '2023-12-01' AND created_at <= '2023-12-31';
