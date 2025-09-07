import Link from "next/link";
import { useState } from "react";
import ShowModal from "./ShowModal";

function HeroActions({ user }) {

   const [isShowModalOpen, setIsShowModalOpen] = useState(false);

  const openShowModal = () => setIsShowModalOpen(true);
  const closeShowModal = () => setIsShowModalOpen(false);
  return (
    <div className="flex justify-center items-center py-4 md:py-8 px-2 md:px-4">
      {user ? (
        <div className="flex flex-row gap-6 md:gap-12 lg:gap-20 items-center justify-center w-full  flex-wrap">
          
          {/* Havan Booking Circle */}
          <div className="group relative flex items-center justify-center">
            {/* Mobile Version - Simple Round Button */}
            <div className="block md:hidden relative">
              <Link
                href="/booking/havan"
                className="relative group flex items-center justify-center
                           w-16 h-16 sm:w-18 sm:h-18
                           bg-gradient-to-br from-orange-400 via-red-500 to-yellow-500
                           rounded-full shadow-xl cursor-pointer
                           transform active:scale-95 transition-all duration-200
                           focus:outline-none focus:ring-4 focus:ring-orange-300 focus:ring-opacity-50
                           touch-manipulation"
              >
                <div className="flex flex-col items-center justify-center text-center">
                  <img 
                    src="/havanicon.png" 
                    alt="Havan" 
                    className="w-6 h-6 sm:w-7 sm:h-7 object-contain drop-shadow-sm mb-1"
                  />
                  <span className="text-white font-bold text-xs tracking-wide drop-shadow-lg">
                    Havan
                  </span>
                </div>
              </Link>
              
              {/* Mobile Floating particles */}
              <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-yellow-400 rounded-full animate-bounce delay-100"></div>
              <div className="absolute -bottom-2 -left-2 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-400 rounded-full animate-pulse delay-300"></div>
              <div className="absolute top-1 -left-3 w-1 h-1 sm:w-1.5 sm:h-1.5 bg-red-400 rounded-full animate-ping delay-500"></div>
            </div>
            
            {/* Desktop Version - Original Design */}
            <div className="hidden md:block">
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
                      Reserve Your Havan Spot
                    </span>
                  </div>
                </Link>
              </div>
              
              {/* Floating particles */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-bounce delay-100"></div>
              <div className="absolute -bottom-2 -left-2 w-2 h-2 bg-orange-400 rounded-full animate-pulse delay-300"></div>
              <div className="absolute top-1 -left-3 w-1.5 h-1.5 bg-red-400 rounded-full animate-ping delay-500"></div>
            </div>
          </div>

          {/* Stall Booking Circle */}
          <div className="group relative flex items-center justify-center">
            {/* Mobile Version - Simple Round Button */}
            <div className="block md:hidden relative">
              <Link
                href="/booking/stall"
                className="relative group flex items-center justify-center
                           w-16 h-16 sm:w-18 sm:h-18
                           bg-gradient-to-br from-purple-500 via-pink-500 to-indigo-500
                           rounded-full shadow-xl cursor-pointer
                           transform active:scale-95 transition-all duration-200
                           focus:outline-none focus:ring-4 focus:ring-purple-300 focus:ring-opacity-50
                           touch-manipulation"
              >
                <div className="flex flex-col items-center justify-center text-center">
                  <img 
                    src="/stall.png" 
                    alt="Stall" 
                    className="w-6 h-6 sm:w-7 sm:h-7 object-contain drop-shadow-sm mb-1"
                  />
                  <span className="text-white font-bold text-xs tracking-wide drop-shadow-lg">
                    Stall
                  </span>
                </div>
              </Link>
              
              {/* Mobile Floating particles */}
              <div className="absolute -top-2 -left-1 w-2 h-2 sm:w-3 sm:h-3 bg-pink-400 rounded-full animate-pulse delay-200"></div>
              <div className="absolute -bottom-1 -right-2 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-400 rounded-full animate-bounce delay-400"></div>
              <div className="absolute top-2 -right-3 w-1 h-1 sm:w-1.5 sm:h-1.5 bg-indigo-400 rounded-full animate-ping delay-600"></div>
            </div>
            
            {/* Desktop Version - Original Design */}
            <div className="hidden md:block">
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
                      Reserve Your Stall
                    </span>
                  </div>
                </Link>
              </div>
              
              <div className="absolute -top-2 -left-1 w-3 h-3 bg-pink-400 rounded-full animate-pulse delay-200"></div>
              <div className="absolute -bottom-1 -right-2 w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-400"></div>
              <div className="absolute top-2 -right-3 w-1.5 h-1.5 bg-indigo-400 rounded-full animate-ping delay-600"></div>
            </div>
          </div>

          {/* Show Booking Circle */}
          <div className="group relative flex items-center justify-center">
            <div className="block md:hidden relative">
              <button onClick={openShowModal}
                className="relative group flex items-center justify-center
                           w-16 h-16 sm:w-18 sm:h-18
                           bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500
                           rounded-full shadow-xl cursor-pointer
                           transform active:scale-95 transition-all duration-200
                           focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50
                           touch-manipulation"
              >
                <div className="flex flex-col items-center justify-center text-center">
                  <img 
                    src="/show.png" 
                    alt="Show" 
                    className="w-6 h-6 sm:w-7 sm:h-7 object-contain drop-shadow-sm mb-1"
                  />
                  <span className="text-white font-bold text-xs tracking-wide drop-shadow-lg">
                    Show
                  </span>
                </div>
              </button>
              
              <div className="absolute -bottom-2 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-cyan-400 rounded-full animate-bounce delay-300"></div>
              <div className="absolute -top-1 -left-2 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-400 rounded-full animate-pulse delay-500"></div>
              <div className="absolute -bottom-3 left-1 w-1 h-1 sm:w-1.5 sm:h-1.5 bg-teal-400 rounded-full animate-ping delay-700"></div>
            </div>
            
            <div className="hidden md:block">
              <div className="absolute -inset-3 bg-gradient-to-r from-blue-500/20 via-cyan-500/20 to-teal-500/20 rounded-full blur-xl opacity-75 animate-pulse group-hover:opacity-100 group-hover:blur-lg transition-all duration-500"></div>
              
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-15 h-15 bg-gradient-to-br from-white via-blue-50 to-white rounded-full shadow-2xl flex items-center justify-center z-20 border-2 border-blue-200/50 group-hover:scale-95 transition-all duration-300">
                <img 
                  src="/show.png" 
                  alt="Show" 
                  className="w-8 h-8 object-contain drop-shadow-sm group-hover:scale-90 transition-transform duration-300"
                />
              </div>
              
              <div className="relative w-16 h-16 group-hover:w-72 group-hover:h-14 transition-all duration-700 ease-out flex items-center justify-center">
                <button onClick={openShowModal}
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
                  
                  <div className="opacity-0 group-hover:opacity-100 flex items-center justify-center w-full h-full pl-16 pr-4
                                transition-all duration-500 delay-200">
                    <span className="text-white font-semibold text-base tracking-wide whitespace-nowrap 
                                   drop-shadow-lg flex items-center gap-2">
                      Reserve Your Show Spot
                    </span>
                  </div>
                </button>
              </div>
              
              <div className="absolute -bottom-2 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-bounce delay-300"></div>
              <div className="absolute -top-1 -left-2 w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-500"></div>
              <div className="absolute -bottom-3 left-1 w-1.5 h-1.5 bg-teal-400 rounded-full animate-ping delay-700"></div>
            </div>
          </div>

          {/* Delegate Registration Circle */}
          <div className="group relative flex items-center justify-center">
            {/* Mobile Version - Simple Round Button */}
            <div className="block md:hidden relative">
              <Link
                href="/booking/delegate"
                className="relative group flex items-center justify-center
                           w-16 h-16 sm:w-18 sm:h-18
                           bg-gradient-to-br from-emerald-500 via-green-500 to-lime-500
                           rounded-full shadow-xl cursor-pointer
                           transform active:scale-95 transition-all duration-200
                           focus:outline-none focus:ring-4 focus:ring-emerald-300 focus:ring-opacity-50
                           touch-manipulation"
              >
                <div className="flex flex-col items-center justify-center text-center">
                  <img 
                    src="/delegate.png" 
                    alt="Delegate" 
                    className="w-6 h-6 sm:w-7 sm:h-7 object-contain drop-shadow-sm mb-1"
                  />
                  <span className="text-white font-bold text-xs tracking-wide drop-shadow-lg">
                    Delegate
                  </span>
                </div>
              </Link>
              
              {/* Mobile Floating particles */}
              <div className="absolute -top-2 -right-2 w-2 h-2 sm:w-3 sm:h-3 bg-lime-400 rounded-full animate-bounce delay-400"></div>
              <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-400 rounded-full animate-pulse delay-600"></div>
              <div className="absolute top-3 -left-2 w-1 h-1 sm:w-1.5 sm:h-1.5 bg-green-400 rounded-full animate-ping delay-800"></div>
            </div>
            
            {/* Desktop Version - Original Design */}
            <div className="hidden md:block">
              <div className="absolute -inset-3 bg-gradient-to-r from-emerald-500/20 via-green-500/20 to-lime-500/20 rounded-full blur-xl opacity-75 animate-pulse group-hover:opacity-100 group-hover:blur-lg transition-all duration-500"></div>
              
              <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-15 h-15 bg-gradient-to-br from-white via-emerald-50 to-white rounded-full shadow-2xl flex items-center justify-center z-20 border-2 border-emerald-200/50 group-hover:scale-95 transition-all duration-300">
                <img 
                  src="/delegate.png" 
                  alt="Delegate" 
                  className="w-12 h-12 object-contain drop-shadow-sm group-hover:scale-90 transition-transform duration-300"
                />
              </div>
              
              <div className="relative w-16 h-16 group-hover:w-80 group-hover:h-14 transition-all duration-700 ease-out flex items-center justify-center">
                <Link
                  href="/booking/delegate"
                  className="absolute inset-0 rounded-full group-hover:rounded-2xl
                             bg-gradient-to-br from-emerald-500 via-green-500 to-lime-500
                             hover:shadow-2xl hover:shadow-emerald-500/30 cursor-pointer
                             transform hover:scale-105 group-hover:scale-100 transition-all duration-500
                             flex items-center justify-center overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-lime-500 via-green-500 to-emerald-600 
                                opacity-0 group-hover:opacity-100 transition-opacity duration-500 
                                rounded-full group-hover:rounded-2xl"></div>
                  
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent
                                -skew-x-12 translate-x-[-200%] group-hover:translate-x-[300%] 
                                transition-transform duration-1200 ease-out
                                rounded-full group-hover:rounded-2xl"></div>
                  
                  <div className="opacity-0 group-hover:opacity-100 flex items-center justify-center w-full h-full pl-16 pr-4
                                transition-all duration-500 delay-200">
                    <span className="text-white font-semibold text-base tracking-wide whitespace-nowrap 
                                   drop-shadow-lg flex items-center gap-2">
                      Register as Delegate
                    </span>
                  </div>
                </Link>
              </div>
              
              <div className="absolute -top-2 -right-2 w-3 h-3 bg-lime-400 rounded-full animate-bounce delay-400"></div>
              <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-emerald-400 rounded-full animate-pulse delay-600"></div>
              <div className="absolute top-3 -left-2 w-1.5 h-1.5 bg-green-400 rounded-full animate-ping delay-800"></div>
            </div>
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
              <span className="relative font-bold tracking-wide">Register Now</span>
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
              <span className="relative font-bold tracking-wide">LogIn</span>
            </Link>
          </div>
        </div>
      )}
            <ShowModal isOpen={isShowModalOpen} onClose={closeShowModal} />

    </div>
  );
}

export default HeroActions;