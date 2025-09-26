import { MapPin } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

function ShowModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300"
        onClick={onClose}
      ></div>
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4">
        <div 
          className="bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 rounded-3xl shadow-2xl max-w-2xl w-full mx-1 md:mx-4 transform transition-all duration-300 scale-100 border border-white/50 backdrop-blur-lg max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative p-4  md:p-6 pb-2 md:pb-4">
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/80 hover:bg-white transition-colors duration-200 flex items-center justify-center text-gray-500 hover:text-gray-700 shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Title with gradient */}
            <div className="text-center mb-4">
              <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 rounded-full flex items-center justify-center shadow-xl">
                <img 
                  src="/show.png" 
                  alt="Show" 
                  className="w-8 h-8 object-contain drop-shadow-sm"
                />
              </div>
              
              <Link href="/showlayout">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent mb-3">
                ✨ Cultural Show ✨
              </h2>
              </Link>
              
              {/* Free Entry Badge */}
               <Link href="/delegate">
              <div className="inline-block ">
                <div className="bg-gradient-to-r from-green-400 via-emerald-400 to-green-500 text-white font-black text-base md:text-lg px-2 md:px-6 py-2 rounded-full shadow-2xl border-4 border-white transform hover:scale-105 transition-transform duration-200 relative overflow-hidden ">
                  <span className="relative z-10 tracking-wider">🎉 FREE ENTRY 🎉</span>
                </div>
              </div>
              </Link>
            </div>
          </div>
          
          {/* Content */}
          <div className="px-2 md:px-6 pb-2 md:pb-6">
            {/* Welcome Quote */}
            <div className="text-center mb-2 md:mb-5 p-1 md:p-3 bg-white/60 rounded-2xl shadow-inner">
              <p className="text-gray-700 text-base leading-relaxed font-medium italic">
                "🎭 Where culture meets celebration, and every moment becomes a memory to cherish forever! 🌟"
              </p>
            </div>
            
            {/* Event Details - Side by side layout */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {/* Duration */}
              <div className="flex items-center justify-center p-2 pb-8 md:pb-0 md:p-4 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-2xl shadow-sm">
                <div className="text-center">
                  <div className="text-xl mb-2">📅</div>
                  <div className="text-gray-700 font-semibold pb-2 md:pb-0 text-sm">5 Amazing Days</div>
                  <div className="text-blue-600 font-bold text-sm md:text-base">3rd Dec - 7th Dec</div>
                </div>
              </div>
              
              {/* Timing */}
              <Link href="/showlayout">
              <div className="flex items-center justify-center p-2 pb-8 md:pb-0 md:p-4 bg-gradient-to-r from-cyan-100 to-teal-100 rounded-2xl shadow-sm">
                <div className="text-center">
                  <div className="text-xl mb-2">🕐</div>
                  <div className="text-gray-700 font-semibold pb-2 md:pb-0 text-sm">Evening Shows</div>
                  <div className="text-teal-600 font-bold text-sm md:text-base">5:00 PM - 10:00 PM</div>
                </div>
              </div>
              </Link>
            </div>
            
            {/* Call to Action */}
            <div className="text-center">
              <div className="p-3 bg-gradient-to-r from-blue-50 to-teal-50 rounded-2xl mb-4">
                <p className="text-gray-600 text-sm leading-relaxed">
                  🎪 Join us for an unforgettable journey through art, music, and dance! 
                  Experience the magic of live performances that will touch your heart and soul. 💫
                </p>
              </div>
              
            <Link href="/showlayout">
              <div className="group cursor-pointer relative overflow-hidden rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 px-6 py-3 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-teal-500/25">
              <div className="flex cursor-pointer items-center justify-center gap-2 text-white font-medium text-sm">
                  <MapPin className={`w-4 h-4 transition-transform duration-300 `} />
                  <span>View Show Layout</span>
                </div>
                </div>
                </Link>
            </div>
          </div>
          
          {/* Floating particles animation */}
          <div className="absolute top-8 left-10 w-2 h-2 bg-blue-400/60 rounded-full animate-bounce delay-100"></div>
          <div className="absolute top-16 right-12 w-1.5 h-1.5 bg-cyan-400/60 rounded-full animate-pulse delay-300"></div>
          <div className="absolute bottom-16 left-8 w-1 h-1 bg-teal-400/60 rounded-full animate-ping delay-500"></div>
          <div className="absolute bottom-24 right-6 w-2.5 h-2.5 bg-blue-300/60 rounded-full animate-bounce delay-700"></div>
        </div>
      </div>
    </>
  );
}

export default ShowModal;