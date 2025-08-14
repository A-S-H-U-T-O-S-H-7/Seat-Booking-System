"use client";
import { ShowSeatBookingProvider } from '@/context/ShowSeatBookingContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import ShowBookingFlow from '@/components/show/ShowBookingFlow';
import Link from 'next/link';

export default function ShowBookingPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        {/* Header */}
        <header className="bg-gray-800/95 backdrop-blur-sm shadow-lg sticky top-0 z-50 border-b border-gray-700">
          <div className="px-2 sm:px-6 py-3 sm:py-4">
            <div className="flex justify-between items-center">
              <Link href="/" className="flex items-center gap-3">
                <img 
                  src="/havan.jpg" 
                  alt="Havan Logo" 
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover shadow-md"
                />
                <div>
                  <h1 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold bg-gradient-to-r from-purple-400 via-indigo-400 to-pink-400 bg-clip-text text-transparent">
                    Show Booking
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-400">Reserve your show tickets</p>
                </div>
              </Link>
            </div>
          </div>
        </header>

        <ShowSeatBookingProvider>
          <ShowBookingFlow />
        </ShowSeatBookingProvider>
      </div>
    </ProtectedRoute>
  );
}
