// DistinguishedGuests.jsx - Main Component
"use client"
import { useState } from 'react';
import GuestsDay1 from './GuestDayone';
import GuestsDay2 from './GuestDaytwo';
import GuestsDay3 from './GuestDaythree';
import GuestsDay4 from './GuestDayfour';
import GuestsDay5 from './GuestDayfive';
import GuestBanner from './GuestBanner';

export default function DistinguishedGuests() {
  const [activeDay, setActiveDay] = useState('day1');

  const dayTabs = [
    { id: 'day1', label: 'Day 1', number: '१', theme: 'Knowledge' },
    { id: 'day2', label: 'Day 2', number: '२', theme: 'Glory' },
    { id: 'day3', label: 'Day 3', number: '३', theme: 'Beauty' },
    { id: 'day4', label: 'Day 4', number: '४', theme: 'Love' },
    { id: 'day5', label: 'Day 5', number: '५', theme: 'Unity' }
  ];

  const renderDayComponent = () => {
    switch(activeDay) {
      case 'day1': return <GuestsDay1 />;
      case 'day2': return <GuestsDay2 />;
      case 'day3': return <GuestsDay3 />;
      case 'day4': return <GuestsDay4 />;
      case 'day5': return <GuestsDay5 />;
      default: return <GuestsDay1 />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br pt-5 from-indigo-50 via-purple-50 to-pink-50">
      

      <GuestBanner/>

      {/* Honored Presence Banner */}
      <div className="bg-gradient-to-r from-violet-200  via-white/30 to-purple-200 py-2 md:py-4 px-2 md:px-6 border-b-4 border-purple-300 rounded-xl mx-2 md:mx-10 shadow-lg">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex flex-col items-center space-y-4 bg-white/90 backdrop-blur-sm rounded-3xl px-2 py-2 md:px-8 md:py-6 shadow-xl border border-amber-200">
            <div className="flex items-center space-x-3">
              <span className="text-amber-600 text-xl md:text-3xl">🙏</span>
              <span className="text-gray-800 font-semibold md:font-bold text-lg md:text-xl">
                Revered Spiritual Luminaries & Sacred Dignitaries
              </span>
              <span className="text-amber-600 text-xl md:text-3xl">🙏</span>
            </div>
            <p className="text-gray-600 text-base md:text-lg max-w-3xl">
              Blessed by the presence of enlightened souls who illuminate the path of devotion
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced Main Content */}
      <div className="max-w-8xl mx-auto px-2 md:px-6 py-4 md:py-8">
        {/* Redesigned Day Tabs - Compact & Responsive (Wrapping) */}
<div className="flex justify-center mb-8 ">
  <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-2 shadow-xl border border-purple-200/50 w-full max-w-4xl">
    <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
      {dayTabs.map((day) => (
        <button
          key={day.id}
          onClick={() => setActiveDay(day.id)}
          className={`group px-3 sm:px-4 md:px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-102 flex-shrink-0 ${
            activeDay === day.id
              ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg scale-102'
              : 'text-gray-600 hover:text-indigo-600 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50'
          }`}
        >
          <div className="flex flex-col items-center space-y-0.5">
            <div className="flex items-center space-x-1.5">
              <span className="text-base sm:text-lg font-bold">{day.number}</span>
              <span className="text-sm sm:text-base">{day.label}</span>
            </div>
            <span className={`text-xs font-medium leading-tight text-center ${
              activeDay === day.id ? 'text-white/80' : 'text-gray-400 group-hover:text-indigo-400'
            }`}>
              {day.theme}
            </span>
          </div>
        </button>
      ))}
    </div>
  </div>
</div>

        {/* Enhanced Content Container */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-purple-200/30 overflow-hidden">
          {/* Decorative Header */}
          <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 p-8 border-b border-purple-200/30">
            <div className="flex items-center justify-center space-x-4">
              <div className="w-12 h-0.5 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full"></div>
              <span className="text-purple-600 text-2xl">🌟</span>
              <span className="text-gray-700 font-bold text-xl">Sacred Presence</span>
              <span className="text-purple-600 text-2xl">🌟</span>
              <div className="w-12 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"></div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="p-8 md:p-12 lg:p-16">
            {renderDayComponent()}
            
            {/* Enhanced Devotional Quote */}
            <div className="text-center pt-12 border-t border-purple-200/30 mt-16">
              <div className="bg-gradient-to-r from-indigo-50/80 to-purple-50/80 rounded-3xl p-8 backdrop-blur-sm border border-indigo-200/30">
                <div className="flex items-center justify-center space-x-4 text-indigo-600 mb-6">
                  <span className="text-3xl">🙏</span>
                  <span className="font-sanskrit text-2xl font-bold">
                    अतिथि देवो भवः
                  </span>
                  <span className="text-3xl">🙏</span>
                </div>
                <p className="text-lg text-gray-600 mb-4 italic">
                  "The Guest is God" - Honoring Divine Presence in Sacred Visitors
                </p>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-8 h-0.5 bg-indigo-300 rounded-full"></div>
                  <span className="text-indigo-400 text-lg">⭐</span>
                  <div className="w-8 h-0.5 bg-indigo-300 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}