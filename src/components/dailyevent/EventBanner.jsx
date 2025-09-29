export default function EventBanner() {
  return (
    <div className="bg-gradient-to-r mx-2 md:mx-10 rounded-xl mb-5 from-pink-100 to-rose-200 text-white relative overflow-hidden">
      
      {/* Corner Border Designs */}
      {/* Left Bottom Corner */}
      <div className="absolute  -left-1 -bottom-1 md:-left-1 md:-bottom-1 z-10">
        <img 
          src="/newpinkborder.png" 
          alt="Decorative Flower" 
          className="w-24 h-24 md:w-36 md:h-36 object-contain -rotate-90 opacity-80"
        />
      </div>
      {/* Right Bottom Corner */}
      <div className="absolute -right-1 -bottom-1 md:-right-1 md:-bottom-1 z-10">
        <img 
          src="/newpinkborder.png" 
          alt="Decorative Flower" 
          className="w-24 h-24 md:w-36 md:h-36 object-contain opacity-80 rotate-180 "
        />
      </div>

      {/* Left Top Corner */}
      <div className="absolute -left-1  md:-left-1  z-10">
        <img 
          src="/newpinkborder.png" 
          alt="Decorative Flower" 
          className="w-24 h-24 md:w-36 md:h-36 opacity-80 object-contain  "
        />
      </div>
      
      {/* Right Top Corner */}
      <div className="absolute -right-1 -top-1 md:-right-1 md:-top-1 z-10">
        <img 
          src="/newpinkborder.png" 
          alt="Decorative Border" 
          className="w-24 h-24 md:w-36 md:h-36 opacity-80 object-contain rotate-90"
        />
      </div>

      {/* Left Image */}
      <div className="absolute left-4 lg:left-6 top-1/2 transform -translate-y-1/2 hidden md:block z-10">
        <img 
          src="/jaga6.png" 
          alt="Jagannath" 
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
            <div className="w-16 h-16 md:w-20 md:h-20 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center backdrop-blur-sm">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full flex items-center justify-center">
                <img 
          src="/jaga1.png" 
          alt="Sri Mandir" 
          className="w-24 h-24 lg:w-80  lg:h-80 object-contain transition-opacity duration-300"
        />
              </div>
            </div>
          </div>
          
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 text-rose-600 drop-shadow-lg leading-tight">
            Śrī Jagannātha Pāñcharātra
          </h1>
          
          <p className="text-base text-gray-800 md:text-xl font-semibold max-w-3xl mx-auto leading-relaxed px-4">
                     <span className="text-orange-600 text-2xl">🕉️</span>

            Five Days of Divine Grace - Daily Schedule & Sacred Activities
                                 <span className="text-orange-600 text-2xl">🕉️</span>

          </p>
        </div>
      </div>
    </div>
  );
}