import { useAdmin } from '@/context/AdminContext';
import { hasPermission, hasAnyPermission, hasAllPermissions } from '@/utils/permissionUtils';

/**
 * PermissionGate component for conditional rendering based on admin permissions
 * 
 * Usage examples:
 * 
 * // Show content if admin has specific permission
 * <PermissionGate permission="havan_bookings_view">
 *   <HavanBookingsTable />
 * </PermissionGate>
 * 
 * // Show content if admin has ANY of the specified permissions
 * <PermissionGate anyOf={['havan_bookings_view', 'havan_bookings_manage']}>
 *   <HavanBookingsSection />
 * </PermissionGate>
 * 
 * // Show content if admin has ALL of the specified permissions
 * <PermissionGate allOf={['havan_bookings_manage', 'havan_bookings_cancel']}>
 *   <AdminActions />
 * </PermissionGate>
 * 
 * // Show fallback content if no permissions
 * <PermissionGate permission="manage_admins" fallback={<AccessDenied />}>
 *   <AdminManagement />
 * </PermissionGate>
 */
export default function PermissionGate({ 
  permission,
  anyOf,
  allOf,
  children,
  fallback = null,
  showFallback = true
}) {
  const { adminUser } = useAdmin();

  // Determine if access should be granted
  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(adminUser, permission);
  } else if (anyOf && anyOf.length > 0) {
    hasAccess = hasAnyPermission(adminUser, anyOf);
  } else if (allOf && allOf.length > 0) {
    hasAccess = hasAllPermissions(adminUser, allOf);
  } else {
    // If no permissions specified, allow access
    hasAccess = true;
  }

  if (hasAccess) {
    return children;
  }

  // Show fallback content if access denied
  if (showFallback) {
    return fallback;
  }

  // Return null if no fallback should be shown
  return null;
}

/**
 * Hook for checking permissions in components
 * 
 * Usage:
 * const { hasPermission: checkPermission, hasAnyPermission: checkAnyPermission } = usePermissions();
 * 
 * if (checkPermission('havan_bookings_manage')) {
 *   // Show admin actions
 * }
 */
export function usePermissions() {
  const { adminUser } = useAdmin();

  return {
    hasPermission: (permission) => hasPermission(adminUser, permission),
    hasAnyPermission: (permissions) => hasAnyPermission(adminUser, permissions),
    hasAllPermissions: (permissions) => hasAllPermissions(adminUser, permissions),
    isSuperAdmin: () => adminUser?.role === 'super_admin',
    isAdmin: () => adminUser?.role === 'admin',
    getCurrentPermissions: () => adminUser?.permissions || []
  };
}
