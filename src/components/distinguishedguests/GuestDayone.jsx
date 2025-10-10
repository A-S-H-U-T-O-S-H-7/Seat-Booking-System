"use client"
import React, { useState, useEffect } from 'react';
import { getGuests } from '@/lib/distinguishedGuestsService';
import { GUEST_CATEGORIES } from '@/lib/guestConstants';
import GuestBanner from './GuestBanner';

const GuestCard = ({ guest }) => {
  const category = GUEST_CATEGORIES[guest.category] || GUEST_CATEGORIES.spiritual;

  return (
    <div className={`${category.bgColor} rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden`}>
      <div className="p-4 sm:p-6">
        {/* Mobile Layout - Column */}
        <div className="flex flex-col items-center text-center sm:hidden">
          {/* Image Circle */}
          <div className={`flex-shrink-0 w-20 h-20 rounded-full bg-gradient-to-br ${category.gradient} p-0.5 mb-4`}>
            <div className="w-full h-full rounded-full bg-white p-1">
              <img 
                src={guest.imageUrl || '/api/placeholder/120/120'} 
                alt={guest.name}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 w-full">
            <h3 className="font-bold text-gray-900 text-base leading-tight mb-2">
              {guest.name}
            </h3>
            <p className={`text-sm font-semibold bg-gradient-to-r ${category.gradient} bg-clip-text text-transparent mb-3`}>
              {guest.title}
            </p>
            <p className="text-xs text-gray-600 leading-relaxed mb-3">
              {guest.description}
            </p>
          </div>
        </div>

        {/* Desktop Layout - Row */}
        <div className="hidden sm:flex items-start gap-5">
          {/* Image Circle */}
          <div className={`flex-shrink-0 w-28 h-28 rounded-full bg-gradient-to-br ${category.gradient} p-0.5`}>
            <div className="w-full h-full rounded-full bg-white p-1">
              <img 
                src={guest.imageUrl || '/api/placeholder/120/120'} 
                alt={guest.name}
                className="w-full h-full rounded-full object-cover"
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-lg leading-tight mb-2">
              {guest.name}
            </h3>
            <p className={`text-base font-semibold bg-gradient-to-r ${category.gradient} bg-clip-text text-transparent mb-3`}>
              {guest.title}
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              {guest.description}
            </p>
          </div>
        </div>

        {/* Significance */}
        {guest.significance && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-xs sm:text-sm text-gray-600 italic leading-relaxed">
              <span className="font-semibold text-amber-600">Sacred Significance: </span>
              {guest.significance}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const GuestSection = ({ title, icon, guests, gradient, description }) => {
  if (!guests || guests.length === 0) return null;

  return (
    <section className="mb-12 last:mb-0">
      {/* Section Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="h-1 w-8 sm:w-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
          <span className="mx-3 text-xl sm:text-2xl">{icon}</span>
          <div className="h-1 w-8 sm:w-12 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full"></div>
        </div>
        
        <h2 className="text-xl sm:text-3xl font-bold text-gray-900 mb-2">
          {title}
        </h2>
        <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
          {description}
        </p>
      </div>

      {/* Guests Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {guests.map(guest => (
          <GuestCard key={guest.id} guest={guest} />
        ))}
      </div>
    </section>
  );
};

export default function DistinguishedGuests() {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    loadGuests();
  }, []);

  const loadGuests = async () => {
    setLoading(true);
    try {
      const result = await getGuests();
      if (result.success) {
        setGuests(result.data);
      } else {
        console.error('Error loading guests:', result.error);
        setGuests([]);
      }
    } catch (error) {
      console.error('Error loading guests:', error);
      setGuests([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter guests by category
  const spiritualGuests = guests.filter(guest => guest.category === 'spiritual');
  const artistGuests = guests.filter(guest => guest.category === 'artist');
  const specialGuests = guests.filter(guest => guest.category === 'special');

  // Category tabs configuration
  const categories = [
    {
      id: 'all',
      label: 'All Guests',
      icon: '👥',
      show: true
    },
    {
      id: 'spiritual',
      label: 'Spiritual Gurus',
      icon: '🕉️',
      show: spiritualGuests.length > 0
    },
    {
      id: 'artist',
      label: 'Artists',
      icon: '🎨',
      show: artistGuests.length > 0
    },
    {
      id: 'special',
      label: 'Special Guests',
      icon: '⭐',
      show: specialGuests.length > 0
    }
  ].filter(cat => cat.show);

  // Get guests for selected category
  const getFilteredGuests = () => {
    switch (selectedCategory) {
      case 'spiritual':
        return { spiritual: spiritualGuests };
      case 'artist':
        return { artist: artistGuests };
      case 'special':
        return { special: specialGuests };
      default:
        return {
          spiritual: spiritualGuests,
          artist: artistGuests,
          special: specialGuests
        };
    }
  };

  const filteredGuests = getFilteredGuests();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <GuestBanner />

      {/* Honored Presence Banner */}
      <div className="bg-gradient-to-r from-violet-200 via-white/30 to-purple-200 py-4 md:py-6 px-4 md:px-8 border-b-4 border-purple-300 rounded-xl mx-4 md:mx-10 shadow-lg mt-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex flex-col items-center space-y-3 bg-white/90 backdrop-blur-sm rounded-3xl px-4 py-4 md:px-8 md:py-6 shadow-xl border border-amber-200">
            <div className="flex items-center space-x-2 md:space-x-3">
              <span className="text-amber-600 text-xl md:text-3xl">🙏</span>
              <span className="text-gray-800 font-semibold text-base md:text-xl">
                Revered Spiritual Luminaries & Sacred Dignitaries
              </span>
              <span className="text-amber-600 text-xl md:text-3xl">🙏</span>
            </div>
            <p className="text-gray-600 text-sm md:text-base max-w-3xl">
              Blessed by the presence of enlightened souls who illuminate the path of devotion
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced Main Content */}
      <div className="max-w-8xl mx-auto px-4 md:px-8 py-6 md:py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="h-1 w-10 sm:w-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
            <span className="mx-3 sm:mx-4 text-2xl sm:text-4xl">🏛️</span>
            <div className="h-1 w-10 sm:w-16 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full"></div>
          </div>
          
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2">
            Sacred Assembly
          </h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-2xl mx-auto">
            Honored Guests of the Pañcharātra Foundation Ceremony
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full font-medium transition-all duration-300 text-sm sm:text-base ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg transform scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 hover:shadow-md'
              }`}
            >
              <span className="mr-2">{category.icon}</span>
              {category.label}
            </button>
          ))}
        </div>

        {/* Guest Sections */}
        <div className="space-y-12">
          {/* Spiritual Gurus Section */}
          {filteredGuests.spiritual && filteredGuests.spiritual.length > 0 && (
            <GuestSection
              title="Spiritual Gurus"
              icon="🕉️"
              guests={filteredGuests.spiritual}
              gradient="from-purple-500 to-pink-500"
              description="Enlightened souls guiding us on the path of devotion and wisdom"
            />
          )}

          {/* Artists Section */}
          {filteredGuests.artist && filteredGuests.artist.length > 0 && (
            <GuestSection
              title="Artists"
              icon="🎨"
              guests={filteredGuests.artist}
              gradient="from-blue-500 to-teal-500"
              description="Creative visionaries preserving and propagating sacred arts"
            />
          )}

          {/* Special Guests Section */}
          {filteredGuests.special && filteredGuests.special.length > 0 && (
            <GuestSection
              title="Special Guests"
              icon="⭐"
              guests={filteredGuests.special}
              gradient="from-amber-500 to-orange-500"
              description="Distinguished personalities gracing our sacred ceremony"
            />
          )}
        </div>

        {/* Empty State */}
        {Object.values(filteredGuests).every(section => !section || section.length === 0) && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">😔</div>
            <p className="text-gray-600 text-lg">No guests found for the selected category.</p>
          </div>
        )}

        {/* Enhanced Devotional Quote */}
        <div className="text-center pt-12 border-t border-purple-200/30 mt-12">
          <div className="bg-gradient-to-r from-indigo-50/80 to-purple-50/80 rounded-3xl p-6 md:p-8 backdrop-blur-sm border border-indigo-200/30">
            <div className="flex items-center justify-center space-x-3 md:space-x-4 text-indigo-600 mb-4 md:mb-6">
              <span className="text-2xl md:text-3xl">🙏</span>
              <span className="font-bold text-xl md:text-2xl">
                अतिथि देवो भवः
              </span>
              <span className="text-2xl md:text-3xl">🙏</span>
            </div>
            <p className="text-base md:text-lg text-gray-600 mb-4 italic">
              "The Guest is God" - Honoring Divine Presence in Sacred Visitors
            </p>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-6 md:w-8 h-0.5 bg-indigo-300 rounded-full"></div>
              <span className="text-indigo-400 text-lg">⭐</span>
              <div className="w-6 md:w-8 h-0.5 bg-indigo-300 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}