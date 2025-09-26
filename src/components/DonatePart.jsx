import React from 'react';
import Link from 'next/link'; // Adjust import based on your routing library

const DonationPart = () => {
  return (
    <Link href="/donate" className="block mx-4 my-3">
      <div className="relative overflow-hidden bg-gradient-to-r from-rose-500 via-orange-500 to-red-500 py-2 -mt-15 md:-mt-2 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-[1.01] hover:shadow-xl cursor-pointer">
        
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_white_1px,_transparent_1px)] bg-[length:15px_15px] animate-pulse"></div>
        </div>
        
        {/* Floating sparkles - reduced */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-2 left-4 w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{animationDelay: '0s', animationDuration: '2s'}}></div>
          <div className="absolute top-3 right-6 w-1 h-1 bg-yellow-200 rounded-full animate-bounce" style={{animationDelay: '0.5s', animationDuration: '1.5s'}}></div>
          <div className="absolute bottom-2 right-4 w-1 h-1 bg-yellow-200 rounded-full animate-bounce" style={{animationDelay: '1s', animationDuration: '2s'}}></div>
        </div>

        {/* Glowing border effect - subtle */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-rose-400 via-orange-400 to-red-400 opacity-50 blur-lg animate-pulse"></div>
        
        {/* Content */}
        <div className="relative z-10 text-center">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center animate-spin" style={{animationDuration: '3s'}}>
              <div className="w-3 h-3 bg-yellow-300 rounded-full animate-pulse"></div>
            </div>
            
            <p className="font-bold text-white text-base md:text-lg drop-shadow-lg animate-fade-in">
              Want to contribute for{' '}
              <span className="inline-block animate-bounce bg-white/20 px-2 py-0.5 rounded-full text-sm md:text-base" style={{animationDelay: '0.2s'}}>
                Sri Jagannath Seva
              </span>{' '}
              ?
            </p>
            
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
              <div className="w-3 h-3 bg-red-300 rounded-full"></div>
            </div>
          </div>
          
          <div className="inline-flex items-center gap-2 bg-white/90 hover:bg-white text-rose-600 font-bold py-2 px-6 rounded-full shadow-lg transform transition-all duration-300 hover:scale-105">
            <span className="hover:animate-bounce">💝</span>
            <span className="text-sm md:text-base">Donate Now</span>
            <span className="hover:animate-bounce">🙏</span>
          </div>
        </div>
      </div>

      {/* Custom CSS for fade-in animation */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
      `}</style>
    </Link>
  );
};

export default DonationPart;