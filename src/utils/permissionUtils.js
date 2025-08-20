/**
 * Permission utility functions for admin access control
 */

// Define all available permissions with their categories
export const PERMISSIONS = {
  // Dashboard & Overview
  VIEW_DASHBOARD: 'view_dashboard',
  VIEW_STATS: 'view_stats',
  
  // Show Seats Management
  SHOW_SEATS_VIEW: 'show_seats_view',
  SHOW_SEATS_MANAGE: 'show_seats_manage',
  
  // Havan Bookings
  HAVAN_BOOKINGS_VIEW: 'havan_bookings_view',
  HAVAN_BOOKINGS_MANAGE: 'havan_bookings_manage',
  HAVAN_BOOKINGS_CANCEL: 'havan_bookings_cancel',
  HAVAN_BOOKINGS_PAYMENT: 'havan_bookings_payment',
  
  // Stall Bookings
  STALL_BOOKINGS_VIEW: 'stall_bookings_view',
  STALL_BOOKINGS_MANAGE: 'stall_bookings_manage',
  STALL_BOOKINGS_CANCEL: 'stall_bookings_cancel',
  STALL_BOOKINGS_PAYMENT: 'stall_bookings_payment',
  
  // Show Bookings
  SHOW_BOOKINGS_VIEW: 'show_bookings_view',
  SHOW_BOOKINGS_MANAGE: 'show_bookings_manage',
  SHOW_BOOKINGS_CANCEL: 'show_bookings_cancel',
  
  // User Management
  USERS_VIEW: 'users_view',
  USERS_MANAGE: 'users_manage',
  
  // Pricing & Settings
  PRICING_VIEW: 'pricing_view',
  PRICING_MANAGE: 'pricing_manage',
  PAYMENT_MANAGEMENT: 'payment_management',
  SYSTEM_SETTINGS: 'system_settings',
  
  // Advanced Features
  ACTIVITY_LOGS: 'activity_logs',
  REAL_TIME_SYNC: 'real_time_sync',
  CANCELLATION_MANAGEMENT: 'cancellation_management',
  
  // Admin Management
  MANAGE_ADMINS: 'manage_admins'
};

// Permission groups for UI organization
export const PERMISSION_GROUPS = [
  {
    title: 'Dashboard & Overview',
    permissions: [PERMISSIONS.VIEW_DASHBOARD, PERMISSIONS.VIEW_STATS]
  },
  {
    title: 'Show Seats',
    permissions: [PERMISSIONS.SHOW_SEATS_VIEW, PERMISSIONS.SHOW_SEATS_MANAGE]
  },
  {
    title: 'Havan Bookings',
    permissions: [
      PERMISSIONS.HAVAN_BOOKINGS_VIEW,
      PERMISSIONS.HAVAN_BOOKINGS_MANAGE,
      PERMISSIONS.HAVAN_BOOKINGS_CANCEL,
      PERMISSIONS.HAVAN_BOOKINGS_PAYMENT
    ]
  },
  {
    title: 'Stall Bookings',
    permissions: [
      PERMISSIONS.STALL_BOOKINGS_VIEW,
      PERMISSIONS.STALL_BOOKINGS_MANAGE,
      PERMISSIONS.STALL_BOOKINGS_CANCEL,
      PERMISSIONS.STALL_BOOKINGS_PAYMENT
    ]
  },
  {
    title: 'Show Bookings',
    permissions: [
      PERMISSIONS.SHOW_BOOKINGS_VIEW,
      PERMISSIONS.SHOW_BOOKINGS_MANAGE,
      PERMISSIONS.SHOW_BOOKINGS_CANCEL
    ]
  },
  {
    title: 'User Management',
    permissions: [PERMISSIONS.USERS_VIEW, PERMISSIONS.USERS_MANAGE]
  },
  {
    title: 'Settings & Pricing',
    permissions: [
      PERMISSIONS.PRICING_VIEW,
      PERMISSIONS.PRICING_MANAGE,
      PERMISSIONS.SYSTEM_SETTINGS
    ]
  },
  {
    title: 'Advanced Features',
    permissions: [
      PERMISSIONS.ACTIVITY_LOGS,
      PERMISSIONS.REAL_TIME_SYNC,
      PERMISSIONS.CANCELLATION_MANAGEMENT,
      PERMISSIONS.MANAGE_ADMINS
    ]
  }
];

