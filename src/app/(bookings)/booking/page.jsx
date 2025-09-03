// src/app/(web)/booking/page.jsx
"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from "@/components/ProtectedRoute";
import { BookingProvider } from '@/context/BookingContext';
import BookingFlow from '@/components/BookingFlow';
import Link from 'next/link';
import Footer from '@/components/home/Footer';
import ImageModal from '@/components/ImageModal';
import { Heart, Sparkles } from 'lucide-react';
import DonateBar from '@/components/donation/DonationBar';
import { useSeatCleanup } from '@/hooks/useSeatCleanup';

export default function BookingPage() {
  const router = useRouter();
  const [showEventLayoutModal, setShowEventLayoutModal] = useState(false);
  
  // Initialize seat cleanup service for havan bookings
  const { manualCleanup } = useSeatCleanup();

  const handleBack = () => {
    router.back();
  };

  return (
    <ProtectedRoute> 
      <BookingProvider>
        <div className="bg-gradient-to-br from-orange-50 via-white to-amber-50">

          <header className="bg-white/95 backdrop-blur-sm shadow-lg sticky top-0 z-50 border-b border-orange-200">
            <div className="px-2 sm:px-6 py-3 sm:py-4">
              <div className="flex justify-between items-center">
                <Link href="/" className="flex items-center gap-3">
                  <img 
                    src="/header-logo.png" 
                    alt="Havan Logo" 
                    className=" object-cover shadow-md"
                  />
                  
                </Link>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowEventLayoutModal(true)}
                    className="relative mx-2 flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white transition-all duration-300 group shadow-lg hover:shadow-xl transform hover:scale-105 animate-pulse hover:animate-none"
                    aria-label="View Event Layout"
                  >
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                    <div className="relative flex items-center gap-2">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                      </svg>
                      <span className="text-sm font-bold hidden sm:inline">Layout</span>
                    </div>
                  </button>
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
            </div>
          </header>

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
                      className="w-32 h-32 xl:w-70 lg:h-75 object-contain drop-shadow-lg"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>

                  {/* Center - Main Content */}
<div className="text-center flex-1 max-w-3xl mx-auto">
  <div className="flex justify-center items-center mb-4">
    <div className="w-16 h-16 md:w-18 md:h-18 rounded-full bg-white/60 backdrop-blur-sm shadow-xl flex items-center justify-center border border-orange-300">
      <img 
        src="/havanicon.png" 
        alt="Havan" 
        className="w-10 h-10 md:w-14 md:h-14 object-cover rounded-full"
        onError={(e) => {
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'block';
        }}
      />
      <span className="text-2xl md:text-3xl hidden">🔥</span>
    </div>
  </div>

  <div className='w-full max-w-3xl mx-auto mb-4'>
    <DonateBar/>
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
                      className="w-32 h-32 md:w-68 md:h-75  object-contain drop-shadow-lg transform scale-x-[-1]"
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
          
          {/* Event Layout Modal */}
          <ImageModal
            show={showEventLayoutModal}
            onClose={() => setShowEventLayoutModal(false)}
            imageSrc="/eventlayout2.jpg"
            imageAlt="Event Layout"
            title="Event Layout"
          />
        </div>
      </BookingProvider>
    </ProtectedRoute>
  );
}
