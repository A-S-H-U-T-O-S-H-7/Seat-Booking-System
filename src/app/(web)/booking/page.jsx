// src/app/(web)/booking/page.jsx
"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from "@/components/ProtectedRoute";
import { BookingProvider } from '@/context/BookingContext';
import BookingFlow from '@/components/BookingFlow';
import Link from 'next/link';
import Footer from '@/components/home/Footer';
import { Heart, Sparkles } from 'lucide-react';

export default function BookingPage() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <ProtectedRoute> 
      <BookingProvider>
        <div className="bg-gradient-to-br from-orange-50 via-white to-amber-50">

          {/* <header className="bg-white/95 backdrop-blur-sm shadow-lg sticky top-0 z-50 border-b border-orange-200">
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
          </header> */}

          {/* Header Section */}
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
            
            <div className="rounded-2xl border bg-gradient-to-r from-orange-200 via-white to-orange-200 backdrop-blur-sm border-orange-200/50 shadow-lg overflow-hidden">
              
              {/* Flower Design Border at Top of Block */}
              <div 
                className="w-full h-8 sm:h-12 bg-repeat-x bg-center"
                style={{
                  backgroundImage: 'url(/flowerdesign2.png)',
                  backgroundSize: 'auto 100%'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              ></div>
              
              <div className="container mx-auto px-4 md:px-6 py-4 md:py-6">
                <div className="flex items-center justify-between gap-6 lg:gap-8">
                  
                  {/* Left side - Jaga Image */}
                  <div className="hidden lg:flex flex-1 justify-center">
                    <img 
                      src="/jaga1.png" 
                      alt="jaga" 
                      className="w-32 h-32 xl:w-44 lg:h-52 object-contain drop-shadow-lg"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>

                  {/* Center - Main Content */}
                  <div className="text-center flex-1 max-w-3xl mx-auto">
                    <div className="flex justify-center items-center mb-4">
                      <div className="w-16 h-16 md:w-18 md:h-18 rounded-full bg-white/60 backdrop-blur-sm shadow-xl flex items-center justify-center border-2 border-orange-300">
                        <img 
                          src="/havanicon.png" 
                          alt="Havan" 
                          className="w-10 h-10 md:w-12 md:h-12 object-cover rounded-full"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                        <span className="text-2xl md:text-3xl hidden">🔥</span>
                      </div>
                    </div>

                    {/* donate bar */}
                    <div className="relative overflow-hidden">
      {/* Main donate bar */}
      <div className="flex items-center gap-6 p-2 bg-gradient-to-r from-white via-rose-50/30 to-purple-50/30 rounded-2xl  border border-rose-100  transition-all duration-300 hover:scale-[1.02] cursor-pointer group">
        
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-2 right-4 text-rose-300">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="absolute bottom-3 right-12 text-purple-300">
            <Heart className="w-4 h-4" />
          </div>
        </div>
        
        {/* Image with enhanced styling */}
        <div className="flex-shrink-0 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-400 to-purple-500 rounded-full blur-sm opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
          <img 
            src="/donate.jpg" 
            alt="Donate for a Smile" 
            className="relative w-14 h-14 md:w-16 md:h-16 rounded-full object-cover border-3 border-white shadow-lg group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
            <Heart className="w-3 h-3 text-white" />
          </div>
        </div>
        
        {/* Content with improved typography */}
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-lg md:text-xl font-bold bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 bg-clip-text text-transparent leading-tight">
              Donate for a Smile
            </h2>
            {/* Emoji separated from gradient text */}
            <span className="text-xl animate-pulse">😊</span>
          </div>
          <p className="text-sm md:text-base font-medium text-slate-600 leading-relaxed mb-1">
            Together, we create brighter futures.
          </p>
          {/* <div className="flex items-center gap-1 text-xs text-rose-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span>Click to make a difference</span>
            <span className="animate-bounce">→</span>
          </div> */}
        </div>
        
        {/* Action indicator
        <div className="flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-rose-100 to-purple-100 rounded-full flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-rose-200 group-hover:to-purple-200 transition-colors duration-300">
            <Heart className="w-4 h-4 md:w-5 md:h-5 text-rose-500 group-hover:text-rose-600" />
          </div>
        </div> */}
      </div>
    </div>
                    
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-3 leading-tight whitespace-nowrap">
                      Reserve Your Havan Place 
                    </h1>
                    
                    <p className="text-gray-700 text-sm md:text-base max-w-2xl mx-auto mb-4 leading-relaxed">
                      Select your preferred date, shift, and seats for the sacred Havan ceremony
                    </p>
                    
                    <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm text-orange-800 rounded-full text-sm font-medium border border-orange-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
                      ✨ Experience Divine Blessings ✨
                    </div>
                  </div>

                  {/* Right side - Mirror Jaga Image for better balance */}
                  <div className="hidden xl:flex flex-1 justify-center">
                    <img 
                      src="/jaga1.png" 
                      alt="jaga" 
                      className="w-32 h-32 md:w-44 md:h-62 object-contain drop-shadow-lg transform scale-x-[-1]"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="max-w-7xl mx-auto mt-8">
              <BookingFlow />
            </div>
          </div>
        </div>
      </BookingProvider>
    </ProtectedRoute>
  );
}