import Link from 'next/link';

const HeroContent = () => {
  return (
    <div className="relative z-10 w-full px-4 sm:px-6 lg:px-10 py-6">
      {/* Main Content Container */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-8 mb-10">
        
        {/* Left Side - Enhanced Image Section */}
        <div className="w-full lg:w-2/5 flex flex-col items-center lg:items-center">
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

<div className='flex gap-2 md:gap-4 flex-wrap justify-center'>
         <Link href="/daily-events">
  <div className='mt-4 px-2 py-2 rounded-md drop-shadow-md border text-cyan-900 font-semibold italic border-indigo-400 bg-cyan-200'>
    Daily Events
  </div>
</Link>
<Link href="/distinguished-guests">
  <div className='mt-4 px-2 py-2 shadow-2xl drop-shadow-md  rounded-md border text-teal-900 font-semibold italic border-emerald-400 bg-teal-200'>
    Distinguised Guests
  </div>
</Link>
<Link href="/pancha-ratra">
  <div className='mt-4 px-2 py-2 rounded-md drop-shadow-md border text-orange-900 font-semibold italic border-orange-400 bg-orange-200'>
    Know more About Pancha Ratra
  </div>
</Link>


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
                  className="w-20 h-20 md:w-28 md:h-28 rounded-full object-cover shadow-xl border-3 border-white/90 backdrop-blur-sm transform group-hover:scale-110 transition-all duration-500"
                />
                {/* Rotating Border Effect */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500 via-yellow-500 to-red-500 opacity-60 animate-spin" style={{animationDuration: '8s'}}></div>
                <div className="absolute inset-1 rounded-full bg-white"></div>
                <img 
                  src="/havan.jpg" 
                  alt="Sacred Havan Ceremony" 
                  className="absolute inset-2 w-16 h-16 md:w-24 md:h-24 rounded-full object-cover"
                />
              </div>
              
              {/* Enhanced Glow Effects */}
              <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-orange-400/30 via-yellow-400/30 to-red-400/30 blur-lg animate-pulse"></div>
              <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-orange-300/15 via-yellow-300/15 to-red-300/15 blur-xl animate-pulse delay-500"></div>
            </div>
          </div>

          {/* Enhanced Title Section */}
          <div className="text-center lg:text-left space-y-3">
            <h1 className="text-2xl lg:text-4xl font-black leading-tight">
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 bg-clip-text text-transparent mb-4 font-extrabold tracking-tight">
                International
              </span>
              <span className="block text-gray-900 font-bold tracking-tight mb-1 text-shadow-sm">
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
                <Link href="/donate"> <span className='font-black underline animate-pulse text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text'> Donate Now!  </span></Link>
                Be a <span className="font-black text-transparent bg-gradient-to-r from-orange-600 via-red-600 to-yellow-600 bg-clip-text">SVS member</span> and join us for a divine 5-day ceremony.
              </p>
              
              <div className="w-16 h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mx-auto lg:mx-0"></div>
              <p className="text-base sm:text-lg lg:text-lg text-gray-700 leading-relaxed font-medium">
                Contribute with devotion and reserve your seat for a spiritual experience filled with 
                <span className="text-orange-600 font-bold"> peace</span>, 
                <span className="text-yellow-600 font-bold"> blessings</span>, and
                <span className="text-red-600 font-bold"> divine grace</span>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroContent;
