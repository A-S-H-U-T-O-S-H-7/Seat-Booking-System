// GuestsDay1.jsx
import React from 'react';

const GuestsDay1 = () => {
  const guestData = {
    title: "Day 1 - Foundation Ceremony Honor Roll",
    subtitle: "Revered Spiritual Luminaries & Sacred Knowledge Keepers",
    theme: "Wisdom Bearers & Divine Form Contemplators",
    
    chiefGuests: [
      {
        name: "His Holiness Jagadguru Śrī Bharatī Tīrtha Mahāsvāmījī",
        title: "Śaṅkarācārya of Śṛṅgerī Śārada Pīṭha",
        role: "Chief Patron & Spiritual Guide",
        significance: "Supreme spiritual authority blessing the commencement of sacred Pañcharātra",
        time: "9:00 AM - 11:00 AM",
        ceremony: "Mahā-Archanā Blessing",
        icon: "🕉️"
      },
      {
        name: "Śrī Śrī 108 Śrī Viṣṇu Pad Mahānt Dayānanda Giri",
        title: "Pīṭhādhīśvara of Govardhana Pīṭha",
        role: "Divine Invocation Leader",
        significance: "Leading the sacred invocation and establishing divine presence",
        time: "7:00 AM - 9:00 AM",
        ceremony: "Morning Saṅkīrtana Leadership",
        icon: "🎵"
      }
    ],

    honoredScholars: [
      {
        name: "Dr. Paṇḍit Rāma Śaṅkara Tripāṭhī",
        title: "Vedic Scholar & Sanskrit Authority",
        expertise: "Puruṣottama Māhātmya & Ancient Scriptures",
        contribution: "Sacred Text Recitation & Commentary",
        time: "11:00 AM - 12:00 PM",
        icon: "📚"
      },
      {
        name: "Ācārya Keśava Prasāda Miśra",
        title: "Paurāṇika & Spiritual Exponent",
        expertise: "Jagannātha Tradition & Temple Protocols",
        contribution: "Divine Form Discourse & Teaching",
        time: "7:30 PM - 9:00 PM",
        icon: "💫"
      },
      {
        name: "Dr. Śrīmatī Sundarī Devī Śāstrī",
        title: "Dharmaśāstra Expert & Women's Spiritual Leader",
        expertise: "Vedic Rituals & Sacred Ceremonies",
        contribution: "Ritual Guidance & Spiritual Counseling",
        time: "Throughout Day",
        icon: "🔥"
      }
    ],

    culturalDignitaries: [
      {
        name: "Paṇḍit Rāghunātha Panigrāhī",
        title: "Odissi Dance Maestro",
        contribution: "Sacred Dance Offerings & Cultural Program Direction",
        significance: "Preserving and presenting classical devotional arts",
        icon: "💃"
      },
      {
        name: "Ustad Ramahari Das",
        title: "Classical Vocalist & Bhajan Samrat",
        contribution: "Leading Devotional Music & Kirtan Sessions",
        significance: "Creating divine atmosphere through sacred sound",
        icon: "🎼"
      }
    ],

    administrativeGuests: [
      {
        name: "Śrī Arabinda Padhī",
        title: "Chief Administrator, Jagannātha Temple",
        role: "Temple Protocol & Ceremonial Coordination",
        significance: "Ensuring authentic traditional procedures",
        icon: "🏛️"
      },
      {
        name: "Dr. Priyambada Hejmadi",
        title: "Director, Odia Language & Culture",
        role: "Cultural Program Coordination",
        significance: "Preserving linguistic and cultural authenticity",
        icon: "🌸"
      }
    ]
  };

  const renderGuestCard = (guest, index, type) => {
    const colorSchemes = {
      chief: "from-purple-50 to-indigo-50 border-purple-200",
      scholar: "from-blue-50 to-cyan-50 border-blue-200", 
      cultural: "from-pink-50 to-rose-50 border-pink-200",
      admin: "from-green-50 to-emerald-50 border-green-200"
    };

    return (
      <div key={index} className={`bg-gradient-to-r ${colorSchemes[type]} rounded-2xl p-6 shadow-lg border hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
        <div className="flex items-start space-x-4">
          <div className="text-4xl flex-shrink-0 mt-1">{guest.icon}</div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800 mb-2">{guest.name}</h3>
            <p className="text-lg text-indigo-600 font-semibold mb-3">{guest.title}</p>
            
            {guest.role && (
              <div className="bg-white/70 rounded-lg p-3 mb-3">
                <span className="text-sm font-bold text-gray-600">Role: </span>
                <span className="text-gray-700">{guest.role}</span>
              </div>
            )}
            
            {guest.expertise && (
              <div className="bg-white/70 rounded-lg p-3 mb-3">
                <span className="text-sm font-bold text-gray-600">Expertise: </span>
                <span className="text-gray-700">{guest.expertise}</span>
              </div>
            )}
            
            <div className="bg-white/70 rounded-lg p-3 mb-3">
              <span className="text-sm font-bold text-gray-600">Contribution: </span>
              <span className="text-gray-700">{guest.contribution}</span>
            </div>
            
            {guest.time && (
              <div className="inline-block bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium">
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
        
        {guest.significance && (
          <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl border border-amber-200">
            <p className="text-sm text-gray-700 italic leading-relaxed">
              <span className="font-semibold text-amber-700">Sacred Significance: </span>
              {guest.significance}
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Day Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-8">
          <div className="h-1 w-20 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full"></div>
          <span className="mx-6 text-purple-600 text-5xl">🏛️</span>
          <div className="h-1 w-20 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full"></div>
        </div>
        
        <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
          {guestData.title}
        </h2>
        
        <p className="text-xl text-gray-600 mb-8 italic max-w-4xl mx-auto leading-relaxed">
          {guestData.subtitle}
        </p>
        
        <div className="bg-gradient-to-r from-purple-100 via-indigo-100 to-blue-100 rounded-3xl p-8 mb-12 border border-purple-200 shadow-lg">
          <h3 className="text-2xl font-bold text-purple-700 mb-3">Sacred Assembly Theme</h3>
          <p className="text-gray-700 text-lg font-medium">{guestData.theme}</p>
        </div>
      </div>

      {/* Chief Guests Section */}
      <div className="mb-16">
        <h3 className="text-3xl font-bold text-center mb-10 text-gray-800 flex items-center justify-center">
          <span className="text-purple-600 text-4xl mr-4">👑</span>
          Chief Spiritual Patrons
          <span className="text-purple-600 text-4xl ml-4">👑</span>
        </h3>
        <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {guestData.chiefGuests.map((guest, index) => renderGuestCard(guest, index, 'chief'))}
        </div>
      </div>

      {/* Honored Scholars Section */}
      <div className="mb-16">
        <h3 className="text-3xl font-bold text-center mb-10 text-gray-800 flex items-center justify-center">
          <span className="text-blue-600 text-4xl mr-4">📚</span>
          Revered Scholars & Ācāryas
          <span className="text-blue-600 text-4xl ml-4">📚</span>
        </h3>
        <div className="grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {guestData.honoredScholars.map((guest, index) => renderGuestCard(guest, index, 'scholar'))}
        </div>
      </div>

      {/* Cultural Dignitaries Section */}
      <div className="mb-16">
        <h3 className="text-3xl font-bold text-center mb-10 text-gray-800 flex items-center justify-center">
          <span className="text-pink-600 text-4xl mr-4">🎭</span>
          Cultural Luminaries
          <span className="text-pink-600 text-4xl ml-4">🎭</span>
        </h3>
        <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8">
          {guestData.culturalDignitaries.map((guest, index) => renderGuestCard(guest, index, 'cultural'))}
        </div>
      </div>

      {/* Administrative Guests Section */}
      <div className="mb-12">
        <h3 className="text-3xl font-bold text-center mb-10 text-gray-800 flex items-center justify-center">
          <span className="text-green-600 text-4xl mr-4">⚖️</span>
          Administrative Dignitaries
          <span className="text-green-600 text-4xl ml-4">⚖️</span>
        </h3>
        <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8">
          {guestData.administrativeGuests.map((guest, index) => renderGuestCard(guest, index, 'admin'))}
        </div>
      </div>

      {/* Day Significance */}
      <div className="bg-gradient-to-r from-gold-50 via-amber-50 to-orange-50 rounded-3xl p-10 shadow-xl border border-gold-200">
        <div className="text-center">
          <h4 className="text-2xl font-bold text-amber-800 mb-6 flex items-center justify-center">
            <span className="text-4xl mr-3">🌟</span>
            Day One Sacred Significance
            <span className="text-4xl ml-3">🌟</span>
          </h4>
          <p className="text-lg text-gray-700 leading-relaxed max-w-5xl mx-auto">
            The foundation day brings together the most revered spiritual authorities to establish the sacred atmosphere 
            and invoke divine blessings for the entire Pañcharātra. These luminous souls carry the wisdom of ages and 
            the authority to bridge heaven and earth through their presence and blessings.
          </p>
        </div>
      </div>
    </>
  );
};

export default GuestsDay1;