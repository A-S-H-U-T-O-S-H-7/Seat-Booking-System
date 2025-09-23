import { useState } from 'react';
import { useRouter } from 'next/router';
import { useTheme } from '@/context/ThemeContext';
import { useAdmin } from '@/context/AdminContext';
import { filterMenuItems } from '@/utils/permissionUtils';
import { PERMISSIONS } from '@/utils/permissionUtils';
import {
  HomeIcon,
  ChartBarIcon,
  TicketIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export default function AdminMenu() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const { adminUser } = useAdmin();
  const [isOpen, setIsOpen] = useState(false);

  // Define all menu items with their required permissions
  const allMenuItems = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: HomeIcon,
      requiredPermissions: [PERMISSIONS.VIEW_DASHBOARD]
    },
    {
      id: 'stats',
      name: 'Statistics & Reports',
      href: '/admin/stats',
      icon: ChartBarIcon,
      requiredPermissions: [PERMISSIONS.VIEW_STATS]
    },
    {
      id: 'divider1',
      type: 'divider',
      name: 'Booking Management'
    },
    {
      id: 'show-seats',
      name: 'Show Seats',
      href: '/admin/show-seats',
      icon: TicketIcon,
      requiredPermissions: [PERMISSIONS.SHOW_SEATS_VIEW, PERMISSIONS.SHOW_SEATS_MANAGE]
    },
    {
      id: 'havan-bookings',
      name: 'Havan Bookings',
      href: '/admin/havan-bookings',
      icon: BuildingOfficeIcon,
      requiredPermissions: [PERMISSIONS.HAVAN_BOOKINGS_VIEW, PERMISSIONS.HAVAN_BOOKINGS_MANAGE]
    },
    {
      id: 'stall-bookings',
      name: 'Stall Bookings',
      href: '/admin/stall-bookings',
      icon: BuildingOfficeIcon,
      requiredPermissions: [PERMISSIONS.STALL_BOOKINGS_VIEW, PERMISSIONS.STALL_BOOKINGS_MANAGE]
    },
    {
      id: 'show-bookings',
      name: 'Show Bookings',
      href: '/admin/show-bookings',
      icon: TicketIcon,
      requiredPermissions: [PERMISSIONS.SHOW_BOOKINGS_VIEW, PERMISSIONS.SHOW_BOOKINGS_MANAGE]
    },
    {
      id: 'divider2',
      type: 'divider',
      name: 'Management'
    },
    {
      id: 'users',
      name: 'User Management',
      href: '/admin/users',
      icon: UserGroupIcon,
      requiredPermissions: [PERMISSIONS.USERS_VIEW, PERMISSIONS.USERS_MANAGE]
    },
    {
      id: 'pricing',
      name: 'Pricing Settings',
      href: '/admin/pricing',
      icon: CurrencyDollarIcon,
      requiredPermissions: [PERMISSIONS.PRICING_VIEW, PERMISSIONS.PRICING_MANAGE]
    },
    {
      id: 'payments',
      name: 'Payment Management',
      href: '/admin/payments',
      icon: CurrencyDollarIcon,
      requiredPermissions: [PERMISSIONS.PAYMENT_MANAGEMENT]
    },
    {
      id: 'settings',
      name: 'System Settings',
      href: '/admin/settings',
      icon: Cog6ToothIcon,
      requiredPermissions: [PERMISSIONS.SYSTEM_SETTINGS]
    },
    {
      id: 'divider3',
      type: 'divider',
      name: 'Advanced'
    },
    {
      id: 'logs',
      name: 'Activity Logs',
      href: '/admin/logs',
      icon: DocumentTextIcon,
      requiredPermissions: [PERMISSIONS.ACTIVITY_LOGS]
    },
    {
      id: 'sync',
      name: 'Real-time Sync',
      href: '/admin/sync',
      icon: ArrowPathIcon,
      requiredPermissions: [PERMISSIONS.REAL_TIME_SYNC]
    },
    {
      id: 'cancellations',
      name: 'Cancellation Management',
      href: '/admin/cancellations',
      icon: ExclamationTriangleIcon,
      requiredPermissions: [PERMISSIONS.CANCELLATION_MANAGEMENT]
    },
    {
      id: 'admins',
      name: 'Admin Management',
      href: '/admin/admins',
      icon: ShieldCheckIcon,
      requiredPermissions: [PERMISSIONS.MANAGE_ADMINS]
    }
  ];

  // Filter menu items based on admin permissions
  const visibleMenuItems = filterMenuItems(allMenuItems, adminUser);

  const handleNavigation = (href) => {
    router.push(href);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className=\"lg:hidden fixed top-4 left-4 z-50\">\n        <button\n          onClick={() => setIsOpen(!isOpen)}\n          className={`p-2 rounded-md ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} shadow-lg`}\n        >\n          {isOpen ? (\n            <XMarkIcon className=\"h-6 w-6\" />\n          ) : (\n            <Bars3Icon className=\"h-6 w-6\" />\n          )}\n        </button>\n      </div>\n\n      {/* Sidebar */}\n      <div className={`${\n        isOpen ? 'translate-x-0' : '-translate-x-full'\n      } lg:translate-x-0 fixed inset-y-0 left-0 z-40 w-64 transition-transform duration-300 ease-in-out ${\n        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'\n      } border-r lg:static lg:inset-0`}>\n        <div className=\"flex flex-col h-full\">\n          {/* Header */}\n          <div className=\"flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700\">\n            <div className=\"flex items-center\">\n              <BuildingOfficeIcon className={`h-8 w-8 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />\n              <span className={`ml-2 text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>\n                Havan Admin\n              </span>\n            </div>\n          </div>\n\n          {/* Navigation */}\n          <nav className=\"flex-1 px-4 py-6 space-y-2 overflow-y-auto\">\n            {visibleMenuItems.map((item) => {\n              if (item.type === 'divider') {\n                return (\n                  <div key={item.id} className=\"pt-6 pb-2\">\n                    <h3 className={`px-3 text-xs font-semibold uppercase tracking-wider ${\n                      isDarkMode ? 'text-gray-400' : 'text-gray-500'\n                    }`}>\n                      {item.name}\n                    </h3>\n                  </div>\n                );\n              }\n\n              const isActive = router.pathname === item.href;\n              const IconComponent = item.icon;\n\n              return (\n                <button\n                  key={item.id}\n                  onClick={() => handleNavigation(item.href)}\n                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${\n                    isActive\n                      ? (isDarkMode \n                          ? 'bg-purple-900 text-purple-200 border-purple-700' \n                          : 'bg-purple-100 text-purple-700 border-purple-200'\n                        )\n                      : (isDarkMode\n                          ? 'text-gray-300 hover:bg-gray-700 hover:text-white'\n                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'\n                        )\n                  }`}\n                >\n                  <IconComponent className=\"h-5 w-5 mr-3\" />\n                  {item.name}\n                </button>\n              );\n            })}\n          </nav>\n\n          {/* Footer */}\n          <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>\n            <div className=\"flex items-center\">\n              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${\n                isDarkMode ? 'bg-purple-900 text-purple-300' : 'bg-purple-100 text-purple-600'\n              }`}>\n                {adminUser?.name?.charAt(0)?.toUpperCase() || 'A'}\n              </div>\n              <div className=\"ml-3\">\n                <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>\n                  {adminUser?.name || 'Admin User'}\n                </p>\n                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>\n                  {adminUser?.role === 'super_admin' ? 'Super Admin' : 'Admin'}\n                </p>\n              </div>\n            </div>\n          </div>\n        </div>\n      </div>\n\n      {/* Overlay for mobile */}\n      {isOpen && (\n        <div\n          className=\"fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden\"\n          onClick={() => setIsOpen(false)}\n        />\n      )}\n    </>\n  );\n}
