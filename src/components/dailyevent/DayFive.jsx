// Day5Schedule.jsx
import React from 'react';

const Day5Schedule = () => {
  const dayData = {
    title: "Day 5 - Divine Unity & Spiritual Culmination",
    subtitle: "Complete Surrender and Eternal Union with the Divine",
    theme: "Aikya-Jñāna (Knowledge of Divine Unity)",
    schedule: [
      {
        time: "4:00 AM - 6:00 AM",
        activity: "Unity Meditation & Final Surrender",
        description: "Deep contemplation on oneness with the Divine. Complete surrender of individual will to the Lord's divine plan, dissolving all sense of separation.",
        icon: "🕉️"
      },
      {
        time: "6:00 AM - 7:00 AM",
        activity: "Unity Prayers & Dedication",
        description: "Sacred verses celebrating the eternal relationship between soul and God. Final dedication of life, thoughts, and actions to divine service.",
        icon: "🙏"
      },
      {
        time: "7:00 AM - 9:00 AM",
        activity: "Transcendental Saṅkīrtana",
        description: "Ecstatic kirtan reaching spiritual heights. Voices unite in perfect harmony, creating vibrations that transport consciousness beyond material boundaries.",
        icon: "🎵"
      },
      {
        time: "9:00 AM - 11:00 AM",
        activity: "Grand Culmination Ceremony",
        description: "The most elaborate worship of the five days. Every ritual perfected with love, gratitude, and complete spiritual absorption in divine service.",
        icon: "🏛️"
      },
      {
        time: "11:00 AM - 12:00 PM",
        activity: "Final Scripture Completion",
        description: "Completion of Puruṣottama Māhātmya (Chapters 49-60). The sacred text concludes with promises of eternal spiritual benefit and divine blessing.",
        icon: "📿"
      },
      {
        time: "12:00 PM - 2:00 PM",
        activity: "Grand Feast & Thanksgiving",
        description: "Magnificent prasādam feast celebrating spiritual accomplishment. Grateful hearts partake the final blessed meal of the sacred journey.",
        icon: "🍽️"
      },
      {
        time: "2:00 PM - 4:00 PM",
        activity: "Final Sacred Fire Ceremony",
        description: "Concluding homa with offerings of gratitude. Sacred flames carry final prayers and commitments to the divine realm above.",
        icon: "🔱"
      },
      {
        time: "4:00 PM - 6:00 PM",
        activity: "Gratitude & Commitment Session",
        description: "Expressions of gratitude for divine blessings received. Devotees make commitments to carry forward the spiritual realizations in daily life.",
        icon: "🌟"
      },
      {
        time: "6:00 PM - 7:00 PM",
        activity: "Final Āratī & Blessing",
        description: "Culminating evening service with special blessings. The Lord's final darśana fills hearts with peace, joy, and spiritual satisfaction.",
        icon: "✨"
      },
      {
        time: "7:30 PM - 9:00 PM",
        activity: "Integration & Future Path Discourse",
        description: "Inspiring guidance on maintaining spiritual momentum. Wisdom on integrating the five-day experience into lifelong spiritual practice and service.",
        icon: "🛤️"
      }
    ],
    specialNote: "The culmination day brings complete spiritual fulfillment and establishes eternal connection with the Divine. Devotees leave transformed, carrying divine blessings into their daily lives.",
    chapterFocus: "Puruṣottama Māhātmya - Chapters 49-60 (Final Blessings & Spiritual Culmination)"
  };

  return (
    <>
      {/* Day Header */}
      <div className="text-center mb-10">
        <div className="flex items-center justify-center mb-6">
          <div className="h-1 w-16 bg-gradient-to-r from-amber-400 to-yellow-400 rounded-full"></div>
          <span className="mx-4 text-amber-600 text-4xl">🕉️</span>
          <div className="h-1 w-16 bg-gradient-to-r from-yellow-400 to-amber-400 rounded-full"></div>
        </div>
        
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
          {dayData.title}
        </h2>
        
        <p className="text-xl text-gray-600 mb-6 italic">
          {dayData.subtitle}
        </p>
        
        <div className="bg-gradient-to-r from-amber-100 to-yellow-100 rounded-2xl p-6 mb-8 border border-amber-200">
          <h3 className="text-lg font-bold text-amber-700 mb-2">Daily Theme</h3>
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
            <div key={index} className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-6 shadow-lg border border-amber-100 hover:shadow-xl transition-all duration-300">
              <div className="flex flex-col md:flex-row md:items-center md:space-x-6">
                <div className="flex items-center space-x-4 mb-4 md:mb-0 md:w-80">
                  <div className="text-3xl">{item.icon}</div>
                  <div>
                    <div className="text-sm font-bold text-amber-600 bg-amber-100 px-3 py-1 rounded-full inline-block mb-2">
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

      {/* Final Blessing Section */}
      <div className="bg-gradient-to-r from-gold-50 to-amber-50 rounded-3xl p-8 shadow-xl border border-gold-200 mt-12">
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <span className="text-4xl">🙏</span>
            <h3 className="text-2xl font-bold text-amber-800 mx-4">Final Blessing</h3>
            <span className="text-4xl">🙏</span>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 max-w-4xl mx-auto">
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              "May all who participate in this sacred Pañcharātra be blessed with eternal devotion, 
              divine realization, and the constant presence of Śrī Jagannātha in their hearts."
            </p>
            <p className="text-sm font-sanskrit text-amber-700 font-medium">
              सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः ।<br/>
              सर्वे भद्राणि पश्यन्तु मा कश्चिद्दुःखभाग्भवेत् ॥
            </p>
            <p className="text-xs text-gray-500 mt-2 italic">
              May all beings be happy, may all be free from disease,<br/>
              may all see auspiciousness, may no one suffer.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Day5Schedule;