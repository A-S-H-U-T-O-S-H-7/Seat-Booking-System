"use client"
import { useAuth } from '@/context/AuthContext';

import HeroSection from '@/components/home/HeroSection';
import BookingSection from '@/components/home/BookingSection';
import DonationBanner from '@/components/home/DonationBanner';

function HomePage() {
  const { user,loading} = useAuth();

  

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50">
      <HeroSection user={user} />
      <DonationBanner/>
      <BookingSection user={user} />
    </div>
  );
}

export default HomePage;