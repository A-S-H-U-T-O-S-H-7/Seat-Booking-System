"use client";
import ProtectedRoute from '@/components/ProtectedRoute';
import { StallBookingProvider } from '@/context/StallBookingContext';
import StallBookingFlow from '@/components/stall/StallBookingFlow';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import Footer from '@/components/home/Footer';

export default function StallBookingPage() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        {/* Header */}
        <header className="bg-white/95 backdrop-blur-sm shadow-lg sticky top-0 z-50 border-b border-blue-100">
          <div className="px-2 sm:px-6 py-3 sm:py-4">
            <div className="flex justify-between items-center">
              {/* Logo and Title */}
              <Link href="/" className="flex items-center gap-3">
                <img
                  src="/stall.png"
                  alt="Stall Logo"
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover shadow-md"
                />
                <div>
                  <h1 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
                    Pick Your Stall
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-600">Reserve your business space</p>
                </div>
              </Link>

              {/* Back Button */}
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-3 py-2 bg-purple-200 text-purple-600 hover:text-purple-700 hover:bg-purple-300 cursor-pointer rounded-full transition-colors duration-200 group"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-0.5 transition-transform duration-200" />
                <span className="text-sm sm:text-base font-medium">Back</span>
              </button>
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