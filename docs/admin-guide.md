# Administrator User Guide

This guide provides comprehensive instructions for system administrators managing the Laundry Management System. It covers all administrative functions, from user management to system configuration and maintenance.

## Admin Dashboard Overview

### Dashboard Components

**Key Metrics Cards:**
- Total orders today/this month
- Revenue today/this month
- Active customers
- Pending orders requiring attention
- System health indicators

**Quick Actions:**
- Create new order
- Add new customer
- View pending orders
- Access reports
- System settings

**Recent Activity:**
- Latest orders created
- Recent customer registrations
- Payment confirmations
- Status updates
- System alerts

## User Management

### Creating User Accounts

1. **Navigate to User Management**
   - Go to Settings → User Management
   - Click "Add New User"

2. **User Information Form**
   - **Email**: User's email address (will be login)
   - **Full Name**: Complete name for display
   - **Role**: Select from Admin, Manager, Staff
   - **Initial Password**: Temporary password (user must change)
   - **Send Welcome Email**: Option to notify user

3. **Role Configuration**
   - **Admin**: Full system access
   - **Manager**: Order and customer management, reports
   - **Staff**: Order creation and basic operations

### Managing Existing Users

#### User List View
- Search users by name or email
- Filter by role or status
- Sort by name, role, or created date
- View user activity status

#### User Actions
- **Edit Profile**: Update name, email, role
- **Reset Password**: Generate new temporary password
- **Deactivate Account**: Disable user access (preserves data)
- **Delete Account**: Remove user (requires confirmation)
- **View Activity**: Check user's recent actions

### User Permissions Matrix

| Permission | Admin | Manager | Staff |
|------------|-------|---------|-------|
| Create Orders | ✅ | ✅ | ✅ |
| View All Orders | ✅ | ✅ | ❌ |
| Edit Any Order | ✅ | ✅ | ❌ |
| Cancel Orders | ✅ | ✅ | ❌ |
| Delete Orders | ✅ | ❌ | ❌ |
| Manage Customers | ✅ | ✅ | ✅* |
| Financial Reports | ✅ | ✅ | ❌ |
| User Management | ✅ | ❌ | ❌ |
| System Settings | ✅ | ✅** | ❌ |
| Audit Logs | ✅ | ❌ | ❌ |

*Staff: Read-only customer access
**Manager: Limited settings access

## System Configuration

### Business Settings

#### Basic Information
- **Business Name**: Your laundry business name
- **Address**: Physical business address
- **Phone**: Contact phone number
- **Email**: Business email address
- **Website**: Business website URL
- **Logo**: Upload business logo (PNG/JPG, max 2MB)

#### Operating Hours
- Set business hours for each day of the week
- Define holiday schedules
- Configure pickup/delivery time slots
- Set advance booking requirements

### Service Pricing Management

#### Service Types Configuration
1. **Add New Service**
   - Service name (e.g., "Wash & Fold")
   - Price per unit
   - Unit type (kg, piece, bundle)
   - Service description
   - Active status

2. **Edit Existing Services**
   - Update pricing
   - Modify service descriptions
   - Activate/deactivate services
   - Set promotional pricing

#### Add-on Services
- Configure additional services
- Set pricing for each add-on
- Define availability rules
- Group related add-ons

### Payment Methods Setup

#### Supported Payment Types
1. **Cash Payments**
   - Enable/disable cash acceptance
   - Set cash handling procedures

2. **Digital Payments**
   - **GCash**: Configure merchant details
   - **PayMaya**: Set up merchant account
   - **Bank Transfer**: Add bank account details

#### Payment Processing Rules
- Set default payment terms
- Configure partial payment policies
- Define refund procedures
- Set late payment fees

## Reporting and Analytics

### Financial Reports

#### Revenue Reports
- Daily revenue summary
- Monthly revenue trends
- Payment method breakdown
- Outstanding payments
- Refund summaries

**Generating Reports:**
1. Navigate to Reports → Financial
2. Select date range
3. Choose report type
4. Apply filters (payment method, user, etc.)
5. Generate and download

#### Profit Analysis
- Revenue vs. operational costs
- Service profitability analysis
- Customer lifetime value
- Growth trends

### Operational Reports

#### Order Analytics
- Order volume trends
- Service popularity
- Processing time analysis
- Customer satisfaction metrics

#### Staff Performance
- Orders processed per staff member
- Average processing times
- Customer feedback scores
- Productivity metrics

### Customer Analytics
- New customer acquisition
- Customer retention rates
- Average order frequency
- Customer preferences

## Audit and Monitoring

### Audit Log Management

#### Viewing Audit Logs
1. **Navigate to Audit Logs**
   - Go to Settings → Audit Logs
   - View chronological activity list

2. **Filter and Search**
   - Filter by user, action type, date range
   - Search by specific records or actions
   - Export logs for compliance

