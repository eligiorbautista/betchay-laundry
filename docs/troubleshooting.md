# Troubleshooting Guide

This guide provides solutions to common issues you might encounter while using the Laundry Management System. Issues are organized by category with step-by-step solutions.

## System Setup and Installation

### Installation Issues

#### Node.js Version Compatibility
**Issue**: Build fails with Node.js version errors
```
Error: This project requires Node.js 18.0 or higher
```

**Solution**:
1. Check your Node.js version:
   ```bash
   node --version
   ```
2. Install Node.js 18+ from [nodejs.org](https://nodejs.org/)
3. Clear npm cache and reinstall:
   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

#### Dependency Installation Failures
**Issue**: npm install fails with permission errors
```
EACCES: permission denied, mkdir '/usr/local/lib/node_modules'
```

**Solution**:
1. **Option 1**: Use a Node.js version manager (recommended)
   ```bash
   # Install nvm (Linux/Mac)
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
   
   # Install latest Node.js
   nvm install 18
   nvm use 18
   ```

2. **Option 2**: Fix npm permissions
   ```bash
   npm config set prefix ~/.npm-global
   export PATH=~/.npm-global/bin:$PATH
   ```

#### Supabase Connection Issues
**Issue**: Cannot connect to Supabase database
```
Error: Invalid API key or project URL
```

**Solution**:
1. Verify environment variables in `.env`:
   ```env
   PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```
2. Check Supabase project status in dashboard
3. Ensure API keys are correctly copied (no extra spaces)
4. Verify your IP is not blocked in Supabase settings

## Authentication and Login

### Login Problems

#### Cannot Login with Correct Credentials
**Issue**: Login fails despite correct email/password
```
Error: Invalid login credentials
```

**Solution**:
1. **Check user account in Supabase**:
   - Go to Supabase Dashboard → Authentication → Users
   - Verify user exists and is not disabled
   - Check email confirmation status

2. **Verify user record in database**:
   ```sql
   SELECT * FROM users WHERE email = 'your-email@example.com';
   ```
   - Ensure user exists in `users` table
   - Check if `is_active` is true

3. **Reset password**:
   - Use "Forgot Password" feature
   - Or manually reset in Supabase Dashboard

#### Two-Factor Authentication Issues
**Issue**: 2FA code not working
```
Error: Invalid verification code
```

**Solution**:
1. **Check time synchronization**:
   - Ensure device time is correct
   - TOTP codes are time-sensitive

2. **Try backup codes**:
   - Use one of the backup codes provided during 2FA setup

3. **Disable and re-enable 2FA**:
   - Admin can disable 2FA for user
   - User sets up 2FA again with new QR code

#### Session Timeout Issues
**Issue**: Frequent session timeouts
```
Error: Session expired, please login again
```

**Solution**:
1. **Check session configuration**:
   ```env
   SESSION_TIMEOUT=86400  # 24 hours in seconds
   ```

2. **Browser issues**:
   - Clear browser cookies and cache
   - Disable ad blockers
   - Check for browser security settings

3. **Network connectivity**:
   - Ensure stable internet connection
   - Check for corporate firewall issues

## Order Management

### Order Creation Issues

#### Order Submission Fails
**Issue**: Cannot create new orders
```
Error: Failed to create order - validation error
```

**Solution**:
1. **Check required fields**:
   - Customer name (minimum 2 characters)
   - Valid phone number format (+63XXXXXXXXXX)
   - Service type selected
   - Quantity greater than 0

2. **Verify service pricing data**:
   ```sql
   SELECT * FROM service_pricing WHERE is_active = true;
   ```

3. **Check user permissions**:
   - Ensure user role allows order creation
   - Verify not exceeding rate limits

#### Customer Phone Validation Error
**Issue**: Phone number format rejected
```
Error: Invalid phone number format
```

**Solution**:
1. **Use correct format**:
   - Philippine format: +639XXXXXXXXX
   - Must start with +63
   - Must be exactly 13 characters

2. **Update validation pattern** (if needed):
   ```typescript
   // In validation schema
   customerPhone: z.string().regex(/^\+63\d{10}$/)
   ```

### Order Status Updates

#### Cannot Update Order Status
**Issue**: Status update fails
```
Error: Cannot update order status
```

**Solution**:
1. **Check user permissions**:
   - Staff: Can only update own orders to Processing/Ready
   - Manager: Can update any order status
   - Admin: Full permissions

2. **Verify valid status transitions**:
   ```
   Pending → Processing → Ready → Completed
   Any status → Cancelled (Manager/Admin only)
   ```

3. **Check order current state**:
   - Cannot update completed orders
   - Cannot update cancelled orders

#### Order Not Found Error
**Issue**: Order appears missing
```
Error: Order not found
```

**Solution**:
1. **Check Row Level Security**:
   - Staff can only see orders they created
   - Verify user role and permissions

2. **Search by order number**:
   - Use exact order number format
   - Check for typos in search

3. **Database query**:
   ```sql
   SELECT * FROM orders WHERE order_number = 'ORD-2024-XXX';
   ```

## Payment Processing

### Payment Recording Issues

#### Payment Amount Validation
**Issue**: Cannot record payment
```
Error: Invalid payment amount
```

**Solution**:
1. **Check amount format**:
   - Use decimal format (123.45)
   - Maximum 2 decimal places
   - Cannot exceed total order amount

2. **Verify payment status logic**:
   - Partial: Amount < Total
   - Paid: Amount = Total
   - Cannot overpay

#### Payment Method Issues
**Issue**: Digital payment methods not working
```
Error: Payment method not available
```

**Solution**:
1. **Check payment method configuration**:
   - Verify GCash/PayMaya settings
   - Ensure payment methods are enabled

2. **Network connectivity**:
   - Check internet connection
   - Verify payment gateway status

## Database and Performance

### Database Connection Issues

#### Connection Timeout
**Issue**: Database queries timing out
```
Error: Connection timeout
```

**Solution**:
1. **Check Supabase project status**:
   - Verify project is not paused
   - Check for maintenance notifications

2. **Network issues**:
   - Test connection from different network
   - Check firewall settings

3. **Query optimization**:
   - Add database indexes for slow queries
   - Limit result sets with pagination

#### Row Level Security Errors
**Issue**: Permission denied errors
```
Error: new row violates row-level security policy
```

**Solution**:
1. **Check RLS policies**:
   ```sql
   -- View current policies
   SELECT * FROM pg_policies WHERE tablename = 'orders';
   ```

2. **Verify user authentication**:
   - Ensure `auth.uid()` returns valid user ID
   - Check user role in database

3. **Update policies if needed**:
   ```sql
   -- Example policy update
   CREATE POLICY "order_insert_policy" ON orders
   FOR INSERT WITH CHECK (auth.role() = 'authenticated');
   ```

### Performance Issues

#### Slow Page Loading
**Issue**: Application loads slowly
```
Pages taking 10+ seconds to load
```

**Solution**:
1. **Check browser performance**:
   - Open browser dev tools (F12)
   - Check Network tab for slow requests
   - Clear browser cache

2. **Database optimization**:
   ```sql
   -- Add indexes for common queries
   CREATE INDEX idx_orders_created_at ON orders(created_at);
   CREATE INDEX idx_orders_customer_name ON orders(customer_name);
   ```

3. **Image optimization**:
   - Compress uploaded images
   - Use WebP format where possible

#### Memory Usage Issues
**Issue**: Browser becomes unresponsive
```
Browser tab crashes or freezes
```

**Solution**:
1. **Reduce data loading**:
   - Implement pagination for large lists
   - Limit initial data fetch size

2. **Browser troubleshooting**:
   - Close other browser tabs
   - Restart browser
   - Clear browser data

## Reporting and Analytics

### Report Generation Issues

#### Reports Not Loading
**Issue**: Report generation fails
```
Error: Failed to generate report
```

**Solution**:
1. **Check date range**:
   - Ensure start date is before end date
   - Use valid date format (YYYY-MM-DD)
   - Don't exceed maximum date range (1 year)

2. **Verify data availability**:
   ```sql
   SELECT COUNT(*) FROM orders 
   WHERE created_at BETWEEN 'start_date' AND 'end_date';
   ```

3. **Check user permissions**:
   - Ensure user role allows report access
   - Staff may have limited report access

#### Empty Report Data
**Issue**: Reports show no data despite existing orders
```
Report shows "No data available"
```

**Solution**:
1. **Check filter criteria**:
   - Verify date range includes order dates
   - Check status filters are not too restrictive

2. **Database query debugging**:
   ```sql
   -- Check for data in date range
   SELECT * FROM orders 
   WHERE created_at >= 'start_date' 
   AND created_at <= 'end_date'
   LIMIT 10;
   ```

## File Uploads and Media

### Image Upload Issues

#### File Size Too Large
**Issue**: Cannot upload business logo
```
Error: File size exceeds limit
```

**Solution**:
1. **Compress image**:
   - Maximum file size: 2MB
   - Use image compression tools
   - Convert to WebP format

2. **Supported formats**:
   - PNG, JPG, JPEG, WebP
   - Square format recommended for logos

#### Upload Permission Errors
**Issue**: File upload fails with permission error
```
Error: Storage upload failed
```

**Solution**:
1. **Check Supabase storage policies**:
   - Verify storage bucket permissions
   - Ensure authenticated users can upload

2. **File validation**:
   - Check file type and size
   - Ensure valid file extension

## Browser Compatibility

### Browser-Specific Issues

#### Internet Explorer/Edge Legacy
**Issue**: Application doesn't work in old browsers
```
JavaScript errors, layout issues
```

**Solution**:
1. **Use modern browser**:
   - Chrome 90+
   - Firefox 88+
   - Safari 14+
   - Edge 90+

2. **Browser updates**:
   - Enable automatic browser updates
   - Clear browser cache after updates

#### Mobile Browser Issues
**Issue**: Problems on mobile devices
```
Layout broken, touch interactions not working
```

**Solution**:
1. **Check viewport settings**:
   - Ensure responsive design is working
   - Test on different screen sizes

2. **Touch-friendly interface**:
   - Increase button sizes
   - Ensure proper touch targets

## Security and Access Control

### Permission Denied Errors

#### Access Denied to Features
**Issue**: User cannot access certain features
```
Error: You don't have permission to access this resource
```

**Solution**:
1. **Check user role**:
   ```sql
   SELECT role FROM users WHERE id = 'user-id';
   ```

2. **Role permissions matrix**:
   - Staff: Basic order operations
   - Manager: Order management, reports
   - Admin: Full system access

3. **Update user role** (Admin only):
   ```sql
   UPDATE users SET role = 'manager' WHERE id = 'user-id';
   ```

### API Rate Limiting

#### Rate Limit Exceeded
**Issue**: Too many requests error
```
Error: Rate limit exceeded, try again later
```

**Solution**:
1. **Wait for reset period**:
   - Check rate limit headers in response
   - Wait for rate limit window to reset

2. **Optimize API usage**:
   - Reduce frequency of requests
   - Implement client-side caching
   - Use pagination for large data sets

## Getting Additional Help

### Diagnostic Information

When reporting issues, include:

1. **System Information**:
   - Browser version and type
   - Operating system
   - Screen resolution (for UI issues)

2. **Error Details**:
   - Complete error message
   - Steps to reproduce
   - Browser console errors (F12 → Console)

3. **Network Information**:
   - Internet connection type
   - Any corporate firewalls or proxies

### Log Collection

#### Browser Console Logs
1. Open browser developer tools (F12)
2. Go to Console tab
3. Reproduce the issue
4. Copy any error messages
5. Take screenshot if needed

#### Network Request Logs
1. Open browser developer tools (F12)
2. Go to Network tab
3. Reproduce the issue
4. Look for failed requests (red status)
5. Check request/response details

### Contact Support

**Priority Levels**:
- **Critical**: System down, data loss
- **High**: Major functionality broken
- **Medium**: Minor functionality issues
- **Low**: Enhancement requests

**Support Channels**:
- **Emergency**: 24/7 hotline for critical issues
- **Email**: support@laundry-system.com
- **Documentation**: [Online Help Center](https://docs.laundry-system.com)
- **Community**: [GitHub Discussions](https://github.com/yourusername/laundry-management-system/discussions)

**When Contacting Support**:
1. Provide detailed issue description
2. Include error messages and screenshots
3. Specify your user role and permissions
4. Mention steps already tried
5. Include system information

---

*Next: [Performance Optimization](./performance.md)*
