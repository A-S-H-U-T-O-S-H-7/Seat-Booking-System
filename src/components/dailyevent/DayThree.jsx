// Day3Schedule.jsx - Complete Component
import React from 'react';

const Day3Schedule = () => {
  const dayData = {
    title: "Day 3 - Divine Beauty Darśana",
    subtitle: "Heart-Melting Vision of Supreme Loveliness",
    theme: "Rūpa-Jñāna (Knowledge of Divine Beauty)",
    schedule: [
      {
        time: "4:00 AM - 6:00 AM",
        activity: "Beauty Meditation",
        description: "Contemplation on the Lord's transcendent beauty. Hearts prepare to receive the soul-stirring vision of divine loveliness that surpasses all imagination.",
        icon: "🌸"
      },
      {
        time: "6:00 AM - 7:00 AM",
        activity: "Aesthetic Prayers",
        description: "Recitation of verses describing divine beauty. Each word paints portraits of loveliness that capture hearts and awaken dormant love.",
        icon: "🎨"
      },
      {
        time: "7:00 AM - 9:00 AM",
        activity: "Madhura Saṅkīrtana",
        description: "Sweet, melodious kirtan celebrating divine beauty. Voices blend in harmonies that mirror the beauty of the Lord's transcendent form.",
        icon: "🎼"
      },
      {
        time: "9:00 AM - 11:00 AM",
        activity: "Aesthetic Worship Ceremony",
        description: "Pūjā emphasizing beauty and artistic expression. Exquisite flowers, artistic decorations, and beautiful ornaments adorn the divine form.",
        icon: "💐"
      },
      {
        time: "11:00 AM - 12:00 PM",
        activity: "Beauty Scripture Session",
        description: "Puruṣottama Māhātmya Part III (Chapters 25-36). Verses describing the captivating beauty that enchants even the greatest sages and gods.",
        icon: "📜"
      },
      {
        time: "12:00 PM - 2:00 PM",
        activity: "Aesthetic Prasādam",
        description: "Beautifully prepared and presented sacred food. Each dish is an artwork expressing love and devotion to the supremely beautiful Lord.",
        icon: "🌺"
      },
      {
        time: "2:00 PM - 4:00 PM",
        activity: "Artistic Fire Ceremony",
        description: "Homa with emphasis on beauty and harmony. Sacred geometries in fire arrangements reflect the perfect beauty of divine creation.",
        icon: "🎭"
      },
      {
        time: "4:00 PM - 6:00 PM",
        activity: "Dance & Music Offering",
        description: "Classical dance and music as expressions of beauty. Artists offer their talents as flowers at the lotus feet of the supremely beautiful Lord.",
        icon: "💃"
      },
      {
        time: "6:00 PM - 7:00 PM",
        activity: "Beauty Evening Service",
        description: "Āratī highlighting the Lord's captivating form. Artistic lamp arrangements create patterns of light that celebrate divine beauty.",
        icon: "🌙"
      },
      {
        time: "7:30 PM - 9:00 PM",
        activity: "Divine Beauty Discourse",
        description: "Inspiring talks on transcendent beauty and aesthetic realization. The speaker reveals how divine beauty transforms consciousness and awakens love.",
        icon: "💖"
      }
    ],
    specialNote: "The heart opens to experience divine beauty that surpasses all material conceptions. This day awakens aesthetic realization and pure devotional love.",
    chapterFocus: "Puruṣottama Māhātmya - Chapters 25-36 (Divine Beauty & Form)"
  };

  return (
    <>
      {/* Day Header */}
      <div className="text-center mb-10">
        <div className="flex items-center justify-center mb-6">
          <div className="h-1 w-16 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full"></div>
          <span className="mx-4 text-pink-600 text-4xl">🌸</span>
          <div className="h-1 w-16 bg-gradient-to-r from-rose-400 to-pink-400 rounded-full"></div>
        </div>
        
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
          {dayData.title}
        </h2>
        
        <p className="text-xl text-gray-600 mb-6 italic">
          {dayData.subtitle}
        </p>
        
        <div className="bg-gradient-to-r from-pink-100 to-rose-100 rounded-2xl p-6 mb-8 border border-pink-200">
          <h3 className="text-lg font-bold text-pink-700 mb-2">Daily Theme</h3>
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
            <div key={index} className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl p-6 shadow-lg border border-pink-100 hover:shadow-xl transition-all duration-300">
              <div className="flex flex-col md:flex-row md:items-center md:space-x-6">
                <div className="flex items-center space-x-4 mb-4 md:mb-0 md:w-80">
                  <div className="text-3xl">{item.icon}</div>
                  <div>
                    <div className="text-sm font-bold text-pink-600 bg-pink-100 px-3 py-1 rounded-full inline-block mb-2">
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

export default Day3Schedule;