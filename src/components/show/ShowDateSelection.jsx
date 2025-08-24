"use client";
import { useEffect, useState } from "react";
import { useShowSeatBooking } from "@/context/ShowSeatBookingContext";
import { Calendar } from "lucide-react";
import { format, addDays, startOfToday, isSameDay } from "date-fns";
import { db } from "@/lib/firebase";
import { doc, getDoc, onSnapshot } from "firebase/firestore";

export default function ShowDateSelection() {
  const { selectedDate, setDateAndShift, selectedShift } = useShowSeatBooking();
  const [showSettings, setShowSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  // Real-time listener for show settings from Firebase
  useEffect(() => {
    setLoading(true);
    
    const showSettingsRef = doc(db, 'settings', 'shows');
    
    const unsubscribe = onSnapshot(
      showSettingsRef,
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setShowSettings(data);
        } else {
          setShowSettings(null);
        }
        setLoading(false);
      },
      (error) => {
        setLoading(false);
      }
    );
    
    return () => unsubscribe();
  }, []);

  // Generate dates based on settings or fallback to default 5 days
  const generateAvailableDates = () => {
    const dates = [];
    
    // Check different possible structures for event dates configuration
    const eventDates = showSettings?.eventDates;
    
    if (eventDates) {
      
      // If we have specific start and end dates, use them
      if (eventDates.startDate && eventDates.endDate) {
        const startDate = new Date(eventDates.startDate);
        const endDate = new Date(eventDates.endDate);
        
        const currentDate = new Date(startDate);
        while (currentDate <= endDate) {
          dates.push(new Date(currentDate));
          currentDate.setDate(currentDate.getDate() + 1);
        }
        
        return dates;
      }
    }
    
    // Fallback to tomorrow + X days logic
    const today = startOfToday();
    let dayCount = 5; // Default fallback
    
    if (eventDates) {
      // Check for enabled and dayCount properties
      if (eventDates.enabled && eventDates.dayCount) {
        dayCount = eventDates.dayCount;
      }
      // Check for isActive and availableDays properties (alternative structure)
      else if (eventDates.isActive && eventDates.availableDays) {
        dayCount = eventDates.availableDays;
      }
      // Check for direct dayCount property
      else if (eventDates.dayCount) {
        dayCount = eventDates.dayCount;
      }
      // Check for direct availableDays property
      else if (eventDates.availableDays) {
        dayCount = eventDates.availableDays;
      }
    }
    
    for (let i = 1; i <= dayCount; i++) {
      dates.push(addDays(today, i));
    }
    return dates;
  };

  const availableDates = generateAvailableDates();
  
  // Handle different possible structures for shows array
  const activeShows = showSettings?.shows?.filter(show => 
    show.active === true || show.isActive === true
  ) || [];

  const handleDateSelect = (date) => {
    
    // Set both date and shift in the context
    // Use the first active show or default to "evening"
    const firstShow = activeShows.length > 0 ? 
      (activeShows[0].name || activeShows[0].label || 'evening').toLowerCase() : 
      "evening";
    
    setDateAndShift(date, firstShow);
  };
  
  // Format time to AM/PM format
  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Fixed date comparison
  const isDateSelected = (date) => {
    if (!selectedDate) return false;
    
    // If selectedDate is a string, convert to Date object
    const selectedDateObj = typeof selectedDate === 'string' 
      ? new Date(selectedDate) 
      : selectedDate;
    
    return isSameDay(date, selectedDateObj);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 pb-10">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-pink-300 bg-clip-text text-transparent mb-2">
          Choose Your Show Date & Time
        </h2>
        <p className="text-gray-600">
          Select your preferred date and timing for the show
        </p>
      </div>

      {/* Date Selection */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-5">
        {availableDates.map((date, index) => {
          const isSelected = isDateSelected(date);

          return (
            <div
              key={index}
              className={`group relative p-4 rounded-2xl cursor-pointer transition-all duration-300 hover:scale-105 transform ${
                isSelected
                  ? "bg-gradient-to-br from-pink-100 to-pink-50 border-2 border-pink-300 shadow-xl scale-105"
                  : "bg-white border border-gray-200 hover:border-pink-200 hover:shadow-lg"
              }`}
              onClick={() => handleDateSelect(date)}
            >
              <div className="flex items-center justify-center mb-3">
                <Calendar
                  className={`w-6 h-6 mr-2 transition-colors ${
                    isSelected ? "text-pink-600" : "text-gray-400"
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    isSelected ? "text-pink-600" : "text-gray-500"
                  }`}
                >
                  Day {index + 1}
                </span>
              </div>

              <div className="text-center">
                <div
                  className={`text-lg font-bold mb-1 ${
                    isSelected ? "text-pink-700" : "text-gray-700"
                  }`}
                >
                  {format(date, "EEEE")}
                </div>

                <div
                  className={`text-sm font-medium ${
                    isSelected ? "text-pink-600" : "text-gray-500"
                  }`}
                >
                  {format(date, "MMMM dd")}
                </div>
              </div>

              {isSelected && (
                <div className="absolute inset-0 bg-gradient-to-br from-pink-50 to-pink-100 rounded-2xl opacity-50 pointer-events-none animate-pulse"></div>
              )}
            </div>
          );
        })}
      </div>

      {/* Show Timing Info */}
      {selectedDate && (
        <div className="mt-10 max-w-4xl mx-auto space-y-4">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
            </div>
          ) : activeShows.length > 0 ? (
            activeShows.map((show, index) => (
              <div key={index} className="p-6 rounded-2xl bg-gradient-to-r from-pink-100 via-pink-50 to-pink-100 border-2 border-pink-300 shadow-md hover:shadow-pink-200 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-pink-600 text-3xl">{show.icon || '🎭'}</span>
                    <div>
                      <p className="text-lg font-semibold text-pink-700">{show.name}</p>
                      <p className="text-sm text-pink-600">
                        {formatTime(show.timeFrom || show.startTime)} - {formatTime(show.timeTo || show.endTime)}
                      </p>
                    </div>
                  </div>
                  <span className="px-4 py-1 bg-pink-200 text-pink-700 rounded-full text-sm font-medium">
                    {show.badgeText || 'Daily Event'}
                  </span>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {show.description || 'Join us for an unforgettable experience filled with mesmerizing performances and memorable moments.'}
                </p>
              </div>
            ))
          ) : (
            <div className="p-6 rounded-2xl bg-gradient-to-r from-pink-100 via-pink-50 to-pink-100 border-2 border-pink-300 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-pink-600 text-3xl">🎭</span>
                  <div>
                    <p className="text-lg font-semibold text-pink-700">Evening Show</p>
                    <p className="text-sm text-pink-600">5:00 PM - 10:00 PM</p>
                  </div>
                </div>
                <span className="px-4 py-1 bg-pink-200 text-pink-700 rounded-full text-sm font-medium">
                  Daily Event
                </span>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">
                Join us for an evening of{" "}
                <span className="text-pink-600 font-medium">
                  mesmerizing cultural performances
                </span>{" "}
                and unforgettable moments.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Selected Summary */}
      {selectedDate && (
        <div className="mt-8 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl max-w-md mx-auto animate-fade-in">
          <div className="text-center">
            <div className="text-green-600 mb-1">✓ Booking Selection</div>
            <p className="text-sm font-semibold text-green-700">
              {format(
                typeof selectedDate === 'string' 
                  ? new Date(selectedDate) 
                  : selectedDate, 
                "EEEE, MMMM dd, yyyy"
              )} — {activeShows.length > 0 ? activeShows[0].name : 'Evening Show'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}