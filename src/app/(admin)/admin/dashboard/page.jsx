"use client";
import { useState, useEffect } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

// Import admin components
import ProtectedAdminRoute from '@/components/admin/ProtectedAdminRoute';
import SeatManagement from '@/components/admin/SeatManagement';
import ShowSeatManagement from '@/components/admin/ShowSeatManagement';
import StallManagement from '@/components/admin/StallManagement';
import BookingManagement from '@/components/admin/havan-bookings/BookingManagement';
import StallBookingManagement from '@/components/admin/stall-bookings/StallBookingManagement';
import ShowBookingManagement from '@/components/admin/show-bookings/ShowBookingManagement';
import DelegateManagement from '@/components/admin/delegate-bookings/DelegateManagement';
import UserManagement from '@/components/admin/UserManagement';
import AdminManagement from '@/components/admin/AdminManagement';
import PriceSettings from '@/components/admin/PriceSettings';
import SystemSettings from '@/components/admin/SystemSettings';
import OverviewStats from '@/components/admin/OverviewStats';
import ActivityLogs from '@/components/admin/ActivityLogs';
import CancellationRefundManagement from '@/components/admin/cancellation-refunds/CancellationRefundManagement';
import DonationManagement from '@/components/admin/donation-management/DonationManagement';
import SponsorPerformerManagement from '@/components/admin/SponsorPerformerManagement';
import DistinguishedGuestsManagement from '@/components/admin/DistinguishedGuestsManagement';
import GenerateDocumentsUtility from '@/components/admin/GenerateDocumentsUtility';

import LoadingSpinner from '@/components/admin/dashboard/LoadingSpinner';
import Sidebar from '@/components/admin/dashboard/Sidebar';
import TopBar from '@/components/admin/dashboard/TopBar';
import { navigationItems } from '@/components/admin/dashboard/NavigationItem';

export default function AdminDashboard() {
  const { adminUser, loading, logout, hasPermission } = useAdmin();
  const { isDarkMode } = useTheme();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !adminUser) {
      router.push('/admin/login');
    }
  }, [adminUser, loading, router]);

  if (loading) {
    return <LoadingSpinner />;
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
      case 'delegate-bookings':
        return <DelegateManagement />;
      case 'donations':
        return <DonationManagement />;
      case 'sponsor-performer':
        return <SponsorPerformerManagement />;
      case 'cancellations':
        return <CancellationRefundManagement />;
      case 'users':
        return <UserManagement />;
      case 'distinguished-guests':
        return <DistinguishedGuestsManagement />;
      case 'pricing':
        return <PriceSettings />;
      case 'system-settings':
        return <SystemSettings />;
      case 'admins':
        return <AdminManagement />;
      case 'logs':
        return <ActivityLogs />;
      case 'generate-documents':
        return <GenerateDocumentsUtility />;
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

        <Sidebar 
          isDarkMode={isDarkMode}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          navigationItems={navigationItems}
          hasPermission={hasPermission}
          adminUser={adminUser}
          handleLogout={handleLogout}
        />

        {/* Main content */}
        <div className="lg:ml-64">
          <TopBar 
            isDarkMode={isDarkMode}
            setIsSidebarOpen={setIsSidebarOpen}
            activeTab={activeTab}
            navigationItems={navigationItems}
          />

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