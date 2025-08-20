"use client"
import Footer from '@/components/home/Footer'
import Header from '@/components/home/Header'
import React from 'react'
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import PrivacyPolicy from '@/components/static-pages/Privacy-Policy';

function page() {
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
    
  return (
    <div>
      <Header user={user} handleLogout={handleLogout} />
      <PrivacyPolicy/>
                <Footer />

    </div>
  )
}

export default page