/**
 * Check if an admin has a specific permission
 * @param {Object} admin - Admin object with role and permissions
 * @param {string} permission - Permission to check
 * @returns {boolean} - Whether the admin has the permission
 */
export const hasPermission = (admin, permission) => {
  if (!admin) return false;
  
  // Super admins have all permissions
  if (admin.role === 'super_admin') return true;
  
  // Check if admin has the specific permission
  return admin.permissions && admin.permissions.includes(permission);
};

/**
 * Check if an admin has any of the specified permissions
 * @param {Object} admin - Admin object with role and permissions
 * @param {string[]} permissions - Array of permissions to check
 * @returns {boolean} - Whether the admin has any of the permissions
 */
export const hasAnyPermission = (admin, permissions) => {
  if (!admin || !permissions || permissions.length === 0) return false;
  
  // Super admins have all permissions
  if (admin.role === 'super_admin') return true;
  
  // Check if admin has any of the permissions
  return permissions.some(permission => 
    admin.permissions && admin.permissions.includes(permission)
  );
};

/**
 * Check if an admin has all of the specified permissions
 * @param {Object} admin - Admin object with role and permissions
 * @param {string[]} permissions - Array of permissions to check
 * @returns {boolean} - Whether the admin has all of the permissions
 */
export const hasAllPermissions = (admin, permissions) => {
  if (!admin || !permissions || permissions.length === 0) return false;
  
  // Super admins have all permissions
  if (admin.role === 'super_admin') return true;
  
  // Check if admin has all permissions
  return permissions.every(permission => 
    admin.permissions && admin.permissions.includes(permission)
  );
};

/**
 * Filter menu items based on admin permissions
 * @param {Array} menuItems - Array of menu items with required permissions
 * @param {Object} admin - Admin object
 * @returns {Array} - Filtered menu items
 */
export const filterMenuItems = (menuItems, admin) => {
  if (!admin) return [];
  
  return menuItems.filter(item => {
    // If no permissions required, show the item
    if (!item.requiredPermissions || item.requiredPermissions.length === 0) {
      return true;
    }
    
    // Check if admin has any of the required permissions
    return hasAnyPermission(admin, item.requiredPermissions);
  });
};

/**
 * Get admin permissions as a readable list
 * @param {Object} admin - Admin object
 * @returns {string[]} - Array of readable permission names
 */
