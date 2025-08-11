"use client";
import ProtectedRoute from '@/components/ProtectedRoute';
import { StallBookingProvider } from '@/context/StallBookingContext';
import StallBookingFlow from '@/components/stall/StallBookingFlow';
import Link from 'next/link';

export default function StallBookingPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        {/* Header */}
        <header className="bg-white/95 backdrop-blur-sm shadow-lg sticky top-0 z-50 border-b border-blue-100">
          <div className="px-2 sm:px-6 py-3 sm:py-4">
            <div className="flex justify-between items-center">
              <Link href="/" className="flex items-center gap-3">
                <img 
                  src="/havan.jpg" 
                  alt="Havan Logo" 
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover shadow-md"
                />
                <div>
                  <h1 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
                    Stall Booking
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-600">Reserve your business space</p>
                </div>
              </Link>
              
              <div className="flex items-center gap-4">
                <Link
                  href="/profile"
                  className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Profile
                </Link> 
              </div>
            </div>
          </div>
        </header>

        <StallBookingProvider>
          <StallBookingFlow />
        </StallBookingProvider>
      </div>
    </ProtectedRoute>
  );
}
