"use client";
import { useState } from 'react';
import ProtectedAdminRoute from '@/components/admin/ProtectedAdminRoute';
import { AdminProvider } from '@/context/AdminContext';
import { ThemeProvider } from '@/context/ThemeContext';
import ShowBookingManagement from '@/components/admin/show-bookings/ShowBookingManagement';

export default function ShowBookingsPage() {
  return (
    <AdminProvider>
      <ThemeProvider>
        <ProtectedAdminRoute requiredPermission="view_bookings">
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <ShowBookingManagement />
            </div>
          </div>
        </ProtectedAdminRoute>
      </ThemeProvider>
    </AdminProvider>
  );
}
