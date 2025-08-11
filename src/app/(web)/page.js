"use client";
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Header from '@/components/home/Header';
import HeroSection from '@/components/home/HeroSection';
import BookingSection from '@/components/home/BookingSection';
import Footer from '@/components/home/Footer';

function HomePage() {
  const { user, logout ,loading} = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

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
      <Header user={user} handleLogout={handleLogout} />
      <HeroSection user={user} />
      <BookingSection user={user} />
      <Footer />
    </div>
  );
}

export default HomePage;