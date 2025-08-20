"use client";
import { useState, useEffect } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { 
  CalendarDaysIcon, 
  UsersIcon, 
  CurrencyRupeeIcon, 
  ChartBarIcon,
  Cog6ToothIcon,
  UserPlusIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  SunIcon,
  MoonIcon,
  DocumentTextIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';

// Import admin components
import ProtectedAdminRoute from '@/components/admin/ProtectedAdminRoute';
import SeatManagement from '@/components/admin/SeatManagement';
import ShowSeatManagement from '@/components/admin/ShowSeatManagement';
import StallManagement from '@/components/admin/StallManagement';
import BookingManagement from '@/components/admin/havan-bookings/BookingManagement';
import StallBookingManagement from '@/components/admin/stall-bookings/StallBookingManagement';
import ShowBookingManagement from '@/components/admin/show-bookings/ShowBookingManagement';
import UserManagement from '@/components/admin/UserManagement';
import AdminManagement from '@/components/admin/AdminManagement';
import PriceSettings from '@/components/admin/PriceSettings';
import SystemSettings from '@/components/admin/SystemSettings';
import OverviewStats from '@/components/admin/OverviewStats';
import ActivityLogs from '@/components/admin/ActivityLogs';
import CancellationRefundManagement from '@/components/admin/cancellation-refunds/CancellationRefundManagement';

export default function AdminDashboard() {
  const { adminUser, loading, logout, hasPermission } = useAdmin();
  const { isDarkMode, toggleTheme } = useTheme();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !adminUser) {
      router.push('/admin/login');
    }
  }, [adminUser, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!adminUser) {
    return null;
  }

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Error logging out');
    }
  };

  const navigationItems = [
    {
      id: 'overview',
      name: 'Overview',
      icon: ChartBarIcon,
      permission: 'view_overview' // Now requires permission
    },
    {
      id: 'seats',
      name: 'Havan Seats',
      icon: Cog6ToothIcon,
      permission: 'manage_seats'
    },
    {
      id: 'stalls',
      name: 'Stall Seats',
      icon: Cog6ToothIcon,
      permission: 'manage_stalls'
    },
    {
      id: 'show-seats',
      name: 'Show Seats',
      icon: CalendarDaysIcon,
      permission: 'manage_show_seats' // Separate permission
    },
    {
      id: 'bookings',
      name: 'Havan Bookings',
      icon: UsersIcon,
      permission: 'view_havan_bookings' // Separate permission
    },
    {
      id: 'stall-bookings',
      name: 'Stall Bookings',
      icon: UsersIcon,
      permission: 'view_stall_bookings' // Separate permission
    },
    {
      id: 'show-bookings',
      name: 'Show Bookings',
      icon: UsersIcon,
      permission: 'view_show_bookings' // Separate permission
    },
    {
      id: 'cancellations',
      name: 'Cancellation & Refunds',
      icon: BanknotesIcon,
      permission: 'manage_cancellations'
    },
    {
      id: 'users',
      name: 'User Management',
      icon: UsersIcon,
      permission: 'view_users'
    },
    {
      id: 'pricing',
      name: 'Price Settings',
      icon: CurrencyRupeeIcon,
      permission: 'manage_pricing'
    },
    {
      id: 'system-settings',
      name: 'System Settings',
      icon: Cog6ToothIcon,
      permission: 'manage_settings'
    },
    {
      id: 'admins',
      name: 'Admin Management',
      icon: UserPlusIcon,
      permission: 'manage_admins'
    },
    {
      id: 'logs',
      name: 'Activity Logs',
      icon: DocumentTextIcon,
      permission: 'view_logs'
    }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewStats />;
      case 'seats':
        return <SeatManagement />;
      case 'stalls':
        return <StallManagement />;
      case 'show-seats':
        return <ShowSeatManagement />;
      case 'bookings':
        return <BookingManagement />;
      case 'stall-bookings':
        return <StallBookingManagement />;
      case 'show-bookings':
        return <ShowBookingManagement />;
      case 'cancellations':
        return <CancellationRefundManagement />;
      case 'users':
        return <UserManagement />;
      case 'pricing':
        return <PriceSettings />;
      case 'system-settings':
        return <SystemSettings />;
      case 'admins':
        return <AdminManagement />;
      case 'logs':
        return <ActivityLogs />;
      default:
        return <OverviewStats />;
    }
  };

  return (
    <ProtectedAdminRoute>
      <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        {/* Mobile sidebar backdrop */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-gray-600 bg-opacity-50 lg:hidden" 
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}

        {/* Sidebar */}
        <div className={`
          fixed inset-y-0 left-0 z-50 w-64 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-xl transform transition-transform duration-300 ease-in-out flex flex-col
          lg:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className={`flex items-center justify-center h-20 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <div>
                <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Admin Panel</h1>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Havan Booking System</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto admin-sidebar-nav">
            {(() => {
              const visibleItems = navigationItems.filter(item => 
                !item.permission || hasPermission(item.permission)
              );
              
              // If no visible items, show a message
              if (visibleItems.length === 0) {
                return (
                  <div className={`text-center p-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <ExclamationTriangleIcon className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">No permissions assigned</p>
                    <p className="text-xs mt-1">Contact your Super Admin</p>
                  </div>
                );
              }
              
              return visibleItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150
                    ${activeTab === item.id
                      ? (isDarkMode 
                        ? 'bg-purple-900 text-purple-300 border-r-2 border-purple-400' 
                        : 'bg-purple-100 text-purple-700 border-r-2 border-purple-600')
                      : (isDarkMode
                        ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900')
                    }
                  `}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </button>
              ));
            })()} 
          </nav>

          {/* Theme toggle */}
          <div className="px-4 py-2">
            <button
              onClick={toggleTheme}
              className={`w-full flex items-center justify-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150
                ${isDarkMode 
                  ? 'text-yellow-400 bg-gray-700 hover:bg-gray-600' 
                  : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                }`}
            >
              {isDarkMode ? (
                <>
                  <SunIcon className="w-4 h-4 mr-2" />
                  Light Mode
                </>
              ) : (
                <>
                  <MoonIcon className="w-4 h-4 mr-2" />
                  Dark Mode
                </>
              )}
            </button>
          </div>

          {/* User info and logout */}
          <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {adminUser.name?.charAt(0) || adminUser.email.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {adminUser.name || 'Admin'}
                </p>
                <p className={`text-xs truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{adminUser.email}</p>
                <p className="text-xs text-purple-400 capitalize">{adminUser.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-150"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:ml-64">
          {/* Top bar */}
          <div className={`shadow-sm border-b ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center">
                  <button
                    onClick={() => setIsSidebarOpen(true)}
                    className={`lg:hidden -ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md focus:outline-none focus:ring-2 focus:ring-inset focus:ring-purple-500 transition-colors duration-150
                      ${isDarkMode 
                        ? 'text-gray-400 hover:text-white' 
                        : 'text-gray-500 hover:text-gray-900'
                      }`}
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                  <h2 className={`ml-4 lg:ml-0 text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {navigationItems.find(item => item.id === activeTab)?.name || 'Dashboard'}
                  </h2>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="hidden sm:block">
                    <div className={`flex items-center space-x-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                      <ClockIcon className="w-4 h-4" />
                      <span>{new Date().toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Link
                    href="/"
                    className={`inline-flex items-center px-3 py-1 border rounded-md text-sm font-medium transition-colors duration-150
                      ${isDarkMode
                        ? 'border-gray-600 text-gray-300 bg-gray-800 hover:bg-gray-700'
                        : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                      }`}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Site
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Page content */}
          <main className="py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {renderContent()}
            </div>
          </main>
        </div>
      </div>
    </ProtectedAdminRoute>
  );
}
