"use client";
import { useShowSeatBooking } from '@/context/ShowSeatBookingContext';
import { useTheme } from '@/context/ThemeContext';
import ShowAuditorium from './ShowAuditorium';
import { toast } from 'react-hot-toast';
import { ArrowLeftIcon, ArrowRightIcon, TicketIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

export default function ShowSeatSelection({ onNext, onBack }) {
  const { 
    selectedSeats, 
    selectedDate, 
    selectedShift, 
    totalPrice, 
    totalCapacity, 
    SEAT_TYPES 
  } = useShowSeatBooking();
  const { isDarkMode } = useTheme();

  const handleContinue = () => {
    if (selectedSeats.length === 0) {
      toast.error('Please select at least one seat');
      return;
    }
    onNext();
  };

  const shifts = [
    { id: 'morning', name: 'Morning Show', time: '10:00 AM - 1:00 PM' },
    { id: 'afternoon', name: 'Afternoon Show', time: '2:00 PM - 5:00 PM' },
    { id: 'evening', name: 'Evening Show', time: '6:00 PM - 9:00 PM' }
  ];

  const selectedShiftInfo = shifts.find(s => s.id === selectedShift);

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className={`p-4 rounded-lg border ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TicketIcon className={`w-6 h-6 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
            <div>
              <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Select Your Seats
              </h2>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {selectedDate && format(new Date(selectedDate), 'EEEE, MMMM d, yyyy')} • {selectedShiftInfo?.name}
              </p>
            </div>
          </div>
          
          {/* Seat Type Info */}
          <div className="text-right">
            <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              VIP Sofa: ₹{SEAT_TYPES.VIP.price} (2 people)
            </div>
            <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Regular Seat: ₹{SEAT_TYPES.REGULAR.price} (1 person)
            </div>
          </div>
        </div>
      </div>

      {/* Auditorium Layout */}
      <ShowAuditorium />

      {/* Selection Summary */}
      <div className={`p-6 rounded-lg border ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Booking Summary
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Selected Seats Count */}
          <div className={`p-4 rounded-lg ${
            isDarkMode ? 'bg-gray-700' : 'bg-purple-50'
          }`}>
            <div className={`text-2xl font-bold ${
              isDarkMode ? 'text-purple-400' : 'text-purple-600'
            }`}>
              {selectedSeats.length}
            </div>
            <div className={`text-sm ${
              isDarkMode ? 'text-gray-300' : 'text-purple-700'
            }`}>
              Seats Selected
            </div>
          </div>

          {/* Total Capacity */}
          <div className={`p-4 rounded-lg ${
            isDarkMode ? 'bg-gray-700' : 'bg-blue-50'
          }`}>
            <div className={`text-2xl font-bold ${
              isDarkMode ? 'text-blue-400' : 'text-blue-600'
            }`}>
              {totalCapacity}
            </div>
            <div className={`text-sm ${
              isDarkMode ? 'text-gray-300' : 'text-blue-700'
            }`}>
              Total People
            </div>
          </div>

          {/* Total Price */}
          <div className={`p-4 rounded-lg ${
            isDarkMode ? 'bg-gray-700' : 'bg-green-50'
          }`}>
            <div className={`text-2xl font-bold ${
              isDarkMode ? 'text-green-400' : 'text-green-600'
            }`}>
              ₹{totalPrice.toLocaleString('en-IN')}
            </div>
            <div className={`text-sm ${
              isDarkMode ? 'text-gray-300' : 'text-green-700'
            }`}>
              Total Price
            </div>
          </div>
        </div>

        {/* Booking Instructions */}
        <div className={`mt-6 p-4 rounded-lg ${
          isDarkMode ? 'bg-blue-900/20 border border-blue-700' : 'bg-blue-50 border border-blue-200'
        }`}>
          <h4 className={`font-medium mb-2 ${
            isDarkMode ? 'text-blue-300' : 'text-blue-800'
          }`}>
            📋 Booking Instructions
          </h4>
          <ul className={`text-sm space-y-1 ${
            isDarkMode ? 'text-blue-200' : 'text-blue-700'
          }`}>
            <li>• VIP sofas accommodate 2 people each</li>
            <li>• Regular seats accommodate 1 person each</li>
            <li>• You can select maximum 10 seats at once</li>
            <li>• Seats are held for 15 minutes during booking process</li>
            <li>• Cancellation allowed up to 5 days before show date</li>
          </ul>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
            isDarkMode 
              ? 'bg-gray-700 hover:bg-gray-600 text-white' 
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          }`}
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Back to Date Selection
        </button>

        <button
          onClick={handleContinue}
          disabled={selectedSeats.length === 0}
          className={`flex items-center gap-2 px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
            selectedSeats.length > 0
              ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:scale-105'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Continue to Details
          <ArrowRightIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
