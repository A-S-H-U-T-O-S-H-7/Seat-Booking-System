"use client"
import Footer from '@/components/home/Footer'
import Header from '@/components/home/Header'
import React from 'react'
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import FAQ from '@/components/static-pages/Faqs'

function page() {
      
    
  return (
    <div>
      <FAQ />            

    </div>
  )
}

export default page
