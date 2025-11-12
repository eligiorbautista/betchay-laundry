# Order Management Guide

This guide covers all aspects of order management in the Laundry Management System, from creating new orders to tracking completion and generating receipts.

## Order Lifecycle

### Order States
```
Pending → Processing → Ready → Completed
   ↓           ↓         ↓
Cancelled ← Cancelled ← Cancelled
```

**Status Definitions:**
- **Pending**: Order received, waiting to be processed
- **Processing**: Laundry work in progress
- **Ready**: Order completed, ready for customer pickup
- **Completed**: Order delivered to customer
- **Cancelled**: Order cancelled (can happen at any stage)

## Creating Orders

### Order Creation Process

1. **Navigate to Orders**: Click "Orders" → "New Order"
2. **Customer Information**: Enter or select existing customer
3. **Service Selection**: Choose service type and quantity
4. **Add-ons**: Select optional add-on services
5. **Payment Details**: Select payment method and status
6. **Scheduling**: Set pickup and delivery dates
7. **Submit Order**: Create the order and generate order number

### Order Form Fields

#### Required Fields
- **Customer Name**: Full name of the customer
- **Customer Phone**: Contact number for notifications
- **Service Type**: Selected from configured service types
- **Quantity**: Weight (kg) or piece count
- **Payment Method**: Cash, GCash, PayMaya, or Bank Transfer

#### Optional Fields
- **Customer Address**: For delivery services
- **Pickup Date**: When items will be collected
- **Delivery Date**: When items will be returned
- **Remarks**: Special instructions or notes

### Service Types Configuration

Services are configured with:
- **Service Name**: Display name (e.g., "Wash & Fold")
- **Price**: Cost per unit (kg or piece)
- **Unit**: Measurement unit (kg, piece, etc.)
- **Active Status**: Whether service is available

### Add-on Services

Common add-ons include:
- **Fabric Softener**: ₱10.00 per order
- **Starch**: ₱15.00 per order
- **Express Delivery**: ₱50.00 per order
- **Pickup Service**: ₱30.00 per order
- **Garment Bag**: ₱20.00 per piece

## Order Management Interface

### Orders List View

**Display Columns:**
- Order Number (clickable to view details)
- Customer Name
- Service Type
- Quantity
- Total Amount
- Status (with color coding)
- Created Date
- Actions (View, Edit, Print)

**Filtering Options:**
- Status filter (All, Pending, Processing, Ready, Completed, Cancelled)
- Date range filter
- Customer search
- Payment status filter

**Sorting Options:**
- Created date (newest/oldest first)
- Total amount (high/low)
- Customer name (A-Z/Z-A)
- Status

### Order Details View

**Order Information:**
- Order number and creation date
- Customer details and contact information
- Service breakdown with quantities and pricing
- Add-ons with individual pricing
- Payment information and status
- Current order status and history
- Special remarks or instructions

**Available Actions:**
- Edit order details (if not completed)
- Update order status
- Process payment
- Print receipt/invoice
- Add internal notes
- Cancel order (with confirmation)

## Order Status Management

### Status Update Process

1. **Select Order**: Navigate to order details
2. **Update Status**: Choose new status from dropdown
3. **Add Notes**: Optionally add status change notes
4. **Confirm**: Save status update
5. **Notification**: System can notify customer of status change

### Status Permissions

**Staff Level:**
- Create orders (Pending status)
- Update to Processing
- Update to Ready
- Cannot cancel orders

**Manager Level:**
- All staff permissions
- Update to Completed
- Cancel orders
- Modify payment status

**Admin Level:**
- All permissions
- Delete orders (with audit trail)
- Bulk status updates

## Payment Management

### Payment Methods

**Supported Methods:**
1. **Cash**: Traditional cash payment
2. **GCash**: Philippine mobile wallet
3. **PayMaya**: Philippine digital wallet
4. **Bank Transfer**: Direct bank-to-bank transfer

### Payment Status Tracking

