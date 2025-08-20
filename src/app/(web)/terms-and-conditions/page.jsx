"use client"
import Footer from '@/components/home/Footer'
import Header from '@/components/home/Header'
import TermsAndConditions from '@/components/static-pages/Terms-and-Conditions'
import React from 'react'
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

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

      <TermsAndConditions />
            <Footer />

    </div>
  )
}

export default page
