import Link from 'next/link';

function BookingSection({ user }) {
  return (
    <>
      {/* Booking Options */}
      {user && (
        <section className="py-12 sm:py-16 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-8xl mx-auto px-4 sm:px-6">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-8 sm:mb-12 text-gray-800">
              Choose Your Participation Type
            </h3>
            
            <div className="grid grid-cols-3 gap-2  md:gap-4">
              {/* Havan Seat Booking */}
              <Link
                href="/havan"
                className="bg-white rounded-lg sm:rounded-xl shadow-lg border border-gray-200 p-2 sm:p-4 md:p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 active:scale-95 group touch-manipulation cursor-pointer"
              >
                <div className="flex flex-col items-center text-center gap-2 sm:gap-3 md:gap-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                    <img 
                      src="havanicon.png" 
                      alt="Havan icon" 
                      className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-gray-800 group-hover:text-orange-600 transition-colors duration-300 leading-tight">
                      Havan Place
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Sacred ceremony</p>
                  </div>
                </div>
                <p className="text-gray-700 text-center text-xs sm:text-sm leading-relaxed hidden md:block mt-2">
                  Secure your place for the sacred Havan ceremony. Choose from multiple sessions and seating arrangements.
                </p>
              </Link>

              {/* Stall Booking */}
              <Link
                href="/stall"
                className="bg-white rounded-lg sm:rounded-xl shadow-lg border border-gray-200 p-2 sm:p-4 md:p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 active:scale-95 group touch-manipulation cursor-pointer"
              >
                <div className="flex flex-col items-center text-center gap-2 sm:gap-3 md:gap-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                    <img 
                      src="stall.png" 
                      alt="Stall icon" 
                      className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors duration-300 leading-tight">
                      Your Stall
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Vendor space</p>
                  </div>
                </div>
                <p className="text-gray-700 text-center text-xs sm:text-sm leading-relaxed hidden md:block mt-2">
                  Reserve a stall space for your business. 5-day reserve with prime locations available.
                </p>
              </Link>
 
              {/* Show Seat Booking */}
              {/* <Link
                href="/show"
                className="bg-white rounded-lg sm:rounded-xl shadow-lg border border-gray-200 p-2 sm:p-4 md:p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 active:scale-95 group touch-manipulation cursor-pointer"
              >
                <div className="flex flex-col items-center text-center gap-2 sm:gap-3 md:gap-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                    <img 
                      src="show.png" 
                      alt="Show icon" 
                      className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-gray-800 group-hover:text-purple-600 transition-colors duration-300 leading-tight">
                      Show place
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Entertainment</p>
                  </div>
                </div>
                <p className="text-gray-700 text-center text-xs sm:text-sm leading-relaxed hidden md:block mt-2">
                  Pick your spot for cultural shows and performances.
                </p>
              </Link> */}

              {/* Delegates Booking */}
              <Link
                href="/delegate"
                className="bg-white rounded-lg sm:rounded-xl shadow-lg border border-gray-200 p-2 sm:p-4 md:p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 active:scale-95 group touch-manipulation cursor-pointer"
              >
                <div className="flex flex-col items-center text-center gap-2 sm:gap-3 md:gap-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                    <img 
                      src="delegate.png" 
                      alt="Delegate icon" 
                      className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-gray-800 group-hover:text-teal-600 transition-colors duration-300 leading-tight">
                      Delegate Reservation
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">  Delegates</p>
                  </div>
                </div>
                <p className="text-gray-700 text-center text-xs sm:text-sm leading-relaxed hidden md:block mt-2">
                  Be part of the gathering, share your voice, and represent with pride.
                </p>
              </Link>

            </div>
          </div>
        </section>
      )}
      
      {/* Features */}
      <section className="py-12 sm:py-16 bg-gradient-to-b from-gray-50 to-orange-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-8 sm:mb-12 text-gray-800">
            Why Register Online?
          </h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            <div className="text-center p-4 sm:p-6 rounded-xl bg-white hover:shadow-lg transition-all duration-300 hover:transform hover:scale-105">
              <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">💺</div>
              <h4 className="font-bold text-base sm:text-lg mb-2 text-gray-800">Choose Your Place</h4>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">Select exact places with visual seat map</p>
            </div>
            
            <div className="text-center p-4 sm:p-6 rounded-xl bg-white hover:shadow-lg transition-all duration-300 hover:transform hover:scale-105">
              <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">💳</div>
              <h4 className="font-bold text-base sm:text-lg mb-2 text-gray-800">Secure Payment</h4>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">Safe online donation payment with instant confirmation</p>
            </div>
            
            <div className="text-center p-4 sm:p-6 rounded-xl bg-white hover:shadow-lg transition-all duration-300 hover:transform hover:scale-105">
              <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">📧</div>
              <h4 className="font-bold text-base sm:text-lg mb-2 text-gray-800">Email Confirmation</h4>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">Get immediate email confirmation of your donation</p>
            </div>
            
            <div className="text-center p-4 sm:p-6 rounded-xl bg-white hover:shadow-lg transition-all duration-300 hover:transform hover:scale-105">
  <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">🤝</div>
  <h4 className="font-bold text-base sm:text-lg mb-2 text-gray-800">Dedicated Support</h4>
  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
    Our team is here to assist you at every step
  </p>
</div>

          </div>
        </div>
      </section>
    </>
  );
}

export default BookingSection;