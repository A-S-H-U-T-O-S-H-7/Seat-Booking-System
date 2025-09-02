// Day2Schedule.jsx
import React from 'react';

const Day2Schedule = () => {
  const dayData = {
    title: "Day 2 - Divine Glory Revelation",
    subtitle: "Witnessing the Infinite Majesty of the Lord",
    theme: "Mahimā-Jñāna (Knowledge of Divine Glory)",
    schedule: [
      {
        time: "4:00 AM - 6:00 AM",
        activity: "Dawn Meditation & Preparation",
        description: "Deep contemplation on the Lord's infinite glory. Silent meditation prepares hearts to receive the overwhelming majesty of divine revelation.",
        icon: "🧘"
      },
      {
        time: "6:00 AM - 7:00 AM",
        activity: "Glorification Prayers",
        description: "Recitation of hymns praising the Lord's cosmic majesty. Ancient verses reveal the unlimited nature of His divine qualities and powers.",
        icon: "🙏"
      },
      {
        time: "7:00 AM - 9:00 AM",
        activity: "Mahimā Saṅkīrtana",
        description: "Special kirtan focusing on the Lord's glorious attributes. Each name sung reveals another facet of His infinite, all-pervading presence.",
        icon: "✨"
      },
      {
        time: "9:00 AM - 11:00 AM",
        activity: "Elaborate Worship Service",
        description: "Enhanced pūjā acknowledging the Lord's supreme position. Royal treatment befitting the King of Kings, with golden ornaments and silk garments.",
        icon: "👑"
      },
      {
        time: "11:00 AM - 12:00 PM",
        activity: "Scripture Recitation - Part II",
        description: "Continuation of Puruṣottama Māhātmya (Chapters 13-24). Stories of the Lord's cosmic interventions and universal sovereignty unfold.",
        icon: "🌌"
      },
      {
        time: "12:00 PM - 2:00 PM",
        activity: "Grand Feast & Contemplation",
        description: "Sumptuous prasādam reflecting the Lord's abundant grace. Time for quiet reflection on the morning's revelations of divine glory.",
        icon: "🍛"
      },
      {
        time: "2:00 PM - 4:00 PM",
        activity: "Cosmic Fire Ritual",
        description: "Expanded homa ceremony with cosmic significance. Each offering acknowledges the Lord's presence in all creation, from atoms to galaxies.",
        icon: "🌟"
      },
      {
        time: "4:00 PM - 6:00 PM",
        activity: "Instrumental Glory Session",
        description: "Musical celebration of divine majesty with full orchestra. Conch shells, bells, and drums announce the King of Universe's presence.",
        icon: "🎺"
      },
      {
        time: "6:00 PM - 7:00 PM",
        activity: "Royal Evening Service",
        description: "Āratī ceremony with increased grandeur. Multiple lamps create a celestial atmosphere befitting the Supreme Lord's evening reception.",
        icon: "🌅"
      },
      {
        time: "7:30 PM - 9:00 PM",
        activity: "Divine Majesty Discourse",
        description: "Profound exposition on the Lord's unlimited glory. Speaker unveils the mysteries of cosmic lordship and infinite divine attributes.",
        icon: "🔥"
      }
    ],
    specialNote: "This day opens our consciousness to the Lord's infinite majesty and cosmic sovereignty. Devotees experience overwhelming awe at the unlimited nature of divine glory.",
    chapterFocus: "Puruṣottama Māhātmya - Chapters 13-24 (Cosmic Manifestations)"
  };

  return (
    <>
      {/* Day Header */}
      <div className="text-center mb-10">
        <div className="flex items-center justify-center mb-6">
          <div className="h-1 w-16 bg-gradient-to-r from-orange-400 to-red-400 rounded-full"></div>
          <span className="mx-4 text-orange-600 text-4xl">👑</span>
          <div className="h-1 w-16 bg-gradient-to-r from-red-400 to-orange-400 rounded-full"></div>
        </div>
        
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
          {dayData.title}
        </h2>
        
        <p className="text-xl text-gray-600 mb-6 italic">
          {dayData.subtitle}
        </p>
        
        <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-2xl p-6 mb-8 border border-purple-200">
          <h3 className="text-lg font-bold text-purple-700 mb-2">Daily Theme</h3>
          <p className="text-gray-700 text-lg font-medium">{dayData.theme}</p>
        </div>
      </div>

      {/* Daily Schedule */}
      <div className="mb-10">
        <h3 className="text-2xl font-bold text-center mb-8 text-gray-800">
          Sacred Daily Schedule
        </h3>

        <div className="space-y-6">
          {dayData.schedule.map((item, index) => (
            <div key={index} className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 shadow-lg border border-purple-100 hover:shadow-xl transition-all duration-300">
              <div className="flex flex-col md:flex-row md:items-center md:space-x-6">
                <div className="flex items-center space-x-4 mb-4 md:mb-0 md:w-80">
                  <div className="text-3xl">{item.icon}</div>
                  <div>
                    <div className="text-sm font-bold text-purple-600 bg-purple-100 px-3 py-1 rounded-full inline-block mb-2">
                      {item.time}
                    </div>
                    <h4 className="text-lg font-bold text-gray-800">
                      {item.activity}
                    </h4>
                  </div>
                </div>
                
                <div className="flex-1">
                  <p className="text-gray-700 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chapter Focus & Special Note */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 shadow-lg border border-blue-200">
          <h4 className="text-lg font-bold text-blue-700 mb-3 flex items-center">
            <span className="text-2xl mr-2">📚</span>
            Scripture Focus
          </h4>
          <p className="text-gray-700 leading-relaxed">
            {dayData.chapterFocus}
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 shadow-lg border border-green-200">
          <h4 className="text-lg font-bold text-green-700 mb-3 flex items-center">
            <span className="text-2xl mr-2">💡</span>
            Special Significance
          </h4>
          <p className="text-gray-700 leading-relaxed">
            {dayData.specialNote}
          </p>
        </div>
      </div>
    </>
  );
};

export default Day2Schedule;