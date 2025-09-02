// GuestsDay3.jsx
import React from 'react';

const GuestsDay3 = () => {
  const guestData = {
    title: "Day 3 - Beauty & Divine Aesthetics Assembly",
    subtitle: "Celebrating Cosmic Beauty & Sacred Arts",
    theme: "Divine Beauty Manifestation & Sacred Artistic Expression",
    
    chiefGuests: [
      {
        name: "His Holiness Jagadguru Śrī Śaṅkara Vijayendra Sarasvatī",
        title: "Śaṅkarācārya of Śṛṅgerī Śārada Pīṭha",
        role: "Divine Beauty Contemplation Leader",
        significance: "Guiding meditation on cosmic beauty and divine aesthetic principles",
        time: "8:30 AM - 10:30 AM",
        ceremony: "Saundarya Laharī Recitation",
        icon: "🌸"
      },
      {
        name: "Śrī Śrī 1008 Ācārya Prema Vallabha Ācārya",
        title: "Puṣṭimārga Ācārya & Aesthetic Philosophy Guide",
        role: "Divine Love-Beauty Synthesis Teacher",
        significance: "Revealing the connection between divine love and cosmic beauty",
        time: "6:00 AM - 8:00 AM",
        ceremony: "Rāsa-Līlā Beauty Meditation",
        icon: "💫"
      }
    ],

    honoredScholars: [
      {
        name: "Dr. Paṇḍita Kamalā Saurāṣṭrī",
        title: "Sanskrit Aesthetics Scholar & Alaṅkāra Śāstra Expert",
        expertise: "Divine Poetry & Sacred Literature Aesthetics",
        contribution: "Beauty-filled Verse Recitation & Aesthetic Theory Teaching",
        time: "10:30 AM - 12:30 PM",
        icon: "📖"
      },
      {
        name: "Ācārya Rāmacandra Kavi",
        title: "Nāṭya Śāstra Authority & Performance Aesthetics Expert",
        expertise: "Sacred Drama & Divine Performance Arts",
        contribution: "Divine Drama Direction & Sacred Performance Guidance",
        time: "2:00 PM - 4:00 PM",
        icon: "🎭"
      },
      {
        name: "Dr. Śrīmatī Lalitā Devī Śāstrī",
        title: "Alaṅkāra Śāstra & Divine Beauty Philosophy Scholar",
        expertise: "Cosmic Beauty Principles & Sacred Aesthetics",
        contribution: "Beauty Meditation Guidance & Aesthetic Philosophy Teaching",
        time: "4:30 PM - 6:00 PM",
        icon: "🌺"
      },
      {
        name: "Paṇḍit Śyāma Caran Tripāṭhī",
        title: "Vedic Aesthetics & Sacred Geometry Expert",
        expertise: "Divine Proportion & Sacred Mathematical Beauty",
        contribution: "Sacred Geometry Teaching & Divine Pattern Recognition",
        time: "6:30 PM - 8:00 PM",
        icon: "📐"
      }
    ],

    culturalDignitaries: [
      {
        name: "Smt. Sonal Mansingh",
        title: "Padma Vibhushan & Classical Dance Legend",
        contribution: "Divine Beauty Expression through Sacred Dance",
        significance: "Embodying cosmic beauty through perfect artistic expression",
        icon: "💃"
      },
      {
        name: "Pt. Hariprasad Chaurasia",
        title: "Flute Maestro & Divine Sound Beauty Creator",
        contribution: "Sacred Sound Beauty & Melodic Divine Expression",
        significance: "Creating celestial beauty through perfect musical harmony",
        icon: "🪈"
      },
      {
        name: "Smt. Shubha Mudgal",
        title: "Classical Vocalist & Sacred Song Beauty Expert",
        contribution: "Divine Vocal Beauty & Sacred Song Performance",
        significance: "Expressing divine beauty through perfect vocal artistry",
        icon: "🎵"
      },
      {
        name: "Guru Ratikant Mohapatra",
        title: "Odissi Dance Master & Divine Grace Teacher",
        contribution: "Sacred Dance Beauty & Divine Movement Arts",
        significance: "Teaching divine beauty through traditional dance perfection",
        icon: "🕺"
      }
    ],

    artisticGuests: [
      {
        name: "Śrī Jagannātha Mahāpātra",
        title: "Traditional Painting Master & Divine Art Creator",
        contribution: "Sacred Visual Arts & Divine Image Creation",
        significance: "Creating visual representations of divine beauty",
        icon: "🎨"
      },
      {
        name: "Smt. Meera Mukherjee Memorial Collective",
        title: "Sacred Sculpture & Divine Form Artists",
        contribution: "Three-dimensional Divine Beauty Creation",
        significance: "Manifesting divine forms through sacred sculpture",
        icon: "🗿"
      },
      {
        name: "Guru Deva Prasad Das",
        title: "Pattachitra Master & Sacred Story Painter",
        contribution: "Divine Story Illustration & Sacred Narrative Art",
        significance: "Preserving divine stories through beautiful visual narratives",
        icon: "🖼️"
      }
    ],

    administrativeGuests: [
      {
        name: "Smt. Ileana Citaristi",
        title: "Odissi Research Centre Director",
        role: "Cultural Preservation & Aesthetic Documentation",
        significance: "Preserving and promoting traditional art forms",
        icon: "📚"
      },
      {
        name: "Dr. Kavita Sharma",
        title: "National Museum Director (Former)",
        role: "Cultural Heritage & Artistic Excellence Promotion",
        significance: "Connecting ancient artistic traditions with contemporary appreciation",
        icon: "🏛️"
      },
      {
        name: "Śrī Raghunath Panigrahi",
        title: "Cultural Affairs Secretary, Odisha",
        role: "Government Cultural Support & Arts Promotion",
        significance: "Official recognition and support for traditional arts",
        icon: "⚖️"
      }
    ],

    specialFeatures: [
      {
        name: "Divine Beauty Altar",
        title: "108 Flowers Sacred Decoration",
        contribution: "Creating Visual Divine Beauty through Floral Arrangements",
        significance: "Manifesting natural divine beauty in sacred space",
        time: "Throughout the day",
        icon: "🌹"
      },
      {
        name: "Celestial Color Symphony",
        title: "Sacred Color Therapy & Divine Light Display",
        contribution: "Color-based Meditation & Divine Light Experience",
        significance: "Healing and inspiring through divine color principles",
        time: "Evening hours",
        icon: "🌈"
      }
    ]
  };

  const renderGuestCard = (guest, index, type) => {
    const colorSchemes = {
      chief: "from-pink-50 to-rose-50 border-pink-200",
      scholar: "from-purple-50 to-violet-50 border-purple-200", 
      cultural: "from-blue-50 to-indigo-50 border-blue-200",
      artistic: "from-teal-50 to-cyan-50 border-teal-200",
      admin: "from-green-50 to-emerald-50 border-green-200",
      special: "from-yellow-50 to-amber-50 border-yellow-300"
    };

    return (
      <div key={index} className={`bg-gradient-to-r ${colorSchemes[type]} rounded-2xl p-6 shadow-lg border-2 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105`}>
        <div className="flex items-start space-x-4">
          <div className="text-4xl flex-shrink-0 mt-1">{guest.icon}</div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800 mb-2">{guest.name}</h3>
            <p className="text-lg text-purple-600 font-semibold mb-3">{guest.title}</p>
            
            {guest.role && (
              <div className="bg-white/80 rounded-lg p-3 mb-3 border border-pink-200">
                <span className="text-sm font-bold text-gray-600">Aesthetic Role: </span>
                <span className="text-gray-700">{guest.role}</span>
              </div>
            )}
            
            {guest.expertise && (
              <div className="bg-white/80 rounded-lg p-3 mb-3 border border-purple-200">
                <span className="text-sm font-bold text-gray-600">Beauty Expertise: </span>
                <span className="text-gray-700">{guest.expertise}</span>
              </div>
            )}
            
            <div className="bg-white/80 rounded-lg p-3 mb-3 border border-blue-200">
              <span className="text-sm font-bold text-gray-600">Artistic Contribution: </span>
              <span className="text-gray-700">{guest.contribution}</span>
            </div>
            
            {guest.time && (
              <div className="inline-block bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-sm font-medium">
                🕐 {guest.time}
              </div>
            )}
            
            {guest.ceremony && (
              <div className="mt-2 inline-block bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium ml-2">
                🌸 {guest.ceremony}
              </div>
            )}
          </div>
        </div>
        
        {guest.significance && (
          <div className="mt-4 p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-200">
            <p className="text-sm text-gray-700 italic leading-relaxed">
              <span className="font-semibold text-pink-700">Aesthetic Significance: </span>
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
          <div className="h-1 w-20 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full"></div>
          <span className="mx-6 text-pink-600 text-5xl">🌸</span>
          <div className="h-1 w-20 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
        </div>
        
        <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
          {guestData.title}
        </h2>
        
        <p className="text-xl text-gray-600 mb-8 italic max-w-4xl mx-auto leading-relaxed">
          {guestData.subtitle}
        </p>
        
        <div className="bg-gradient-to-r from-pink-100 via-purple-100 to-blue-100 rounded-3xl p-8 mb-12 border border-pink-200 shadow-lg">
          <h3 className="text-2xl font-bold text-pink-700 mb-3">Sacred Beauty Theme</h3>
          <p className="text-gray-700 text-lg font-medium">{guestData.theme}</p>
        </div>
      </div>

      {/* Chief Guests Section */}
      <div className="mb-16">
        <h3 className="text-3xl font-bold text-center mb-10 text-gray-800 flex items-center justify-center">
          <span className="text-pink-600 text-4xl mr-4">👑</span>
          Divine Beauty Contemplators
          <span className="text-pink-600 text-4xl ml-4">👑</span>
        </h3>
        <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {guestData.chiefGuests.map((guest, index) => renderGuestCard(guest, index, 'chief'))}
        </div>
      </div>

      {/* Honored Scholars Section */}
      <div className="mb-16">
        <h3 className="text-3xl font-bold text-center mb-10 text-gray-800 flex items-center justify-center">
          <span className="text-purple-600 text-4xl mr-4">📖</span>
          Aesthetic Philosophy Masters
          <span className="text-purple-600 text-4xl ml-4">📖</span>
        </h3>
        <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6">
          {guestData.honoredScholars.map((guest, index) => renderGuestCard(guest, index, 'scholar'))}
        </div>
      </div>

      {/* Cultural Dignitaries Section */}
      <div className="mb-16">
        <h3 className="text-3xl font-bold text-center mb-10 text-gray-800 flex items-center justify-center">
          <span className="text-blue-600 text-4xl mr-4">🎭</span>
          Divine Beauty Artists
          <span className="text-blue-600 text-4xl ml-4">🎭</span>
        </h3>
        <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6">
          {guestData.culturalDignitaries.map((guest, index) => renderGuestCard(guest, index, 'cultural'))}
        </div>
      </div>

      {/* Artistic Guests Section */}
      <div className="mb-16">
        <h3 className="text-3xl font-bold text-center mb-10 text-gray-800 flex items-center justify-center">
          <span className="text-teal-600 text-4xl mr-4">🎨</span>
          Sacred Visual Artists
          <span className="text-teal-600 text-4xl ml-4">🎨</span>
        </h3>
        <div className="grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {guestData.artisticGuests.map((guest, index) => renderGuestCard(guest, index, 'artistic'))}
        </div>
      </div>

      {/* Special Features Section */}
      <div className="mb-16">
        <h3 className="text-3xl font-bold text-center mb-10 text-gray-800 flex items-center justify-center">
          <span className="text-yellow-600 text-4xl mr-4">🌟</span>
          Beauty Manifestations
          <span className="text-yellow-600 text-4xl ml-4">🌟</span>
        </h3>
        <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8">
          {guestData.specialFeatures.map((guest, index) => renderGuestCard(guest, index, 'special'))}
        </div>
      </div>

      {/* Administrative Guests Section */}
      <div className="mb-12">
        <h3 className="text-3xl font-bold text-center mb-10 text-gray-800 flex items-center justify-center">
          <span className="text-green-600 text-4xl mr-4">⚖️</span>
          Cultural Preservation Authorities
          <span className="text-green-600 text-4xl ml-4">⚖️</span>
        </h3>
        <div className="grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {guestData.administrativeGuests.map((guest, index) => renderGuestCard(guest, index, 'admin'))}
        </div>
      </div>

      {/* Day Significance */}
      <div className="bg-gradient-to-r from-pink-50 via-purple-50 to-blue-50 rounded-3xl p-10 shadow-xl border-2 border-pink-200">
        <div className="text-center">
          <h4 className="text-2xl font-bold text-pink-800 mb-6 flex items-center justify-center">
            <span className="text-4xl mr-3">🌸</span>
            Day Three Divine Beauty Significance
            <span className="text-4xl ml-3">🌸</span>
          </h4>
          <p className="text-lg text-gray-700 leading-relaxed max-w-5xl mx-auto">
            The third day celebrates the magnificent beauty that permeates all creation. Through sacred arts, divine 
            performances, and aesthetic contemplation, this assembly reveals how beauty serves as a pathway to the 
            Divine. Master artists, scholars of aesthetics, and cultural luminaries gather to demonstrate that 
            true beauty transcends the material realm, serving as a bridge between earth and heaven, inspiring 
            souls toward divine realization through the pure experience of cosmic beauty.
          </p>
        </div>
      </div>
    </>
  );
};

export default GuestsDay3;