"use client";
import { ShowSeatBookingProvider } from '@/context/ShowSeatBookingContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import ShowBookingFlow from '@/components/show/ShowBookingFlow';

import { useShowSeatCleanup } from '@/hooks/useShowSeatCleanup';

export default function ShowBookingPage() {
  
  // Initialize show seat cleanup service to run every 2 minutes
  useShowSeatCleanup();
  
    
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
       

        <ShowSeatBookingProvider>
          <ShowBookingFlow />
        </ShowSeatBookingProvider>
        
        
      </div>
    </ProtectedRoute>
  );
}
