"use client"
import ShowAuditorium from '@/components/home/ShowSeatLayout'
import { ShowSeatBookingProvider } from '@/context/ShowSeatBookingContext'

import React from 'react'

function page() {
      
    
  return (
    <div>
        
                <ShowSeatBookingProvider>
        
      <ShowAuditorium />
        </ShowSeatBookingProvider>
    </div>
  )
}

export default page
