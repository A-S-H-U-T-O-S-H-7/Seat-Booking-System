import { Heart, Users, Globe } from 'lucide-react';

export default function Banner() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 text-white rounded-2xl mb-5 py-3 md:py-8 px-2 mx-0 md:mx-15">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-white rounded-full"></div>
        <div className="absolute top-20 right-10 w-32 h-32 bg-white rounded-full"></div>
        <div className="absolute bottom-10 left-1/3 w-28 h-28 bg-white rounded-full"></div>
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
            <Heart className="w-8 h-8 md:w-12 md:h-12 text-white" fill="currentColor" />
          </div>
        </div>
        
        <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent">
          Make a Difference
        </h1>
        
        <p className="text-lg md:text-2xl mb-8 text-white/90 font-light">
          Your contribution creates lasting impact in communities across India
        </p>
        
        <div className="flex justify-center gap-2 md:gap-8 text-xs md:text-sm">
          <div className="flex items-center gap-1 md:gap-2 bg-white/10 backdrop-blur-sm rounded-full px-2 md:px-4 py-1 md:py-2">
            <Users className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden md:inline">1000+ Lives Impacted</span>
            <span className="md:hidden">1000+ Lives</span>
          </div>
          <div className="flex items-center gap-1 md:gap-2 bg-white/10 backdrop-blur-sm rounded-full px-2 md:px-4 py-1 md:py-2">
            <Globe className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden md:inline">50+ Communities Served</span>
            <span className="md:hidden">50+ Areas</span>
          </div>
          <div className="flex items-center gap-1 md:gap-2 bg-white/10 backdrop-blur-sm rounded-full px-2 md:px-4 py-1 md:py-2">
            <Heart className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden md:inline">Trusted by Thousands</span>
            <span className="md:hidden">Thousands Trust</span>
          </div>
        </div>
      </div>
    </div>
  );
}