# Admin Activity Logging System

A comprehensive activity logging system for tracking all admin and super admin actions in the Havan seat booking system.

## Overview

This system provides:
- **Real-time activity tracking** for all admin actions
- **Detailed audit trail** with timestamps, IP addresses, and user agents
- **Beautiful admin interface** with filtering and search capabilities
- **CSV export functionality** for compliance and reporting
- **Responsive design** with dark/light theme support
- **Permission-based access control** for viewing logs

## Features

### ✅ Complete Activity Tracking
- Login/logout events
- CRUD operations on all entities (bookings, users, events, admins, etc.)
- Settings modifications
- Payment-related activities
- System configuration changes

### ✅ Rich Metadata
- Timestamp with timezone
- Admin ID, name, and role
- Action type (create, read, update, delete)
- Entity type and ID
- Detailed descriptions
- IP address tracking
- Browser/user agent information
- Session tracking

### ✅ Advanced Filtering & Search
- Date range filters (today, yesterday, last 7 days, last 30 days)
- Action type filtering
- Admin-specific filtering
- Real-time search across all fields
- Pagination for large datasets

### ✅ Export & Reporting
- CSV export with all log details
- Automated filename with timestamps
- Compliance-ready format

## Installation & Setup

### 1. Files Added

The following files have been created for the logging system:

```
src/
├── components/admin/
│   └── ActivityLogs.jsx          # Main logs component
├── lib/
│   ├── adminLogger.js            # Logging utility class
│   └── createSampleLogs.js       # Sample data generator
└── ADMIN_LOGGING_GUIDE.md        # This documentation
```

### 2. Dashboard Integration

The Activity Logs tab has been integrated into your admin dashboard (`src/app/(admin)/admin/dashboard/page.jsx`):

- Added `DocumentTextIcon` import
- Added `ActivityLogs` component import
- Added logs navigation item with `view_logs` permission
- Added logs case in `renderContent()` function

### 3. Firebase Collection

The system uses a `adminLogs` collection in Firestore with the following structure:

```javascript
{
  adminId: "admin_uid_123",
  adminName: "John Doe",
  adminRole: "super_admin",
  action: "create",
  entityType: "booking",
  entityId: "booking_abc123",
  details: "Created booking for 5 seats",
  timestamp: Timestamp,
  ipAddress: "192.168.1.100",
  userAgent: "Mozilla/5.0...",
  sessionId: "session_xyz789"
}
```

## Usage

### Basic Logging

```javascript
import adminLogger from '@/lib/adminLogger';

// In your admin action handler
const handleCreateBooking = async (bookingData) => {
  try {
    // Your booking creation logic
    const booking = await createBooking(bookingData);
    
    // Log the activity
    await adminLogger.logBookingActivity(
      adminUser,
      'create',
      booking.id,
      `Created booking for ${bookingData.seats.length} seats`
    );
    
    toast.success('Booking created successfully');
  } catch (error) {
    console.error(error);
    toast.error('Failed to create booking');
  }
};
```

### Specific Entity Logging

```javascript
// Booking activities
await adminLogger.logBookingActivity(adminUser, 'update', bookingId, 'Changed status to confirmed');
await adminLogger.logBookingActivity(adminUser, 'delete', bookingId, 'Cancelled booking');

// User management
await adminLogger.logUserActivity(adminUser, 'create', userId, 'Created new user account');
await adminLogger.logUserActivity(adminUser, 'update', userId, 'Updated user permissions');

// Admin management
await adminLogger.logAdminActivity(adminUser, 'create', newAdminId, 'Added new admin user');
await adminLogger.logAdminActivity(adminUser, 'delete', adminId, 'Removed admin access');

// Event management
await adminLogger.logEventActivity(adminUser, 'create', eventId, 'Created new Havan event');
await adminLogger.logEventActivity(adminUser, 'update', eventId, 'Updated event schedule');

// Settings changes
await adminLogger.logSettingsActivity(adminUser, 'update', 'pricing', 'Changed seat price to ₹600');
await adminLogger.logSettingsActivity(adminUser, 'update', 'general', 'Updated system configuration');

// Payment activities
await adminLogger.logPaymentActivity(adminUser, 'update', paymentId, 'Processed refund');

// System activities
await adminLogger.logSystemActivity(adminUser, 'update', 'database', 'Updated database indexes');
```

### Login/Logout Logging

