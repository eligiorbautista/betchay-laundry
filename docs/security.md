# Security Overview

The Laundry Management System implements enterprise-grade security measures to protect sensitive business and customer data. This document outlines the security architecture, features, and best practices.

## Security Architecture

### Multi-Layer Security Model

```
┌─────────────────────────────────────────────────┐
│                Application Layer                 │
│  - Input validation                             │
│  - XSS protection                               │
│  - CSRF protection                              │
│  - Rate limiting                                │
└─────────────────────────────────────────────────┘
                         │
┌─────────────────────────────────────────────────┐
│              Authentication Layer                │
│  - JWT tokens                                   │
│  - Two-factor authentication                    │
│  - Session management                           │
│  - Password policies                            │
└─────────────────────────────────────────────────┘
                         │
┌─────────────────────────────────────────────────┐
│              Authorization Layer                 │
│  - Role-based access control (RBAC)            │
│  - Resource-level permissions                   │
│  - Row-level security (RLS)                    │
│  - API endpoint protection                      │
└─────────────────────────────────────────────────┘
                         │
┌─────────────────────────────────────────────────┐
│                Database Layer                    │
│  - Data encryption at rest                      │
│  - Connection encryption (TLS)                  │
│  - Audit logging                                │
│  - Backup encryption                            │
└─────────────────────────────────────────────────┘
```

## Authentication System

### User Authentication

**Authentication Methods:**
1. **Email/Password**: Primary authentication method
2. **Two-Factor Authentication (2FA)**: Optional enhanced security
3. **Session Tokens**: JWT-based session management

### Password Security

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character
- Cannot reuse last 5 passwords

**Password Storage:**
- Bcrypt hashing with salt (cost factor: 12)
- No plaintext password storage
- Automatic password expiry (90 days for admin users)

### Two-Factor Authentication (2FA)

**Supported 2FA Methods:**
1. **TOTP (Time-based One-Time Password)**
   - Google Authenticator
   - Authy
   - Microsoft Authenticator

2. **SMS-based OTP** (optional)
   - 6-digit numeric codes
   - 5-minute expiry
   - Rate limited (max 3 attempts per hour)

**2FA Setup Process:**
1. User enables 2FA in profile settings
2. QR code generated for authenticator app
3. User scans QR code and enters verification code
4. Backup codes generated (10 single-use codes)
5. 2FA is now required for all logins

### Session Management

**Session Security:**
- JWT tokens with 24-hour expiry
- Automatic token refresh (sliding expiration)
- Secure HTTP-only cookies for web sessions
- Session revocation on password change
- Device tracking and management

**Session Storage:**
```typescript
interface SessionData {
  userId: string;
  role: 'admin' | 'manager' | 'staff';
  permissions: string[];
  deviceId: string;
  ipAddress: string;
  lastActivity: Date;
  expiresAt: Date;
}
```

## Authorization & Access Control

### Role-Based Access Control (RBAC)

**User Roles:**

#### Admin Role
- Full system access and configuration
- User management (create, modify, delete users)
- System settings and pricing configuration
- All reports and analytics
- Audit log access
- Database backup and restore

#### Manager Role
- Order management (all orders)
- Customer management
- Staff oversight
- Financial reports
- Limited system settings
- Cannot manage other managers or admins

#### Staff Role
- Order creation and basic management
- Customer information access (limited)
- Basic reporting
- Own profile management
- Cannot access system settings

### Permission Matrix

| Feature | Admin | Manager | Staff |
|---------|-------|---------|-------|
| Create Orders | ✅ | ✅ | ✅ |
| View All Orders | ✅ | ✅ | ❌* |
| Edit Orders | ✅ | ✅ | ✅** |
| Cancel Orders | ✅ | ✅ | ❌ |
| Delete Orders | ✅ | ❌ | ❌ |
| Manage Customers | ✅ | ✅ | ✅*** |
| View Reports | ✅ | ✅ | ✅**** |
| Manage Users | ✅ | ❌ | ❌ |
| System Settings | ✅ | ✅***** | ❌ |
| Audit Logs | ✅ | ❌ | ❌ |

*Staff can only view orders they created
**Staff can only edit orders they created and not yet completed
***Staff have read-only access to customer information
****Staff can access basic reports only
*****Managers have limited settings access

### Row-Level Security (RLS)

**Database-Level Access Control:**
```sql
-- Orders access policy
CREATE POLICY "order_access_policy" ON orders
FOR ALL USING (
  CASE 
    WHEN auth_role() = 'admin' THEN true
    WHEN auth_role() = 'manager' THEN true
    WHEN auth_role() = 'staff' THEN created_by = auth.uid()
    ELSE false
  END
);

-- Customer access policy
CREATE POLICY "customer_access_policy" ON customers
FOR SELECT USING (
  auth.role() = 'authenticated'
);

CREATE POLICY "customer_modify_policy" ON customers
FOR INSERT, UPDATE USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'manager')
  )
);
```

## Data Protection

### Data Encryption

**Encryption at Rest:**
- Database encryption (AES-256)
- File storage encryption
- Backup encryption
- Configuration secrets encryption

**Encryption in Transit:**
- TLS 1.3 for all HTTPS connections
- Certificate pinning for API communications
- Encrypted database connections
- Secure WebSocket connections (WSS)

### Sensitive Data Handling

**Customer Data Protection:**
- PII (Personally Identifiable Information) encryption
- Phone number masking in logs
- Address data protection
- GDPR compliance measures

**Payment Data Security:**
- PCI DSS compliance considerations
- No credit card storage
- Payment reference tokenization
- Secure payment processor integration

### Data Classification

**Data Sensitivity Levels:**

