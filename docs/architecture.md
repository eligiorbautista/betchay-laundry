# Technical Architecture

## Architecture Overview

The Laundry Management System follows a modern, scalable architecture built on SvelteKit frontend with Supabase backend. This document provides a comprehensive overview of the technical architecture, design decisions, and implementation details.

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Layer                              │
├─────────────────────────────────────────────────────────────┤
│  Web Browser (Chrome, Firefox, Safari, Edge)                │
│  - SvelteKit Application                                     │
│  - TypeScript                                               │
│  - Tailwind CSS                                             │
│  - Lucide Icons                                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS/WSS
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                Application Layer                             │
├─────────────────────────────────────────────────────────────┤
│  SvelteKit Server                                           │
│  - Server-Side Rendering (SSR)                             │
│  - API Routes                                               │
│  - Authentication Middleware                                │
│  - Rate Limiting                                            │
│  - Session Management                                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/PostgreSQL
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                Backend Services                              │
├─────────────────────────────────────────────────────────────┤
│  Supabase                                                   │
│  - PostgreSQL Database                                      │
│  - Authentication Service                                   │
│  - Real-time Subscriptions                                 │
│  - Row Level Security (RLS)                                │
│  - Auto-generated APIs                                     │
└─────────────────────────────────────────────────────────────┘
```

## Frontend Architecture

### SvelteKit Framework

**Technology Stack:**
- **SvelteKit**: Full-stack framework with SSR capabilities
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework

**Architecture Patterns:**
- **Component-Based**: Modular, reusable UI components
- **Server-Side Rendering**: Improved SEO and initial load performance
- **Progressive Enhancement**: Works without JavaScript
- **File-based Routing**: Intuitive route structure

### Directory Structure

```
src/
├── app.html                 # Main HTML template
├── app.css                  # Global styles
├── app.d.ts                 # TypeScript declarations
├── lib/                     # Shared libraries
│   ├── components/          # Reusable UI components
│   │   ├── common/          # Common components
│   │   └── layout/          # Layout components
│   ├── config/              # Configuration files
│   ├── stores/              # Svelte stores
│   ├── types/               # TypeScript type definitions
│   └── utils/               # Utility functions
└── routes/                  # Page routes
    ├── (app)/               # Protected app routes
    ├── auth/                # Authentication routes
    ├── +layout.svelte       # Root layout
    └── +page.svelte         # Home page
```

### Component Architecture

```
┌─────────────────┐
│  Page Components │
├─────────────────┤
│ +page.svelte    │ ← Route-specific pages
│ +layout.svelte  │ ← Layout components
└─────────────────┘
        │
        ▼
┌─────────────────┐
│ Layout Components│
├─────────────────┤
│ Header.svelte   │ ← Global navigation
│ Sidebar.svelte  │ ← Side navigation
│ Footer.svelte   │ ← Global footer
└─────────────────┘
        │
        ▼
┌─────────────────┐
│Common Components│
├─────────────────┤
│ Button.svelte   │ ← Reusable UI elements
│ Modal.svelte    │ ← Dialog components
│ Form.svelte     │ ← Form components
└─────────────────┘
```

### State Management

**Svelte Stores Pattern:**
```typescript
// Store structure
stores/
├── authStore.ts      # User authentication state
├── orderStore.ts     # Order management state
├── settingsStore.ts  # Application settings
└── uiStore.ts        # UI state (modals, loading)
```

**Store Implementation:**
```typescript
// Example: Auth Store
import { writable } from 'svelte/store';
import type { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  loading: boolean;
  role: 'admin' | 'manager' | 'staff' | null;
}

