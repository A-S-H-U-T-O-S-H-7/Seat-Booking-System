import Link from 'next/link';

function HeroSection({ user }) {
  return (
    <>
      {/* Hero Section */}
      <section className="relative py-4 sm:py-6 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/havan.jpg" 
            alt="Havan Ceremony" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-orange-100/80 via-yellow-100/70 to-red-100/80"></div>
        </div>
        
        <div className="relative z-10 text-center px-4 sm:px-6">
          <div className="mb-6">
            <img 
              src="/havan.jpg" 
              alt="Havan Ceremony" 
              className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 xl:w-48 xl:h-48 rounded-full object-cover mx-auto shadow-2xl border-4 border-white/50"
            />
          </div>
          <h2 className="text-xl sm:text-3xl md:text-5xl font-bold text-gray-800 mb-4 sm:mb-6 leading-tight">
            Sri Jagannatha Pancha Ratra<br />
            <span className="bg-gradient-to-r from-orange-600 via-red-500 to-yellow-600 bg-clip-text text-transparent">
              Havan Ceremony
            </span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-700 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed font-medium">
            Join us for a divine 5-day ceremony.<br />
            Book your seats online for spiritual experience filled with peace and blessings.
          </p>
          
          {user ? (
            <Link
              href="/booking/havan"
              className="inline-block bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 hover:from-orange-600 hover:via-red-600 hover:to-yellow-600 text-white px-6 sm:px-8 lg:px-10 py-3 sm:py-4 rounded-xl text-sm sm:text-base lg:text-lg xl:text-xl font-semibold transform hover:scale-105 transition-all duration-300 shadow-xl hover:shadow-2xl"
            >
              🕉️ Book Your Seats Now
            </Link>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md sm:max-w-none mx-auto">
              <Link
                href="/register"
                className="inline-block bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 hover:from-orange-600 hover:via-red-600 hover:to-yellow-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-sm sm:text-base lg:text-lg font-semibold transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl w-full sm:w-auto"
              >
                Register & Book Seats
              </Link>
              <Link
                href="/login"
                className="inline-block border-2 border-orange-500 text-orange-600 hover:bg-orange-50 hover:border-orange-600 hover:text-orange-700 px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-sm sm:text-base lg:text-lg font-semibold transform hover:scale-105 transition-all duration-300 w-full sm:w-auto"
              >
                Login to Book
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Event Details */}
      <section className="py-12 sm:py-16 bg-white shadow-inner">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-8 sm:mb-12 text-gray-800">
            Ceremony Details
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Duration */}
            <div className="text-center p-4 sm:p-6 rounded-xl bg-gradient-to-b from-orange-50 to-yellow-50 hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-2xl sm:text-3xl text-white">📅</span>
              </div>
              <h4 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2 sm:mb-3 text-gray-800">5-Day Sacred Event</h4>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                Sacred Havan ceremony spanning 5 consecutive days with morning and afternoon sessions
              </p>
            </div>

            {/* Timing */}
            <div className="text-center p-4 sm:p-6 rounded-xl bg-gradient-to-b from-yellow-50 to-red-50 hover:shadow-lg transition-shadow duration-300">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-2xl sm:text-3xl text-white">⏰</span>
              </div>
              <h4 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2 sm:mb-3 text-gray-800">Two Shifts Daily</h4>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                <strong>Morning:</strong> 9:00 AM - 12:00 PM<br />
                <strong>Afternoon:</strong> 2:00 PM - 5:00 PM
              </p>
            </div>

            {/* Capacity */}
            <div className="text-center p-4 sm:p-6 rounded-xl bg-gradient-to-b from-red-50 to-orange-50 hover:shadow-lg transition-shadow duration-300 sm:col-span-2 lg:col-span-1">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-red-400 to-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-2xl sm:text-3xl text-white">🪑</span>
              </div>
              <h4 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2 sm:mb-3 text-gray-800">400 Sacred Seats</h4>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                Organized seating in 4 blocks (A, B, C, D) with clear view of the sacred fire
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default HeroSection;