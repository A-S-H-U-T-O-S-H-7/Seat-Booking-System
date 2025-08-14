"use client";
import { useShowSeatBooking } from '@/context/ShowSeatBookingContext';
import ShowAuditorium from './ShowAuditorium';
import { toast } from 'react-hot-toast';
import { Users, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function ShowSeatSelection() {
  const { 
    selectedDate, 
    selectedSeats,
    totalPrice, 
    totalCapacity, 
    SEAT_TYPES 
  } = useShowSeatBooking();

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full mb-4 shadow-lg">
          <Users className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Seats</h2>
        <p className="text-gray-600">Select your preferred seats from the auditorium</p>
      </div>

      {/* Show Information */}
      <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl p-6 border border-gray-300 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-purple-600" />
            <div>
              <h3 className="text-gray-900 font-semibold">Show Details</h3>
              <p className="text-gray-600 text-sm">
                {selectedDate ? (selectedDate instanceof Date ? format(selectedDate, 'EEEE, MMMM d, yyyy') : selectedDate) : 'N/A'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-purple-600" />
            <div className="text-right">
              <p className="text-gray-900 font-semibold">Evening Show</p>
              <p className="text-gray-600 text-sm">5:00 PM - 10:00 PM</p>
            </div>
          </div>
        </div>
      </div>

      {/* Auditorium Layout */}
      <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl p-6 border border-gray-300 backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Auditorium Layout</h3>
        <ShowAuditorium />
      </div>

      
    </div>
  );
}
