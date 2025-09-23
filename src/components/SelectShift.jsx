"use client";
import { useState, useEffect } from 'react';
import { format } from "date-fns";
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export default function SelectShift({ selectedDate, selectedShift, onShiftSelect }) {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Listen to shift settings changes
  useEffect(() => {
    const shiftRef = doc(db, 'settings', 'shifts');
    
    const unsubscribe = onSnapshot(shiftRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Only show active shifts
        const activeShifts = data.shifts?.filter(shift => shift.isActive) || [];
        setShifts(activeShifts);
      } else {
        // Default shifts if none exist
        const defaultShifts = [
          { 
            id: "morning", 
            label: "Morning Session", 
            time: "9:00 AM - 12:00 PM",
            timeFrom: "09:00",
            timeTo: "12:00",
            description: "Start your day with divine blessings",
            icon: "🌅",
            isActive: true
          },
          { 
            id: "afternoon", 
            label: "Afternoon Session", 
            time: "2:00 PM - 5:00 PM",
            timeFrom: "14:00",
            timeTo: "17:00",
            description: "Peaceful afternoon spiritual session",
            icon: "☀️",
            isActive: true
          },
          { 
            id: "evening", 
            label: "Evening Session", 
            time: "4:00 PM - 10:00 PM",
            timeFrom: "16:00",
            timeTo: "22:00",
            description: "Evening spiritual experience",
            icon: "🌆",
            isActive: true
          }
        ];
        setShifts(defaultShifts);
      }
      setLoading(false);
    }, (error) => {
      console.error('Error listening to shift settings:', error);
      // Set default shifts on error
      const defaultShifts = [
        { 
          id: "morning", 
          label: "Morning Session", 
          time: "9:00 AM - 12:00 PM",
          timeFrom: "09:00",
          timeTo: "12:00",
          description: "Start your day with divine blessings",
          icon: "🌅",
          isActive: true
        },
        { 
          id: "afternoon", 
          label: "Afternoon Session", 
          time: "2:00 PM - 5:00 PM",
          timeFrom: "14:00",
          timeTo: "17:00",
          description: "Peaceful afternoon spiritual session",
          icon: "☀️",
          isActive: true
        },
        { 
          id: "evening", 
          label: "Evening Session", 
          time: "4:00 PM - 10:00 PM",
          timeFrom: "16:00",
          timeTo: "22:00",
          description: "Evening spiritual experience",
          icon: "🌆",
          isActive: true
        }
      ];
      setShifts(defaultShifts);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleShiftClick = (shiftId) => {
    onShiftSelect(shiftId);
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (shifts.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">🕐</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Shifts Available</h3>
        <p className="text-gray-600">Please check back later or contact support.</p>
      </div>
    );
  }

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