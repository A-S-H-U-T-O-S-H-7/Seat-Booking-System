// src/app/(web)/booking/page.jsx
"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from "@/components/ProtectedRoute";
import { BookingProvider } from '@/context/BookingContext';
import BookingFlow from '@/components/BookingFlow';
import Link from 'next/link';
import Footer from '@/components/home/Footer';

export default function BookingPage() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <ProtectedRoute> 
      <BookingProvider>
        <div className=" bg-gradient-to-br from-orange-50 via-white to-amber-50">

          <header className="bg-white/95 backdrop-blur-sm shadow-lg sticky top-0 z-50 border-b border-orange-200">
          <div className="px-2 sm:px-6 py-3 sm:py-4">
            <div className="flex justify-between items-center">
              <Link href="/" className="flex items-center gap-3">
                <img 
                  src="/havan.jpg" 
                  alt="Havan Logo" 
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover shadow-md"
                />
                <div>
                  <h1 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 bg-clip-text text-transparent">
                    Reserve Your Havan Place 
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-600">Join the spiritual journey – reserve your place</p>
                </div>
              </Link>
              <button 
                onClick={handleBack}
                className="flex items-center gap-2 px-3 py-2 rounded-full bg-orange-100 hover:bg-orange-200 transition-colors duration-200 group"
                aria-label="Go back"
              >
                <svg 
                  className="w-4 h-4 text-orange-600 group-hover:text-orange-700" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-sm font-medium text-orange-600 group-hover:text-orange-700">Back</span>
              </button>
            </div>
          </div>
        </header>

          {/* Header Section */}
          <div className="max-w-7xl mx-auto px-2 md:px-6 py-2">
            <div className="rounded-2xl border bg-gradient-to-r from-orange-200 via-white to-orange-200 backdrop-blur-sm border-orange-200/50 shadow-lg">
              <div className="container mx-auto px-4 py-8">
                <div className="flex items-center gap-6">
                  {/* Left side - Trimurti Image
                  <div className=" hidden md:block">
                    <img 
                      src="trimurti.png" 
                      alt="Trimurti" 
                      className="w-20 h-20 lg:w-60 lg:h-60 object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div> */}

                  {/* Center - Main Content */}
                  <div className="text-center flex-1">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4">
                      <img 
                        src="havanicon.png" 
                        alt="Havan" 
                        className="w-12 h-12 object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                      <span className="text-2xl hidden">🔥</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-3">
                      Reserve Your Havan Place 
                    </h1>
                    <p className="text-gray-700 text-base md:text-lg max-w-2xl mx-auto mb-4">
                      Select your preferred date, shift, and seats for the sacred Havan ceremony
                    </p>
                    <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm text-orange-800 rounded-full text-sm font-medium border border-orange-200 shadow-sm">
                      Experience Divine Blessings
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="max-w-7xl mx-auto mt-4">
              <BookingFlow />
            </div>
          </div>
          <Footer/>
        </div>
      </BookingProvider>
    </ProtectedRoute>
  );
}