export const authStore = writable<AuthState>({
  user: null,
  loading: true,
  role: null
});
```

## Backend Architecture

### Supabase Architecture

**Core Services:**
- **PostgreSQL Database**: Primary data storage
- **Authentication**: JWT-based auth with multiple providers
- **Real-time**: WebSocket connections for live updates
- **Storage**: File storage for documents/images
- **Edge Functions**: Serverless functions for custom logic

### Database Design

**Entity Relationship Diagram:**
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    Users    │    │  Customers  │    │   Orders    │
├─────────────┤    ├─────────────┤    ├─────────────┤
│ id (PK)     │    │ id (PK)     │    │ id (PK)     │
│ email       │    │ name        │    │ order_number│
│ full_name   │    │ phone       │    │ customer_id │──┐
│ role        │    │ address     │    │ service_type│  │
│ is_active   │    │ email       │    │ quantity    │  │
│ created_at  │    │ created_at  │    │ total_amount│  │
└─────────────┘    └─────────────┘    │ status      │  │
                                      │ created_by  │──┤
                                      │ created_at  │  │
                                      └─────────────┘  │
                                                       │
┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│ Service     │    │   Add-ons   │    │Order Add-ons│  │
│ Pricing     │    ├─────────────┤    ├─────────────┤  │
├─────────────┤    │ id (PK)     │    │ id (PK)     │  │
│ id (PK)     │    │ name        │    │ order_id    │──┘
│ service_name│    │ price       │    │ add_on_id   │
│ price       │    │ unit        │    │ quantity    │
│ unit        │    │ is_active   │    │ unit_price  │
│ is_active   │    │ created_at  │    │ total_price │
│ created_at  │    └─────────────┘    │ created_at  │
└─────────────┘                       └─────────────┘
```

### Security Architecture

**Row Level Security (RLS):**
```sql
-- Example RLS Policy
CREATE POLICY "Users can only see their own orders" ON orders
FOR SELECT USING (
  auth.uid() = created_by OR 
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'manager')
  )
);
```

**Authentication Flow:**
```
Client                    Supabase Auth               Database
  │                           │                         │
  │ 1. Login Request          │                         │
  ├──────────────────────────►│                         │
  │                           │ 2. Validate Credentials │
  │                           ├────────────────────────►│
  │                           │ 3. User Data            │
  │                           │◄────────────────────────┤
  │ 4. JWT Token + User       │                         │
  │◄──────────────────────────┤                         │
  │                           │                         │
  │ 5. API Request with JWT   │                         │
  ├──────────────────────────►│ 6. Verify JWT          │
  │                           ├────────────────────────►│
  │                           │ 7. Execute Query (RLS)  │
  │                           ├────────────────────────►│
  │                           │ 8. Filtered Results     │
  │                           │◄────────────────────────┤
  │ 9. Response Data          │                         │
  │◄──────────────────────────┤                         │
```

## API Architecture

### SvelteKit API Routes

**Route Structure:**
```
src/routes/
├── api/
│   ├── orders/
│   │   ├── +server.ts      # GET, POST /api/orders
│   │   └── [id]/
│   │       └── +server.ts  # GET, PUT, DELETE /api/orders/{id}
│   ├── customers/
│   │   └── +server.ts      # Customer CRUD operations
│   └── reports/
│       └── +server.ts      # Report generation
```

**API Implementation Pattern:**
```typescript
// Example API route
import { json } from '@sveltejs/kit';
import { supabase } from '$lib/config/supabaseServer';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals }) => {
  try {
    // Authentication check
    if (!locals.user) {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Query parameters
    const page = Number(url.searchParams.get('page')) || 1;
    const limit = Number(url.searchParams.get('limit')) || 10;

    // Database query with RLS
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .range((page - 1) * limit, page * limit - 1)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return json({ data, page, limit });
  } catch (error) {
    return json({ error: error.message }, { status: 500 });
  }
};
```

### Data Flow Architecture

**Request/Response Flow:**
```
1. User Interaction (Svelte Component)
   ↓
2. Form Submission / Event Handler
   ↓
3. SvelteKit Action / Load Function
   ↓
4. API Route Handler
   ↓
5. Supabase Client Query
   ↓
6. PostgreSQL Database (with RLS)
   ↓
7. Response Data
   ↓
8. Component State Update
   ↓
9. UI Re-render
```

## Performance Architecture

### Frontend Performance

