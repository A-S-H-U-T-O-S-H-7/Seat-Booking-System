"use client";
import { Calendar } from 'lucide-react';
import { format, addDays, startOfToday } from 'date-fns';

const SelectDate = ({ selectedDate, onDateSelect }) => {
  // Generate next 5 days for the event
  const generateEventDates = () => {
    const today = startOfToday();
    const dates = [];
    
    for (let i = 0; i < 5; i++) {
      dates.push(addDays(today, i));
    } 
    
    return dates;
  };

  const eventDates = generateEventDates();
  const today = startOfToday();

  return (
    <div className="max-w-6xl mx-auto">
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
          
          return (
            <div
              key={index}
              className={`group relative p-3 rounded-2xl cursor-pointer transition-all duration-300 hover:scale-105 transform ${
                isSelected
                  ? 'bg-gradient-to-br from-orange-100 to-yellow-100 border-2 border-orange-300 shadow-xl scale-105'
                  : 'bg-white border border-gray-200 hover:border-orange-200 hover:shadow-lg'
              }`}
              onClick={() => onDateSelect(date)}
            >
              {isToday && (
                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-400 to-yellow-400 text-white text-xs px-2 py-1 rounded-full font-semibold animate-pulse">
                  Today
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