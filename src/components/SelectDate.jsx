"use client";
import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { format, addDays, startOfToday, parseISO, isWithinInterval } from 'date-fns';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

const SelectDate = ({ selectedDate, onDateSelect }) => {
  const [dateSettings, setDateSettings] = useState({
    startDate: '',
    endDate: '',
    isActive: false
  });
  const [loading, setLoading] = useState(true);

  // Listen to date range settings changes
  useEffect(() => {
    const dateRef = doc(db, 'settings', 'dateRange');
    
    const unsubscribe = onSnapshot(dateRef, (docSnap) => {
      if (docSnap.exists()) {
        setDateSettings(docSnap.data());
      } else {
        // Default settings if none exist
        setDateSettings({
          startDate: '',
          endDate: '',
          isActive: false
        });
      }
      setLoading(false);
    }, (error) => {
      console.error('Error listening to date settings:', error);
      setDateSettings({
        startDate: '',
        endDate: '',
        isActive: false
      });
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Generate event dates based on settings
  const generateEventDates = () => {
    const today = startOfToday();
    const dates = [];
    
    if (dateSettings.isActive && dateSettings.startDate && dateSettings.endDate) {
      // Use custom date range - show all dates in the range
      const startDate = parseISO(dateSettings.startDate);
      const endDate = parseISO(dateSettings.endDate);
      
      let currentDate = startDate;
      while (currentDate <= endDate) {
        dates.push(currentDate);
        currentDate = addDays(currentDate, 1);
      }
      
      // If no dates are in the future, show all dates from the custom range
      const futureDates = dates.filter(date => date >= today);
      return futureDates.length > 0 ? futureDates : dates;
    } else {
      // Use default 5-day range from today
      for (let i = 0; i < 5; i++) {
        dates.push(addDays(today, i));
      }
    }
    
    return dates;
  };

  const eventDates = generateEventDates();
  const today = startOfToday();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (eventDates.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Event Dates Available</h3>
        <p className="text-gray-600">Please check back later or contact support.</p>
      </div>
    );
  }
 
  return (
    <div className="max-w-6xl  mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent mb-2">
          Choose Your Sacred Day
        </h2>
        <p className="text-gray-600">Select the perfect date for your spiritual journey</p>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {eventDates.map((date, index) => {
          const isSelected = selectedDate && 
            format(selectedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
          const isToday = format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
          const isPast = date < today;
          
          return (
            <div
              key={index}
              className={`group relative p-3 rounded-2xl cursor-pointer transition-all duration-300 hover:scale-105 transform ${
                isSelected
                  ? 'bg-gradient-to-br from-orange-100 to-yellow-100 border-2 border-orange-300 shadow-xl scale-105'
                  : isPast
                  ? 'bg-gray-50 border border-gray-200 hover:border-gray-300 hover:shadow-sm opacity-75'
                  : 'bg-white border border-gray-200 hover:border-orange-200 hover:shadow-lg'
              }`}
              onClick={() => onDateSelect(date)}
            >
              {isToday && (
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-400 to-yellow-400 text-white text-xs px-2 py-1 rounded-full font-semibold animate-pulse">
                  Today
                </div>
              )}
              {isPast && !isToday && (
                <div className="absolute -top-2 -right-2 bg-gray-400 text-white text-xs px-2 py-1 rounded-full font-medium">
                  Past
                </div>
              )}
              
              <div className="flex items-center justify-center mb-3">
                <Calendar className={`w-6 h-6 mr-2 transition-colors ${isSelected ? 'text-orange-600' : 'text-gray-400'}`} />
                <span className={`text-sm font-medium ${isSelected ? 'text-orange-600' : 'text-gray-500'}`}>
                  Day {index + 1}
                </span>
              </div>
              
              <div className="text-center">
                <div className={`text-lg font-bold mb-1 ${isSelected ? 'text-orange-700' : 'text-gray-700'}`}>
                  {format(date, 'EEEE')}
                </div>
                
                <div className={`text-sm font-medium mb-1 ${isSelected ? 'text-orange-600' : 'text-gray-500'}`}>
                  {format(date, 'MMMM dd')}
                </div>
                
                
              </div>
              
              {isSelected && (
                <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl opacity-50 pointer-events-none animate-pulse"></div>
              )}
              
              {/* Hover effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none"></div>
            </div>
          );
        })}
      </div>
      
      {selectedDate && (
        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl max-w-md mx-auto animate-fade-in">
          <div className="text-center">
            <div className="text-green-600 mb-1">✓ Selected Date</div>
            <p className="text-sm font-semibold text-green-700">
              {format(selectedDate, 'EEEE, MMMM dd, yyyy')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectDate;