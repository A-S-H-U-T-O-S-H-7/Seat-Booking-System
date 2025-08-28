import React from 'react'
import DonateBar from '../donation/DonationBar';

function DelegateBanner() {
  return (
    <div className=" rounded-lg">
      <div className="text-center mb-6">
        <div className="relative bg-gradient-to-br from-yellow-100 via-amber-100 to-white
          backdrop-blur-sm rounded-2xl shadow-2xl border border-white/60 overflow-hidden">

          {/* Blue Background Image */}
          {/* <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(/lilacbg.png)'
            }}
          ></div> */}
          
          {/* Stall Design Border at Top */}
          <div 
            className="relative z-10 w-full h-6 sm:h-8 bg-repeat-x bg-center"
            style={{
              backgroundImage: 'url(/pinkflower.png)',
              backgroundSize: 'auto 100%',
              transform: 'scaleY(-1)'
            }}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          ></div>
          
          {/* Background Decoration - Updated with z-index */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/5 via-purple-400/10 to-pink-400/5 z-5"></div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-400/50 to-transparent rounded-full transform translate-x-12 -translate-y-12 z-5"></div>
          <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-purple-400/50 to-transparent rounded-full transform -translate-x-10 translate-y-10 z-5"></div>
          
          {/* Main Content Container */}
          <div className="relative z-20 px-3 md:px-4 py-4 md:py-6">
            <div className="flex items-center justify-between gap-2 max-w-6xl mx-auto">
              
              {/* Left side - Stall Image */}
              <div className="hidden lg:flex flex-shrink-0">
                <img 
                  src="/namaste.png" 
                  alt="Stall Preview" 
                  className="w-24 h-24 lg:w-75 lg:h-75 object-contain drop-shadow-lg"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
      
              {/* Center - Main Content */}
              <div className="text-center flex-1 min-w-0">
               
      
                <div className='w-full max-w-sm mx-auto mb-3'>
                  <DonateBar/>
                </div>

                <h1 className="text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-pink-400 via-rose-600 to-fuchsia-600 bg-clip-text text-transparent mb-2 leading-tight">
  Welcome, Dear Guest
</h1>

<p className="text-gray-700 text-sm md:text-base max-w-xl mx-auto mb-3 leading-relaxed">
  We warmly invite you to the sacred Havan — may your presence bring divine blessings.
</p>

                
                {/* Feature Pills - Compact */}
                <div className="flex flex-wrap justify-center gap-2 text-xs md:text-sm">
                  <div className="flex items-center gap-1.5 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 px-3 py-1.5 rounded-full border border-green-200/50 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-semibold">Comfortable stay</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 px-3 py-1.5 rounded-full border border-blue-200/50 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="font-semibold">Facility of Pick & Drop</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-3 py-1.5 rounded-full border border-purple-200/50 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse"></div>
                    <span className="font-semibold">Premium Amenities</span>
                  </div>
                </div>
              </div>
      
              
            </div>
          </div>
        </div>
      </div>
    </div>
  ) 
}

export default DelegateBanner