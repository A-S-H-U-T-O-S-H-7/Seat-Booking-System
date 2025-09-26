import React, { useState } from 'react';
import { Ticket, MapPin, ArrowRight, Users, Calendar, Clock } from 'lucide-react';
import Link from 'next/link';

export default function EventParticipation() {
  const [hoveredButton, setHoveredButton] = useState(null);

  return (
    <div className="w-full mt-10 md:mt-5">
      <div className="relative mx-5 bg-gradient-to-br from-teal-50 via-emerald-50 to-teal-100 rounded-3xl overflow-hidden shadow-xl border border-teal-100/50">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-100/40 to-transparent"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-emerald-200/20 to-transparent rounded-full blur-3xl transform translate-x-32 -translate-y-32"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-teal-200/20 to-transparent rounded-full blur-3xl transform -translate-x-32 translate-y-32"></div>
        </div>

        <div className="relative  flex flex-col lg:flex-row min-h-[100px]">
          {/* Left side - Compact Image */}
          <div className="lg:w-2/8 relative">
            <div className=" h-58 md:h-24 lg:h-full w-88 pl-6 relative overflow-hidden">
              <img 
                src="/mandir3.png" 
                alt="Event Experience" 
                className="w-60 h-84 object-cover scale-105 hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-teal-400/20 via-emerald-400/15 to-teal-500/20"></div>
              
              {/* Floating Elements */}
              <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-md rounded-full px-3 py-1.5 text-teal-700 text-xs font-medium flex items-center gap-1 shadow-sm">
                <Calendar className="w-3 h-3" />
                Live Event
              </div>
              
              
            </div>
          </div>

          {/* Right side - Content */}
          <div className="lg:w-3/5 p-6 lg:p-8 flex flex-col justify-center">
            {/* Header */}
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-100/60 to-emerald-100/60 backdrop-blur-sm rounded-full px-4 py-1.5 mb-3 border border-teal-200/50">
                <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div>
                <span className="text-teal-600 text-xs font-medium tracking-wide">EXCLUSIVE EVENT</span>
              </div>
              
              <h2 className="text-xl lg:text-3xl font-bold text-gray-800 mb-3 leading-tight">
                Be Part of This
                <span className="block bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                  Extraordinary Experience
                </span>
              </h2>
              <p className="text-gray-600 text-sm lg:text-base leading-relaxed">
                Join innovators, creators, and visionaries for an unforgettable journey of discovery and connection.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              {/* Primary CTA */}
              <button
                onMouseEnter={() => setHoveredButton('entry')}
                onMouseLeave={() => setHoveredButton(null)}
                className="group cursor-pointer relative overflow-hidden rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 px-6 py-3 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-teal-500/25"
              >
               <Link href="/delegate">
  <div className="relative flex items-center justify-center gap-2 text-white font-semibold text-sm">
    <Ticket className={`w-4 h-4 transition-transform duration-300 ${hoveredButton === 'entry' ? 'rotate-12 scale-110' : ''}`} />
    <span>
      Get <span className="text-yellow-400 inline-block font-bold animate-pulse" style={{
        animation: 'wiggle 1s  infinite',
        transformOrigin: 'center'
      }}>Free</span> Entry Pass
    </span>
    <ArrowRight className={`w-4 h-4 transition-transform duration-300 ${hoveredButton === 'entry' ? 'translate-x-2' : ''}`} />
  </div>
  <style jsx>{`
    @keyframes wiggle {
      0%, 100% { transform: rotate(0deg); }
      50% { transform: rotate(30deg); }
    }
  `}</style>
</Link>
                
                {/* Shine effect */}
                <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transition-all duration-700 ${hoveredButton === 'entry' ? 'translate-x-full' : '-translate-x-full'}`}></div>
              </button>

              {/* Secondary Button */}
            <Link href="/showlayout">
              <button
                onMouseEnter={() => setHoveredButton('seating')}
                onMouseLeave={() => setHoveredButton(null)}
                className="group border border-teal-200/50 bg-white/60 backdrop-blur-sm rounded-xl px-6 py-3 transition-all duration-300 hover:scale-105 hover:bg-white/80 hover:border-teal-300"
              >
                <div className="flex cursor-pointer items-center justify-center gap-2 text-teal-700 font-medium text-sm">
                  <MapPin className={`w-4 h-4 transition-transform duration-300 ${hoveredButton === 'seating' ? 'scale-110 rotate-3' : ''}`} />
                  <span>View Show Layout</span>
                </div>
              </button>
                </Link>
            </div>

            {/* Trust Indicator */}
            <div className="mt-4 pt-4 border-t border-teal-100">
              <p className="text-gray-500 text-xs flex items-center gap-2">
                <span>Instant confirmation • No hidden fees</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}