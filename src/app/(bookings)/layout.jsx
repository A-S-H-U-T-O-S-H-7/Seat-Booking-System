"use client"
import ImageModal from '@/components/ImageModal';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'

function layout({ children }) {
      const [showEventLayoutModal, setShowEventLayoutModal] = useState(false);
    
      const router = useRouter();
        const handleBack = () => {
          router.back();
        };
  return (
    <div>
        {/* Header */}
          <header className="bg-white/95 backdrop-blur-sm shadow-lg sticky top-0 z-50 border-b border-rose-200">
          <div className="px-2 sm:px-6 py-3 sm:py-4">
            <div className="flex justify-between items-center">
              <Link href="/" className="flex items-center gap-3">
                <img 
                  src="/header-logo.png"  
                  alt="Header Logo" 
                  className=" object-cover shadow-md"
                />
                
              </Link>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowEventLayoutModal(true)}
                  className="relative mx-2 flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white transition-all duration-300 group shadow-lg hover:shadow-xl transform hover:scale-105 animate-pulse hover:animate-none"
                  aria-label="View Event Layout"
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                  <div className="relative flex items-center gap-2">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                    </svg>
                    <span className="text-sm font-bold hidden sm:inline">Layout</span>
                  </div>
                </button>
                <button 
                  onClick={handleBack}
                  className="flex items-center gap-2 px-3 py-2 rounded-full bg-fuchsia-100 hover:bg-fuchsia-200 border cursor-pointer border-fuchsia-400 transition-colors duration-200 group"
                  aria-label="Go back"
                >
                <svg 
                  className="w-4 h-4 text-fuchsia-300 group-hover:text-fuchsia-700" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-sm font-medium text-fuchsia-600 group-hover:text-fuchsia-700">Back</span>
                </button>
              </div>
            </div>
          </div>
        </header>
      {children}

      {/* Event Layout Modal */}
        <ImageModal
          show={showEventLayoutModal}
          onClose={() => setShowEventLayoutModal(false)}
          imageSrc="/layout2.png"
          imageAlt="Event Layout"
          title="Event Layout"
        />
    </div>
  )
}

export default layout
