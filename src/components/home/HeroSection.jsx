import Link from 'next/link';

function HeroSection({ user }) {
  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        {/* Enhanced Layered Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-yellow-50/95 to-red-50/85"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-yellow-100/30 via-transparent to-orange-100/25"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-200/30 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-yellow-200/25 via-transparent to-transparent"></div>
        
        {/* Animated Floating Background Elements */}
        <div className="absolute top-16 right-16 w-72 h-72 bg-gradient-to-r from-orange-300/25 to-yellow-300/25 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-28 left-12 w-56 h-56 bg-gradient-to-r from-red-300/20 to-orange-300/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 right-1/4 w-40 h-40 bg-gradient-to-r from-yellow-400/15 to-red-400/15 rounded-full blur-xl animate-pulse delay-500"></div>
        <div className="absolute bottom-1/3 left-1/4 w-24 h-24 bg-gradient-to-r from-orange-400/20 to-yellow-400/20 rounded-full blur-lg animate-pulse delay-700"></div>

        <div className="relative z-10 w-full  px-4 sm:px-6 lg:px-10 py-6">
          {/* Main Content Container */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 mb-10">
            
            {/* Left Side - Enhanced Image Section */}
            <div className="w-full lg:w-2/5 flex justify-center lg:justify-start">
              <div className="relative group">
                {/* Main Image with Enhanced Effects */}
                <div className="relative overflow-hidden rounded-3xl shadow-2xl transform group-hover:scale-105 transition-all duration-700">
                  <img 
                    src="/heroimage.png" 
                    alt="Divine Ceremony" 
                    className="w-full max-w-sm lg:max-w-lg h-auto object-cover"
                  />
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
                
                {/* Enhanced Decorative Elements with Animation */}
                <div className="absolute -top-8 -left-8 w-24 h-24 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-full opacity-40 animate-bounce delay-300"></div>
                <div className="absolute -bottom-8 -right-8 w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-full opacity-50 animate-bounce delay-700"></div>
                <div className="absolute top-1/2 -right-6 w-16 h-16 bg-gradient-to-br from-yellow-500 to-red-500 rounded-full opacity-35 animate-bounce delay-500"></div>
                <div className="absolute bottom-1/4 -left-4 w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full opacity-45 animate-bounce delay-1000"></div>
                
                {/* Enhanced Glow Effect */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-orange-500/20 via-yellow-500/15 to-red-500/20 blur-2xl opacity-70 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </div>

            {/* Right Side - Enhanced Content Section */}
            <div className="w-full lg:w-3/5 space-y-8">
              
              {/* Floating Havan Image with Enhanced Design */}
              <div className="flex justify-center lg:justify-start mb-6">
                <div className="relative group">
                  <div className="relative">
                    <img 
                      src="/havan.jpg" 
                      alt="Sacred Havan Ceremony" 
                      className="w-24 h-24 md:w-28 md:h-28 rounded-full object-cover shadow-xl border-3 border-white/90 backdrop-blur-sm transform group-hover:scale-110 transition-all duration-500"
                    />
                    {/* Rotating Border Effect */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500 via-yellow-500 to-red-500 opacity-60 animate-spin" style={{animationDuration: '8s'}}></div>
                    <div className="absolute inset-1 rounded-full bg-white"></div>
                    <img 
                      src="/havan.jpg" 
                      alt="Sacred Havan Ceremony" 
                      className="absolute inset-2 w-20 h-20 md:w-24 md:h-24 rounded-full object-cover"
                    />
                  </div>
                  
                  {/* Enhanced Glow Effects */}
                  <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-orange-400/30 via-yellow-400/30 to-red-400/30 blur-lg animate-pulse"></div>
                  <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-orange-300/15 via-yellow-300/15 to-red-300/15 blur-xl animate-pulse delay-500"></div>
                </div>
              </div>

              {/* Enhanced Title Section */}
              <div className="text-center lg:text-left space-y-3">
                <h1 className="text-2xl lg:text-4xl  font-black leading-tight">
                  <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 bg-clip-text text-transparent mb-4 font-extrabold tracking-tight">
                    International
                  </span>
                  <span className="block text-gray-900 font-bold  tracking-tight mb-1 text-shadow-sm">
                    Sri Jagannatha Pancha Ratra
                  </span>
                  
                  <span className="block bg-gradient-to-r from-orange-600 via-red-600 to-yellow-600 bg-clip-text text-transparent font-black tracking-tight">
                    Havan Ceremony
                  </span>
                </h1>
              </div>

              {/* Enhanced Description Card */}
              <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 lg:p-8 shadow-2xl border border-orange-200/30 hover:shadow-3xl transition-all duration-500">
                <div className="text-center lg:text-left space-y-3">
                  <p className="text-lg sm:text-xl lg:text-xl text-gray-800 leading-relaxed font-bold">
                    Be a <span className="font-black text-transparent bg-gradient-to-r from-orange-600 via-red-600 to-yellow-600 bg-clip-text">SVS member</span> and join us for a divine 5-day ceremony.
                  </p>
                  <div className="w-16 h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mx-auto lg:mx-0"></div>
                  <p className="text-base sm:text-lg lg:text-lg text-gray-700 leading-relaxed font-medium">
                    Book your seats online for a spiritual experience filled with 
                    <span className="text-orange-600 font-bold"> peace</span>, 
                    <span className="text-yellow-600 font-bold"> blessings</span>, and
                    <span className="text-red-600 font-bold"> divine grace</span>.
                  </p>
                </div>
              </div>
            </div>
          </div>

{/* Enhanced Animated Action Buttons */}
<div className="flex justify-center items-center py-8 px-4">
  {user ? (
    <div className="flex flex-col md:flex-row gap-12 md:gap-20 items-center justify-center w-full max-w-5xl mx-auto">
      
      {/* Havan Booking Circle */}
      <div className="group relative flex items-center justify-center">
        {/* Outer glow ring */}
        <div className="absolute -inset-3 bg-gradient-to-r from-orange-400/20 via-red-500/20 to-yellow-500/20 rounded-full blur-xl opacity-75 animate-pulse group-hover:opacity-100 group-hover:blur-lg transition-all duration-500"></div>
        
        {/* Icon container - always visible */}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-15 h-15 bg-gradient-to-br from-white via-orange-50 to-white rounded-full shadow-2xl flex items-center justify-center z-20 border-2 border-orange-200/50 group-hover:scale-95 transition-all duration-300">
          <img 
            src="/havanicon.png" 
            alt="Havan" 
            className="w-8 h-8 object-contain drop-shadow-sm group-hover:scale-90 transition-transform duration-300"
          />
        </div>
        
        {/* Expandable button */}
        <div className="relative w-16 h-16 group-hover:w-72 group-hover:h-14 transition-all duration-700 ease-out flex items-center justify-center">
          <Link
            href="/booking/havan"
            className="absolute inset-0 rounded-full group-hover:rounded-2xl
                       bg-gradient-to-br from-orange-400 via-red-500 to-yellow-500
                       hover:shadow-2xl hover:shadow-orange-500/30 cursor-pointer
                       transform hover:scale-105 group-hover:scale-100 transition-all duration-500
                       flex items-center justify-center overflow-hidden"
          >
            {/* Hover background overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 
                          opacity-0 group-hover:opacity-100 transition-opacity duration-500 
                          rounded-full group-hover:rounded-2xl"></div>
            
            {/* Shine animation */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent
                          -skew-x-12 translate-x-[-200%] group-hover:translate-x-[300%] 
                          transition-transform duration-1200 ease-out
                          rounded-full group-hover:rounded-2xl"></div>
            
            {/* Text content - only visible on hover */}
            <div className="opacity-0 group-hover:opacity-100 flex items-center justify-center w-full h-full pl-16
                          transition-all duration-500 delay-200">
              <span className="text-white font-semibold text-base tracking-wide whitespace-nowrap 
                             drop-shadow-lg flex items-center gap-2">
                Book Your Havan Seat
              </span>
            </div>
          </Link>
        </div>
        
        {/* Floating particles */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-bounce delay-100"></div>
        <div className="absolute -bottom-2 -left-2 w-2 h-2 bg-orange-400 rounded-full animate-pulse delay-300"></div>
        <div className="absolute top-1 -left-3 w-1.5 h-1.5 bg-red-400 rounded-full animate-ping delay-500"></div>
      </div>

      {/* Stall Booking Circle */}
      <div className="group relative flex items-center justify-center">
        <div className="absolute -inset-3 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-indigo-500/20 rounded-full blur-xl opacity-75 animate-pulse group-hover:opacity-100 group-hover:blur-lg transition-all duration-500"></div>
        
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-15 h-15 bg-gradient-to-br from-white via-purple-50 to-white rounded-full shadow-2xl flex items-center justify-center z-20 border-2 border-purple-200/50 group-hover:scale-95 transition-all duration-300">
          <img 
            src="/stall.png" 
            alt="Stall" 
            className="w-8 h-8 object-contain drop-shadow-sm group-hover:scale-90 transition-transform duration-300"
          />
        </div>
        
        <div className="relative w-16 h-16 group-hover:w-64 group-hover:h-14 transition-all duration-700 ease-out flex items-center justify-center">
          <Link
            href="/booking/stall"
            className="absolute inset-0 rounded-full group-hover:rounded-2xl
                       bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-500
                       hover:shadow-2xl hover:shadow-purple-500/30 cursor-pointer
                       transform hover:scale-105 group-hover:scale-100 transition-all duration-500
                       flex items-center justify-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-pink-500 to-purple-600 
                          opacity-0 group-hover:opacity-100 transition-opacity duration-500 
                          rounded-full group-hover:rounded-2xl"></div>
            
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent
                          -skew-x-12 translate-x-[-200%] group-hover:translate-x-[300%] 
                          transition-transform duration-1200 ease-out
                          rounded-full group-hover:rounded-2xl"></div>
            
            <div className="opacity-0 group-hover:opacity-100 flex items-center justify-center w-full h-full pl-16
                          transition-all duration-500 delay-200">
              <span className="text-white font-semibold text-base tracking-wide whitespace-nowrap 
                             drop-shadow-lg flex items-center gap-2">
                Book Your Stall
              </span>
            </div>
          </Link>
        </div>
        
        <div className="absolute -top-2 -left-1 w-3 h-3 bg-pink-400 rounded-full animate-pulse delay-200"></div>
        <div className="absolute -bottom-1 -right-2 w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-400"></div>
        <div className="absolute top-2 -right-3 w-1.5 h-1.5 bg-indigo-400 rounded-full animate-ping delay-600"></div>
      </div>

      {/* Show Booking Circle */}
      <div className="group relative flex items-center justify-center">
        <div className="absolute -inset-3 bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-teal-500/20 rounded-full blur-xl opacity-75 animate-pulse group-hover:opacity-100 group-hover:blur-lg transition-all duration-500"></div>
        
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-15 h-15 bg-gradient-to-br from-white via-blue-50 to-white rounded-full shadow-2xl flex items-center justify-center z-20 border-2 border-blue-200/50 group-hover:scale-95 transition-all duration-300">
          <img 
            src="/show.png" 
            alt="Show" 
            className="w-8 h-8 object-contain drop-shadow-sm group-hover:scale-90 transition-transform duration-300"
          />
        </div>
        
        <div className="relative w-16 h-16 group-hover:w-60 group-hover:h-14 transition-all duration-700 ease-out flex items-center justify-center">
          <Link
            href="/booking/show"
            className="absolute inset-0 rounded-full group-hover:rounded-2xl
                       bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500
                       hover:shadow-2xl hover:shadow-blue-500/30 cursor-pointer
                       transform hover:scale-105 group-hover:scale-100 transition-all duration-500
                       flex items-center justify-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-600 
                          opacity-0 group-hover:opacity-100 transition-opacity duration-500 
                          rounded-full group-hover:rounded-2xl"></div>
            
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent
                          -skew-x-12 translate-x-[-200%] group-hover:translate-x-[300%] 
                          transition-transform duration-1200 ease-out
                          rounded-full group-hover:rounded-2xl"></div>
            
            <div className="opacity-0 group-hover:opacity-100 flex items-center justify-center w-full h-full pl-16
                          transition-all duration-500 delay-200">
              <span className="text-white font-semibold text-base tracking-wide whitespace-nowrap 
                             drop-shadow-lg flex items-center gap-2">
                Book Your Show
              </span>
            </div>
          </Link>
        </div>
        
        <div className="absolute -bottom-2 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-bounce delay-300"></div>
        <div className="absolute -top-1 -left-2 w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-500"></div>
        <div className="absolute -bottom-3 left-1 w-1.5 h-1.5 bg-teal-400 rounded-full animate-ping delay-700"></div>
      </div>
    </div>
  ) : (
    <div className="flex flex-col sm:flex-row gap-6 items-center justify-center max-w-4xl mx-auto">
      
      {/* Register Button */}
      <div className="group relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-orange-400/30 via-red-500/30 to-yellow-500/30 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
        <Link
          href="/register"
          className="relative inline-flex items-center justify-center 
                     bg-gradient-to-br from-orange-500 via-red-500 to-yellow-500 
                     text-white px-10 py-5 rounded-2xl text-lg font-bold 
                     shadow-2xl min-w-[280px] hover:scale-105 hover:shadow-orange-500/25 
                     transition-all duration-300 overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 
                        opacity-0 group-hover:opacity-100 transition-opacity duration-400 rounded-2xl"></div>
          
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent 
                        -skew-x-12 translate-x-[-100%] group-hover:translate-x-[200%] 
                        transition-transform duration-800"></div>
          
          <span className="relative text-2xl mr-4 group-hover:animate-pulse">🎯</span>
          <span className="relative font-bold tracking-wide">Register & Book Seats</span>
        </Link>
      </div>
      
      {/* Login Button */}
      <div className="group relative">
        <div className="absolute -inset-1 bg-orange-500/20 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
        <Link
          href="/login"
          className="relative inline-flex items-center justify-center 
                     border-3 border-orange-500 bg-white/95 backdrop-blur-sm 
                     text-orange-700 px-10 py-5 rounded-2xl text-lg font-bold 
                     shadow-2xl min-w-[240px] hover:bg-orange-500 hover:text-white 
                     hover:scale-105 hover:shadow-orange-500/25 transition-all duration-300"
        >
          <span className="relative text-2xl mr-4 group-hover:animate-pulse">🔐</span>
          <span className="relative font-bold tracking-wide">Login to Book</span>
        </Link>
      </div>
    </div>
  )}
</div>
        </div>
      </section>

      {/* Enhanced Event Details Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-b from-white via-orange-50/40 to-yellow-50/30 shadow-inner relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-200/15 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-yellow-200/10 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-red-200/10 via-transparent to-transparent"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-transparent bg-gradient-to-r from-gray-900 via-gray-700 to-gray-800 bg-clip-text mb-4">
              Havan Ceremony Details
            </h3>
            <div className="flex justify-center items-center space-x-2 mb-3">
              <div className="w-12 h-1 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full"></div>
              <div className="w-8 h-1 bg-gradient-to-r from-yellow-500 to-red-500 rounded-full"></div>
              <div className="w-16 h-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-full"></div>
            </div>
            <p className="text-base text-gray-600 font-medium max-w-2xl mx-auto">
              Join us for this sacred 5-day journey of spiritual awakening and divine blessings
            </p>
          </div>
          
          {/* Enhanced Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Duration Card */}
            <div className="group text-center p-6 rounded-2xl bg-gradient-to-br from-orange-50 via-white to-yellow-50/80 border border-orange-200/40 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-500">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                <span className="text-2xl text-white">📅</span>
              </div>
              <h4 className="text-lg lg:text-xl font-black mb-3 text-gray-900">5-Day Sacred Event</h4>
              <div className="w-12 h-1 bg-gradient-to-r from-orange-500 to-red-500 mx-auto rounded-full mb-3"></div>
              <p className="text-sm text-gray-700 leading-relaxed font-medium">
                Sacred Havan ceremony spanning 5 consecutive days with dedicated morning and afternoon sessions for complete spiritual immersion
              </p>
            </div>

            {/* Timing Card */}
            <div className="group text-center p-6 rounded-2xl bg-gradient-to-br from-yellow-50 via-white to-red-50/80 border border-yellow-200/40 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-500">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                <span className="text-2xl text-white">⏰</span>
              </div>
              <h4 className="text-lg lg:text-xl font-black mb-3 text-gray-900">Two Sacred Shifts</h4>
              <div className="w-12 h-1 bg-gradient-to-r from-yellow-500 to-orange-500 mx-auto rounded-full mb-3"></div>
              <div className="space-y-2 text-sm text-gray-700 font-medium">
                <div className="bg-gradient-to-r from-orange-100 to-yellow-100 rounded-lg p-3 border border-orange-200/30">
                  <strong className="text-orange-700">Morning Session:</strong>
                  <div className="text-orange-600 font-bold">9:00 AM - 12:00 PM</div>
                </div>
                <div className="bg-gradient-to-r from-red-100 to-orange-100 rounded-lg p-3 border border-red-200/30">
                  <strong className="text-red-700">Afternoon Session:</strong>
                  <div className="text-red-600 font-bold">2:00 PM - 5:00 PM</div>
                </div>
              </div>
            </div>

            {/* Capacity Card */}
            <div className="group text-center p-6 rounded-2xl bg-gradient-to-br from-red-50 via-white to-orange-50/80 border border-red-200/40 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-500 md:col-span-2 lg:col-span-1">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                <span className="text-2xl text-white">🪑</span>
              </div>
              <h4 className="text-lg lg:text-xl font-black mb-3 text-gray-900">400 Sacred Seats</h4>
              <div className="w-12 h-1 bg-gradient-to-r from-red-500 to-yellow-500 mx-auto rounded-full mb-3"></div>
              <p className="text-sm text-gray-700 leading-relaxed font-medium mb-3">
Strategic seating layout across 4 blocks (A, B, C, D) for 400 participants to engage in the havan ceremony, with every seat positioned for devotees to offer their prayers and participate in this Havan ritual.</p>
              <div className="flex justify-center space-x-1">
                <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">Block A</span>
                <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">Block B</span>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">Block C</span>
                <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">Block D</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default HeroSection;