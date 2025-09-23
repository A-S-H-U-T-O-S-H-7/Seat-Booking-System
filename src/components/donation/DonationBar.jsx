import { Heart, Sparkles } from 'lucide-react';

const DonateBar = ({
  title = "Donate for a Smile",
  subtitle = "Together, we create brighter futures.",
  imageUrl = "/donate.jpg",
  imageAlt = "Donate for a Smile",
  onClick = () => {},
  className = ""
}) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Main donate bar */}
      <div 
        className="flex items-center gap-6 p-2 bg-gradient-to-r from-white via-rose-50/30 to-purple-50/30 rounded-2xl border border-rose-100 transition-all duration-300 hover:scale-[1.02] cursor-pointer group"
        onClick={onClick}
      >
        
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-2 right-4 text-rose-300">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="absolute bottom-3 right-12 text-purple-300">
            <Heart className="w-4 h-4" />
          </div>
        </div>
        
        {/* Image with enhanced styling */}
        <div className="flex-shrink-0 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-rose-400 to-purple-500 rounded-full blur-sm opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
          <img 
            src={imageUrl}
            alt={imageAlt}
            className="relative w-14 h-14 md:w-16 md:h-16 rounded-full object-cover border-3 border-white shadow-lg group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
            <Heart className="w-3 h-3 text-white" />
          </div>
        </div>
        
        {/* Content with improved typography */}
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-lg md:text-xl font-bold bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 bg-clip-text text-transparent leading-tight">
              {title}
            </h2>
            {/* Emoji separated from gradient text */}
            <span className="text-xl animate-pulse">😊</span>
          </div>
          <p className="text-xs md:text-base font-medium text-slate-600 leading-relaxed mb-1">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DonateBar;