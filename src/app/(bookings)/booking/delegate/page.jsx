"use client";
import DelegateForm from '@/components/deligateRegistration/DelegateForm'
import React from 'react'
import ProtectedRoute from '@/components/ProtectedRoute';



function page() {
    
  
  return (
    <div>
          <ProtectedRoute>
      
     
      <DelegateForm />
      </ProtectedRoute>
    </div>
  )
}

export default page
