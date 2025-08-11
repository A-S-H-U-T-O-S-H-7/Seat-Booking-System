"use client";
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';

function HomePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);


  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-sm shadow-lg sticky top-0 z-50 border-b border-orange-100">
        <div className=" px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img 
                src="/havan.jpg" 
                alt="Havan Logo" 
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover shadow-md"
              />
              <h1 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold bg-gradient-to-r from-orange-600 via-red-500 to-yellow-600 bg-clip-text text-transparent">
              Havan Ceremony
              </h1>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4">
            {user ? (
  <div className="relative">
    {/* User Dropdown */}
    <button
      onClick={() => setDropdownOpen(!dropdownOpen)}
      className="flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-orange-100 to-amber-100 hover:from-orange-150 hover:to-amber-150 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-orange-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
    >
      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-orange-400 to-amber-500 rounded-full flex items-center justify-center shadow-sm">
        <span className="text-xs sm:text-sm text-white font-bold">
          {user.email.charAt(0).toUpperCase()}
        </span>
      </div>
      <div className="flex flex-col min-w-0 flex-1 text-left">
        <span className="text-xs sm:text-sm font-medium text-gray-700">Welcome</span>
        <span className="text-xs sm:text-sm font-semibold text-orange-700 truncate max-w-20 sm:max-w-32 lg:max-w-none">
          {user.email}
        </span>
      </div>
      {/* Dropdown Arrow */}
      <svg 
        className={`w-4 h-4 text-orange-600 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    {/* Dropdown Menu */}
    {dropdownOpen && (
      <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-3 z-50 backdrop-blur-sm">
        {/* User Info Header */}
        <div className="px-4 py-2 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-amber-500 rounded-full flex items-center justify-center shadow-sm">
              <span className="text-sm text-white font-bold">
                {user.email.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user.email}</p>
              <p className="text-xs text-gray-500">Account Menu</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="py-2">
          {/* Profile Link */}
          <Link
            href="/profile"
            onClick={() => setDropdownOpen(false)}
            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 transition-all duration-200 group"
          >
            <div className="w-8 h-8 bg-blue-100 group-hover:bg-blue-200 rounded-lg flex items-center justify-center transition-colors duration-200">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">My Profile</p>
              <p className="text-xs text-gray-500">View bookings</p>
            </div>
            <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          {/* Divider */}
          <div className="border-t border-gray-100 my-2"></div>

          {/* Logout Button */}
          <button
            onClick={() => {
              setDropdownOpen(false);
              handleLogout();
            }}
            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 hover:text-red-700 transition-all duration-200 group w-full text-left"
          >
            <div className="w-8 h-8 bg-red-100 group-hover:bg-red-200 rounded-lg flex items-center justify-center transition-colors duration-200">
              <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Sign Out</p>
              <p className="text-xs text-gray-500">Logout from account</p>
            </div>
          </button>
        </div>
      </div>
    )}
  </div>
) : (
  <>
    <Link
      href="/login"
      className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white px-3 py-2 sm:px-4 text-xs sm:text-sm rounded-lg transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
    >
      Login
    </Link>
    <Link
      href="/register"
      className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white px-3 py-2 sm:px-4 text-xs sm:text-sm rounded-lg transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
    >
      Register
    </Link>
  </>
)}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-4 sm:py-6  overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/havan.jpg" 
            alt="Havan Ceremony" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-orange-100/80 via-yellow-100/70 to-red-100/80"></div>
        </div>
        
        <div className="relative z-10 text-center px-4 sm:px-6">
          <div className="mb-6">
            <img 
              src="/havan.jpg" 
              alt="Havan Ceremony" 
              className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 xl:w-48 xl:h-48 rounded-full object-cover mx-auto shadow-2xl border-4 border-white/50"
            />
          </div>
          <h2 className="text-xl sm:text-3xl md:text-5xl  font-bold text-gray-800 mb-4 sm:mb-6 leading-tight">
            Sri Jagannatha Pancha Ratra<br  />
            <span className="bg-gradient-to-r from-orange-600 via-red-500 to-yellow-600 bg-clip-text text-transparent">
              Havan Ceremony
            </span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-700 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed font-medium">
            Join us for a divine 5-day ceremony.<br />
            Book your seats online for spiritual experience filled with peace and blessings.
          </p>
          
          {user ? (
            <Link
              href="/booking"
              className="inline-block bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 hover:from-orange-600 hover:via-red-600 hover:to-yellow-600 text-white px-6 sm:px-8 lg:px-10 py-3 sm:py-4 rounded-xl text-sm sm:text-base lg:text-lg xl:text-xl font-semibold transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl "
            >
              🕉️ Book Your Seats Now
            </Link>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md sm:max-w-none mx-auto">
              <Link
                href="/register"
                className="inline-block bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 hover:from-orange-600 hover:via-red-600 hover:to-yellow-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-sm sm:text-base lg:text-lg font-semibold transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl w-full sm:w-auto"
              >
                Register & Book Seats
              </Link>
              <Link
                href="/login"
                className="inline-block border-2 border-orange-500 text-orange-600 hover:bg-orange-50 hover:border-orange-600 hover:text-orange-700 px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-sm sm:text-base lg:text-lg font-semibold transform hover:scale-105 transition-all duration-300 w-full sm:w-auto"
              >
                Login to Book
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Event Details */}
      <section className="py-12 sm:py-16 bg-white shadow-inner">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-8 sm:mb-12 text-gray-800">
            Ceremony Details
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Duration */}
            <div className="text-center p-4 sm:p-6 rounded-xl bg-gradient-to-b from-orange-50 to-yellow-50 hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-2xl sm:text-3xl text-white">📅</span>
              </div>
              <h4 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2 sm:mb-3 text-gray-800">5-Day Sacred Event</h4>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                Sacred Havan ceremony spanning 5 consecutive days with morning and afternoon sessions
              </p>
            </div>

            {/* Timing */}
            <div className="text-center p-4 sm:p-6 rounded-xl bg-gradient-to-b from-yellow-50 to-red-50 hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-2xl sm:text-3xl text-white">⏰</span>
              </div>
              <h4 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2 sm:mb-3 text-gray-800">Two Shifts Daily</h4>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                <strong>Morning:</strong> 9:00 AM - 12:00 PM<br />
                <strong>Afternoon:</strong> 2:00 PM - 5:00 PM
              </p>
            </div>

            {/* Capacity */}
            <div className="text-center p-4 sm:p-6 rounded-xl bg-gradient-to-b from-red-50 to-orange-50 hover:shadow-lg transition-shadow duration-300 sm:col-span-2 lg:col-span-1">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-red-400 to-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-2xl sm:text-3xl text-white">🪑</span>
              </div>
              <h4 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2 sm:mb-3 text-gray-800">400 Sacred Seats</h4>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                Organized seating in 4 blocks (A, B, C, D) with clear view of the sacred fire
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 sm:py-16 bg-gradient-to-b from-gray-50 to-orange-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-8 sm:mb-12 text-gray-800">
            Why Book Online?
          </h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            <div className="text-center p-4 sm:p-6 rounded-xl bg-white hover:shadow-lg transition-all duration-300 hover:transform hover:scale-105">
              <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">💺</div>
              <h4 className="font-bold text-base sm:text-lg mb-2 text-gray-800">Choose Your Seat</h4>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">Select exact seats with visual seat map</p>
            </div>
            
            <div className="text-center p-4 sm:p-6 rounded-xl bg-white hover:shadow-lg transition-all duration-300 hover:transform hover:scale-105">
              <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">💳</div>
              <h4 className="font-bold text-base sm:text-lg mb-2 text-gray-800">Secure Payment</h4>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">Safe online payment with instant confirmation</p>
            </div>
            
            <div className="text-center p-4 sm:p-6 rounded-xl bg-white hover:shadow-lg transition-all duration-300 hover:transform hover:scale-105">
              <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">📧</div>
              <h4 className="font-bold text-base sm:text-lg mb-2 text-gray-800">Email Confirmation</h4>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">Instant booking confirmation via email</p>
            </div>
            
            <div className="text-center p-4 sm:p-6 rounded-xl bg-white hover:shadow-lg transition-all duration-300 hover:transform hover:scale-105">
              <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">💰</div>
              <h4 className="font-bold text-base sm:text-lg mb-2 text-gray-800">Flexible Refunds</h4>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">Full refund if canceled 15+ days before</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
            {/* Contact Info */}
            <div>
              <h4 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-orange-300">Contact Details</h4>
              <div className="space-y-2 text-sm sm:text-base text-gray-300">
                <p><strong className="text-white">Tel:</strong> 0120-4348458</p>
                <p><strong className="text-white">Phone:</strong> +91 730 339 7090</p>
                <p><strong className="text-white">Email:</strong> info@svsamiti.com</p>
                <p><strong className="text-white">Website:</strong> www.svsamiti.com</p>
              </div>
            </div>

            {/* Corporate Address */}
            <div>
              <h4 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-orange-300">Corporate Address</h4>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                C-316 B & C, C Block,<br />
                Sector 10, Noida,<br />
                Uttar Pradesh 201301
              </p>
            </div>

            {/* Registered Address */}
            <div className="md:col-span-2 lg:col-span-1">
              <h4 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-orange-300">Registered Address</h4>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                A 86/B, 2nd Floor,<br />
                School Block, Chander Vihar,<br />
                Delhi-110092
              </p>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-6 sm:pt-8 text-center">
            <p className="text-sm sm:text-base">&copy; 2024 Sri Jagannatha Pancha Ratra Havan Seat Booking System. All rights reserved.</p>
            <p className="text-gray-400 text-xs sm:text-sm mt-2">
              For support, contact us at info@svsamiti.com
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;