export default function GuestBanner() {
  return (
    <div className="bg-gradient-to-r mx-2 md:mx-10 rounded-xl mb-5 from-teal-100 to-emerald-200 text-white relative overflow-hidden">
      
      {/* Corner Border Designs */}
      {/* Left Bottom Corner */}
      <div className="absolute  -left-1 -bottom-0 md:-left-2 md:-bottom-1 z-10">
        <img 
          src="/greenflower1.png" 
          alt="Decorative Flower" 
          className="w-24 h-24 md:w-36 md:h-36 object-contain  opacity-80"
        />
      </div>
      {/* Right Bottom Corner */}
      <div className="absolute -right-0 -bottom-2 md:-right-0 md:-bottom-2 z-10">
        <img 
          src="/greenflower1.png" 
          alt="Decorative Flower" 
          className="w-24 h-24 md:w-36 md:h-36 object-contain -rotate-90 opacity-80  "
        />
      </div>

      {/* Left top Corner */}
      <div className="absolute -left-1 -top-1 md:-left-1 md:-top-2 z-10">
        <img 
          src="/greenflower1.png" 
          alt="Decorative Flower" 
          className="w-24 h-24 md:w-36 md:h-36 opacity-80 object-contain -rotate-90 scale-[-1] "
        />
      </div>
      
      {/* Right Top Corner */}
      <div className="absolute -right-1 -top-1 md:-right-1 md:-top-2 z-10">
        <img 
          src="/greenflower1.png" 
          alt="Decorative Border" 
          className="w-24 h-24 md:w-36 md:h-36 opacity-80 object-contain -rotate-90 scale-x-[-1]"
        />
      </div>

      {/* Left Image */}
      <div className="absolute left-4 lg:left-6 top-1/2 transform -translate-y-1/2 hidden md:block z-10">
        <img 
          src="/dance2.png" 
          alt="Dance" 
          className="w-8 h-8 lg:w-80 drop-shadow-2xl lg:h-80 object-contain transition-opacity duration-300"
        />
      </div>
      
      {/* Right Image */}
      <div className="absolute right-4 lg:right-6 top-1/2 transform -translate-y-1/2 hidden md:block z-10">
        <img 
          src="/mandir3.png" 
          alt="Sri Mandir" 
          className="w-8 h-8 lg:w-80  lg:h-80 object-contain transition-opacity duration-300"
        />
      </div>

      {/* Main Content */}
      <div className="relative z-20 px-4 md:px-8 lg:px-24 xl:px-32 py-8 md:py-12 lg:py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-6">
            <div className="w-16 h-16 md:w-20 md:h-20  rounded-full mx-auto mb-4 flex items-center justify-center ">
              <div className="w-25 h-25  rounded-full flex items-center justify-center">
                <img 
          src="/namaste1.png" 
          alt="Dance" 
          className="w-24 h-24 lg:w-80  lg:h-80 object-contain transition-opacity duration-300"
        />
              </div>
            </div>
          </div>
          
          <h1 className="text-3xl md:text-5xl  font-bold mb-4 md:mb-6 text-amber-500 drop-shadow-lg leading-tight">
            Distinguished Guests
          </h1>
          <h1 className="text-xl md:text-3xl  font-semibold mb-4 md:mb-6 text-emerald-600 drop-shadow-lg leading-tight">
            Śrī Jagannātha Pañcharātra
          </h1>
          
          <p className="text-base text-gray-800 md:text-lg lg:text-xl opacity-90 max-w-3xl mx-auto leading-relaxed ">
              Honoring Esteemed Spiritual Leaders, Scholars & Divine Servants
          </p>
        </div>
        {/* Decorative Elements */}
            <div className="flex items-center justify-center space-x-4 mt-8">
              <div className="w-16 h-0.5 bg-black/40 rounded-full"></div>
              <span className="text-white/80 text-2xl">🌸</span>
              <div className="w-16 h-0.5 bg-black/40 rounded-full"></div>
            </div>
      </div>
    </div>
  );
}