**Optimization Strategies:**
- **Code Splitting**: Automatic route-based splitting
- **Tree Shaking**: Dead code elimination
- **Lazy Loading**: On-demand component loading
- **Image Optimization**: WebP format and responsive images
- **Caching**: Browser and CDN caching strategies

### Backend Performance

**Database Optimization:**
```sql
-- Indexes for common queries
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_created_by ON orders(created_by);
```

**Query Optimization:**
- **Pagination**: Limit result sets with OFFSET/LIMIT
- **Selective Fields**: Only fetch required columns
- **Joins**: Efficient table joins for related data
- **Connection Pooling**: Managed by Supabase

### Caching Strategy

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Browser   │    │   CDN       │    │  Supabase   │
│   Cache     │    │   Cache     │    │   Cache     │
├─────────────┤    ├─────────────┤    ├─────────────┤
│ Static      │    │ Static      │    │ Query       │
│ Assets      │    │ Assets      │    │ Results     │
│ (CSS, JS)   │    │ (Images)    │    │ (Redis)     │
│             │    │             │    │             │
│ TTL: 1 year │    │ TTL: 1 week │    │ TTL: 5 min  │
└─────────────┘    └─────────────┘    └─────────────┘
```

## Security Architecture

### Authentication & Authorization

**Multi-layered Security:**
1. **Frontend Route Guards**: Protect routes based on auth state
2. **API Route Protection**: Verify JWT tokens on server
3. **Database RLS**: Row-level security at database level
4. **Role-based Permissions**: Granular access control

### Data Protection

**Encryption:**
- **In Transit**: HTTPS/TLS for all communications
- **At Rest**: Database encryption managed by Supabase
- **Passwords**: Bcrypt hashing with salt

**Security Headers:**
```typescript
// Security middleware
export const handle = async ({ event, resolve }) => {
  const response = await resolve(event);
  
  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'geolocation=(), camera=()');
  
  return response;
};
```

## Deployment Architecture

### Production Environment

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Vercel        │    │   Cloudflare    │    │   Supabase      │
│   (Hosting)     │    │   (CDN)         │    │   (Backend)     │
├─────────────────┤    ├─────────────────┤    ├─────────────────┤
│ - SvelteKit App │    │ - Static Assets │    │ - PostgreSQL    │
│ - Edge Functions│    │ - Global CDN    │    │ - Authentication│
│ - Auto Scaling  │    │ - DDoS Protection│    │ - Real-time     │
│ - SSL/HTTPS     │    │ - Web Firewall  │    │ - File Storage  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Monitoring & Observability

**Monitoring Stack:**
- **Application Monitoring**: Vercel Analytics
- **Error Tracking**: Built-in error boundaries
- **Performance Monitoring**: Web Vitals tracking
- **Database Monitoring**: Supabase Dashboard
- **Uptime Monitoring**: Third-party services

### Backup & Recovery

**Backup Strategy:**
- **Database Backups**: Automated daily backups via Supabase
- **Point-in-time Recovery**: Up to 7 days (Pro plan)
- **Code Repository**: Git-based version control
- **Environment Configs**: Secure configuration management

## Scalability Architecture

### Horizontal Scaling

**Frontend Scaling:**
- **CDN Distribution**: Global edge locations
- **Auto Scaling**: Serverless function scaling
- **Load Balancing**: Managed by hosting provider

**Backend Scaling:**
- **Database Scaling**: Automatic scaling via Supabase
- **Connection Pooling**: PgBouncer integration
- **Read Replicas**: Available for high-traffic scenarios

### Future Architecture Considerations

**Microservices Migration:**
```
Monolithic SvelteKit App
         ↓
Service-Oriented Architecture
         ↓
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   Auth      │  │   Orders    │  │  Reports    │
│   Service   │  │   Service   │  │  Service    │
└─────────────┘  └─────────────┘  └─────────────┘
```

**Integration Points:**
- **Payment Gateways**: Stripe, PayPal integration
- **Communication**: SMS/Email service APIs
- **Analytics**: Google Analytics, Mixpanel
- **Monitoring**: DataDog, New Relic integration

---

*Next: [Database Schema](./database-schema.md)*
