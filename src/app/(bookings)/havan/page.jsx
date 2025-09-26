"use client";
import ProtectedRoute from "@/components/ProtectedRoute";
import { BookingProvider } from "@/context/BookingContext";
import BookingFlow from "@/components/BookingFlow";
import DonateBar from "@/components/donation/DonationBar";

export default function BookingPage() {
  return (
    <ProtectedRoute>
      <BookingProvider>
        <div className="bg-gradient-to-br from-orange-50 via-white to-amber-50">
          {/* Header Section */}
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
            <div className="rounded-2xl border bg-gradient-to-r from-orange-200 via-white to-orange-200 backdrop-blur-sm border-orange-200/50 shadow-lg overflow-hidden">
              {/* Flower Design Border at Top of Block */}
              <div
                className="w-full h-8 sm:h-12 bg-repeat-x bg-center"
                style={{
                  backgroundImage: "url(/flowerdesign2.png)",
                  backgroundSize: "auto 100%"
                }}
                onError={e => {
                  e.target.style.display = "none";
                }}
              />

              <div className="container mx-auto px-4 md:px-6 py-4 md:py-6">
                <div className="flex items-center justify-between gap-6 lg:gap-8">
                  {/* Left side - Jaga Image */}
                  <div className="hidden lg:flex flex-1 justify-center">
                    <img
                      src="/jaga1.png"
                      alt="jaga"
                      className="w-32 h-32 xl:w-70 lg:h-75 object-contain drop-shadow-lg"
                      onError={e => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>

                  {/* Center - Main Content */}
                  <div className="text-center flex-1 max-w-3xl mx-auto">
                    <div className="flex justify-center items-center mb-4">
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/60 backdrop-blur-sm shadow-xl flex items-center justify-center border border-orange-300">
                        <img
                          src="/havanicon.png"
                          alt="Havan"
                          className="w-10 h-10 md:w-14 md:h-14 object-cover rounded-full"
                          onError={e => {
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "block";
                          }}
                        />
                        <span className="text-2xl md:text-3xl hidden">🔥</span>
                      </div>
                    </div>

                    <div className="w-full max-w-3xl mx-auto mb-4">
                      <DonateBar />
                    </div>

  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-3 leading-tight whitespace-nowrap">
                      Reserve Your Havan Place
                    </h1>

                    <p className="text-gray-700 text-sm md:text-base max-w-2xl mx-auto mb-4 leading-relaxed">
                      Select your preferred date, shift, and seats for the
                      sacred Havan ceremony
                    </p>

                    <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm text-orange-800 rounded-full text-sm font-medium border border-orange-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
                      ✨ Experience Divine Blessings ✨
                    </div>
                  </div>

                  {/* Right side - Mirror Jaga Image for better balance */}
                  <div className="hidden xl:flex flex-1 justify-center">
                    <img
                      src="/jaga1.png"
                      alt="jaga"
                      className="w-32 h-32 xl:w-70 lg:h-75 object-contain drop-shadow-lg transform scale-x-[-1]"
                      onError={e => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="max-w-7xl mx-auto mt-8">
              <BookingFlow />
            </div>
          </div>
        </div>
      </BookingProvider>
    </ProtectedRoute>
  );
}
