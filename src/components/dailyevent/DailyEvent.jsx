// JagannathSchedule.jsx - Main Component
"use client"
import { useState } from 'react';
import Day1Schedule from './Dayone';
import EventBanner from './EventBanner';

export default function JagannathSchedule() {
  const [activeDay, setActiveDay] = useState('day1');
  const [language, setLanguage] = useState('english');



  const renderDayComponent = () => {
    switch(activeDay) {
      case 'day1': return <Day1Schedule language={language} />;
      
      default: return <Day1Schedule language={language} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br pt-4 from-orange-50 via-yellow-50 to-red-50">
      <EventBanner />

     

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-2 md:px-6 py-6 md:py-12">
        {/* Day Tabs */}
        {/* <div className="flex justify-center mb-8">
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
        </div> */}
       <div className="flex justify-center  mb-8">
      <div className="relative overflow-hidden rounded-3xl shadow-2xl">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br  from-orange-100 via-pink-50 to-purple-100"></div>
        
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 bg-white/40 backdrop-blur-sm"></div>
        
        {/* Content */}
        <div className="relative px-8 py-6 sm:px-6 sm:py-4 border border-pink-200 ">
          <div className="text-center space-y-2">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
              Schedule Overview
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-gray-700 font-medium">
              December 3 - December 7, 2025
            </p>
          </div>
        </div>
      </div>
    </div>

        {/* Day Content */}
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-2xl border border-orange-200 overflow-hidden">
          <div className="p-4 md:p-12">
            {renderDayComponent()}
            
           
          </div>
        </div>
      </div>
    </div>
  );
}