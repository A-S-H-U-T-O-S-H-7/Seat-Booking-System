"use client";
import { format } from "date-fns";

export default function SelectShift({ selectedDate, selectedShift, onShiftSelect }) {
  const shifts = [
    { 
      id: "morning", 
      label: "Morning Session", 
      time: "9:00 AM - 12:00 PM",
      description: "Start your day with divine blessings",
      icon: "🌅"
    },
    { 
      id: "evening", 
      label: "Evening Session", 
      time: "4:00 PM - 10:00 PM",
      description: "Evening spiritual experience",
      icon: "🌆"
    }
  ];

  const handleShiftClick = (shiftId) => {
    onShiftSelect(shiftId);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <p className="text-gray-600 text-lg">Choose the perfect time for your spiritual experience</p>
      </div>

      {selectedDate && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg max-w-md mx-auto">
          <p className="text-sm text-blue-700 text-center">
            <strong>Selected Date:</strong> {format(selectedDate, 'EEEE, MMMM dd, yyyy')}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
        {shifts.map((shift) => (
          <div
            key={shift.id}
            className={`relative p-6 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md border ${
              selectedShift === shift.id
                ? "bg-blue-50 border-blue-400 shadow-md"
                : "bg-white border-gray-200 hover:border-blue-300"
            }`}
            onClick={() => handleShiftClick(shift.id)}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="text-3xl">{shift.icon}</div>
              {selectedShift === shift.id && (
                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              )}
            </div>
            
            <h3 className={`text-lg font-semibold mb-2 ${
              selectedShift === shift.id ? 'text-blue-700' : 'text-gray-700'
            }`}>
              {shift.label}
            </h3>
            
            <p className={`text-base font-medium mb-2 ${
              selectedShift === shift.id ? 'text-blue-600' : 'text-gray-600'
            }`}>
              {shift.time}
            </p>
            
            <p className={`text-sm ${
              selectedShift === shift.id ? 'text-blue-500' : 'text-gray-500'
            }`}>
              {shift.description}
            </p>
          </div>
        ))}
      </div>
             
      {selectedShift && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg max-w-md mx-auto">
          <p className="text-sm text-green-700 text-center">
            <strong>Selected:</strong> {shifts.find(s => s.id === selectedShift)?.label}
          </p>
          <p className="text-xs text-green-600 mt-1 text-center">
            Proceeding to seat selection...
          </p>
        </div>
      )}
    </div>
  );
}