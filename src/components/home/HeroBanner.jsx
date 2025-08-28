import Link from "next/link";

function HeroBanner() {
  return (
    <div className="flex flex-col lg:flex-row items-center justify-between gap-8 mb-10">
      
      {/* Left Side - Image */}
      <div className="w-full lg:w-2/5 flex justify-center lg:justify-start">
        <div className="relative group">
          <div className="relative overflow-hidden rounded-3xl shadow-2xl transform group-hover:scale-105 transition-all duration-700">
            <img src="/heroimage.png" alt="Divine Ceremony" className="w-full max-w-sm lg:max-w-lg h-auto object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </div>
          {/* Decorative Glows */}
          <div className="absolute -top-8 -left-8 w-24 h-24 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-full opacity-40 animate-bounce delay-300"></div>
        </div>
      </div>

      {/* Right Side - Content */}
      <div className="w-full lg:w-3/5 space-y-8">
        {/* Floating Havan Image */}
        <div className="flex justify-center lg:justify-start mb-6">
          <div className="relative group">
            <img src="/havan.jpg" alt="Sacred Havan Ceremony" className="w-24 h-24 md:w-28 md:h-28 rounded-full object-cover shadow-xl border-3 border-white/90" />
          </div>
        </div>

        {/* Title */}
        <div className="text-center lg:text-left space-y-3">
          <h1 className="text-2xl lg:text-4xl font-black leading-tight">
            <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 bg-clip-text text-transparent mb-4">
              International
            </span>
            <span className="block text-gray-900 font-bold">
              Sri Jagannatha Pancha Ratra
            </span>
            <span className="block bg-gradient-to-r from-orange-600 via-red-600 to-yellow-600 bg-clip-text text-transparent font-black">
              Havan Ceremony
            </span>
          </h1>
        </div>

        {/* Description */}
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 lg:p-8 shadow-2xl border border-orange-200/30">
          <p className="text-lg sm:text-xl text-gray-800 font-bold text-center lg:text-left">
            <Link href="/donate">
              <span className="font-black underline animate-pulse text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text">Donate Now!</span>
            </Link>{" "}
            Be a <span className="font-black text-transparent bg-gradient-to-r from-orange-600 via-red-600 to-yellow-600 bg-clip-text">SVS member</span> and join us for a divine 5-day ceremony.
          </p>
        </div>
      </div>
    </div>
  );
}

export default HeroBanner;
