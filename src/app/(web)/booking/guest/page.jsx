"use client";
import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';

export default function GuestBookingPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
        {/* Header */}
        <header className="bg-white/95 backdrop-blur-sm shadow-lg sticky top-0 z-50 border-b border-green-100">
          <div className="px-2 sm:px-6 py-3 sm:py-4">
            <div className="flex justify-between items-center">
              <Link href="/" className="flex items-center gap-3">
                <img 
                  src="/havan.jpg" 
                  alt="Havan Logo" 
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover shadow-md"
                />
                <div>
                  <h1 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold bg-gradient-to-r from-green-600 via-emerald-500 to-teal-600 bg-clip-text text-transparent">
                    Guest Seat Booking
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-600">Special events and VIP occasions</p>
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

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 sm:p-12">
              <div className="mb-8">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                  <span className="text-4xl text-white">👥</span>
                </div>
                
                <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                  Guest Seat Booking
                </h2>
                
                <p className="text-xl text-gray-600 mb-8">
                  Coming Soon! Reserve guest seating for special events and VIP occasions.
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
                <h3 className="text-lg font-semibold text-green-800 mb-4">Features in Development</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-green-700">
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">🌟</span>
                    <span>VIP Guest Areas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">🎪</span>
                    <span>Special Event Seating</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">🍽️</span>
                    <span>Premium Dining Access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">🎁</span>
                    <span>Exclusive Benefits</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Link
                  href="/booking/havan"
                  className="inline-block bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white px-8 py-4 rounded-xl font-semibold transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  🔥 Book Havan Seats Instead
                </Link>
                
                <div className="text-gray-500">or</div>
                
                <Link
                  href="/"
                  className="inline-block border-2 border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-700 px-8 py-4 rounded-xl font-semibold transform hover:scale-105 transition-all duration-200"
                >
                  ← Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
