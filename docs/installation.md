# Installation Guide

This guide will walk you through setting up the Laundry Management System on your local development environment or production server.

## Prerequisites

Before you begin, ensure you have the following installed:

### Required Software
- **Node.js** 18.0 or higher ([Download](https://nodejs.org/))
- **npm** 8.0 or higher (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))

### External Services
- **Supabase Account** ([Sign up](https://supabase.com/))
- **Supabase Project** (created in your Supabase dashboard)

### Optional Tools
- **VS Code** with Svelte extension ([Download](https://code.visualstudio.com/))
- **pnpm** or **yarn** as npm alternatives

## Step 1: Clone the Repository

```bash
# Clone the repository
git clone https://github.com/yourusername/laundry-management-system.git

# Navigate to project directory
cd laundry-management-system

# Verify the project structure
ls -la
```

## Step 2: Install Dependencies

```bash
# Install all project dependencies
npm install

# Or using pnpm
pnpm install

# Or using yarn
yarn install
```

## Step 3: Supabase Setup

### 3.1 Create a Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: Laundry Management System
   - **Database Password**: Choose a strong password
   - **Region**: Choose closest to your location
5. Click "Create new project"

### 3.2 Get Project Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **API Keys** → **anon/public** key
   - **API Keys** → **service_role/secret** key (for admin operations)

### 3.3 Database Setup

1. In Supabase dashboard, go to **SQL Editor**
2. Run the database setup scripts in order:

```sql
-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create user roles enum
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'staff');

-- 3. Create users table
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'staff',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create customers table
CREATE TABLE customers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create service_pricing table
CREATE TABLE service_pricing (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    service_name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) DEFAULT 'kg',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create add_ons table
CREATE TABLE add_ons (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) DEFAULT 'piece',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Create orders table
CREATE TABLE orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id),
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20),
    service_type VARCHAR(100) NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    add_ons_total DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'unpaid',
    status VARCHAR(20) DEFAULT 'pending',
    pickup_date DATE,
    delivery_date DATE,
    remarks TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Create order_add_ons table
CREATE TABLE order_add_ons (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    add_on_id UUID REFERENCES add_ons(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Create audit_logs table
CREATE TABLE audit_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(50),
    record_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

3. Insert sample data:

```sql
-- Insert sample service pricing
INSERT INTO service_pricing (service_name, price, unit) VALUES
('Wash & Fold', 45.00, 'kg'),
('Dry Clean', 120.00, 'piece'),
('Iron Only', 25.00, 'kg'),
('Wash & Iron', 60.00, 'kg'),
('Express Service', 80.00, 'kg');

-- Insert sample add-ons
INSERT INTO add_ons (name, price, unit) VALUES
('Fabric Softener', 10.00, 'order'),
('Starch', 15.00, 'order'),
('Express Delivery', 50.00, 'order'),
('Pickup Service', 30.00, 'order'),
('Garment Bag', 20.00, 'piece');

-- Insert sample customer
INSERT INTO customers (name, phone, address, email) VALUES
('John Doe', '+639123456789', '123 Main St, Manila', 'john.doe@email.com'),
('Jane Smith', '+639987654321', '456 Oak Ave, Quezon City', 'jane.smith@email.com');
```

## Step 4: Environment Configuration

### 4.1 Create Environment File

```bash
# Create environment file
cp .env.example .env
```

### 4.2 Configure Environment Variables

Edit the `.env` file with your Supabase credentials:

```env
# Supabase Configuration
PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Application Configuration
PUBLIC_APP_NAME="Laundry Management System"
PUBLIC_APP_VERSION="1.0.0"

# Security Configuration
SESSION_SECRET=your-very-long-random-string-here
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=900000

# Optional: Development settings
NODE_ENV=development
LOG_LEVEL=debug
```

**Important Security Notes:**
- Never commit the `.env` file to version control
- Use a strong, random SESSION_SECRET (32+ characters)
- Keep your service role key secret and secure

## Step 5: Database Permissions Setup

Set up Row Level Security (RLS) policies in Supabase:

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_add_ons ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view all users" ON users FOR SELECT USING (true);
CREATE POLICY "Only admins can modify users" ON users FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Create policies for customers table
CREATE POLICY "Authenticated users can view customers" ON customers FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Staff can create customers" ON customers FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Staff can update customers" ON customers FOR UPDATE USING (auth.role() = 'authenticated');

-- Create policies for orders table
CREATE POLICY "Authenticated users can view orders" ON orders FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Staff can create orders" ON orders FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Staff can update orders" ON orders FOR UPDATE USING (auth.role() = 'authenticated');

-- Create policies for order_add_ons table
CREATE POLICY "View order add-ons with order access" ON order_add_ons FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM orders 
        WHERE orders.id = order_add_ons.order_id
    )
);

-- Create policies for audit_logs table
CREATE POLICY "Only admins can view audit logs" ON audit_logs FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() AND role = 'admin'
    )
);
```

## Step 6: Start the Development Server

```bash
# Start the development server
npm run dev

# Or with custom port
npm run dev -- --port 3000

# Or open browser automatically
npm run dev -- --open
```

The application will be available at `http://localhost:5173` (or your specified port).

## Step 7: Create Your First Admin User

1. Go to your Supabase dashboard → **Authentication** → **Users**
2. Click "Add User"
3. Enter email and password
4. After creating the user, go to **SQL Editor** and run:

```sql
-- Update the user role to admin
UPDATE users 
SET role = 'admin', full_name = 'Your Name'
WHERE email = 'your-admin-email@example.com';
```

## Step 8: Verify Installation

1. **Access the application**: Open `http://localhost:5173`
2. **Login**: Use your admin credentials
3. **Test basic functionality**:
   - Navigate to Dashboard
   - Create a test order
   - Check reports section
   - Verify user management (admin only)

## Production Deployment

### Build for Production

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

### Environment Variables for Production

Update your `.env` file for production:

```env
NODE_ENV=production
PUBLIC_SUPABASE_URL=your-production-supabase-url
PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key
SESSION_SECRET=your-production-session-secret
```

### Deployment Options

1. **Vercel** (Recommended for SvelteKit)
2. **Netlify**
3. **Digital Ocean App Platform**
4. **Railway**
5. **Self-hosted with Docker**

See the [Deployment Guide](./deployment.md) for detailed deployment instructions.

## Troubleshooting

### Common Issues

1. **Supabase Connection Error**
   - Verify your environment variables
   - Check your Supabase project status
   - Ensure your IP is not blocked

2. **Database Permission Errors**
   - Verify RLS policies are set up correctly
   - Check user roles in the database
   - Ensure auth.uid() is working

3. **Build Errors**
   - Clear node_modules and reinstall dependencies
   - Check for TypeScript errors
   - Verify all environment variables are set

4. **Authentication Issues**
   - Check Supabase auth settings
   - Verify JWT secret configuration
   - Ensure user exists in users table

### Getting Help

- Check the [Troubleshooting Guide](./troubleshooting.md)
- Review [GitHub Issues](https://github.com/yourusername/laundry-management-system/issues)
- Join the [Community Discussions](https://github.com/yourusername/laundry-management-system/discussions)

---

*Next: [Quick Start Guide](./quick-start.md)*