| Level | Data Types | Protection Measures |
|-------|------------|-------------------|
| **Critical** | Passwords, 2FA secrets | Hashed storage, never logged |
| **Sensitive** | Customer PII, payment refs | Encrypted, audit logged |
| **Internal** | Order details, business metrics | Access controlled, RLS |
| **Public** | Service pricing, business hours | Standard protection |

## API Security

### Input Validation

**Validation Layers:**
1. **Frontend Validation**: Client-side validation for UX
2. **Schema Validation**: TypeScript type checking
3. **Server Validation**: Zod schema validation
4. **Database Constraints**: SQL constraints and triggers

**Example Validation:**
```typescript
import { z } from 'zod';

const orderCreateSchema = z.object({
  customerName: z.string().min(2).max(100),
  customerPhone: z.string().regex(/^\+63\d{10}$/),
  serviceType: z.string().min(1),
  quantity: z.number().positive().max(1000),
  paymentMethod: z.enum(['cash', 'gcash', 'paymaya', 'bank_transfer'])
});
```

### Rate Limiting

**Rate Limiting Rules:**
```typescript
const rateLimits = {
  login: '5 attempts per 15 minutes',
  orderCreate: '10 orders per minute',
  apiGeneral: '100 requests per minute',
  reportGeneration: '5 reports per hour'
};
```

**Implementation:**
- IP-based rate limiting
- User-based rate limiting
- Endpoint-specific limits
- Progressive delays on abuse

### CORS and Security Headers

**Security Headers:**
```typescript
const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  'Content-Security-Policy': 'default-src \'self\'; script-src \'self\' \'unsafe-inline\''
};
```

## Audit & Monitoring

### Audit Logging

**Logged Events:**
- User authentication (login, logout, failures)
- Order operations (create, update, delete)
- Customer data access and modifications
- System configuration changes
- Payment processing events
- File uploads and downloads
- Permission changes

**Audit Log Structure:**
```typescript
interface AuditLog {
  id: string;
  userId: string;
  action: string;
  tableName: string;
  recordId: string;
  oldData: object | null;
  newData: object | null;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}
```

### Security Monitoring

**Real-time Monitoring:**
- Failed login attempts
- Suspicious API usage patterns
- Data access anomalies
- Rate limit violations
- Authentication bypass attempts

**Alerting Triggers:**
- Multiple failed logins from same IP
- Unusual data access patterns
- System configuration changes
- Database connection failures
- Unauthorized API endpoint access

## Compliance & Standards

### Data Privacy Compliance

**GDPR Compliance:**
- Right to access personal data
- Right to data portability
- Right to erasure (data deletion)
- Data processing transparency
- Consent management
- Data breach notification procedures

**Implementation:**
```typescript
// Data export for GDPR compliance
export async function exportUserData(userId: string) {
  const userData = {
    profile: await getUserProfile(userId),
    orders: await getUserOrders(userId),
    preferences: await getUserPreferences(userId),
    auditLogs: await getUserAuditLogs(userId)
  };
  
  return {
    data: userData,
    exportDate: new Date(),
    format: 'JSON'
  };
}
```

### Security Standards

**Compliance Frameworks:**
- OWASP Top 10 protection
- NIST Cybersecurity Framework alignment
- ISO 27001 security controls
- PCI DSS Level 4 (for payment handling)

## Incident Response

### Security Incident Procedures

**Incident Classification:**
1. **Critical**: Data breach, system compromise
2. **High**: Unauthorized access, service disruption
3. **Medium**: Failed security controls, policy violations
4. **Low**: Suspicious activities, minor vulnerabilities

**Response Process:**
1. **Detection**: Automated monitoring alerts
2. **Assessment**: Classify incident severity
3. **Containment**: Isolate affected systems
4. **Investigation**: Forensic analysis
5. **Recovery**: Restore normal operations
6. **Lessons Learned**: Update security measures

### Backup & Recovery

**Backup Strategy:**
- **Daily automated backups**: Database and critical files
- **Weekly full system backups**: Complete system state
- **Monthly offsite backups**: Disaster recovery
- **Real-time replication**: For critical data

**Recovery Procedures:**
- **Point-in-time recovery**: Restore to specific timestamp
- **Partial data recovery**: Restore specific tables/records
- **Full system recovery**: Complete system restoration
- **Disaster recovery**: Offsite backup restoration

## Security Best Practices

### For Administrators

1. **Regular Security Audits**
   - Monthly access review
   - Quarterly penetration testing
   - Annual security assessment

2. **User Management**
   - Immediate access revocation for terminated employees
   - Regular permission reviews
   - Principle of least privilege

3. **System Maintenance**
   - Regular security updates
   - Vulnerability scanning
   - Security configuration reviews

### For Users

1. **Password Hygiene**
   - Use strong, unique passwords
   - Enable two-factor authentication
   - Never share credentials

2. **Secure Practices**
   - Log out after sessions
   - Report suspicious activities
   - Keep software updated

3. **Data Handling**
   - Follow data classification guidelines
   - Secure physical access to devices
   - Report data incidents immediately

## Security Configuration

### Environment Variables

**Security-related configurations:**
```env
# Authentication
JWT_SECRET=your-256-bit-secret
SESSION_TIMEOUT=86400
2FA_ISSUER=LaundrySystem

# Rate Limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# Security Features
ENABLE_2FA=true
FORCE_HTTPS=true
SECURE_COOKIES=true
```

### Database Security

**Connection Security:**
```typescript
const supabaseConfig = {
  url: process.env.SUPABASE_URL,
  key: process.env.SUPABASE_SERVICE_ROLE_KEY,
  auth: {
    persistSession: false,
    autoRefreshToken: false
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'x-application-name': 'laundry-management-system'
    }
  }
};
```

---

*Next: [Authentication System](./authentication.md)*
