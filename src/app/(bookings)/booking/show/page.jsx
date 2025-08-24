"use client";
import { ShowSeatBookingProvider } from '@/context/ShowSeatBookingContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import ShowBookingFlow from '@/components/show/ShowBookingFlow';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ShowBookingPage() {
  const router = useRouter();
  
    const handleBack = () => {
      router.back();
    };
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        {/* Header */}
          <header className="bg-white/95 backdrop-blur-sm shadow-lg sticky top-0 z-50 border-b border-rose-200">
          <div className="px-2 sm:px-6 py-3 sm:py-4">
            <div className="flex justify-between items-center">
              <Link href="/" className="flex items-center gap-3">
                <img 
                  src="/header-logo.png"  
                  alt="Header Logo" 
                  className=" object-cover shadow-md"
                />
                
              </Link>
              <button 
                onClick={handleBack}
                className="flex items-center gap-2 px-3 py-2 rounded-full bg-fuchsia-100 hover:bg-fuchsia-200 border cursor-pointer border-fuchsia-400 transition-colors duration-200 group"
                aria-label="Go back"
              >
                <svg 
                  className="w-4 h-4 text-fuchsia-300 group-hover:text-fuchsia-700" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-sm font-medium text-fuchsia-600 group-hover:text-fuchsia-700">Back</span>
              </button>
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