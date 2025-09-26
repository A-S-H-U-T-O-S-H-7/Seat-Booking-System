"use client";
import ProtectedRoute from '@/components/ProtectedRoute';
import { StallBookingProvider } from '@/context/StallBookingContext';
import StallBookingFlow from '@/components/stall/StallBookingFlow';
import Link from 'next/link';
import ImageModal from '@/components/ImageModal';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useStallCleanup } from '@/hooks/useStallCleanup';

export default function StallBookingPage() {
  const router = useRouter();
  const [showEventLayoutModal, setShowEventLayoutModal] = useState(false);
  
  // Initialize stall cleanup service - runs continuously for the entire stall booking session
  const { manualCleanup } = useStallCleanup();

  

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
       

        <StallBookingProvider>
          <StallBookingFlow />
        </StallBookingProvider>
        
        
      </div>
    </ProtectedRoute>
  );
}
