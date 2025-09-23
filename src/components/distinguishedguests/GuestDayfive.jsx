// GuestsDay5.jsx
import React from 'react';

const GuestsDay5 = () => {
  const guestData = {
    title: "Day 5 - Unity & Divine Integration",
    subtitle: "Universal Harmony & Spiritual Synthesis",
    theme: "Oneness of All Paths",
    
    chiefGuests: [
      {
        name: "His Holiness Jagadguru Śrī Mādhavāśrama Svāmījī",
        title: "Unity Philosophy Master",
        role: "Synthesis Wisdom Teacher",
        time: "8:00 AM - 10:00 AM",
        ceremony: "Unity Consciousness Discourse",
        icon: "🕉️"
      }
    ],

    honoredScholars: [
      {
        name: "Dr. Paṇḍit Vāsudeva Śarmā",
        title: "Comparative Religion Scholar",
        expertise: "Inter-religious Dialogue",
        contribution: "Unity Teaching & Philosophy",
        time: "10:30 AM - 12:30 PM",
        icon: "🌍"
      },
      {
        name: "Ācārya Rām Svarūp Śāstrī",
        title: "Cosmic Consciousness Expert",
        expertise: "Universal Awareness Principles",
        contribution: "Consciousness Expansion Teaching",
        time: "2:00 PM - 4:00 PM",
        icon: "🧠"
      }
    ],

    culturalDignitaries: [
      {
        name: "Pt. Ravi Shankar Legacy",
        title: "Global Music Ambassador",
        contribution: "Universal Music & Cultural Bridge",
        icon: "🎵"
      },
      {
        name: "Smt. Kapila Vatsyayan Memorial",
        title: "Arts Integration Scholar",
        contribution: "Cultural Synthesis & Global Arts",
        icon: "🎭"
      }
    ]
  };

  const renderGuestCard = (guest, index, type) => {
    const colorSchemes = {
      chief: "from-indigo-50 to-purple-50 border-indigo-200",
      scholar: "from-blue-50 to-cyan-50 border-blue-200", 
      cultural: "from-green-50 to-teal-50 border-green-200"
    };

    return (
      <div key={index} className={`bg-gradient-to-r ${colorSchemes[type]} rounded-2xl p-6 shadow-lg border-2 hover:shadow-xl transition-all duration-300`}>
        <div className="flex items-start space-x-4">
          <div className="text-4xl flex-shrink-0 mt-1">{guest.icon}</div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800 mb-2">{guest.name}</h3>
            <p className="text-lg text-indigo-600 font-semibold mb-3">{guest.title}</p>
            
            {guest.role && (
              <div className="bg-white/80 rounded-lg p-3 mb-3">
                <span className="text-sm font-bold text-gray-600">Role: </span>
                <span className="text-gray-700">{guest.role}</span>
              </div>
            )}
            
            {guest.expertise && (
              <div className="bg-white/80 rounded-lg p-3 mb-3">
                <span className="text-sm font-bold text-gray-600">Expertise: </span>
                <span className="text-gray-700">{guest.expertise}</span>
              </div>
            )}
            
            <div className="bg-white/80 rounded-lg p-3 mb-3">
              <span className="text-sm font-bold text-gray-600">Contribution: </span>
              <span className="text-gray-700">{guest.contribution}</span>
            </div>
            
            {guest.time && (
              <div className="inline-block bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
                🕐 {guest.time}
              </div>
            )}
            
            {guest.ceremony && (
              <div className="mt-2 inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium ml-2">
                ⭐ {guest.ceremony}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Day Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-8">
          <div className="h-1 w-20 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full"></div>
          <span className="mx-6 text-indigo-600 text-5xl">🕉️</span>
          <div className="h-1 w-20 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full"></div>
        </div>
        
        <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
          {guestData.title}
        </h2>
        
        <p className="text-xl text-gray-600 mb-8 italic max-w-4xl mx-auto leading-relaxed">
          {guestData.subtitle}
        </p>
        
        <div className="bg-gradient-to-r from-indigo-100 via-purple-100 to-blue-100 rounded-3xl p-8 mb-12 border border-indigo-200 shadow-lg">
          <h3 className="text-2xl font-bold text-indigo-700 mb-3">Sacred Unity Theme</h3>
          <p className="text-gray-700 text-lg font-medium">{guestData.theme}</p>
        </div>
      </div>

      {/* Chief Guests Section */}
      <div className="mb-16">
        <h3 className="text-3xl font-bold text-center mb-10 text-gray-800 flex items-center justify-center">
          <span className="text-indigo-600 text-4xl mr-4">👑</span>
          Unity Consciousness Leaders
          <span className="text-indigo-600 text-4xl ml-4">👑</span>
        </h3>
        <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {guestData.chiefGuests.map((guest, index) => renderGuestCard(guest, index, 'chief'))}
        </div>
      </div>

      {/* Honored Scholars Section */}
      <div className="mb-16">
        <h3 className="text-3xl font-bold text-center mb-10 text-gray-800 flex items-center justify-center">
          <span className="text-blue-600 text-4xl mr-4">🌍</span>
          Universal Wisdom Teachers
          <span className="text-blue-600 text-4xl ml-4">🌍</span>
        </h3>
        <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6">
          {guestData.honoredScholars.map((guest, index) => renderGuestCard(guest, index, 'scholar'))}
        </div>
      </div>

      {/* Cultural Dignitaries Section */}
      <div className="mb-16">
        <h3 className="text-3xl font-bold text-center mb-10 text-gray-800 flex items-center justify-center">
          <span className="text-green-600 text-4xl mr-4">🎭</span>
          Global Cultural Ambassadors
          <span className="text-green-600 text-4xl ml-4">🎭</span>
        </h3>
        <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8">
          {guestData.culturalDignitaries.map((guest, index) => renderGuestCard(guest, index, 'cultural'))}
        </div>
      </div>

      {/* Day Significance */}
      <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50 rounded-3xl p-10 shadow-xl border-2 border-indigo-200">
        <div className="text-center">
          <h4 className="text-2xl font-bold text-indigo-800 mb-6 flex items-center justify-center">
            <span className="text-4xl mr-3">🕉️</span>
            Day Five Unity Significance
            <span className="text-4xl ml-3">🕉️</span>
          </h4>
          <p className="text-lg text-gray-700 leading-relaxed max-w-5xl mx-auto">
            The final day celebrates the ultimate truth - that all paths lead to the same divine source. 
            Through synthesis of wisdom traditions and universal principles, this assembly demonstrates 
            how spiritual diversity enriches rather than divides, creating a harmonious tapestry of 
            divine realization that embraces all beings in cosmic unity.
          </p>
        </div>
      </div>
    </>
  );
};

export default GuestsDay5;