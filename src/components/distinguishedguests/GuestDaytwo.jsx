// GuestsDay2.jsx
import React from 'react';

const GuestsDay2 = () => {
  const guestData = {
    title: "Day 2 - Glory & Divine Power Assembly",
    subtitle: "Celebrating Divine Majesty & Cosmic Authority",
    theme: "Manifestation of Supreme Power & Universal Sovereignty",
    
    chiefGuests: [
      {
        name: "His Holiness Jagadguru Śrī Vijayendra Sarasvatī Śaṅkarācārya",
        title: "Śaṅkarācārya of Kāñchī Kāmakoṭi Pīṭha",
        role: "Divine Power Invocation Leader",
        significance: "Channeling cosmic authority and establishing divine sovereignty in the sacred space",
        time: "8:00 AM - 10:00 AM",
        ceremony: "Mahā-Śakti Invocation",
        icon: "⚡"
      },
      {
        name: "Śrī Śrī 1008 Ācārya Lakṣmī Nārāyaṇa Ācārya",
        title: "Mahāmaṇḍaleśvara & Viṣṇu Sampradāya Head",
        role: "Glory Manifestation Guide",
        significance: "Leading ceremonies that reveal the glorious forms and divine attributes",
        time: "6:30 AM - 8:00 AM",
        ceremony: "Dawn Glory Darśana",
        icon: "🔥"
      }
    ],

    honoredScholars: [
      {
        name: "Dr. Ācārya Gopīnātha Kavi",
        title: "Sāhitya Ācārya & Divine Poetry Expert",
        expertise: "Stotra Literature & Divine Glorification Texts",
        contribution: "Recitation of Power Hymns & Glory Verses",
        time: "10:30 AM - 12:00 PM",
        icon: "📜"
      },
      {
        name: "Paṇḍit Madhusūdana Ojhā",
        title: "Tantra Śāstra Authority & Ritual Specialist",
        expertise: "Śakti Worship & Divine Power Ceremonies",
        contribution: "Power Ritual Guidance & Energy Channeling",
        time: "2:00 PM - 4:00 PM",
        icon: "🔱"
      },
      {
        name: "Dr. Śrīmatī Kamalā Devī Bhāratī",
        title: "Devī Māhātmya Scholar & Śakti Tradition Expert",
        expertise: "Divine Feminine Power & Cosmic Energy",
        contribution: "Goddess Power Invocation & Sacred Feminine Teaching",
        time: "4:30 PM - 6:00 PM",
        icon: "🌺"
      },
      {
        name: "Ācārya Viśvanātha Śarmā",
        title: "Vedic Fire Ceremony Expert",
        expertise: "Agni Hotra & Sacred Fire Rituals",
        contribution: "Power Fire Ceremonies & Divine Light Manifestation",
        time: "6:00 PM - 8:00 PM",
        icon: "🕯️"
      }
    ],

    culturalDignitaries: [
      {
        name: "Guru Kelucharan Mohapatra (Representative)",
        title: "Odissi Dance Legend Memorial",
        contribution: "Power Dance Performances & Divine Expression through Movement",
        significance: "Embodying divine power through classical dance forms",
        icon: "🕺"
      },
      {
        name: "Ustad Allauddin Khan Saheb",
        title: "Dhrupad Master & Sacred Sound Authority",
        contribution: "Power Ragas & Divine Sound Vibrations",
        significance: "Creating cosmic resonance through powerful musical expressions",
        icon: "🎻"
      },
      {
        name: "Śrī Rām Mohan Mahāpātra",
        title: "Gotipua Dance Master",
        contribution: "Traditional Power Dances & Acrobatic Devotion",
        significance: "Demonstrating divine strength through sacred acrobatics",
        icon: "🤸"
      }
    ],

    administrativeGuests: [
      {
        name: "Śrī Bimalendu Nayak",
        title: "Puri Jagannātha Temple Executive Officer",
        role: "Sacred Protocol & Power Ceremony Coordination",
        significance: "Ensuring authentic power ritual implementations",
        icon: "⚖️"
      },
      {
        name: "Dr. Damodar Acharya",
        title: "Śrī Jagannātha Sanskrit University Vice-Chancellor",
        role: "Academic Excellence & Scholarly Recognition",
        significance: "Bridging ancient wisdom with contemporary understanding",
        icon: "🎓"
      },
      {
        name: "Śrī Ajay Kumar Singh",
        title: "Cultural Affairs Director, Odisha Government",
        role: "Government Cultural Support & Recognition",
        significance: "Official acknowledgment and support for sacred gathering",
        icon: "🏛️"
      }
    ],

    specialFeatures: [
      {
        name: "Mahā-Ārtī Collective",
        title: "108 Priests Sacred Fire Ceremony",
        contribution: "Synchronized Power Invocation with Sacred Flames",
        significance: "Creating a cosmic fire that connects earth to divine realms",
        time: "7:00 PM - 8:00 PM",
        icon: "🔥"
      },
      {
        name: "Divine Thunder Percussion",
        title: "Sacred Drum Ensemble",
        contribution: "Cosmic Rhythm & Divine Power Beats",
        significance: "Mimicking celestial thunder to invoke divine presence",
        time: "Throughout ceremonies",
        icon: "🥁"
      }
    ]
  };

  const renderGuestCard = (guest, index, type) => {
    const colorSchemes = {
      chief: "from-red-50 to-orange-50 border-red-200",
      scholar: "from-amber-50 to-yellow-50 border-amber-200", 
      cultural: "from-rose-50 to-pink-50 border-rose-200",
      admin: "from-orange-50 to-red-50 border-orange-200",
      special: "from-yellow-50 to-amber-50 border-yellow-300"
    };

    return (
      <div key={index} className={`bg-gradient-to-r ${colorSchemes[type]} rounded-2xl p-6 shadow-lg border-2 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105`}>
        <div className="flex items-start space-x-4">
          <div className="text-4xl flex-shrink-0 mt-1">{guest.icon}</div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800 mb-2">{guest.name}</h3>
            <p className="text-lg text-red-600 font-semibold mb-3">{guest.title}</p>
            
            {guest.role && (
              <div className="bg-white/80 rounded-lg p-3 mb-3 border border-orange-200">
                <span className="text-sm font-bold text-gray-600">Sacred Role: </span>
                <span className="text-gray-700">{guest.role}</span>
              </div>
            )}
            
            {guest.expertise && (
              <div className="bg-white/80 rounded-lg p-3 mb-3 border border-amber-200">
                <span className="text-sm font-bold text-gray-600">Divine Expertise: </span>
                <span className="text-gray-700">{guest.expertise}</span>
              </div>
            )}
            
            <div className="bg-white/80 rounded-lg p-3 mb-3 border border-yellow-200">
              <span className="text-sm font-bold text-gray-600">Power Contribution: </span>
              <span className="text-gray-700">{guest.contribution}</span>
            </div>
            
            {guest.time && (
              <div className="inline-block bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium">
                🕐 {guest.time}
              </div>
            )}
            
            {guest.ceremony && (
              <div className="mt-2 inline-block bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium ml-2">
                ⚡ {guest.ceremony}
              </div>
            )}
          </div>
        </div>
        
        {guest.significance && (
          <div className="mt-4 p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-200">
            <p className="text-sm text-gray-700 italic leading-relaxed">
              <span className="font-semibold text-red-700">Divine Significance: </span>
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
          <div className="h-1 w-20 bg-gradient-to-r from-red-400 to-orange-400 rounded-full"></div>
          <span className="mx-6 text-red-600 text-5xl">⚡</span>
          <div className="h-1 w-20 bg-gradient-to-r from-orange-400 to-red-400 rounded-full"></div>
        </div>
        
        <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
          {guestData.title}
        </h2>
        
        <p className="text-xl text-gray-600 mb-8 italic max-w-4xl mx-auto leading-relaxed">
          {guestData.subtitle}
        </p>
        
        <div className="bg-gradient-to-r from-red-100 via-orange-100 to-yellow-100 rounded-3xl p-8 mb-12 border border-red-200 shadow-lg">
          <h3 className="text-2xl font-bold text-red-700 mb-3">Sacred Power Theme</h3>
          <p className="text-gray-700 text-lg font-medium">{guestData.theme}</p>
        </div>
      </div>

      {/* Chief Guests Section */}
      <div className="mb-16">
        <h3 className="text-3xl font-bold text-center mb-10 text-gray-800 flex items-center justify-center">
          <span className="text-red-600 text-4xl mr-4">👑</span>
          Supreme Power Authorities
          <span className="text-red-600 text-4xl ml-4">👑</span>
        </h3>
        <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {guestData.chiefGuests.map((guest, index) => renderGuestCard(guest, index, 'chief'))}
        </div>
      </div>

      {/* Honored Scholars Section */}
      <div className="mb-16">
        <h3 className="text-3xl font-bold text-center mb-10 text-gray-800 flex items-center justify-center">
          <span className="text-amber-600 text-4xl mr-4">🔱</span>
          Power Scholars & Ritual Masters
          <span className="text-amber-600 text-4xl ml-4">🔱</span>
        </h3>
        <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6">
          {guestData.honoredScholars.map((guest, index) => renderGuestCard(guest, index, 'scholar'))}
        </div>
      </div>

      {/* Cultural Dignitaries Section */}
      <div className="mb-16">
        <h3 className="text-3xl font-bold text-center mb-10 text-gray-800 flex items-center justify-center">
          <span className="text-rose-600 text-4xl mr-4">🎭</span>
          Divine Expression Artists
          <span className="text-rose-600 text-4xl ml-4">🎭</span>
        </h3>
        <div className="grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {guestData.culturalDignitaries.map((guest, index) => renderGuestCard(guest, index, 'cultural'))}
        </div>
      </div>

      {/* Special Features Section */}
      <div className="mb-16">
        <h3 className="text-3xl font-bold text-center mb-10 text-gray-800 flex items-center justify-center">
          <span className="text-yellow-600 text-4xl mr-4">🌟</span>
          Divine Power Manifestations
          <span className="text-yellow-600 text-4xl ml-4">🌟</span>
        </h3>
        <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8">
          {guestData.specialFeatures.map((guest, index) => renderGuestCard(guest, index, 'special'))}
        </div>
      </div>

      {/* Administrative Guests Section */}
      <div className="mb-12">
        <h3 className="text-3xl font-bold text-center mb-10 text-gray-800 flex items-center justify-center">
          <span className="text-orange-600 text-4xl mr-4">⚖️</span>
          Administrative Power Support
          <span className="text-orange-600 text-4xl ml-4">⚖️</span>
        </h3>
        <div className="grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {guestData.administrativeGuests.map((guest, index) => renderGuestCard(guest, index, 'admin'))}
        </div>
      </div>

      {/* Day Significance */}
      <div className="bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50 rounded-3xl p-10 shadow-xl border-2 border-red-200">
        <div className="text-center">
          <h4 className="text-2xl font-bold text-red-800 mb-6 flex items-center justify-center">
            <span className="text-4xl mr-3">⚡</span>
            Day Two Divine Glory Significance
            <span className="text-4xl ml-3">⚡</span>
          </h4>
          <p className="text-lg text-gray-700 leading-relaxed max-w-5xl mx-auto">
            The second day manifests the supreme power and cosmic authority of the Divine. Through magnificent ceremonies, 
            sacred fire rituals, and powerful invocations, this assembly channels the raw divine energy that governs 
            the universe. The presence of these spiritual powerhouses creates a vortex of sacred energy that transforms 
            the entire space into a cosmic power center, where heaven's might touches earth.
          </p>
        </div>
      </div>
    </>
  );
};

export default GuestsDay2;