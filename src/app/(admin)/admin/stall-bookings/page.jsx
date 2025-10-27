"use client";
import { Suspense } from 'react';
import AdminStallBooking from '@/components/admin/adminStallbooking/AdminStallBooking';
import { AdminProvider } from '@/context/AdminContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { StallBookingProvider } from '@/context/StallBookingContext';
import { toast } from 'react-hot-toast';

export default function AdminStallBookingsPage() {
  return (
    <ThemeProvider>
      <AdminProvider>
        <StallBookingProvider>
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          }>
            <AdminStallBooking />
          </Suspense>
        </StallBookingProvider>
      </AdminProvider>
    </ThemeProvider>
  );
}