```javascript
// In your login handler
import adminLogger from '@/lib/adminLogger';

const handleLogin = async (credentials) => {
  try {
    const user = await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
    const adminData = await getAdminData(user.uid);
    
    // Log login activity
    await adminLogger.logLogin(
      user.uid,
      adminData.name,
      adminData.role,
      await adminLogger.getClientIP(),
      adminLogger.getUserAgent()
    );
    
    setAdminUser(adminData);
  } catch (error) {
    console.error('Login failed:', error);
  }
};

// In your logout handler
const handleLogout = async () => {
  try {
    // Log logout before signing out
    await adminLogger.logLogout(
      adminUser.uid,
      adminUser.name,
      adminUser.role,
      await adminLogger.getClientIP(),
      adminLogger.getUserAgent()
    );
    
    await signOut(auth);
  } catch (error) {
    console.error('Logout error:', error);
  }
};
```

### Automatic Context Logging

```javascript
// Automatically includes IP and user agent
await adminLogger.logWithContext(
  adminUser,
  'update',
  'booking',
  bookingId,
  'Updated payment status'
);
```

### Batch Logging

```javascript
// For bulk operations
const activities = [
  {
    adminId: adminUser.uid,
    adminName: adminUser.name,
    adminRole: adminUser.role,
    action: 'delete',
    entityType: 'booking',
    entityId: 'booking_1',
    details: 'Bulk cancellation'
  },
  {
    adminId: adminUser.uid,
    adminName: adminUser.name,
    adminRole: adminUser.role,
    action: 'delete',
    entityType: 'booking',
    entityId: 'booking_2',
    details: 'Bulk cancellation'
  }
];

const result = await adminLogger.logBatch(activities);
console.log(`Logged ${result.successful} activities, ${result.failed} failed`);
```

## Integration Examples

### 1. Booking Management Integration

```javascript
// In BookingManagement.jsx
import adminLogger from '@/lib/adminLogger';

const handleUpdateBookingStatus = async (bookingId, newStatus) => {
  try {
    await updateDoc(doc(db, 'bookings', bookingId), { status: newStatus });
    
    // Log the activity
    await adminLogger.logBookingActivity(
      adminUser,
      'update',
      bookingId,
      `Changed booking status to ${newStatus}`
    );
    
    toast.success('Booking status updated');
    fetchBookings(); // Refresh data
  } catch (error) {
    console.error('Error updating booking:', error);
    toast.error('Failed to update booking');
  }
};
```

### 2. User Management Integration

```javascript
// In UserManagement.jsx
import adminLogger from '@/lib/adminLogger';

const handleDeleteUser = async (userId) => {
  if (!confirm('Are you sure you want to delete this user?')) return;
  
  try {
    // Delete user logic here
    await deleteUser(userId);
    
    // Log the activity
    await adminLogger.logUserActivity(
      adminUser,
      'delete',
      userId,
      'Deleted user account'
    );
    
    toast.success('User deleted successfully');
    fetchUsers(); // Refresh data
  } catch (error) {
    console.error('Error deleting user:', error);
    toast.error('Failed to delete user');
  }
};
```

### 3. Admin Context Integration

```javascript
// In AdminContext.jsx - Update the login function
import adminLogger from '@/lib/adminLogger';

// Update your existing login tracking
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const adminDoc = await getDoc(doc(db, 'admins', user.uid));
        
        if (adminDoc.exists()) {
          const data = adminDoc.data();
          const adminInfo = {
            uid: user.uid,
            email: user.email,
            name: data.name,
            role: data.role,
            permissions: data.permissions || [],
            createdAt: data.createdAt,
            lastLogin: data.lastLogin
          };
          
          setAdminUser(adminInfo);
          
          // Log login activity
          await adminLogger.logLogin(
            user.uid,
            data.name,
            data.role
          );
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
      }
    }
  });

  return unsubscribe;
}, []);

// Update your logout function
const logout = async () => {
  try {
    // Log logout before signing out
    if (adminUser) {
      await adminLogger.logLogout(
        adminUser.uid,
        adminUser.name,
        adminUser.role
      );
    }
    
    await signOut(auth);
    setAdminUser(null);
    router.push('/admin/login');
  } catch (error) {
    console.error('Admin logout error:', error);
    throw error;
  }
};
```

## Permissions

### Required Permission

Add the `view_logs` permission to your admin permissions system:

```javascript
const availablePermissions = [
  { id: 'view_events', name: 'View Events' },
  { id: 'manage_seats', name: 'Manage Seats' },
  { id: 'view_bookings', name: 'View Bookings' },
  { id: 'manage_bookings', name: 'Manage Bookings' },
  { id: 'view_users', name: 'View Users' },
  { id: 'manage_users', name: 'Manage Users' },
  { id: 'manage_pricing', name: 'Manage Pricing' },
  { id: 'manage_admins', name: 'Manage Admins' },
  { id: 'view_logs', name: 'View Activity Logs' }, // Add this
  { id: 'view_reports', name: 'View Reports' }
];
```