export const getReadablePermissions = (admin) => {
  if (!admin) return [];
  
  if (admin.role === 'super_admin') {
    return ['All Permissions'];
  }
  
  if (!admin.permissions || admin.permissions.length === 0) {
    return ['No Permissions'];
  }
  
  // Map permission IDs to readable names
  const permissionMap = {
    [PERMISSIONS.VIEW_DASHBOARD]: 'Dashboard Overview',
    [PERMISSIONS.VIEW_STATS]: 'Statistics & Reports',
    [PERMISSIONS.SHOW_SEATS_VIEW]: 'View Show Seats',
    [PERMISSIONS.SHOW_SEATS_MANAGE]: 'Manage Show Seats',
    [PERMISSIONS.HAVAN_BOOKINGS_VIEW]: 'View Havan Bookings',
    [PERMISSIONS.HAVAN_BOOKINGS_MANAGE]: 'Manage Havan Bookings',
    [PERMISSIONS.HAVAN_BOOKINGS_CANCEL]: 'Cancel Havan Bookings',
    [PERMISSIONS.HAVAN_BOOKINGS_PAYMENT]: 'Manage Havan Payments',
    [PERMISSIONS.STALL_BOOKINGS_VIEW]: 'View Stall Bookings',
    [PERMISSIONS.STALL_BOOKINGS_MANAGE]: 'Manage Stall Bookings',
    [PERMISSIONS.STALL_BOOKINGS_CANCEL]: 'Cancel Stall Bookings',
    [PERMISSIONS.STALL_BOOKINGS_PAYMENT]: 'Manage Stall Payments',
    [PERMISSIONS.SHOW_BOOKINGS_VIEW]: 'View Show Bookings',
    [PERMISSIONS.SHOW_BOOKINGS_MANAGE]: 'Manage Show Bookings',
    [PERMISSIONS.SHOW_BOOKINGS_CANCEL]: 'Cancel Show Bookings',
    [PERMISSIONS.USERS_VIEW]: 'View Users',
    [PERMISSIONS.USERS_MANAGE]: 'Manage Users',
    [PERMISSIONS.PRICING_VIEW]: 'View Pricing',
    [PERMISSIONS.PRICING_MANAGE]: 'Manage Pricing',
    [PERMISSIONS.PAYMENT_MANAGEMENT]: 'Payment Management',
    [PERMISSIONS.SYSTEM_SETTINGS]: 'System Settings',
    [PERMISSIONS.ACTIVITY_LOGS]: 'Activity Logs',
    [PERMISSIONS.REAL_TIME_SYNC]: 'Real-time Sync Status',
    [PERMISSIONS.CANCELLATION_MANAGEMENT]: 'Cancellation Management',
    [PERMISSIONS.MANAGE_ADMINS]: 'Manage Admins'
  };
  
  return admin.permissions.map(permission => 
    permissionMap[permission] || permission
  );
};

/**
 * Check if admin can access a specific route/page
 * @param {Object} admin - Admin object
 * @param {string} route - Route path
 * @returns {boolean} - Whether admin can access the route
 */
export const canAccessRoute = (admin, route) => {
  // Route to permission mapping
  const routePermissions = {
    '/admin': [PERMISSIONS.VIEW_DASHBOARD],
    '/admin/dashboard': [PERMISSIONS.VIEW_DASHBOARD],
    '/admin/show-seats': [PERMISSIONS.SHOW_SEATS_VIEW, PERMISSIONS.SHOW_SEATS_MANAGE],
    '/admin/havan-bookings': [PERMISSIONS.HAVAN_BOOKINGS_VIEW, PERMISSIONS.HAVAN_BOOKINGS_MANAGE],
    '/admin/stall-bookings': [PERMISSIONS.STALL_BOOKINGS_VIEW, PERMISSIONS.STALL_BOOKINGS_MANAGE],
    '/admin/show-bookings': [PERMISSIONS.SHOW_BOOKINGS_VIEW, PERMISSIONS.SHOW_BOOKINGS_MANAGE],
    '/admin/users': [PERMISSIONS.USERS_VIEW, PERMISSIONS.USERS_MANAGE],
    '/admin/pricing': [PERMISSIONS.PRICING_VIEW, PERMISSIONS.PRICING_MANAGE],
    '/admin/payments': [PERMISSIONS.PAYMENT_MANAGEMENT],
    '/admin/settings': [PERMISSIONS.SYSTEM_SETTINGS],
    '/admin/logs': [PERMISSIONS.ACTIVITY_LOGS],
    '/admin/sync': [PERMISSIONS.REAL_TIME_SYNC],
    '/admin/cancellations': [PERMISSIONS.CANCELLATION_MANAGEMENT],
    '/admin/admins': [PERMISSIONS.MANAGE_ADMINS]
  };
  
  const requiredPermissions = routePermissions[route];
  
  if (!requiredPermissions) {
    // If no specific permissions required, allow access
    return true;
  }
  
  return hasAnyPermission(admin, requiredPermissions);
};
