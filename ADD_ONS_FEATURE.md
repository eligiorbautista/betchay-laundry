# Add-ons Feature Documentation

## Overview
The add-ons feature allows customers to add extra services to their laundry orders, such as fabric softener, express service, starch, and more. This feature enhances the laundry management system by providing additional revenue streams and better customer service options.

## Database Changes

### New Tables
1. **`add_ons`** - Stores available add-on services
   - `id` (UUID, Primary Key)
   - `name` (TEXT, Unique) - Name of the add-on
   - `description` (TEXT) - Description of the service
   - `price` (DECIMAL) - Price of the add-on
   - `unit` (TEXT) - Unit of measurement (piece, kg, set, order)
   - `is_active` (BOOLEAN) - Whether the add-on is available
   - `created_at`, `updated_at` (TIMESTAMP)

2. **`order_add_ons`** - Junction table linking orders to add-ons
   - `id` (UUID, Primary Key)
   - `order_id` (UUID, Foreign Key) - References orders table
   - `add_on_id` (UUID, Foreign Key) - References add_ons table
   - `quantity` (DECIMAL) - Quantity of the add-on
   - `unit_price` (DECIMAL) - Price per unit
   - `total_price` (DECIMAL) - Total price for this add-on
   - `created_at` (TIMESTAMP)
   - Unique constraint on (order_id, add_on_id)

### Updated Tables
1. **`orders`** - Added new fields for add-ons
   - `subtotal_amount` (DECIMAL) - Service cost before add-ons
   - `add_ons_amount` (DECIMAL) - Total cost of add-ons
   - Updated `payment_status` to include 'partial'

## Features

### 1. Add-ons Management
- View all available add-ons
- Add new add-ons with name, description, price, and unit
- Enable/disable add-ons
- Edit existing add-ons

### 2. Order Creation with Add-ons
- Select multiple add-ons when creating an order
- Adjust quantities for each add-on
- Real-time calculation of total cost
- Clear breakdown of service cost vs add-ons cost

### 3. Order Editing with Add-ons
- Modify add-ons on existing orders
- Add or remove add-ons
- Update quantities
- Recalculate totals

### 4. Order Viewing with Add-ons
- Display all selected add-ons
- Show individual add-on details
- Clear cost breakdown

### 5. Receipt Printing with Add-ons
- Include add-ons in printed receipts
- Show detailed breakdown
- Professional formatting

## Implementation Details

### Frontend Components
- **New Order Form**: Add-ons selection interface
- **Edit Order Form**: Modify existing add-ons
- **Order View**: Display add-ons information
- **Print Receipt**: Include add-ons in receipt

### Backend Functions
- `fetchAddOns()`: Get all active add-ons
- `fetchOrderWithAddOns()`: Get order with add-ons data
- `createOrder()`: Create order with add-ons
- Updated order update functions to handle add-ons

### Database Operations
- Insert add-ons into `order_add_ons` table
- Calculate totals including add-ons
- Maintain referential integrity
- Audit logging for add-ons changes

## Sample Add-ons
The system comes with pre-configured add-ons:
- Fabric Softener (₱10.00)
- Starch (₱15.00)
- Express Service (₱50.00)
- Hanger Service (₱5.00)
- Dry Clean Press (₱20.00)
- Spot Treatment (₱25.00)
- Fragrance Boost (₱8.00)
- Wrinkle Free (₱12.00)
- Color Protection (₱18.00)
- Delicate Care (₱30.00)
- Ironing Service (₱15.00)
- Packaging (₱10.00)

## Setup Instructions

1. **Run Database Migration**:
   ```sql
   -- Execute the updated database_schema.sql
   -- Run migration_add_addons.sql for existing databases
   ```

2. **Seed Add-ons Data**:
   ```sql
   -- Execute add_ons_seeder.sql to add sample add-ons
   ```

3. **Update Application**:
   - Deploy the updated code
   - Test the new functionality
   - Train staff on using add-ons

## Usage Examples

### Creating an Order with Add-ons
1. Fill in customer information
2. Select service type and quantity
3. Click "Add" on desired add-ons
4. Adjust quantities if needed
5. Review total cost breakdown
6. Submit order

### Editing Add-ons on Existing Order
1. Open order for editing
2. Add/remove add-ons as needed
3. Adjust quantities
4. Save changes
5. Updated totals are calculated automatically

## Benefits
- **Increased Revenue**: Additional services generate more income
- **Better Customer Service**: More options for customer needs
- **Flexible Pricing**: Different add-ons for different requirements
- **Professional Service**: Express options and special treatments
- **Clear Documentation**: Detailed receipts with add-ons breakdown

## Future Enhancements
- Add-on categories (cleaning, finishing, special services)
- Bulk add-on pricing
- Seasonal add-on promotions
- Customer add-on preferences
- Add-on analytics and reporting