### Access Control

- **Super Admins**: Automatically have access to view all logs
- **Regular Admins**: Need the `view_logs` permission explicitly granted
- **Filtering**: Admins can only see logs if they have the appropriate permissions

## Firebase Security Rules

Add these Firestore security rules to protect the logs collection:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Admin Logs - Only admins can read, only system can write
    match /adminLogs/{logId} {
      allow read: if request.auth != null && 
        exists(/databases/$(database)/documents/admins/$(request.auth.uid));
      allow write: if false; // Only server-side writes allowed
    }
  }
}
```

## Testing

### 1. Create Sample Data

```javascript
// Run this once to create sample logs
import createSampleLogs from '@/lib/createSampleLogs';

// In your browser console or a test component
createSampleLogs().then(result => {
  if (result.success) {
    console.log(`Created ${result.count} sample logs`);
  } else {
    console.error('Failed to create sample logs:', result.error);
  }
});
```

### 2. Test Logging Functions

```javascript
// Test individual logging functions
import adminLogger from '@/lib/adminLogger';

const testLogging = async () => {
  const testAdmin = {
    uid: 'test_admin_123',
    name: 'Test Admin',
    role: 'admin'
  };
  
  // Test different log types
  await adminLogger.logBookingActivity(testAdmin, 'create', 'test_booking_1', 'Test booking creation');
  await adminLogger.logUserActivity(testAdmin, 'update', 'test_user_1', 'Test user update');
  await adminLogger.logSystemActivity(testAdmin, 'update', 'settings', 'Test system update');
  
  console.log('Test logs created successfully');
};
```

## Performance Considerations

### 1. Async Logging
All logging operations are asynchronous and won't block your main application flow:

```javascript
// Logging won't block the main operation
const result = await performCriticalOperation();
adminLogger.logBookingActivity(adminUser, 'create', result.id, 'Created successfully'); // Fire and forget
return result;
```

### 2. Error Handling
The logger is designed to never throw errors that could break your application:

```javascript
// If logging fails, it will only console.error() but won't throw
await adminLogger.log({ /* log data */ }); // Safe to use
```

### 3. Batch Operations
Use batch logging for multiple related operations:

```javascript
// More efficient than individual logs
await adminLogger.logBatch(multipleActivities);
```

## Troubleshooting

### Common Issues

1. **Logs not appearing**: Check Firebase permissions and ensure the `adminLogs` collection exists
2. **Permission errors**: Verify the user has `view_logs` permission or is a super admin
3. **Timestamp issues**: Ensure Firebase timestamp is used, not JavaScript Date
4. **IP address not showing**: IP detection only works in browser environment with external services

### Debug Mode

Enable debug logging by checking the browser console for adminLogger messages:

```javascript
// The logger automatically logs its activities to console
console.log('Admin activity logged:', { admin, action, entityType });
```

## Best Practices

### 1. Consistent Naming
- Use consistent entity types: `booking`, `user`, `admin`, `event`, `seat`, `settings`, `payment`, `system`
- Use consistent actions: `create`, `read`, `update`, `delete`, `login`, `logout`
- Use descriptive details that provide context

### 2. Sensitive Data
- Never log sensitive information (passwords, payment details, personal data)
- Log only IDs and action descriptions
- Consider GDPR compliance when logging user activities

### 3. Performance
- Use batch logging for bulk operations
- Don't wait for logging to complete if it's not critical
- Consider rate limiting for high-frequency actions

### 4. Maintenance
- Regularly archive old logs (consider implementing log rotation)
- Monitor storage usage in Firebase
- Set up alerts for unusual admin activity patterns

## Future Enhancements

### Possible Additions
- **Real-time notifications** for critical admin actions
- **Automated alerts** for suspicious activities
- **Advanced analytics** and reporting dashboards
- **Log retention policies** with automatic archiving
- **Integration with external SIEM systems**
- **Advanced search** with Elasticsearch
- **Activity patterns analysis**
- **Compliance reporting** templates

## Security Considerations

1. **Access Control**: Only authorized admins can view logs
2. **Immutable Logs**: Prevent log modification after creation
3. **Secure Transport**: All data transmitted over HTTPS
4. **Data Privacy**: Personal information is not logged
5. **Audit Trail**: Complete audit trail for compliance

## Support

For issues or questions about the logging system:

1. Check this documentation first
2. Verify Firebase permissions and security rules
3. Check browser console for error messages
4. Test with sample data using `createSampleLogs()`
5. Ensure all required imports are in place

The logging system is designed to be robust, secure, and easy to use while providing comprehensive activity tracking for your admin panel.
