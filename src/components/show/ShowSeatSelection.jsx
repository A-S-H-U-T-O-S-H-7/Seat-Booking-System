"use client";
import { useShowSeatBooking } from '@/context/ShowSeatBookingContext';
import ShowAuditorium from './ShowAuditorium';
import { toast } from 'react-hot-toast';
import { Users, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export default function ShowSeatSelection() {
  const { 
    selectedDate, 
    selectedSeats,
    totalPrice, 
    totalCapacity, 
    SEAT_TYPES 
  } = useShowSeatBooking();
  
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
        console.error('Error listening to show settings:', error);
        setLoading(false);
      }
    );
    
    return () => unsubscribe();
  }, []);
  
  // Format time to AM/PM format
  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };
  
  // Get active shows
  const activeShows = showSettings?.shows?.filter(show => 
    show.active === true || show.isActive === true
  ) || [];
  
  // Get the first active show for display
  const currentShow = activeShows.length > 0 ? activeShows[0] : null;

  return (
    <div className="space-y-6 p-0 md:p-2">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full mb-4 shadow-lg">
          <Users className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Places</h2>
        <p className="text-gray-600">Select your preferred places</p>
      </div>

      {/* Show Information */}
      <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl p-4 border border-gray-300 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-purple-600" />
            <div>
              <h3 className="text-gray-900 font-semibold">Show Details</h3>
              <p className="text-gray-600 text-sm">
                {selectedDate ? (
                  typeof selectedDate === 'string' 
                    ? format(new Date(selectedDate), 'EEEE, MMMM d, yyyy')
                    : format(selectedDate, 'EEEE, MMMM d, yyyy')
                ) : 'N/A'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-purple-600" />
            <div className="text-right">
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-300 rounded w-16 mb-1"></div>
                  <div className="h-3 bg-gray-300 rounded w-20"></div>
                </div>
              ) : currentShow ? (
                <>
                  <p className="text-gray-900 font-semibold">{currentShow.name}</p>
                  <p className="text-gray-600 text-sm">
                    {formatTime(currentShow.timeFrom || currentShow.startTime)} - {formatTime(currentShow.timeTo || currentShow.endTime)}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-gray-900 font-semibold">Evening Show</p>
                  <p className="text-gray-600 text-sm">5:00 PM - 10:00 PM</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Auditorium Layout */}
      <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl p-2 border border-gray-300 backdrop-blur-sm">
        <ShowAuditorium />
      </div>

      
    </div>
  );
}
