"use client";
import { useShowSeatBooking } from '@/context/ShowSeatBookingContext';
import { useTheme } from '@/context/ThemeContext';
import { format } from 'date-fns';
import { ArrowLeftIcon, ArrowRightIcon, CheckCircleIcon, TicketIcon, UserIcon, MapPinIcon, PhoneIcon, CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export default function ShowBookingSummary({ onNext, onBack }) {
  const { 
    selectedSeats, 
    seats, 
    selectedDate, 
    selectedShift, 
    totalPrice, 
    totalCapacity, 
    bookingData,
    SEAT_TYPES 
  } = useShowSeatBooking();
  const { isDarkMode } = useTheme();
  
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
  
  // Get active shows and create shifts array dynamically
  const activeShows = showSettings?.shows?.filter(show => 
    show.active === true || show.isActive === true
  ) || [];
  
  // Create dynamic shifts from admin settings
  const shifts = activeShows.map(show => ({
    id: (show.name || show.label || 'show').toLowerCase().replace(/\s+/g, '_'),
    name: show.name,
    time: `${formatTime(show.timeFrom || show.startTime)} - ${formatTime(show.timeTo || show.endTime)}`
  }));
  
  // Fallback to hardcoded shifts if no active shows
  const fallbackShifts = [
    { id: 'morning', name: 'Morning Show', time: '10:00 AM - 1:00 PM' },
    { id: 'afternoon', name: 'Afternoon Show', time: '2:00 PM - 5:00 PM' },
    { id: 'evening', name: 'Evening Show', time: '6:00 PM - 9:00 PM' }
  ];
  
  const availableShifts = shifts.length > 0 ? shifts : fallbackShifts;
  const selectedShiftInfo = availableShifts.find(s => s.id === selectedShift) || availableShifts.find(s => s.name.toLowerCase().includes(selectedShift)) || availableShifts[0];
  const userDetails = bookingData?.userDetails || {};

  // Group selected seats by type
  const seatsByType = selectedSeats.reduce((acc, seatId) => {
    const seat = seats[seatId];
    if (!acc[seat.type]) {
      acc[seat.type] = [];
    }
    acc[seat.type].push(seat);
    return acc;
  }, {});

  // Calculate pricing breakdown
  const pricingBreakdown = {
    vipSeats: seatsByType.VIP?.length || 0,
    vipPrice: (seatsByType.VIP?.length || 0) * SEAT_TYPES.VIP.price,
    regularSeats: seatsByType.REGULAR?.length || 0,
    regularPrice: (seatsByType.REGULAR?.length || 0) * SEAT_TYPES.REGULAR.price,
    subtotal: totalPrice,
    tax: 0, // Will be calculated from settings if needed
    total: totalPrice
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`p-6 rounded-lg border ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="flex items-center gap-3 mb-4">
          <CheckCircleIcon className={`w-6 h-6 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
          <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Review Your Booking
          </h2>
        </div>
        
        <div className={`p-4 rounded-lg ${
          isDarkMode ? 'bg-green-900/20 border border-green-700' : 'bg-green-50 border border-green-200'
        }`}>
          <p className={`text-sm ${
            isDarkMode ? 'text-green-300' : 'text-green-800'
          }`}>
            Please review all details carefully before proceeding to payment. 
            Changes cannot be made after payment is completed.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Show Details */}
        <div className={`p-6 rounded-lg border ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 flex items-center ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            <TicketIcon className="w-5 h-5 mr-2" />
            Show Details
          </h3>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <CalendarIcon className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {format(new Date(selectedDate), 'EEEE, MMMM d, yyyy')}
                </p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Show Date
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ClockIcon className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {selectedShiftInfo?.name}
                </p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {selectedShiftInfo?.time}
                </p>
              </div>
            </div>
          </div>

          {/* Selected Seats */}
          <div className="mt-6">
            <h4 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Selected Seats ({selectedSeats.length} seats, {totalCapacity} people)
            </h4>
            
            {Object.entries(seatsByType).map(([type, seatList]) => (
              <div key={type} className="mb-4">
                <p className={`text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {type === 'VIP' ? 'VIP Sofas' : 'Regular Seats'} ({seatList.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {seatList.map(seat => (
                    <span
                      key={seat.id}
                      className={`px-2 py-1 text-xs rounded ${
                        type === 'VIP'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {seat.displayName}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Information */}
        <div className={`p-6 rounded-lg border ${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 flex items-center ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            <UserIcon className="w-5 h-5 mr-2" />
            Contact Information
          </h3>

          <div className="space-y-3">
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {userDetails.fullName}
              </p>
              <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Full Name
              </p>
            </div>

            <div className="flex items-center gap-3">
              <PhoneIcon className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {userDetails.phone}
                </p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Primary Phone
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPinIcon className={`w-4 h-4 mt-0.5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {userDetails.address}
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {userDetails.city}, {userDetails.state} - {userDetails.pincode}
                </p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Address
                </p>
              </div>
            </div>

            {userDetails.emergencyContact?.name && (
              <div className={`pt-3 border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Emergency Contact
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {userDetails.emergencyContact.name} - {userDetails.emergencyContact.phone}
                </p>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {userDetails.emergencyContact.relation}
                </p>
              </div>
            )}

            {userDetails.specialRequests && (
              <div className={`pt-3 border-t ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Special Requests
                </p>
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  {userDetails.specialRequests}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pricing Summary */}
      <div className={`p-6 rounded-lg border ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Pricing Summary
        </h3>

        <div className="space-y-3">
          {pricingBreakdown.vipSeats > 0 && (
            <div className="flex justify-between items-center">
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                VIP Sofas ({pricingBreakdown.vipSeats} × ₹{SEAT_TYPES.VIP.price.toLocaleString('en-IN')})
              </span>
              <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                ₹{pricingBreakdown.vipPrice.toLocaleString('en-IN')}
              </span>
            </div>
          )}

          {pricingBreakdown.regularSeats > 0 && (
            <div className="flex justify-between items-center">
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Regular Seats ({pricingBreakdown.regularSeats} × ₹{SEAT_TYPES.REGULAR.price.toLocaleString('en-IN')})
              </span>
              <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                ₹{pricingBreakdown.regularPrice.toLocaleString('en-IN')}
              </span>
            </div>
          )}

          <div className={`border-t pt-3 ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
            <div className="flex justify-between items-center">
              <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                Subtotal
              </span>
              <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                ₹{pricingBreakdown.subtotal.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className={`border-t pt-3 ${isDarkMode ? 'border-gray-600' : 'border-gray-200'}`}>
            <div className="flex justify-between items-center">
              <span className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Total Amount
              </span>
              <span className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                ₹{pricingBreakdown.total.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className={`p-6 rounded-lg border ${
        isDarkMode ? 'bg-yellow-900/20 border-yellow-700' : 'bg-yellow-50 border-yellow-200'
      }`}>
        <h4 className={`text-sm font-semibold mb-2 ${
          isDarkMode ? 'text-yellow-300' : 'text-yellow-800'
        }`}>
          📋 Important Terms & Conditions
        </h4>
        <ul className={`text-sm space-y-1 ${
          isDarkMode ? 'text-yellow-200' : 'text-yellow-700'
        }`}>
          <li>• Booking confirmation will be sent to your registered email address</li>
          <li>• Please arrive 30 minutes before the show starts</li>
          <li>• Entry is subject to availability and event guidelines</li>
        </ul>
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
          Back to Details
        </button>

        <button
          onClick={onNext}
          className="flex items-center gap-2 px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:scale-105"
        >
          Proceed to Payment
          <ArrowRightIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
