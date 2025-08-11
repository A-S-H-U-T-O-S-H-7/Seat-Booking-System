// src/app/(web)/booking/page.jsx
"use client";
import { useState } from 'react';
import ProtectedRoute from "@/components/ProtectedRoute";
import { BookingProvider } from '@/context/BookingContext';
import BookingFlow from '@/components/BookingFlow';

export default function BookingPage() {
  return (
    <ProtectedRoute> 
      <BookingProvider>
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
          <div className= 'px-2 md:px-8 py-2 rounded-2xl'>
            {/* Header Section */}
      <div className=" rounded-2xl border bg-gradient-to-r  from-orange-100/80 to-amber-100/80 backdrop-blur-sm border-b border-orange-200/50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full mb-4 shadow-lg">
              <span className="text-2xl">🔥</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-3">
              Havan Seat Booking
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
            
            <BookingFlow />
          </div>
        </div>
      </BookingProvider>
    </ProtectedRoute>
  );
}
