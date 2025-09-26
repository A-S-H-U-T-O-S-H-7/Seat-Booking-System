import { useState, useEffect } from 'react';

function HeroDetails() {
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch("https://svsamiti.com/news-list.php", {
          method: "GET",
          redirect: "follow"
        });
const newsData = await response.json();
        
        if (newsData.status === 'success' && newsData.data && newsData.data.length > 0) {
  setNews(newsData.data);
} else {
  
  setNews([]);
}
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNews();
  }, []);

  

  return (
    <section className="py-12 sm:py-16 bg-gradient-to-b from-white via-orange-50/40 to-yellow-50/30 shadow-inner relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-200/15 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-yellow-200/10 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-red-200/10 via-transparent to-transparent"></div>
      
      <div className="relative  mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-transparent bg-gradient-to-r from-gray-900 via-gray-700 to-gray-800 bg-clip-text mb-4">
            Havan Ceremony Details
          </h3>
          <div className="flex justify-center items-center space-x-2 mb-3">
            <div className="w-12 h-1 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full"></div>
            <div className="w-8 h-1 bg-gradient-to-r from-yellow-500 to-red-500 rounded-full"></div>
            <div className="w-16 h-1 bg-gradient-to-r from-red-500 to-orange-500 rounded-full"></div>
          </div>
          <p className="text-base text-gray-600 font-medium max-w-2xl mx-auto">
            Join us for this sacred 5-day journey of spiritual awakening and divine blessings
          </p>
        </div>
        
        {/* Enhanced Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Duration Card */}
          <div className="group text-center p-6 rounded-2xl bg-gradient-to-br from-orange-50 via-white to-yellow-50/80 border border-orange-200/40 shadow-xl hover:shadow-2xl  transition-all duration-500">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg  group-hover:rotate-6 transition-all duration-500">
              <span className="text-2xl text-white">📅</span>
            </div>
            <h4 className="text-lg lg:text-xl font-black mb-3 text-gray-900">5-Day Sacred Event</h4>
            <div className="w-12 h-1 bg-gradient-to-r from-orange-500 to-red-500 mx-auto rounded-full mb-3"></div>
            <p className="text-sm text-gray-700 leading-relaxed font-medium">
              Sacred Havan ceremony spanning 5 consecutive days with dedicated morning and afternoon sessions for complete spiritual immersion
            </p>
            <div className="space-y-2 mt-3 text-sm text-gray-700 font-medium">

            <div className="bg-gradient-to-r from-red-100 to-orange-100 rounded-lg p-3 border border-red-200/30">
                <strong className="text-red-700">Afternoon Session:</strong>
                <div className="text-red-600 font-bold">2:00 PM - 5:00 PM</div>
              </div>
              </div>
          </div>

          {/* Timing Card */}
          {/* <div className="group text-center p-6 rounded-2xl bg-gradient-to-br from-yellow-50 via-white to-red-50/80 border border-yellow-200/40 shadow-xl hover:shadow-2xl  transition-all duration-500">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg  group-hover:rotate-6 transition-all duration-500">
              <span className="text-2xl text-white">⏰</span>
            </div>
            <h4 className="text-lg lg:text-xl font-black mb-3 text-gray-900">Our Sacred Shifts</h4>
            <div className="w-12 h-1 bg-gradient-to-r from-yellow-500 to-orange-500 mx-auto rounded-full mb-3"></div>
            <div className="space-y-2 text-sm text-gray-700 font-medium">
              <div className="bg-gradient-to-r from-red-100 to-orange-100 rounded-lg p-3 border border-red-200/30">
                <strong className="text-red-700">Afternoon Session:</strong>
                <div className="text-red-600 font-bold">2:00 PM - 5:00 PM</div>
              </div>
            </div>
          </div> */}

          {/* Capacity Card */}
          <div className="group text-center p-6 rounded-2xl bg-gradient-to-br from-red-50 via-white to-orange-50/80 border border-red-200/40 shadow-xl hover:shadow-2xl  transition-all duration-500">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg  group-hover:rotate-6 transition-all duration-500">
              <span className="text-2xl text-white">🪑</span>
            </div>
            <h4 className="text-lg lg:text-xl font-black mb-3 text-gray-900">400 Sacred Seats</h4>
            <div className="w-12 h-1 bg-gradient-to-r from-red-500 to-yellow-500 mx-auto rounded-full mb-3"></div>
            <p className="text-sm text-gray-700 leading-relaxed font-medium mb-3">
              Strategic seating layout across 4 blocks (A, B, C, D) for 400 participants to engage in the havan ceremony, with every seat positioned for devotees to offer their prayers and participate in this Havan ritual.
            </p>
            <div className="flex justify-center space-x-1">
              <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">Block A</span>
              <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">Block B</span>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">Block C</span>
              <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">Block D</span>
            </div>
          </div>

          {/* Latest News Card */}
          <div className="group text-center p-2 md:p-4 rounded-2xl bg-gradient-to-br from-blue-50 via-white to-indigo-50/80 border-2 border-blue-200/60 shadow-xl hover:shadow-2xl transition-all duration-500">
  {/* Header with Icon and Title in Same Line */}
  <div className='flex items-center justify-center gap-3 mb-4'>
    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-lg group-hover:rotate-6 transition-all duration-500">
      <span className="text-lg text-white">📰</span>
    </div>
    <h4 className="text-lg lg:text-xl font-black text-gray-900">Latest News</h4>
  </div>
  
  <div className="w-16 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 mx-auto rounded-full mb-4"></div>
  
  {/* News Scrolling Container - Increased Height */}
  <div className="relative h-48 overflow-hidden bg-gradient-to-b from-blue-50/50 to-indigo-50/50 rounded-xl border-2 border-blue-200/40 shadow-inner">
    {isLoading ? (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
      </div>
    ) : (
      <div className="absolute inset-0 flex flex-col">
        <div className="animate-marquee-vertical space-y-4 p-4">
          {news.map((item, index) => (
            <div key={item.id} className="text-sm text-gray-700 leading-relaxed font-medium border-b border-blue-200/30 pb-3 last:border-b-0">
              <a 
                href={item.url.trim()} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-blue-600 transition-colors duration-200 block"
                title={item.title}
              >
                {item.title}
              </a>
              <div className="text-xs text-gray-500 mt-1">
                {new Date(item.created_at).toLocaleDateString('hi-IN')}
              </div>
            </div>
          ))}
          {/* Duplicate for continuous scroll */}
          {news.map((item, index) => (
            <div key={`${item.id}-duplicate`} className="text-sm text-gray-700 leading-relaxed font-medium border-b border-blue-200/30 pb-3 last:border-b-0">
              <a 
                href={item.url.trim()} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-blue-600 transition-colors duration-200 block"
                title={item.title}
              >
                {item.title}
              </a>
              <div className="text-xs text-gray-500 mt-1">
                {new Date(item.created_at).toLocaleDateString('hi-IN')}
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
</div>
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee-vertical {
          0% {
            transform: translateY(0%);
          }
          100% {
            transform: translateY(-50%);
          }
        }
        
        .animate-marquee-vertical {
          animation: marquee-vertical 15s linear infinite;
        }
        
        .animate-marquee-vertical:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}

export default HeroDetails;