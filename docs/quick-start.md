# Quick Start Guide

This guide will help you get the Laundry Management System up and running in just a few minutes.

## Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js 18+ installed
- ✅ A Supabase account and project
- ✅ Git installed

## 5-Minute Setup

### 1. Clone and Install (2 minutes)

```bash
# Clone the repository
git clone https://github.com/yourusername/laundry-management-system.git
cd laundry-management-system

# Install dependencies
npm install
```

### 2. Environment Setup (1 minute)

```bash
# Create environment file
cp .env.example .env
```

Edit `.env` with your Supabase credentials:
```env
PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SESSION_SECRET=your-random-string-32-chars-long
```

### 3. Database Setup (2 minutes)

In your Supabase SQL Editor, run this quick setup script:

```sql
-- Quick database setup
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'staff');

-- Essential tables
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'staff',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE customers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE service_pricing (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    service_name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) DEFAULT 'kg',
    is_active BOOLEAN DEFAULT true
);

CREATE TABLE orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20),
    service_type VARCHAR(100) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'unpaid',
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sample data
INSERT INTO service_pricing (service_name, price) VALUES
('Wash & Fold', 45.00),
('Dry Clean', 120.00),
('Iron Only', 25.00);

INSERT INTO customers (name, phone) VALUES
('John Doe', '+639123456789'),
('Jane Smith', '+639987654321');
```

### 4. Start the App

```bash
npm run dev
```

Visit `http://localhost:5173` and you're ready to go!

## First Steps After Setup

### Create Your Admin User

1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add User" and create your admin account
3. In SQL Editor, promote to admin:

```sql
UPDATE users 
SET role = 'admin', full_name = 'Your Name'
WHERE email = 'your-email@example.com';
```

### Take a Quick Tour

1. **Login** with your admin credentials
2. **Dashboard** - See overview of orders and revenue
3. **Create Order** - Try creating a test order
4. **View Orders** - Check the orders list
5. **Reports** - Explore basic reporting features

## Common First-Time Tasks

### Add Your Business Services

1. Go to **Settings** → **Service Pricing**
2. Update the default services:
   - Wash & Fold
   - Dry Cleaning
   - Ironing
   - Express Service

### Create Your First Real Order

1. Click **New Order**
2. Fill in customer details
3. Select service type and quantity
4. Choose payment method
5. Submit and track the order

### Set Up Team Members

1. Go to **Settings** → **User Management** (Admin only)
2. Invite staff members
3. Assign appropriate roles (Staff/Manager)

## Next Steps

Once you have the basics working:

1. **Read the full documentation** - [System Overview](./system-overview.md)
2. **Configure security** - [Security Guide](./security.md)
3. **Set up reporting** - [Reporting Guide](./reporting.md)
4. **Deploy to production** - [Deployment Guide](./deployment.md)

## Quick Reference

### Default User Roles
- **Admin**: Full system access
- **Manager**: Order and customer management, reports
- **Staff**: Order creation and basic operations

### Order Statuses
- **Pending**: Just received
- **Processing**: Being worked on
- **Ready**: Ready for pickup
- **Completed**: Delivered to customer
- **Cancelled**: Cancelled order

### Payment Methods
- Cash
- GCash
- PayMaya
- Bank Transfer

### Payment Statuses
- Unpaid
- Paid
- Partial

## Troubleshooting Quick Fixes

### App Won't Start
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Database Connection Issues
1. Check your `.env` file
2. Verify Supabase project is running
3. Ensure correct URL and keys

### Login Issues
1. Check user exists in Supabase Auth
2. Verify user record in `users` table
3. Ensure user has proper role assigned

## Need Help?

- 📖 **Full Documentation**: [docs/README.md](./README.md)
- 🐛 **Report Issues**: [GitHub Issues](https://github.com/yourusername/laundry-management-system/issues)
- 💬 **Ask Questions**: [GitHub Discussions](https://github.com/yourusername/laundry-management-system/discussions)

---

**🎉 Congratulations! Your Laundry Management System is now ready to use.**

*Next: [Order Management Guide](./order-management.md)*
