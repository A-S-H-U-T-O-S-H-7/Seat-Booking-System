"use client";
import { useState } from 'react';
import { useShowSeatBooking } from '@/context/ShowSeatBookingContext';
import { useTheme } from '@/context/ThemeContext';
import { format, addDays, isAfter, isBefore, startOfDay } from 'date-fns';
import { CalendarDaysIcon, ClockIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

export default function ShowDateTimeSelection({ onNext }) {
  const { setDateAndShift, selectedDate, selectedShift } = useShowSeatBooking();
  const { isDarkMode } = useTheme();
  
  const [currentWeek, setCurrentWeek] = useState(0);

  // Show shifts available
  const shifts = [
    {
      id: 'morning',
      name: 'Morning Show',
      time: '10:00 AM - 1:00 PM',
      description: 'Cultural performances and dance shows',
      icon: '🌅',
      price: 'VIP: ₹1,000 | Regular: ₹300'
    },
    {
      id: 'afternoon',
      name: 'Afternoon Show', 
      time: '2:00 PM - 5:00 PM',
      description: 'Music concerts and traditional shows',
      icon: '☀️',
      price: 'VIP: ₹1,000 | Regular: ₹300'
    },
    {
      id: 'evening',
      name: 'Evening Show',
      time: '6:00 PM - 9:00 PM', 
      description: 'Grand performances and stage shows',
      icon: '🌇',
      price: 'VIP: ₹1,000 | Regular: ₹300'
    }
  ];

  // Generate dates for the next few weeks
  const generateWeekDates = (weekOffset = 0) => {
    const startDate = addDays(new Date(), weekOffset * 7);
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = addDays(startDate, i);
      // Only show future dates and up to 30 days ahead
      if (isAfter(date, startOfDay(new Date())) && isBefore(date, addDays(new Date(), 31))) {
        dates.push(date);
      }
    }
    return dates;
  };

  const weekDates = generateWeekDates(currentWeek);

  const handleDateSelect = (date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    setDateAndShift(formattedDate, selectedShift);
  };

  const handleShiftSelect = (shiftId) => {
    setDateAndShift(selectedDate, shiftId);
  };

  const handleContinue = () => {
    if (!selectedDate) {
      toast.error('Please select a date');
      return;
    }
    if (!selectedShift) {
      toast.error('Please select a show timing');
      return;
    }
    onNext();
  };

  const canGoToPreviousWeek = currentWeek > 0;
  const canGoToNextWeek = currentWeek < 4; // Limit to 4 weeks ahead

  return (
    <div className="space-y-6">
      {/* Date Selection */}
      <div className={`p-6 rounded-lg border ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center gap-3 mb-4">
          <CalendarDaysIcon className={`w-6 h-6 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
          <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Select Show Date
          </h2>
        </div>

        {/* Week Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCurrentWeek(currentWeek - 1)}
            disabled={!canGoToPreviousWeek}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              canGoToPreviousWeek
                ? isDarkMode 
                  ? 'text-gray-300 hover:bg-gray-700' 
                  : 'text-gray-600 hover:bg-gray-100'
                : 'text-gray-400 cursor-not-allowed'
            }`}
          >
            <ChevronLeftIcon className="w-4 h-4" />
            Previous Week
          </button>
          
          <div className={`text-sm font-medium ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Week {currentWeek + 1}
          </div>
          
          <button
            onClick={() => setCurrentWeek(currentWeek + 1)}
            disabled={!canGoToNextWeek}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              canGoToNextWeek
                ? isDarkMode 
                  ? 'text-gray-300 hover:bg-gray-700' 
                  : 'text-gray-600 hover:bg-gray-100'
                : 'text-gray-400 cursor-not-allowed'
            }`}
          >
            Next Week
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Date Grid */}
        <div className="grid grid-cols-7 gap-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className={`text-center text-sm font-medium py-2 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {day}
            </div>
          ))}
          
          {weekDates.map((date, index) => {
            const formattedDate = format(date, 'yyyy-MM-dd');
            const isSelected = selectedDate === formattedDate;
            const dayNumber = format(date, 'd');
            const monthName = format(date, 'MMM');
            
            return (
              <button
                key={index}
                onClick={() => handleDateSelect(date)}
                className={`p-3 rounded-lg text-center transition-all duration-200 ${
                  isSelected
                    ? 'bg-purple-600 text-white shadow-lg scale-105'
                    : isDarkMode
                      ? 'bg-gray-700 hover:bg-gray-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                }`}
              >
                <div className="text-lg font-bold">{dayNumber}</div>
                <div className="text-xs opacity-75">{monthName}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Shift Selection */}
      <div className={`p-6 rounded-lg border ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center gap-3 mb-4">
          <ClockIcon className={`w-6 h-6 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
          <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Select Show Timing
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {shifts.map((shift) => {
            const isSelected = selectedShift === shift.id;
            
            return (
              <button
                key={shift.id}
                onClick={() => handleShiftSelect(shift.id)}
                className={`p-4 rounded-lg text-left transition-all duration-200 border-2 ${
                  isSelected
                    ? 'border-purple-600 bg-purple-50 shadow-lg scale-105'
                    : isDarkMode
                      ? 'border-gray-600 bg-gray-700 hover:border-gray-500'
                      : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{shift.icon}</span>
                  <div>
                    <h3 className={`font-semibold ${
                      isSelected 
                        ? 'text-purple-700' 
                        : isDarkMode 
                          ? 'text-white' 
                          : 'text-gray-900'
                    }`}>
                      {shift.name}
                    </h3>
                    <p className={`text-sm ${
                      isSelected
                        ? 'text-purple-600'
                        : isDarkMode
                          ? 'text-gray-300'
                          : 'text-gray-600'
                    }`}>
                      {shift.time}
                    </p>
                  </div>
                </div>
                
                <p className={`text-sm mb-2 ${
                  isSelected
                    ? 'text-purple-600'
                    : isDarkMode
                      ? 'text-gray-400'
                      : 'text-gray-500'
                }`}>
                  {shift.description}
                </p>
                
                <p className={`text-xs font-medium ${
                  isSelected
                    ? 'text-purple-700'
                    : isDarkMode
                      ? 'text-gray-300'
                      : 'text-gray-600'
                }`}>
                  {shift.price}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Summary */}
      {(selectedDate || selectedShift) && (
        <div className={`p-4 rounded-lg border ${
          isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-blue-50 border-blue-200'
        }`}>
          <h3 className={`font-semibold mb-2 ${
            isDarkMode ? 'text-white' : 'text-blue-900'
          }`}>
            Your Selection
          </h3>
          <div className={`space-y-1 text-sm ${
            isDarkMode ? 'text-gray-300' : 'text-blue-800'
          }`}>
            {selectedDate && (
              <div>📅 Date: {format(new Date(selectedDate), 'EEEE, MMMM d, yyyy')}</div>
            )}
            {selectedShift && (
              <div>🎭 Show: {shifts.find(s => s.id === selectedShift)?.name}</div>
            )}
          </div>
        </div>
      )}

      {/* Continue Button */}
      <div className="flex justify-end">
        <button
          onClick={handleContinue}
          disabled={!selectedDate || !selectedShift}
          className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
            selectedDate && selectedShift
              ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:scale-105'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Continue to Seat Selection →
        </button>
      </div>
    </div>
  );
}
