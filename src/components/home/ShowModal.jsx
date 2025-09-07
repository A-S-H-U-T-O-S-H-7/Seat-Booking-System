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
      <div className="fixed max-h-90 inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 
                     rounded-3xl shadow-2xl max-w-md w-full mx-4 
                     transform transition-all duration-300 scale-100
                     border border-white/50 backdrop-blur-lg"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative p-8 pb-6">
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full 
                        bg-white/80 hover:bg-white transition-colors duration-200
                        flex items-center justify-center text-gray-500 hover:text-gray-700
                        shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Title with gradient */}
            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 
                            rounded-full flex items-center justify-center shadow-xl">
                <img 
                  src="/show.png" 
                  alt="Show" 
                  className="w-10 h-10 object-contain drop-shadow-sm"
                />
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 
                           bg-clip-text text-transparent mb-2">
                ✨ Cultural Show ✨
              </h2>
            </div>
          </div>
          
          {/* Content */}
          <div className="px-8 pb-8">
            {/* Welcome Quote */}
            <div className="text-center mb-6 p-4 bg-white/60 rounded-2xl shadow-inner">
              <p className="text-gray-700 text-lg leading-relaxed font-medium italic">
                "🎭 Where culture meets celebration, and every moment becomes a memory to cherish forever! 🌟"
              </p>
            </div>
            
            {/* Event Details */}
            <div className="space-y-4">
              {/* Duration */}
              <div className="flex items-center justify-center p-4 bg-gradient-to-r from-blue-100 to-cyan-100 
                            rounded-2xl shadow-sm">
                <div className="text-center">
                  <div className="text-2xl mb-2">📅</div>
                  <div className="text-gray-700 font-semibold">5 Amazing Days</div>
                  <div className="text-blue-600 font-bold text-lg">3rd Dec - 7th Dec</div>
                </div>
              </div>
              
              {/* Timing */}
              <div className="flex items-center justify-center p-4 bg-gradient-to-r from-cyan-100 to-teal-100 
                            rounded-2xl shadow-sm">
                <div className="text-center">
                  <div className="text-2xl mb-2">🕐</div>
                  <div className="text-gray-700 font-semibold">Evening Shows</div>
                  <div className="text-teal-600 font-bold text-lg">5:00 PM - 10:00 PM</div>
                </div>
              </div>
            </div>
            
            {/* Call to Action */}
            <div className="mt-8 text-center">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-teal-50 rounded-2xl mb-4">
                <p className="text-gray-600 text-sm leading-relaxed">
                  🎪 Join us for an unforgettable journey through art, music, and dance! 
                  Experience the magic of live performances that will touch your heart and soul. 💫
                </p>
              </div>
              
              {/* Decorative elements */}
              <div className="flex justify-center space-x-2 text-2xl animate-pulse">
                <span>🎨</span>
                <span>🎵</span>
                <span>💃</span>
                <span>🎭</span>
                <span>✨</span>
              </div>
            </div>
          </div>
          
          {/* Floating particles animation */}
          <div className="absolute top-10 left-10 w-2 h-2 bg-blue-400/60 rounded-full animate-bounce delay-100"></div>
          <div className="absolute top-20 right-12 w-1.5 h-1.5 bg-cyan-400/60 rounded-full animate-pulse delay-300"></div>
          <div className="absolute bottom-20 left-8 w-1 h-1 bg-teal-400/60 rounded-full animate-ping delay-500"></div>
          <div className="absolute bottom-32 right-6 w-2.5 h-2.5 bg-blue-300/60 rounded-full animate-bounce delay-700"></div>
        </div>
      </div>
    </>
  );
}

export default ShowModal;