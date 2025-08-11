"use client";
import { useShowSeatBooking } from '@/context/ShowSeatBookingContext';
import { useTheme } from '@/context/ThemeContext';
import { useState } from 'react';

export default function ShowAuditorium() {
  const { seats, selectedSeats, selectSeat, SEAT_TYPES } = useShowSeatBooking();
  const { isDarkMode } = useTheme();
  const [zoomLevel, setZoomLevel] = useState(1);

  const getSeatColor = (seat) => {
    if (seat.isBooked) return 'bg-red-500';
    if (seat.isBlocked) return 'bg-gray-500';
    if (seat.isSelected) return SEAT_TYPES[seat.type].selectedColor;
    return SEAT_TYPES[seat.type].color;
  };

  const renderVIPSection = () => {
    const vipSeats = Object.values(seats).filter(seat => seat.type === 'VIP');
    const rows = Array.from({ length: 8 }, (_, i) => i + 1);

    return (
      <div className="mb-8">
        <div className="text-center mb-4">
          <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            VIP Section (₹1,000 per sofa - 2 people)
          </h3>
        </div>
        
        <div className="space-y-2">
          {rows.map(row => {
            const rowSeats = vipSeats.filter(seat => seat.row === row);
            const leftSeats = rowSeats.filter(seat => seat.side === 'LEFT').sort((a, b) => a.seat - b.seat);
            const rightSeats = rowSeats.filter(seat => seat.side === 'RIGHT').sort((a, b) => a.seat - b.seat);

            return (
              <div key={row} className="flex items-center justify-center gap-8">
                {/* Left side VIP seats */}
                <div className="flex gap-1">
                  {leftSeats.map(seat => (
                    <button
                      key={seat.id}
                      onClick={() => selectSeat(seat.id)}
                      disabled={seat.isBooked || seat.isBlocked}
                      className={`
                        w-8 h-6 rounded text-xs font-medium transition-all duration-200 
                        ${getSeatColor(seat)} 
                        ${seat.isBooked || seat.isBlocked ? 'cursor-not-allowed opacity-50' : 'hover:scale-110 cursor-pointer'} 
                        text-white shadow-sm
                      `}
                      title={`${seat.displayName} - ₹${seat.price} (${seat.capacity} people)`}
                    >
                      {seat.seat}
                    </button>
                  ))}
                </div>

                {/* Row number */}
                <div className={`w-8 text-center text-sm font-medium ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  R{row}
                </div>

                {/* Right side VIP seats */}
                <div className="flex gap-1">
                  {rightSeats.map(seat => (
                    <button
                      key={seat.id}
                      onClick={() => selectSeat(seat.id)}
                      disabled={seat.isBooked || seat.isBlocked}
                      className={`
                        w-8 h-6 rounded text-xs font-medium transition-all duration-200 
                        ${getSeatColor(seat)} 
                        ${seat.isBooked || seat.isBlocked ? 'cursor-not-allowed opacity-50' : 'hover:scale-110 cursor-pointer'} 
                        text-white shadow-sm
                      `}
                      title={`${seat.displayName} - ₹${seat.price} (${seat.capacity} people)`}
                    >
                      {seat.seat}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderRegularSection = () => {
    const regularSeats = Object.values(seats).filter(seat => seat.type === 'REGULAR');
    const rows = Array.from({ length: 35 }, (_, i) => i + 1);

    return (
      <div>
        <div className="text-center mb-4">
          <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Regular Section (₹300 per seat - 1 person)
          </h3>
        </div>
        
        <div className="space-y-1">
          {rows.map(row => {
            const rowSeats = regularSeats.filter(seat => seat.row === row);
            const leftSeats = rowSeats.filter(seat => seat.side === 'LEFT').sort((a, b) => a.seat - b.seat);
            const rightSeats = rowSeats.filter(seat => seat.side === 'RIGHT').sort((a, b) => a.seat - b.seat);

            return (
              <div key={row} className="flex items-center justify-center gap-6">
                {/* Left side regular seats */}
                <div className="flex gap-0.5">
                  {leftSeats.map(seat => (
                    <button
                      key={seat.id}
                      onClick={() => selectSeat(seat.id)}
                      disabled={seat.isBooked || seat.isBlocked}
                      className={`
                        w-6 h-5 rounded text-xs font-medium transition-all duration-200 
                        ${getSeatColor(seat)} 
                        ${seat.isBooked || seat.isBlocked ? 'cursor-not-allowed opacity-50' : 'hover:scale-110 cursor-pointer'} 
                        text-white shadow-sm
                      `}
                      title={`${seat.displayName} - ₹${seat.price}`}
                    >
                      {seat.seat}
                    </button>
                  ))}
                </div>

                {/* Row number */}
                <div className={`w-6 text-center text-xs font-medium ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {row}
                </div>

                {/* Right side regular seats */}
                <div className="flex gap-0.5">
                  {rightSeats.map(seat => (
                    <button
                      key={seat.id}
                      onClick={() => selectSeat(seat.id)}
                      disabled={seat.isBooked || seat.isBlocked}
                      className={`
                        w-6 h-5 rounded text-xs font-medium transition-all duration-200 
                        ${getSeatColor(seat)} 
                        ${seat.isBooked || seat.isBlocked ? 'cursor-not-allowed opacity-50' : 'hover:scale-110 cursor-pointer'} 
                        text-white shadow-sm
                      `}
                      title={`${seat.displayName} - ₹${seat.price}`}
                    >
                      {seat.seat}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={`p-6 rounded-lg border ${
      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      {/* Header with zoom controls */}
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Show Auditorium Layout
        </h2>
        <div className="flex items-center gap-2">
          <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Zoom:</span>
          <button
            onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.1))}
            className={`px-2 py-1 text-xs rounded ${
              isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            -
          </button>
          <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.1))}
            className={`px-2 py-1 text-xs rounded ${
              isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            +
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 mb-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded"></div>
          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>VIP Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded"></div>
          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Regular Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded"></div>
          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Selected VIP</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded"></div>
          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Selected Regular</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-500 rounded"></div>
          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>Blocked</span>
        </div>
      </div>

      {/* Auditorium Layout */}
      <div 
        className="overflow-auto max-h-screen"
        style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
      >
        <div className="min-w-max">
          
          {/* Stage */}
          <div className="text-center mb-8">
            <div className={`inline-block px-16 py-4 rounded-lg border-2 border-dashed ${
              isDarkMode ? 'border-yellow-400 bg-yellow-900/20' : 'border-yellow-500 bg-yellow-50'
            }`}>
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl">🎭</span>
                <span className={`text-lg font-bold ${
                  isDarkMode ? 'text-yellow-300' : 'text-yellow-700'
                }`}>
                  STAGE
                </span>
                <span className="text-2xl">🎪</span>
              </div>
              <div className={`text-sm mt-1 ${
                isDarkMode ? 'text-yellow-400' : 'text-yellow-600'
              }`}>
                Cultural Shows & Performances
              </div>
            </div>
          </div>

          {/* VIP Section */}
          {renderVIPSection()}

          {/* Barrier between VIP and Regular */}
          <div className="flex justify-center my-6">
            <div className={`w-3/4 h-px ${
              isDarkMode ? 'bg-gray-600' : 'bg-gray-300'
            }`}></div>
          </div>
          <div className="text-center mb-6">
            <span className={`text-sm px-4 py-1 rounded-full ${
              isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
            }`}>
              Barrier
            </span>
          </div>

          {/* Regular Section */}
          {renderRegularSection()}

        </div>
      </div>

      {/* Selection Summary */}
      {selectedSeats.length > 0 && (
        <div className={`mt-6 p-4 rounded-lg border ${
          isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
        }`}>
          <h4 className={`font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Selected Seats ({selectedSeats.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {selectedSeats.map(seatId => {
              const seat = seats[seatId];
              return (
                <span
                  key={seatId}
                  className={`px-2 py-1 text-xs rounded ${
                    seat.type === 'VIP' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {seat.displayName} (₹{seat.price})
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