#### Audit Log Information
- **User**: Who performed the action
- **Action**: What was done
- **Table/Record**: What was affected
- **Timestamp**: When it occurred
- **IP Address**: Where it came from
- **Changes**: Before/after data

### System Monitoring

#### Performance Metrics
- System response times
- Database query performance
- User session statistics
- Error rates and types

#### Security Monitoring
- Failed login attempts
- Unusual access patterns
- Permission changes
- Data export activities

## Data Management

### Backup and Recovery

#### Automated Backups
- Daily database backups
- Weekly full system backups
- Monthly archive backups
- Real-time data replication

#### Manual Backup Creation
1. Navigate to Settings → Data Management
2. Click "Create Backup"
3. Select backup type (Database/Full System)
4. Add backup description
5. Initiate backup process

#### Data Recovery Procedures
1. **Identify Recovery Point**
   - Choose specific date/time
   - Verify backup availability

2. **Recovery Process**
   - Contact technical support
   - Provide backup details
   - Follow recovery procedures

### Data Export and Import

#### Data Export Options
- **Customer Data**: Export customer database
- **Order History**: Export order records
- **Financial Data**: Export payment/revenue data
- **System Logs**: Export audit trails

#### Data Import Procedures
- **Customer Import**: Bulk customer data upload
- **Service Import**: Import service pricing
- **User Import**: Bulk user account creation

### Data Retention Policies

#### Standard Retention Periods
- **Orders**: 7 years (tax compliance)
- **Customer Data**: 5 years (business records)
- **Audit Logs**: 3 years (security compliance)
- **Financial Records**: 7 years (legal requirement)

## Security Administration

### User Security Management

#### Password Policies
- Minimum password requirements
- Password expiry settings
- Account lockout policies
- Password reset procedures

#### Two-Factor Authentication
- Enable/disable 2FA for all users
- Set 2FA requirements by role
- Manage backup codes
- Monitor 2FA usage

### System Security

#### Access Control
- Configure IP restrictions
- Set session timeout values
- Manage API access keys
- Control file upload permissions

#### Security Monitoring
- Review failed login attempts
- Monitor suspicious activities
- Check system vulnerabilities
- Manage security alerts

## Troubleshooting Common Issues

### User Issues

#### Login Problems
**Issue**: User cannot log in
**Solutions:**
1. Check if account is active
2. Verify email address is correct
3. Reset password if needed
4. Check for IP restrictions
5. Review audit logs for clues

#### Permission Errors
**Issue**: User gets "Access Denied" errors
**Solutions:**
1. Verify user role assignments
2. Check specific permissions
3. Review recent permission changes
4. Test with admin account

### System Issues

#### Performance Problems
**Issue**: System running slowly
**Solutions:**
1. Check database performance
2. Review server resource usage
3. Analyze query execution times
4. Clear temporary files/cache

#### Data Sync Issues
**Issue**: Data not updating in real-time
**Solutions:**
1. Check internet connectivity
2. Verify database connections
3. Review real-time subscription status
4. Clear browser cache

## Maintenance Tasks

### Daily Tasks
- [ ] Review new orders and alerts
- [ ] Check system health dashboard
- [ ] Monitor failed login attempts
- [ ] Verify backup completion
- [ ] Review customer feedback

### Weekly Tasks
- [ ] Generate weekly reports
- [ ] Review user activity logs
- [ ] Check data storage usage
- [ ] Update service pricing if needed
- [ ] Review security alerts

### Monthly Tasks
- [ ] Comprehensive system backup
- [ ] User access review
- [ ] Performance analysis
- [ ] Security audit
- [ ] Update system documentation

### Quarterly Tasks
- [ ] Full security assessment
- [ ] User training review
- [ ] System optimization
- [ ] Disaster recovery testing
- [ ] Compliance review

## Emergency Procedures

### System Outage Response

#### Immediate Actions
1. **Assess Impact**
   - Determine affected systems
   - Estimate user impact
   - Check backup systems

2. **Communication**
   - Notify users of outage
   - Provide status updates
   - Set expectations for resolution

3. **Recovery Process**
   - Follow disaster recovery plan
   - Restore from backups if needed
   - Verify system functionality

### Data Breach Response

#### Incident Response Steps
1. **Containment**
   - Isolate affected systems
   - Preserve evidence
   - Prevent further damage

2. **Assessment**
   - Determine scope of breach
   - Identify compromised data
   - Assess legal obligations

3. **Notification**
   - Notify affected users
   - Report to authorities if required
   - Document incident details

## Support and Resources

### Getting Help
- **Technical Support**: Contact system vendor
- **User Manual**: Reference documentation
- **Community Forums**: User discussions
- **Training Resources**: Video tutorials

### Contact Information
- **Emergency Support**: 24/7 technical hotline
- **Business Hours Support**: Monday-Friday, 9 AM - 6 PM
- **Email Support**: support@laundry-system.com
- **Documentation**: docs.laundry-system.com

---

*Next: [Staff User Guide](./staff-guide.md)*
