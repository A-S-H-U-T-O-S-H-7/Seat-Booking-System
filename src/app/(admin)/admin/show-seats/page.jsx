"use client";
import { Suspense } from 'react';
import ShowSeatManagement from '@/components/admin/ShowSeatManagement';
import { AdminProvider } from '@/context/AdminContext';
import { ThemeProvider } from '@/context/ThemeContext';

export default function AdminShowSeatsPage() {
  return (
    <ThemeProvider>
      <AdminProvider>
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        }>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto px-4 py-8">
              <ShowSeatManagement />
            </div>
          </div>
        </Suspense>
      </AdminProvider>
    </ThemeProvider>
  );
}
