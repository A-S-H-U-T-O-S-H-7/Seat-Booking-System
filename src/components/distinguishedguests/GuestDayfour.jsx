// GuestsDay4.jsx
import React from 'react';

const GuestsDay4 = () => {
  const guestData = {
    title: "Day 4 - Love & Divine Compassion Assembly",
    subtitle: "Celebrating Universal Love & Sacred Heart Connection",
    theme: "Divine Love Manifestation & Cosmic Compassion Flow",
    
    chiefGuests: [
      {
        name: "His Holiness Jagadguru Śrī Śrī Rāghavendra Tīrtha Svāmījī",
        title: "Uttarādi Maṭha Pīṭhādhipati & Madhva Sampradāya Head",
        role: "Divine Love Philosophy Leader",
        significance: "Teaching the highest principles of divine love and devotional surrender",
        time: "8:00 AM - 10:00 AM",
        ceremony: "Prema-Bhakti Discourse",
        icon: "💖"
      },
      {
        name: "Śrī Śrī 1008 Svāmī Chidānanda Sarasvatī",
        title: "Parmarth Niketan Spiritual Head & Universal Love Ambassador",
        role: "Compassion Activation Guide",
        significance: "Awakening universal compassion and heart-centered consciousness",
        time: "6:30 AM - 8:00 AM",
        ceremony: "Karuṇā Meditation Leadership",
        icon: "🤗"
      }
    ],

    honoredScholars: [
      {
        name: "Dr. Paṇḍita Prema Sundarī Devī",
        title: "Bhakti Śāstra Authority & Divine Love Literature Expert",
        expertise: "Sacred Love Poetry & Devotional Literature",
        contribution: "Love Hymn Recitation & Bhakti Philosophy Teaching",
        time: "10:30 AM - 12:30 PM",
        icon: "💝"
      },
      {
        name: "Ācārya Rādhā Govinda Dāsa",
        title: "Vaiṣṇava Philosophy Scholar & Rāsa-Līlā Expert",
        expertise: "Divine Love Play & Sacred Romance Philosophy",
        contribution: "Divine Love Story Narration & Rāsa Meditation",
        time: "2:00 PM - 4:00 PM",
        icon: "🌹"
      },
      {
        name: "Dr. Śrīmatī Karuṇā Devī Bhaṭṭācārya",
        title: "Compassion Studies Expert & Social Service Philosophy Scholar",
        expertise: "Applied Compassion & Divine Service Principles",
        contribution: "Compassionate Action Guidance & Service Philosophy",
        time: "4:30 PM - 6:00 PM",
        icon: "🤲"
      },
      {
        name: "Paṇḍit Mukunda Gosvāmī",
        title: "ISKCON Scholar & Prema-Dharma Expert",
        expertise: "International Love Movement & Global Compassion",
        contribution: "Universal Love Teaching & Cross-cultural Heart Connection",
        time: "6:30 PM - 8:00 PM",
        icon: "🌍"
      }
    ],

    culturalDignitaries: [
      {
        name: "Smt. M.S. Subbulakshmi Memorial Collective",
        title: "Devotional Music Legend Heritage",
        contribution: "Divine Love Songs & Heart-melting Bhajans",
        significance: "Touching hearts through pure devotional music",
        icon: "🎵"
      },
      {
        name: "Guru Rukmini Devi Arundale Legacy",
        title: "Bharatanatyam Sacred Dance Tradition",
        contribution: "Love Expression through Sacred Dance",
        significance: "Embodying divine love through perfect artistic devotion",
        icon: "💃"
      },
      {
        name: "Smt. Aruna Sairam",
        title: "Carnatic Vocalist & Spiritual Singer",
        contribution: "Divine Love Vocal Expression & Sacred Sound Healing",
        significance: "Healing hearts through divinely inspired vocal artistry",
        icon: "🎤"
      },
      {
        name: "Guru Krishna Mohan Bhanja",
        title: "Odia Devotional Poetry Master",
        contribution: "Regional Love Poetry & Local Language Divine Expression",
        significance: "Connecting local hearts with universal divine love",
        icon: "📝"
      }
    ],

    serviceGuests: [
      {
        name: "Mata Amritanandamayi Mission Representatives",
        title: "Humanitarian Service & Divine Compassion Organization",
        contribution: "Demonstrating Love through Service & Charitable Action",
        significance: "Showing divine love through selfless service to humanity",
        icon: "🙏"
      },
      {
        name: "Akshaya Patra Foundation Delegates",
        title: "Child Nutrition & Educational Love Service",
        contribution: "Feeding Children as Divine Service",
        significance: "Expressing maternal divine love through care of children",
        icon: "🍽️"
      },
      {
        name: "Art of Living Foundation Team",
        title: "Global Peace & Love Ambassadors",
        contribution: "Stress Relief & Love Meditation Programs",
        significance: "Spreading inner peace and love consciousness globally",
        icon: "🕊️"
      }
    ],

    administrativeGuests: [
      {
        name: "Dr. A.P.J. Abdul Kalam Memorial Trust",
        title: "Scientific Humanism & Love-based Education",
        role: "Educational Love Philosophy & Scientific Spirituality",
        significance: "Bridging science and spirituality through love-based learning",
        icon: "🚀"
      },
      {
        name: "Smt. Sudha Murty",
        title: "Philanthropist & Literature-based Social Service",
        role: "Literary Expression of Love & Charitable Compassion",
        significance: "Demonstrating love through literature and social service",
        icon: "📚"
      },
      {
        name: "Dr. Kiran Bedi",
        title: "Transformational Leadership & Compassionate Justice",
        role: "Justice through Love & Rehabilitation with Compassion",
        significance: "Showing how love can transform even criminal justice",
        icon: "⚖️"
      }
    ],

    specialFeatures: [
      {
        name: "Global Unity Circle",
        title: "108 Nations Love Prayer Chain",
        contribution: "International Love Meditation & Global Heart Connection",
        significance: "Creating worldwide network of love and compassion",
        time: "7:00 PM - 8:00 PM",
        icon: "🌐"
      },
      {
        name: "Children's Divine Love Choir",
        title: "Sacred Innocence Love Expression",
        contribution: "Pure Heart Singing & Innocent Love Demonstration",
        significance: "Showing divine love through children's pure hearts",
        time: "Throughout ceremonies",
        icon: "👶"
      },
      {
        name: "Healing Love Circle",
        title: "Compassionate Healing & Divine Grace Distribution",
        contribution: "Love-based Healing & Emotional Transformation",
        significance: "Demonstrating divine love's power to heal and transform",
        time: "Continuous sessions",
        icon: "💚"
      }
    ]
  };

  const renderGuestCard = (guest, index, type) => {
    const colorSchemes = {
      chief: "from-rose-50 to-pink-50 border-rose-200",
      scholar: "from-red-50 to-rose-50 border-red-200", 
      cultural: "from-pink-50 to-purple-50 border-pink-200",
      service: "from-green-50 to-teal-50 border-green-200",
      admin: "from-blue-50 to-indigo-50 border-blue-200",
      special: "from-yellow-50 to-orange-50 border-yellow-300"
    };

    return (
      <div key={index} className={`bg-gradient-to-r ${colorSchemes[type]} rounded-2xl p-6 shadow-lg border-2 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105`}>
        <div className="flex items-start space-x-4">
          <div className="text-4xl flex-shrink-0 mt-1">{guest.icon}</div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800 mb-2">{guest.name}</h3>
            <p className="text-lg text-rose-600 font-semibold mb-3">{guest.title}</p>
            
            {guest.role && (
              <div className="bg-white/80 rounded-lg p-3 mb-3 border border-rose-200">
                <span className="text-sm font-bold text-gray-600">Love Role: </span>
                <span className="text-gray-700">{guest.role}</span>
              </div>
            )}
            
            {guest.expertise && (
              <div className="bg-white/80 rounded-lg p-3 mb-3 border border-red-200">
                <span className="text-sm font-bold text-gray-600">Love Expertise: </span>
                <span className="text-gray-700">{guest.expertise}</span>
              </div>
            )}
            
            <div className="bg-white/80 rounded-lg p-3 mb-3 border border-pink-200">
              <span className="text-sm font-bold text-gray-600">Love Contribution: </span>
              <span className="text-gray-700">{guest.contribution}</span>
            </div>
            
            {guest.time && (
              <div className="inline-block bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-sm font-medium">
                🕐 {guest.time}
              </div>
            )}
            
            {guest.ceremony && (
              <div className="mt-2 inline-block bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-sm font-medium ml-2">
                💖 {guest.ceremony}
              </div>
            )}
          </div>
        </div>
        
        {guest.significance && (
          <div className="mt-4 p-4 bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl border border-rose-200">
            <p className="text-sm text-gray-700 italic leading-relaxed">
              <span className="font-semibold text-rose-700">Love Significance: </span>
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
          <div className="h-1 w-20 bg-gradient-to-r from-rose-400 to-pink-400 rounded-full"></div>
          <span className="mx-6 text-rose-600 text-5xl">💖</span>
          <div className="h-1 w-20 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full"></div>
        </div>
        
        <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
          {guestData.title}
        </h2>
        
        <p className="text-xl text-gray-600 mb-8 italic max-w-4xl mx-auto leading-relaxed">
          {guestData.subtitle}
        </p>
        
        <div className="bg-gradient-to-r from-rose-100 via-pink-100 to-red-100 rounded-3xl p-8 mb-12 border border-rose-200 shadow-lg">
          <h3 className="text-2xl font-bold text-rose-700 mb-3">Sacred Love Theme</h3>
          <p className="text-gray-700 text-lg font-medium">{guestData.theme}</p>
        </div>
      </div>

      {/* Chief Guests Section */}
      <div className="mb-16">
        <h3 className="text-3xl font-bold text-center mb-10 text-gray-800 flex items-center justify-center">
          <span className="text-rose-600 text-4xl mr-4">👑</span>
          Divine Love Teachers
          <span className="text-rose-600 text-4xl ml-4">👑</span>
        </h3>
        <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {guestData.chiefGuests.map((guest, index) => renderGuestCard(guest, index, 'chief'))}
        </div>
      </div>

      {/* Honored Scholars Section */}
      <div className="mb-16">
        <h3 className="text-3xl font-bold text-center mb-10 text-gray-800 flex items-center justify-center">
          <span className="text-red-600 text-4xl mr-4">💝</span>
          Love Philosophy Masters
          <span className="text-red-600 text-4xl ml-4">💝</span>
        </h3>
        <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6">
          {guestData.honoredScholars.map((guest, index) => renderGuestCard(guest, index, 'scholar'))}
        </div>
      </div>

      {/* Cultural Dignitaries Section */}
      <div className="mb-16">
        <h3 className="text-3xl font-bold text-center mb-10 text-gray-800 flex items-center justify-center">
          <span className="text-pink-600 text-4xl mr-4">🎭</span>
          Love Expression Artists
          <span className="text-pink-600 text-4xl ml-4">🎭</span>
        </h3>
        <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6">
          {guestData.culturalDignitaries.map((guest, index) => renderGuestCard(guest, index, 'cultural'))}
        </div>
      </div>

      {/* Service Guests Section */}
      <div className="mb-16">
        <h3 className="text-3xl font-bold text-center mb-10 text-gray-800 flex items-center justify-center">
          <span className="text-green-600 text-4xl mr-4">🤲</span>
          Love in Action Organizations
          <span className="text-green-600 text-4xl ml-4">🤲</span>
        </h3>
        <div className="grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {guestData.serviceGuests.map((guest, index) => renderGuestCard(guest, index, 'service'))}
        </div>
      </div>

      {/* Special Features Section */}
      <div className="mb-16">
        <h3 className="text-3xl font-bold text-center mb-10 text-gray-800 flex items-center justify-center">
          <span className="text-yellow-600 text-4xl mr-4">🌟</span>
          Love Manifestations
          <span className="text-yellow-600 text-4xl ml-4">🌟</span>
        </h3>
        <div className="grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {guestData.specialFeatures.map((guest, index) => renderGuestCard(guest, index, 'special'))}
        </div>
      </div>

      {/* Administrative Guests Section */}
      <div className="mb-12">
        <h3 className="text-3xl font-bold text-center mb-10 text-gray-800 flex items-center justify-center">
          <span className="text-blue-600 text-4xl mr-4">⚖️</span>
          Love Leadership Examples
          <span className="text-blue-600 text-4xl ml-4">⚖️</span>
        </h3>
        <div className="grid md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {guestData.administrativeGuests.map((guest, index) => renderGuestCard(guest, index, 'admin'))}
        </div>
      </div>

      {/* Day Significance */}
      <div className="bg-gradient-to-r from-rose-50 via-pink-50 to-red-50 rounded-3xl p-10 shadow-xl border-2 border-rose-200">
        <div className="text-center">
          <h4 className="text-2xl font-bold text-rose-800 mb-6 flex items-center justify-center">
            <span className="text-4xl mr-3">💖</span>
            Day Four Divine Love Significance
            <span className="text-4xl ml-3">💖</span>
          </h4>
          <p className="text-lg text-gray-700 leading-relaxed max-w-5xl mx-auto">
            The fourth day opens the sacred heart space, where divine love flows freely among all beings. Through 
            teachings on compassion, demonstrations of selfless service, and expressions of pure devotion, this 
            assembly reveals that love is the highest spiritual practice. Distinguished guests who embody love 
            in action gather to show that true spirituality manifests as unconditional love, transforming not 
            only individual hearts but creating waves of compassion that heal the world.
          </p>
        </div>
      </div>
    </>
  );
};

export default GuestsDay4;