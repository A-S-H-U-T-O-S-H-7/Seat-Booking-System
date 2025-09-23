// JagannathSchedule.jsx - Main Component
"use client"
import { useState } from 'react';
import Day1Schedule from './Dayone';
import Day2Schedule from './Daytwo';
import Day3Schedule from './DayThree';
import Day4Schedule from './DayFour';
import Day5Schedule from './DayFive';
import EventBanner from './EventBanner';

export default function JagannathSchedule() {
  const [activeDay, setActiveDay] = useState('day1');

  const dayTabs = [
    { id: 'day1', label: 'Day 1', number: '१' },
    { id: 'day2', label: 'Day 2', number: '२' },
    { id: 'day3', label: 'Day 3', number: '३' },
    { id: 'day4', label: 'Day 4', number: '४' },
    { id: 'day5', label: 'Day 5', number: '५' }
  ];

  const renderDayComponent = () => {
    switch(activeDay) {
      case 'day1': return <Day1Schedule />;
      case 'day2': return <Day2Schedule />;
      case 'day3': return <Day3Schedule />;
      case 'day4': return <Day4Schedule />;
      case 'day5': return <Day5Schedule />;
      default: return <Day1Schedule />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br pt-4 from-orange-50 via-yellow-50 to-red-50">
      <EventBanner />

      

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-2 md:px-6 py-6 md:py-12">
        {/* Day Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-xl border border-orange-200">
            <div className="flex flex-wrap justify-center gap-2">
              {dayTabs.map((day) => (
                <button
                  key={day.id}
                  onClick={() => setActiveDay(day.id)}
                  className={`px-4 md:px-6 py-2 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2 ${
                    activeDay === day.id
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg transform scale-105'
                      : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
                  }`}
                >
                  <span className="text-lg">{day.number}</span>
                  <span>{day.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Day Content */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-2xl border border-orange-200 overflow-hidden">
          <div className="p-4 md:p-12">
            {renderDayComponent()}
            
            {/* Devotional Quote */}
            <div className="text-center pt-8 border-t border-orange-200 mt-10">
              <div className="inline-flex items-center space-x-3 text-orange-600 mb-4">
                <span className="text-2xl">🙏</span>
                <span className="font-sanskrit text-lg">
                  जगन्नाथस्वामी नयनपथगामी भवतु मे
                </span>
                <span className="text-2xl">🙏</span>
              </div>
              <p className="text-sm text-gray-500">
                May Lord Jagannātha be the object of my vision
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}