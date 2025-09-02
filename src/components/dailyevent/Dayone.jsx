// Day1Schedule.jsx
import React from 'react';

const Day1Schedule = () => {
  const dayData = {
    title: "Day 1 - Sacred Commencement & Divine Invocation",
    subtitle: "Foundation of the Five-Day Spiritual Journey",
    theme: "Svarūpa-Jñāna (Knowledge of Divine Form)",
    schedule: [
      {
        time: "4:00 AM - 6:00 AM",
        activity: "Brahmamuhūrta Preparation",
        description: "Sacred preparation and purification rituals. Temple sanctification and devotee preparation for the five-day spiritual journey into Lord Jagannātha's divine realm.",
        icon: "🌅"
      },
      {
        time: "6:00 AM - 7:00 AM",
        activity: "Sacred Bath & Resolution",
        description: "Holy purification and taking sacred vows for the Pañcharātra. Devotees set spiritual intentions and surrender completely to Lord Jagannātha's divine will.",
        icon: "🌊"
      },
      {
        time: "7:00 AM - 9:00 AM",
        activity: "Morning Saṅkīrtana",
        description: "Congregational chanting of divine names fills the sacred space. Hearts unite in melodious kirtan as the Lord's presence descends upon the gathering.",
        icon: "🎵"
      },
      {
        time: "9:00 AM - 11:00 AM",
        activity: "Mahā-Archanā of Śrī Jagannātha",
        description: "Grand worship ceremony with elaborate offerings. Sixteen types of services (Ṣoḍaśopachāra Pūjā) offered with devotion, precision, and overflowing love.",
        icon: "🛕"
      },
      {
        time: "11:00 AM - 12:00 PM",
        activity: "Puruṣottama Māhātmya Recitation - Part I",
        description: "First portion of sacred text recitation (Chapters 1-12). Ancient stories unfold revealing the Lord's divine nature and eternal pastimes.",
        icon: "📖"
      },
      {
        time: "12:00 PM - 2:00 PM",
        activity: "Mahāprasādam & Rest",
        description: "Sacred food offering and rest period. Partaking blessed prasādam that has been sanctified by the Lord's divine touch and grace.",
        icon: "🍽️"
      },
      {
        time: "2:00 PM - 4:00 PM",
        activity: "Sacred Fire Ceremony - Session I",
        description: "First session of Vedic fire ritual. Oblations offered with ancient mantras, creating divine vibrations that purify hearts and atmosphere.",
        icon: "🔥"
      },
      {
        time: "4:00 PM - 6:00 PM",
        activity: "Evening Saṅkīrtana",
        description: "Evening kirtan session with traditional instruments. Divine names resonate through the sacred space, melting hearts in devotional ecstasy.",
        icon: "🪘"
      },
      {
        time: "6:00 PM - 7:00 PM",
        activity: "Sandhyā Āratī",
        description: "Evening prayer ceremony with lamps and incense. The Lord is adorned with love as day transitions to the peaceful embrace of night.",
        icon: "🪔"
      },
      {
        time: "7:30 PM - 9:00 PM",
        activity: "Divine Form Discourse",
        description: "Enlightening discourse on the true nature of the Divine. Learned scholar reveals profound mysteries of Lord Jagannātha's eternal, transcendent form.",
        icon: "💫"
      }
    ],
    specialNote: "The first day focuses on purifying the heart while meditating on the Lord's divine form. This day serves as the cornerstone of our spiritual journey, establishing the foundation for deeper realization.",
    chapterFocus: "Skanda Purāṇa's Puruṣottama Māhātmya - Chapters 1-12"
  };

  return (
    <>
      {/* Day Header */}
      <div className="text-center mb-10">
        <div className="flex items-center justify-center mb-6">
          <div className="h-1 w-16 bg-gradient-to-r from-orange-400 to-red-400 rounded-full"></div>
          <span className="mx-4 text-orange-600 text-4xl">🌸</span>
          <div className="h-1 w-16 bg-gradient-to-r from-red-400 to-orange-400 rounded-full"></div>
        </div>
        
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
          {dayData.title}
        </h2>
        
        <p className="text-xl text-gray-600 mb-6 italic">
          {dayData.subtitle}
        </p>
        
        <div className="bg-gradient-to-r from-orange-100 to-red-100 rounded-2xl p-6 mb-8 border border-orange-200">
          <h3 className="text-lg font-bold text-orange-700 mb-2">Daily Theme</h3>
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
            <div key={index} className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 shadow-lg border border-orange-100 hover:shadow-xl transition-all duration-300">
              <div className="flex flex-col md:flex-row md:items-center md:space-x-6">
                <div className="flex items-center space-x-4 mb-4 md:mb-0 md:w-80">
                  <div className="text-3xl">{item.icon}</div>
                  <div>
                    <div className="text-sm font-bold text-orange-600 bg-orange-100 px-3 py-1 rounded-full inline-block mb-2">
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

export default Day1Schedule;