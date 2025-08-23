"use client";
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HavanBookingPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to existing booking page for havan
    router.replace('/booking');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to Havan booking...</p>
      </div>
    </div>
  );
}