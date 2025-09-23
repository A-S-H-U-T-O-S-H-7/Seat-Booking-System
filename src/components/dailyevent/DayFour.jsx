// Day4Schedule.jsx
import React from 'react';

const Day4Schedule = () => {
  const dayData = {
    title: "Day 4 - Divine Love Immersion",
    subtitle: "Ocean of Infinite Compassion and Grace",
    theme: "Prema-Jñāna (Knowledge of Divine Love)",
    schedule: [
      {
        time: "4:00 AM - 6:00 AM",
        activity: "Love Meditation & Surrender",
        description: "Deep contemplation on divine love and complete surrender. Hearts open to receive the infinite ocean of compassion flowing from the Lord's lotus heart.",
        icon: "💝"
      },
      {
        time: "6:00 AM - 7:00 AM",
        activity: "Compassion Prayers",
        description: "Recitation of verses celebrating divine mercy. Each prayer dissolves ego and awakens the soul's natural loving relationship with the Lord.",
        icon: "🤲"
      },
      {
        time: "7:00 AM - 9:00 AM",
        activity: "Prema Saṅkīrtana",
        description: "Ecstatic kirtan overflowing with divine love. Tears of joy flow as hearts melt in the sweetness of the Lord's all-pervading presence.",
        icon: "💞"
      },
      {
        time: "9:00 AM - 11:00 AM",
        activity: "Loving Service Ceremony",
        description: "Intimate pūjā expressing pure devotional love. Every offering becomes a love letter written from the heart to the beloved Lord.",
        icon: "💌"
      },
      {
        time: "11:00 AM - 12:00 PM",
        activity: "Love Scripture Session",
        description: "Puruṣottama Māhātmya Part IV (Chapters 37-48). Stories of divine compassion and the Lord's loving responses to sincere devotion.",
        icon: "💕"
      },
      {
        time: "12:00 PM - 2:00 PM",
        activity: "Love Feast Prasādam",
        description: "Sacred meal prepared and shared with overflowing love. Each bite tastes of divine nectar, satisfying both body and soul.",
        icon: "🍯"
      },
      {
        time: "2:00 PM - 4:00 PM",
        activity: "Heart-Opening Fire Ritual",
        description: "Homa ceremony focusing on purification of the heart. Sacred flames burn away all barriers to pure love and devotion.",
        icon: "❤️‍🔥"
      },
      {
        time: "4:00 PM - 6:00 PM",
        activity: "Devotional Expression Session",
        description: "Creative expressions of love through poetry, song, and art. Devotees pour their hearts out in spontaneous offerings of devotion.",
        icon: "🎨"
      },
      {
        time: "6:00 PM - 7:00 PM",
        activity: "Intimate Evening Service",
        description: "Personal, heartfelt āratī with deep emotional connection. The boundary between devotee and Lord dissolves in pure love.",
        icon: "🌹"
      },
      {
        time: "7:30 PM - 9:00 PM",
        activity: "Divine Love Discourse",
        description: "Heart-touching talks on the science of divine love. The speaker reveals the secrets of developing an eternal loving relationship with God.",
        icon: "💖"
      }
    ],
    specialNote: "This day focuses on developing pure love for the Divine. Devotees experience the transformative power of divine grace and unconditional love.",
    chapterFocus: "Puruṣottama Māhātmya - Chapters 37-48 (Divine Love & Compassion)"
  };

  return (
    <>
      {/* Day Header */}
      <div className="text-center mb-10">
        <div className="flex items-center justify-center mb-6">
          <div className="h-1 w-16 bg-gradient-to-r from-red-400 to-pink-400 rounded-full"></div>
          <span className="mx-4 text-red-600 text-4xl">💝</span>
          <div className="h-1 w-16 bg-gradient-to-r from-pink-400 to-red-400 rounded-full"></div>
        </div>
        
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
          {dayData.title}
        </h2>
        
        <p className="text-xl text-gray-600 mb-6 italic">
          {dayData.subtitle}
        </p>
        
        <div className="bg-gradient-to-r from-red-100 to-pink-100 rounded-2xl p-6 mb-8 border border-red-200">
          <h3 className="text-lg font-bold text-red-700 mb-2">Daily Theme</h3>
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
            <div key={index} className="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl p-6 shadow-lg border border-red-100 hover:shadow-xl transition-all duration-300">
              <div className="flex flex-col md:flex-row md:items-center md:space-x-6">
                <div className="flex items-center space-x-4 mb-4 md:mb-0 md:w-80">
                  <div className="text-3xl">{item.icon}</div>
                  <div>
                    <div className="text-sm font-bold text-red-600 bg-red-100 px-3 py-1 rounded-full inline-block mb-2">
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

export default Day4Schedule;