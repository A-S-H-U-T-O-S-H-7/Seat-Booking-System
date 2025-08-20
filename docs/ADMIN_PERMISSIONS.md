# Admin Permission System

This document explains how to use the comprehensive permission system implemented for the Havan Seat Booking admin interface.

## Overview

The permission system allows Super Admins to control which pages and features regular admins can access. When adding a new admin, the Super Admin can select from a variety of specific permissions grouped by functionality.

## Available Permissions

### Dashboard & Overview
- **Dashboard Overview** (`view_dashboard`) - Access to main dashboard
- **Statistics & Reports** (`view_stats`) - View analytics and reports

### Show Seats Management
- **View Show Seats** (`show_seats_view`) - View show seat configurations
- **Manage Show Seats** (`show_seats_manage`) - Edit and manage show seats

### Havan Bookings
- **View Havan Bookings** (`havan_bookings_view`) - View havan booking list
- **Manage Havan Bookings** (`havan_bookings_manage`) - Edit havan bookings
- **Cancel Havan Bookings** (`havan_bookings_cancel`) - Cancel havan bookings
- **Manage Havan Payments** (`havan_bookings_payment`) - Handle payment operations

### Stall Bookings
- **View Stall Bookings** (`stall_bookings_view`) - View stall booking list
- **Manage Stall Bookings** (`stall_bookings_manage`) - Edit stall bookings
- **Cancel Stall Bookings** (`stall_bookings_cancel`) - Cancel stall bookings
- **Manage Stall Payments** (`stall_bookings_payment`) - Handle payment operations

### Show Bookings
- **View Show Bookings** (`show_bookings_view`) - View show booking list
- **Manage Show Bookings** (`show_bookings_manage`) - Edit show bookings
- **Cancel Show Bookings** (`show_bookings_cancel`) - Cancel show bookings

### User Management
- **View Users** (`users_view`) - View user accounts
- **Manage Users** (`users_manage`) - Edit and manage users

### Pricing & Settings
- **View Pricing** (`pricing_view`) - View pricing configurations
- **Manage Pricing** (`pricing_manage`) - Edit pricing settings
- **System Settings** (`system_settings`) - Access system configuration

### Advanced Features
- **Activity Logs** (`activity_logs`) - View system activity logs
- **Real-time Sync Status** (`real_time_sync`) - Monitor synchronization
- **Cancellation Management** (`cancellation_management`) - Advanced cancellation tools
- **Manage Admins** (`manage_admins`) - Add/edit admin users (Super Admin only)

## How to Use

### Adding a New Admin

1. Navigate to **Admin Management** (only Super Admins can access this)
2. Click **Add Admin** button
3. Fill in admin details:
   - Name (required)
   - Email (required)
   - Role (Admin or Super Admin)
4. If Role is "Admin", select specific permissions:
   - Use **Select All** / **Clear All** for quick selection
   - Permissions are organized in logical groups
   - Check individual permissions as needed
5. Click **Add Admin** to save

### Editing Admin Permissions

1. In the Admin Management table, click the edit (pencil) icon
2. Modify the admin's name or role
3. Update permissions if the role is "Admin"
4. Click **Update Admin** to save changes

### Super Admin vs Regular Admin

- **Super Admin**: Has access to all features automatically
- **Regular Admin**: Only has access to explicitly granted permissions

## Implementation Files

### Core Components

1. **AdminManagement.jsx** - Main admin management interface
2. **PermissionGate.jsx** - Component for conditional rendering based on permissions
3. **AdminMenu.jsx** - Navigation menu with permission-based filtering

### Utility Files

1. **permissionUtils.js** - Core permission checking functions
2. **AdminContext.jsx** - Context for admin authentication state

### Key Functions

```javascript
// Check if admin has specific permission
hasPermission(admin, 'havan_bookings_view')

// Check if admin has any of the permissions
hasAnyPermission(admin, ['havan_bookings_view', 'havan_bookings_manage'])

// Check if admin has all permissions
hasAllPermissions(admin, ['havan_bookings_manage', 'havan_bookings_cancel'])

// Filter menu items based on permissions
filterMenuItems(menuItems, admin)

// Check route access
canAccessRoute(admin, '/admin/havan-bookings')
```

## Usage Examples

### Conditional Rendering with PermissionGate

```jsx
import PermissionGate from '@/components/admin/PermissionGate';
import { PERMISSIONS } from '@/utils/permissionUtils';

// Show content only if admin has permission
<PermissionGate permission={PERMISSIONS.HAVAN_BOOKINGS_VIEW}>
  <HavanBookingsTable />
</PermissionGate>

// Show content if admin has any of the permissions
<PermissionGate anyOf={['havan_bookings_view', 'havan_bookings_manage']}>
  <HavanBookingsSection />
</PermissionGate>

// Show fallback content if no permission
<PermissionGate 
  permission={PERMISSIONS.MANAGE_ADMINS} 
  fallback={<AccessDeniedMessage />}
>
  <AdminManagement />
</PermissionGate>
```

### Using Permission Hooks

```jsx
import { usePermissions } from '@/components/admin/PermissionGate';

function BookingActions() {
  const { hasPermission, isSuperAdmin } = usePermissions();

  return (
    <div>
      {hasPermission('havan_bookings_manage') && (
        <button>Edit Booking</button>
      )}
      {hasPermission('havan_bookings_cancel') && (
        <button>Cancel Booking</button>
      )}
      {isSuperAdmin() && (
        <button>Advanced Options</button>
      )}
    </div>
  );
}
```

### Protecting Routes

```jsx
import { canAccessRoute } from '@/utils/permissionUtils';
import { useAdmin } from '@/context/AdminContext';

function ProtectedPage() {
  const { adminUser } = useAdmin();
  
  if (!canAccessRoute(adminUser, '/admin/havan-bookings')) {
    return <AccessDenied />;
  }
  
  return <HavanBookingsPage />;
}
```

## Database Structure

Admin documents in Firestore should have this structure:

```javascript
{
  id: "admin_123456789_abcdef123",
  name: "John Doe",
  email: "john@example.com",
  role: "admin", // or "super_admin"
  permissions: [
    "havan_bookings_view",
    "havan_bookings_manage",
    "stall_bookings_view"
  ],
  isActive: true,
  createdAt: "2024-01-01T00:00:00Z",
  createdBy: "super_admin_id",
  updatedAt: "2024-01-02T00:00:00Z",
  updatedBy: "super_admin_id"
}
```

## Security Notes

1. **Frontend Only**: This is a frontend permission system for UI control
2. **Backend Validation**: Always validate permissions on the backend/API level
3. **Route Protection**: Implement route-level protection for sensitive pages
4. **API Security**: Secure all API endpoints with proper authentication and authorization

## Best Practices

1. **Principle of Least Privilege**: Grant only necessary permissions
2. **Regular Audits**: Review admin permissions periodically
3. **Permission Groups**: Use logical groupings when assigning permissions
4. **Clear Naming**: Use descriptive permission names
5. **Documentation**: Keep permission documentation up to date

## Future Enhancements

1. **Role Templates**: Pre-defined permission sets for common admin types
2. **Permission History**: Track permission changes over time
3. **Bulk Actions**: Apply permissions to multiple admins at once
4. **Advanced Filters**: Filter admins by permissions or role
5. **Permission Dependencies**: Automatic permission dependencies
