import { Heart, Users, Globe } from 'lucide-react';

export default function Banner() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 text-white rounded-2xl mb-5 py-8 px-6">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-white rounded-full"></div>
        <div className="absolute top-20 right-10 w-32 h-32 bg-white rounded-full"></div>
        <div className="absolute bottom-10 left-1/3 w-28 h-28 bg-white rounded-full"></div>
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
            <Heart className="w-12 h-12 text-white" fill="currentColor" />
          </div>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent">
          Make a Difference
        </h1>
        
        <p className="text-xl md:text-2xl mb-8 text-white/90 font-light">
          Your contribution creates lasting impact in communities across India
        </p>
        
        <div className="flex flex-wrap justify-center gap-8 text-sm">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
            <Users className="w-5 h-5" />
            <span>1000+ Lives Impacted</span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
            <Globe className="w-5 h-5" />
            <span>50+ Communities Served</span>
          </div>
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
            <Heart className="w-5 h-5" />
            <span>Trusted by Thousands</span>
          </div>
        </div>
      </div>
    </div>
  );
}