**Payment States:**
- **Unpaid**: No payment received
- **Partial**: Partial payment received
- **Paid**: Full payment completed

### Payment Processing

1. **Record Payment**: Select payment method
2. **Enter Amount**: Full or partial payment amount
3. **Payment Date**: When payment was received
4. **Reference Number**: For digital payments
5. **Generate Receipt**: Print/email receipt to customer

## Order Search and Filtering

### Search Functionality

**Search by:**
- Order number (exact or partial match)
- Customer name (fuzzy search)
- Customer phone number
- Service type

**Advanced Filters:**
- Date range (created date)
- Status filter (multiple selection)
- Payment status
- Amount range
- Staff member who created order

### Bulk Operations

**Available Bulk Actions:**
- Status updates (for multiple orders)
- Export to Excel/CSV
- Print batch receipts
- Bulk payment updates

## Receipt and Invoice Generation

### Receipt Components

**Standard Receipt Includes:**
- Business logo and information
- Order number and date
- Customer details
- Service breakdown with pricing
- Add-ons and their costs
- Subtotal and total amount
- Payment method and status
- Staff signature line

### Print Options

1. **Thermal Receipt**: Compact format for POS printers
2. **Standard Invoice**: Full-page format with company details
3. **Delivery Receipt**: Customer copy with pickup instructions
4. **Internal Copy**: Staff copy with internal notes

## Order Analytics

### Key Metrics

**Daily Metrics:**
- Orders created today
- Orders completed today
- Revenue generated today
- Average order value

**Performance Indicators:**
- Processing time per order
- Customer satisfaction ratings
- Service type popularity
- Payment method preferences

### Reporting Features

**Order Reports:**
- Daily/Weekly/Monthly order summaries
- Service type performance
- Customer order history
- Staff productivity reports
- Payment collection reports

## Customer Communication

### Automated Notifications

**SMS/Email Triggers:**
- Order confirmation
- Status updates (Processing, Ready)
- Payment reminders
- Pickup notifications

**Notification Content:**
- Order number reference
- Current status
- Estimated completion time
- Pickup/delivery instructions
- Contact information

## Order Troubleshooting

### Common Issues

#### Order Creation Problems
**Issue**: Cannot create order
**Solutions:**
1. Check required fields are filled
2. Verify customer phone format
3. Ensure service type is selected
4. Confirm quantity is greater than 0

#### Status Update Issues
**Issue**: Cannot update order status
**Solutions:**
1. Check user permissions
2. Verify valid status transition
3. Ensure order is not cancelled
4. Check network connectivity

#### Payment Recording Problems
**Issue**: Payment not saving
**Solutions:**
1. Verify payment amount format
2. Check payment method selection
3. Ensure user has payment permissions
4. Validate payment date

### Data Recovery

**Order Recovery Process:**
1. Check recent audit logs
2. Verify database backup availability
3. Contact system administrator
4. Follow data recovery procedures

## Best Practices

### Order Creation
- Always verify customer information
- Double-check service quantities
- Confirm pricing before submission
- Take photos of items if necessary
- Set realistic delivery dates

### Status Management
- Update status promptly
- Add detailed notes for status changes
- Communicate with customers on delays
- Maintain accurate timeline tracking

### Payment Processing
- Record payments immediately
- Verify payment amounts
- Keep payment references for digital payments
- Issue receipts promptly
- Reconcile daily payment totals

### Customer Service
- Respond to inquiries promptly
- Provide accurate status updates
- Handle complaints professionally
- Maintain customer privacy
- Follow up on completed orders

## Integration Points

### External Systems
- **SMS Gateway**: For customer notifications
- **Email Service**: For order confirmations
- **Payment Processors**: For digital payments
- **Accounting Software**: For financial records

### Future Enhancements
- **Barcode Scanning**: For item tracking
- **Mobile App**: Customer self-service
- **Route Optimization**: For delivery services
- **Inventory Integration**: For supply tracking

---

*Next: [Customer Management](./customer-management.md)*
