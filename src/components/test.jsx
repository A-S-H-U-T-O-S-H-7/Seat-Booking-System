"use client";
import { useShowSeatBooking } from '@/context/ShowSeatBookingContext';
import { useTheme } from '@/context/ThemeContext';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function ShowAuditorium() {
  const { 
    selectedSeats, 
    selectSeat, 
    seatAvailability, 
    totalPrice, 
    totalCapacity 
  } = useShowSeatBooking();
  const { isDarkMode } = useTheme();
  const [zoomLevel, setZoomLevel] = useState(1);

  // Generate seat layout for the auditorium
  const generateSeatLayout = () => {
    const seats = {};
    
    // VIP Section - 8 rows, 10 seats per row (5 left, 5 right)
    for (let row = 1; row <= 8; row++) {
      // A Block (Left side) - 5 seats per row
      for (let seat = 1; seat <= 5; seat++) {
        const seatId = `A-R${row}-${String.fromCharCode(64 + seat)}`;
        seats[seatId] = {
          id: seatId,
          row: row,
          seat: String.fromCharCode(64 + seat),
          side: 'LEFT',
          type: 'VIP',
          section: 'A',
          price: 1000,
          capacity: 1,
          isBooked: false,
          isSelected: false,
          isBlocked: false,
          displayName: `A-R${row}-${String.fromCharCode(64 + seat)}`
        };
      }
      
      // B Block (Right side) - 5 seats per row
      for (let seat = 1; seat <= 5; seat++) {
        const seatId = `B-R${row}-${String.fromCharCode(64 + seat)}`;
        seats[seatId] = {
          id: seatId,
          row: row,
          seat: String.fromCharCode(64 + seat),
          side: 'RIGHT',
          type: 'VIP',
          section: 'B',
          price: 1000,
          capacity: 1,
          isBooked: false,
          isSelected: false,
          isBlocked: false,
          displayName: `B-R${row}-${String.fromCharCode(64 + seat)}`
        };
      }
    }

    // Regular Section - 25 rows, 30 seats per row (15 left, 15 right)
    for (let row = 1; row <= 25; row++) {
      // C Block (Left side) - 15 seats per row, ₹1000
      for (let seat = 1; seat <= 15; seat++) {
        const seatId = `C-R${row}-S${seat}`;
        seats[seatId] = {
          id: seatId,
          row: row,
          seat: seat,
          side: 'LEFT',
          type: 'REGULAR',
          section: 'C',
          price: 1000,
          capacity: 1,
          isBooked: false,
          isSelected: false,
          isBlocked: false,
          displayName: `C-R${row}-S${seat}`
        };
      }
      
      // D Block (Right side) - 15 seats per row, ₹500
      for (let seat = 1; seat <= 15; seat++) {
        const seatId = `D-R${row}-S${seat}`;
        seats[seatId] = {
          id: seatId,
          row: row,
          seat: seat,
          side: 'RIGHT',
          type: 'REGULAR',
          section: 'D',
          price: 500,
          capacity: 1,
          isBooked: false,
          isSelected: false,
          isBlocked: false,
          displayName: `D-R${row}-S${seat}`
        };
      }
    }

    return seats;
  };

  // Get seats and organize them by type
  const allSeats = generateSeatLayout();
  const vipSeats = Object.values(allSeats).filter(seat => seat.type === 'VIP');
  const regularSeats = Object.values(allSeats).filter(seat => seat.type === 'REGULAR');

  // Calculate free seats
  const getFreeSeatsCount = () => {
    const freeSeats = {
      'A': 0, 'B': 0, 'C': 0, 'D': 0
    };
    
    Object.values(allSeats).forEach(seat => {
      if (!seat.isBooked && !seat.isBlocked) {
        freeSeats[seat.section]++;
      }
    });
    
    return freeSeats;
  };

  const freeSeatsCount = getFreeSeatsCount();

  // Seat colors based on status and type
  const getSeatColor = (seat) => {
    if (seat.isBooked) return 'bg-gray-400'; // Gray for booked
    if (seat.isBlocked) return 'bg-gray-600'; // Dark gray for blocked
    if (selectedSeats.includes(seat.id)) return 'bg-blue-600'; // Blue for selected
    
    // Available seat colors based on section
    if (seat.section === 'A' || seat.section === 'B') {
      return 'bg-gradient-to-br from-orange-300 via-yellow-300 to-amber-400'; // Premium golden gradient for VIP
    }
    if (seat.section === 'C') {
      return 'bg-emerald-400'; // Emerald green for Block C
    }
    if (seat.section === 'D') {
      return 'bg-teal-300'; // Teal for Block D
    }
    return 'bg-gray-200';
  };

  // Enhanced seat selection handler
  const handleSeatClick = (seat) => {
    if (seat.isBooked) {
      toast.error('This seat is already booked');
      return;
    }

    if (seat.isBlocked) {
      toast.error('This seat is blocked');
      return;
    }

    if (selectedSeats.includes(seat.id)) {
      // Deselect the seat
      selectSeat(seat.id);
    } else {
      // Check if we can select more seats
      if (selectedSeats.length >= 10) {
        toast.error('Maximum 10 seats can be selected at once');
        return;
      }
      // Select the seat
      selectSeat(seat.id);
    }
  };

  // Render VIP section - keeping existing design
  const renderVIPSection = () => {
    const rows = Array.from({ length: 8 }, (_, i) => i + 1);

    return (
      <div className="mb-10">
        <div className="text-center mb-6">
          <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            VIP Section - Premium Sofa Seating (₹1,000 per seat)
          </h3>
        </div>
        
        <div className="space-y-3">
          {rows.map(row => {
            const aBlockSeats = vipSeats.filter(seat => seat.section === 'A' && seat.row === row);
            const bBlockSeats = vipSeats.filter(seat => seat.section === 'B' && seat.row === row);

            return (
              <div key={row} className="flex items-center justify-center gap-8">
                {/* A Block (Left side) */}
                <div className="flex gap-1">
                  {aBlockSeats.map(seat => {
                    const status = seat.isBooked ? 'booked' : (seat.isBlocked ? 'blocked' : 'available');
                    const isSelected = selectedSeats.includes(seat.id);
                    const isDisabled = status !== 'available' && !isSelected;
                    
                    return (
                      <button
                        key={seat.id}
                        onClick={() => handleSeatClick(seat)}
                        disabled={isDisabled}
                        className={`
                          w-7 h-6 rounded-md text-xs font-bold transition-all duration-200 
                          ${getSeatColor(seat)} 
                          ${isDisabled ? 'cursor-not-allowed opacity-50' : 'hover:scale-105 cursor-pointer hover:shadow-md'} 
                          shadow-sm border border-amber-200
                        `}
                        title={`${seat.displayName} - ₹${seat.price} - ${status}`}
                      >
                        {seat.seat}
                      </button>
                    );
                  })}
                </div>

                {/* Row number */}
                <div className={`w-12 text-center text-lg font-bold px-3 py-1 rounded-lg ${
                  isDarkMode ? 'text-amber-300 bg-gray-700' : 'text-amber-700 bg-amber-100'
                }`}>
                  R{row}
                </div>

                {/* B Block (Right side) */}
                <div className="flex gap-1">
                  {bBlockSeats.map(seat => {
                    const status = seat.isBooked ? 'booked' : (seat.isBlocked ? 'blocked' : 'available');
                    const isSelected = selectedSeats.includes(seat.id);
                    const isDisabled = status !== 'available' && !isSelected;
                    
                    return (
                      <button
                        key={seat.id}
                        onClick={() => handleSeatClick(seat)}
                        disabled={isDisabled}
                        className={`
                          w-7 h-6 rounded-md text-xs font-bold transition-all duration-200 
                          ${getSeatColor(seat)} 
                          ${isDisabled ? 'cursor-not-allowed opacity-50' : 'hover:scale-105 cursor-pointer hover:shadow-md'} 
                          shadow-sm border border-amber-200
                        `}
                        title={`${seat.displayName} - ₹${seat.price} - ${status}`}
                      >
                        {seat.seat}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render Regular section - keeping existing design
  const renderRegularSection = () => {
    const rows = Array.from({ length: 25 }, (_, i) => i + 1);

    return (
      <div>
        <div className="text-center mb-6">
          <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Regular Section
          </h3>
          <div className="text-sm mt-2">
            <span className="text-emerald-600 font-semibold">Block C: ₹1,000</span>
            <span className="mx-4 text-gray-400">•</span>
            <span className="text-teal-600 font-semibold">Block D: ₹500</span>
          </div>
        </div>
        
        {/* Block Headers */}
        <div className="flex items-center justify-center gap-6 mb-4">
          <div className={`px-6 py-2 rounded-lg border-2 font-bold text-md ${
            isDarkMode ? 'bg-emerald-900 border-emerald-600 text-emerald-200' : 'bg-emerald-50 border-emerald-300 text-emerald-800'
          }`}>
            Block C (₹1,000)
          </div>
          <div className="w-10"></div>
          <div className={`px-6 py-2 rounded-lg border-2 font-bold text-md ${
            isDarkMode ? 'bg-teal-900 border-teal-600 text-teal-200' : 'bg-teal-50 border-teal-300 text-teal-800'
          }`}>
            Block D (₹500)
          </div>
        </div>
        
        <div className="space-y-2">
          {rows.map(row => {
            const cBlockSeats = regularSeats.filter(seat => seat.section === 'C' && seat.row === row);
            const dBlockSeats = regularSeats.filter(seat => seat.section === 'D' && seat.row === row);

            return (
              <div key={row} className="flex items-center justify-center gap-8">
                {/* C Block (Left side) */}
                <div className="flex gap-1">
                  {cBlockSeats.map(seat => {
                    const status = seat.isBooked ? 'booked' : (seat.isBlocked ? 'blocked' : 'available');
                    const isSelected = selectedSeats.includes(seat.id);
                    const isDisabled = status !== 'available' && !isSelected;
                    
                    return (
                      <button
                        key={seat.id}
                        onClick={() => handleSeatClick(seat)}
                        disabled={isDisabled}
                        className={`
                          w-6 h-5 rounded-md text-xs font-bold transition-all duration-200 
                          ${getSeatColor(seat)} 
                          ${isDisabled ? 'cursor-not-allowed opacity-50' : 'hover:scale-110 cursor-pointer hover:shadow-md'} 
                          shadow-sm border border-emerald-300
                        `}
                        title={`${seat.displayName} - ₹${seat.price} - ${status}`}
                      >
                        {seat.seat}
                      </button>
                    );
                  })}
                </div>

                {/* Row number */}
                <div className={`w-10 text-center text-sm font-bold px-2 py-1 rounded ${
                  isDarkMode ? 'text-gray-300 bg-gray-700' : 'text-gray-600 bg-gray-100'
                }`}>
                  R{row}
                </div>

                {/* D Block (Right side) */}
                <div className="flex gap-1">
                  {dBlockSeats.map(seat => {
                    const status = seat.isBooked ? 'booked' : (seat.isBlocked ? 'blocked' : 'available');
                    const isSelected = selectedSeats.includes(seat.id);
                    const isDisabled = status !== 'available' && !isSelected;
                    
                    return (
                      <button
                        key={seat.id}
                        onClick={() => handleSeatClick(seat)}
                        disabled={isDisabled}
                        className={`
                          w-6 h-5 rounded-md text-xs font-bold transition-all duration-200 
                          ${getSeatColor(seat)} 
                          ${isDisabled ? 'cursor-not-allowed opacity-50' : 'hover:scale-110 cursor-pointer hover:shadow-md'} 
                          shadow-sm border border-teal-300
                        `}
                        title={`${seat.displayName} - ₹${seat.price} - ${status}`}
                      >
                        {seat.seat}
                      </button>
                    );
                  })}
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
      <div className="flex flex-wrap justify-center gap-6 mb-8 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-gradient-to-br from-orange-300 via-yellow-300 to-amber-400 rounded-md border-2 border-amber-200"></div>
          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>VIP Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-emerald-400 rounded-md border border-emerald-300"></div>
          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Block C Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-teal-300 rounded-md border border-teal-300"></div>
          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Block D Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-blue-600 rounded-md"></div>
          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-gray-400 rounded-md"></div>
          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-gray-600 rounded-md"></div>
          <span className={isDarkMode ? 'text-gray-300' : 'text-gray-700'}>Blocked</span>
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

      {/* Free Seats Summary */}
      <div className={`mt-6 p-4 rounded-xl border-2 ${
        isDarkMode ? 'bg-gradient-to-br from-gray-800 to-gray-700 border-gray-600' : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200'
      }`}>
        <h4 className={`font-bold mb-2 text-lg text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          🎫 Available Seats
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className={`text-center p-2 rounded-lg border-2 ${
            isDarkMode ? 'bg-amber-900/30 border-amber-600' : 'bg-amber-50 border-amber-300'
          }`}>
            <div className={`text-2xl font-bold mb-1 ${isDarkMode ? 'text-amber-300' : 'text-amber-600'}`}>
              {freeSeatsCount['A']}
            </div>
            <div className={`text-xs font-semibold ${isDarkMode ? 'text-amber-200' : 'text-amber-700'}`}>
              Block A
            </div>
            <div className={`text-xs ${isDarkMode ? 'text-amber-300' : 'text-amber-600'}`}>
              VIP Premium
            </div>
          </div>
          <div className={`text-center p-2 rounded-lg border-2 ${
            isDarkMode ? 'bg-amber-900/30 border-amber-600' : 'bg-amber-50 border-amber-300'
          }`}>
            <div className={`text-2xl font-bold mb-1 ${isDarkMode ? 'text-amber-300' : 'text-amber-600'}`}>
              {freeSeatsCount['B']}
            </div>
            <div className={`text-xs font-semibold ${isDarkMode ? 'text-amber-200' : 'text-amber-700'}`}>
              Block B
            </div>
            <div className={`text-xs ${isDarkMode ? 'text-amber-300' : 'text-amber-600'}`}>
              Regular Seats
            </div>
          </div>
          <div className={`text-center p-2 rounded-lg border-2 ${
            isDarkMode ? 'bg-emerald-900/30 border-emerald-600' : 'bg-emerald-50 border-emerald-300'
          }`}>
            <div className={`text-2xl font-bold mb-1 ${isDarkMode ? 'text-emerald-300' : 'text-emerald-600'}`}>
              {freeSeatsCount['C']}
            </div>
            <div className={`text-xs font-semibold ${isDarkMode ? 'text-emerald-200' : 'text-emerald-700'}`}>
              Block C
            </div>
            <div className={`text-xs ${isDarkMode ? 'text-emerald-300' : 'text-emerald-600'}`}>
              ₹1,000
            </div>
          </div>
          <div className={`text-center p-2 rounded-lg border-2 ${
            isDarkMode ? 'bg-teal-900/30 border-teal-600' : 'bg-teal-50 border-teal-300'
          }`}>
            <div className={`text-2xl font-bold mb-1 ${isDarkMode ? 'text-teal-300' : 'text-teal-600'}`}>
              {freeSeatsCount['D']}
            </div>
            <div className={`text-xs font-semibold ${isDarkMode ? 'text-teal-200' : 'text-teal-700'}`}>
              Block D
            </div>
            <div className={`text-xs ${isDarkMode ? 'text-teal-300' : 'text-teal-600'}`}>
              ₹500
            </div>
          </div>
        </div>
        
        {/* Total available seats */}
        <div className="text-center mt-4">
          <div className={`inline-block px-6 py-2 rounded-full border-2 ${
            isDarkMode ? 'bg-blue-900/50 border-blue-500 text-blue-200' : 'bg-blue-100 border-blue-400 text-blue-800'
          }`}>
            <span className="font-bold text-lg">
              Total Available: {freeSeatsCount['A'] + freeSeatsCount['B'] + freeSeatsCount['C'] + freeSeatsCount['D']}
            </span>
          </div>
        </div>
      </div>

      {/* Selection Summary - Similar to Havan floating style */}
      {selectedSeats.length > 0 && (
        <div className={`mt-4 p-4 rounded-xl border-2 shadow-lg sticky bottom-4 z-10 ${
          isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex flex-col gap-3">
            {/* Header and seats */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h4 className={`font-semibold text-sm sm:text-base mb-2 ${
                  isDarkMode ? 'text-white' : 'text-blue-800'
                }`}>
                  Selected Seats ({selectedSeats.length})
                </h4>
                <div className="flex flex-wrap gap-1 sm:gap-2 mb-2 sm:mb-0">
                  {selectedSeats.slice(0, 6).map(seatId => {
                    const seat = allSeats[seatId];
                    const price = seat.price;
                    const isVIP = seat.section === 'A' || seat.section === 'B';
                    const isBlockC = seat.section === 'C';
                    
                    return (
                      <span 
                        key={seatId} 
                        className={`px-2 py-1 text-xs rounded font-medium ${
                          isVIP ? 'bg-yellow-100 text-yellow-800' : 
                          isBlockC ? 'bg-green-100 text-green-800' : 
                          'bg-teal-100 text-teal-800'
                        }`}
                      >
                        {seatId} (₹{price})
                      </span>
                    );
                  })}
                  {selectedSeats.length > 6 && (
                    <span className={`px-2 py-1 text-xs rounded font-medium ${
                      isDarkMode ? 'bg-gray-600 text-gray-200' : 'bg-gray-200 text-gray-700'
                    }`}>
                      +{selectedSeats.length - 6} more
                    </span>
                  )}
                </div>
              </div>
              <div className={`text-right sm:text-left ${
                isDarkMode ? 'text-white' : 'text-blue-700'
              }`}>
                <p className="font-bold text-lg sm:text-xl">₹{totalPrice.toLocaleString('en-IN')}</p>
                <p className="text-xs sm:text-sm opacity-75">
                  {(() => {
                    const breakdown = {
                      vipSeats: 0,
                      blockCSeats: 0,
                      blockDSeats: 0,
                      vipAmount: 0,
                      blockCAmount: 0,
                      blockDAmount: 0
                    };
                    selectedSeats.forEach(seatId => {
                      const seat = allSeats[seatId];
                      if (seat.section === 'A' || seat.section === 'B') {
                        breakdown.vipSeats++;
                        breakdown.vipAmount += seat.price;
                      } else if (seat.section === 'C') {
                        breakdown.blockCSeats++;
                        breakdown.blockCAmount += seat.price;
                      } else if (seat.section === 'D') {
                        breakdown.blockDSeats++;
                        breakdown.blockDAmount += seat.price;
                      }
                    });
                    const parts = [];
                    if (breakdown.vipSeats > 0) parts.push(`${breakdown.vipSeats} VIP`);
                    if (breakdown.blockCSeats > 0) parts.push(`${breakdown.blockCSeats} Block C`);
                    if (breakdown.blockDSeats > 0) parts.push(`${breakdown.blockDSeats} Block D`);
                    return parts.join(' + ');
                  })()}
                </p>
              </div>
            </div>
            
            {/* Pricing breakdown for different seat types */}
            {(() => {
              const breakdown = {
                vipSeats: 0,
                blockCSeats: 0,
                blockDSeats: 0,
                vipAmount: 0,
                blockCAmount: 0,
                blockDAmount: 0
              };
              selectedSeats.forEach(seatId => {
                const seat = allSeats[seatId];
                if (seat.section === 'A' || seat.section === 'B') {
                  breakdown.vipSeats++;
                  breakdown.vipAmount += seat.price;
                } else if (seat.section === 'C') {
                  breakdown.blockCSeats++;
                  breakdown.blockCAmount += seat.price;
                } else if (seat.section === 'D') {
                  breakdown.blockDSeats++;
                  breakdown.blockDAmount += seat.price;
                }
              });
              const hasMultipleTypes = [breakdown.vipSeats, breakdown.blockCSeats, breakdown.blockDSeats].filter(count => count > 0).length > 1;
              
              if (hasMultipleTypes) {
                return (
                  <div className={`p-3 rounded-lg border ${
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
                  }`}>
                    <div className="text-xs font-medium mb-2">Pricing Breakdown:</div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      {breakdown.vipSeats > 0 && (
                        <div className="flex justify-between">
                          <span>VIP ({breakdown.vipSeats} seats):</span>
                          <span className="font-semibold">₹{breakdown.vipAmount.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      {breakdown.blockCSeats > 0 && (
                        <div className="flex justify-between">
                          <span>Block C ({breakdown.blockCSeats} seats):</span>
                          <span className="font-semibold">₹{breakdown.blockCAmount.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      {breakdown.blockDSeats > 0 && (
                        <div className="flex justify-between">
                          <span>Block D ({breakdown.blockDSeats} seats):</span>
                          <span className="font-semibold">₹{breakdown.blockDAmount.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }
              return null;
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
"use client";
import { useState } from "react";
import { Calendar, Users, CreditCard, Check } from "lucide-react";
import { useShowSeatBooking } from "@/context/ShowSeatBookingContext";
import ShowDateSelection from "./ShowDateSelection";
import ShowSeatSelection from "./ShowSeatSelection";
import ShowUserDetails from "./ShowUserDetails";
import ShowPaymentProcess from "./ShowPaymentProcess";

const ShowBookingFlow = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const {
    selectedDate,
    selectedSeats,
    bookingData,
  } = useShowSeatBooking();

  const userDetails = bookingData.userDetails || {};

  const steps = [
    {
      id: 1,
      title: "Select Date",
      subtitle: "Choose your day",
      icon: Calendar,
    },
    {
      id: 2,
      title: "Choose Seats",
      subtitle: "Reserve spots",
      icon: Users,
    },
    {
      id: 3,
      title: "Your Details",
      subtitle: "Personal info",
      icon: Users,
    },
    {
      id: 4,
      title: "Payment",
      subtitle: "Complete booking",
      icon: CreditCard,
    },
  ];

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        // Check if a date is selected (either Date object or string)
        return selectedDate !== null && selectedDate !== "" && selectedDate !== undefined;
      case 2:
        return selectedSeats.length > 0;
      case 3:
        return (
          userDetails.name &&
          userDetails.email &&
          userDetails.phone &&
          userDetails.aadhar
        );
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceedToNext() && currentStep < steps.length) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const getContainerMaxWidth = () => {
    return currentStep === 2 ? "max-w-8xl" : "max-w-6xl";
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <ShowDateSelection />;
      case 2:
        return <ShowSeatSelection />;
      case 3:
        return <ShowUserDetails />;
      case 4:
        return <ShowPaymentProcess />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-2 py-8">
        <div className={`${getContainerMaxWidth()} mx-auto`}>
          {/* Progress Steps */}
          <div className="mb-8">
            {/* Mobile */}
            <div className="block md:hidden">
              <div className="bg-white/10 rounded-xl p-4 shadow-sm border border-pink-200/20">
                <div className="text-center mb-3">
                  <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full mb-2 shadow-md">
                    {(() => {
                      const IconComponent = steps[currentStep - 1].icon;
                      return <IconComponent className="w-5 h-5 text-white" />;
                    })()}
                  </div>
                  <h3 className="text-base font-semibold text-white">
                    {steps[currentStep - 1].title}
                  </h3>
                  <p className="text-xs text-pink-200">
                    {steps[currentStep - 1].subtitle}
                  </p>
                </div>
                <div className="flex items-center justify-center space-x-1.5 mb-2">
                  {steps.map((_, index) => (
                    <div
                      key={index}
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                        index + 1 <= currentStep
                          ? "bg-pink-400"
                          : "bg-gray-500"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-center text-xs text-gray-400">
                  Step {currentStep} of {steps.length}
                </p>
              </div>
            </div>

            {/* Desktop */}
            <div className="hidden md:block">
              <div className="bg-white/10 rounded-2xl p-6 shadow-sm border border-pink-200/20">
                <div className="flex items-center justify-between relative px-6">
                  {/* Progress Line */}
                  <div className="absolute top-6 left-12 right-12 h-0.5 bg-gray-600">
                    <div
                      className="h-full bg-gradient-to-r from-pink-400 to-pink-600 transition-all duration-500 rounded-full"
                      style={{
                        width: `${
                          ((currentStep - 1) / (steps.length - 1)) * 100
                        }%`,
                      }}
                    />
                  </div>

                  {steps.map((step) => {
                    const isActive = currentStep === step.id;
                    const isCompleted = currentStep > step.id;
                    const IconComponent = step.icon;

                    return (
                      <div
                        key={step.id}
                        className="flex flex-col items-center relative z-10"
                      >
                        <div
                          className={`flex items-center justify-center w-12 h-12 rounded-full font-semibold transition-all duration-300 ${
                            isCompleted
                              ? "bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-lg"
                              : isActive
                              ? "bg-gradient-to-br from-pink-400 to-pink-600 text-white shadow-lg scale-110"
                              : "bg-gray-700 text-gray-400 border-2 border-gray-600"
                          }`}
                        >
                          {isCompleted ? (
                            <Check className="w-6 h-6" />
                          ) : (
                            <IconComponent className="w-6 h-6" />
                          )}
                        </div>
                        <div className="mt-3 text-center">
                          <div
                            className={`text-sm font-semibold ${
                              isActive
                                ? "text-pink-400"
                                : isCompleted
                                ? "text-green-400"
                                : "text-gray-400"
                            }`}
                          >
                            {step.title}
                          </div>
                          <div
                            className={`text-xs ${
                              isActive
                                ? "text-pink-300"
                                : isCompleted
                                ? "text-green-300"
                                : "text-gray-500"
                            }`}
                          >
                            {step.subtitle}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Step Content */}
          <div className="bg-white/10 rounded-3xl shadow-xl border border-pink-200/20 p-3 md:p-4 mb-8">
            {renderStepContent()}
          </div>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className={`flex items-center justify-center px-6 py-3 rounded-xl font-medium transition-all duration-200 w-full sm:w-auto ${
                currentStep === 1
                  ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                  : "bg-white/10 border-2 border-gray-600 text-gray-300 hover:bg-white/20 hover:border-gray-400 shadow-sm hover:shadow-md"
              }`}
            >
              ← Previous
            </button>

            <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-400">
              <span>
                Step {currentStep} of {steps.length}
              </span>
            </div>

            <button
              onClick={handleNext}
              disabled={!canProceedToNext() || currentStep === steps.length}
              className={`flex items-center justify-center px-6 py-3 rounded-xl font-medium transition-all duration-200 w-full sm:w-auto ${
                !canProceedToNext() || currentStep === steps.length
                  ? "bg-gray-700 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-pink-500 to-pink-600 cursor-pointer text-white hover:from-pink-600 hover:to-pink-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              }`}
            >
              {currentStep === steps.length
                ? "Complete Booking"
                : "Next →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowBookingFlow;
"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useShowSeatBooking } from '@/context/ShowSeatBookingContext';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { CreditCard, Calendar, Users, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const ShowPaymentProcess = () => {
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [countdown, setCountdown] = useState(15);
  const router = useRouter();
  
  const { user } = useAuth();
  const {
    selectedDate,
    selectedSeats,
    totalPrice,  
    clearSelection,
    processBooking,
    bookingData
  } = useShowSeatBooking();
  
  const userDetails = bookingData.userDetails || {};

  // Simulate Razorpay payment (replace with actual integration)
  const initiatePayment = async () => {
    setProcessing(true);
    
    try {
      // In real implementation, you would:
      // 1. Create order on your backend
      // 2. Initialize Razorpay with order details
      // 3. Handle payment success/failure
      
      // For demo purposes, simulate payment success after 2 seconds
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful payment
      const paymentId = 'pay_' + Math.random().toString(36).substr(2, 9);
      const orderId = 'order_' + Math.random().toString(36).substr(2, 9);
      
              const result = await processBooking({
          method: 'online',
          transactionId: paymentId,
          userDetails: userDetails
        });
        
        if (result.success) {
          setBookingId(result.bookingId);
        }
      
      setPaymentSuccess(true);
      
    } catch (error) {
      console.error('Payment failed:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };



  // Countdown timer for redirect
  useEffect(() => {
    if (paymentSuccess && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (paymentSuccess && countdown === 0) {
      router.push('/profile');
    }
  }, [paymentSuccess, countdown, router]);

  if (paymentSuccess) {
    return (
      <div className="bg-gray-700 rounded-xl shadow-lg border border-gray-600 p-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mb-4 shadow-lg">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">🎉 Booking Confirmed!</h3>
          <p className="text-gray-300 mb-6">Your show tickets have been successfully booked</p>
          
          <div className="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-600">
            <div className="text-center mb-4">
              <p className="text-gray-300 text-sm">Booking ID</p>
              <p className="text-purple-400 font-bold text-lg">{bookingId}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-300 text-sm">Redirecting to profile in</p>
              <p className="text-white font-bold text-2xl">{countdown}s</p>
            </div>
          </div>
          
          <button
            onClick={() => router.push('/profile')}
            className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white py-3 px-6 rounded-lg font-medium hover:from-purple-600 hover:to-indigo-600 transition-all duration-200"
          >
            View My Bookings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-700 rounded-xl shadow-lg border border-gray-600 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center">
          <CreditCard className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Payment Details</h3>
          <p className="text-gray-300 text-sm">Complete your booking</p>
        </div>
      </div>

      {/* Booking Summary */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-600">
        <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-400" />
          Booking Summary
        </h4>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-300">
              <Calendar className="w-4 h-4" />
              <span>Show Date</span>
            </div>
            <span className="text-white font-medium">
              {selectedDate ? (selectedDate instanceof Date ? format(selectedDate, 'MMM dd, yyyy') : selectedDate) : 'N/A'}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-300">
              <Clock className="w-4 h-4" />
              <span>Show Time</span>
            </div>
            <span className="text-white font-medium">5:00 PM - 10:00 PM</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-300">
              <Users className="w-4 h-4" />
              <span>Selected Seats</span>
            </div>
            <span className="text-white font-medium">
              {selectedSeats.length} seat{selectedSeats.length > 1 ? 's' : ''}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-gray-300">Seat Numbers</div>
            <span className="text-white font-medium">
              {selectedSeats.slice(0, 3).join(', ')}
              {selectedSeats.length > 3 && ` +${selectedSeats.length - 3} more`}
            </span>
          </div>
        </div>
      </div>

      {/* Customer Details Summary */}
      <div className="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-600">
        <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-400" />
          Customer Details
        </h4>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-300">Name:</span>
            <span className="text-white">{userDetails.name || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Email:</span>
            <span className="text-white">{userDetails.email || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Phone:</span>
            <span className="text-white">{userDetails.phone || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Payment Amount */}
      <div className="bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-lg p-4 mb-6 border border-purple-500/30">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-300 font-medium">Total Amount</span>
          <span className="text-white font-bold text-xl">₹{totalPrice.toLocaleString('en-IN')}</span>
        </div>
        <p className="text-gray-400 text-sm">Including all taxes and fees</p>
      </div>

      {/* Payment Button */}
      <button
        onClick={initiatePayment}
        disabled={processing}
        className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all duration-200 ${
          processing
            ? 'bg-gray-600 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
        }`}
      >
        {processing ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Processing Payment...
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <CreditCard className="w-5 h-5" />
            Pay ₹{totalPrice.toLocaleString('en-IN')}
          </div>
        )}
      </button>

      {/* Security Note */}
      <div className="mt-4 p-3 bg-blue-900/20 border border-blue-700/50 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-blue-300 text-sm font-medium">Secure Payment</p>
            <p className="text-gray-300 text-xs">Your payment information is encrypted and secure</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShowPaymentProcess;
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
        <h2 className="text-2xl font-bold text-white mb-2">Choose Your Seats</h2>
        <p className="text-purple-200">Select your preferred seats from the auditorium</p>
      </div>

      {/* Show Information */}
      <div className="bg-gradient-to-r from-gray-700/80 to-gray-600/80 rounded-xl p-6 border border-gray-600 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-purple-400" />
            <div>
              <h3 className="text-white font-semibold">Show Details</h3>
              <p className="text-gray-300 text-sm">
                {selectedDate ? (selectedDate instanceof Date ? format(selectedDate, 'EEEE, MMMM d, yyyy') : selectedDate) : 'N/A'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-purple-400" />
            <div className="text-right">
              <p className="text-white font-semibold">Evening Show</p>
              <p className="text-gray-300 text-sm">5:00 PM - 10:00 PM</p>
            </div>
          </div>
        </div>
      </div>

      {/* Auditorium Layout */}
      <div className="bg-gradient-to-r from-gray-700/80 to-gray-600/80 rounded-xl p-6 border border-gray-600 backdrop-blur-sm">
        <h3 className="text-lg font-semibold text-white mb-4">Auditorium Layout</h3>
        <ShowAuditorium />
      </div>

      
    </div>
  );
}
"use client";
import { createContext, useContext, useReducer, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, doc, getDoc, setDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

const ShowSeatBookingContext = createContext();

// Seat types and pricing for show
const SHOW_SEAT_TYPES = {
  VIP: {
    price: 1000,
    name: 'VIP Sofa',
    capacity: 1, // 1 person per seat in VIP sofa
    color: 'bg-gradient-to-br from-orange-300 via-yellow-300 to-amber-400',
    selectedColor: 'bg-blue-600'
  },
  REGULAR_C: {
    price: 1000,
    name: 'Regular Block C',
    capacity: 1,
    color: 'bg-emerald-400',
    selectedColor: 'bg-blue-600'
  },
  REGULAR_D: {
    price: 500,
    name: 'Regular Block D',
    capacity: 1,
    color: 'bg-teal-300',
    selectedColor: 'bg-blue-600'
  }
};

// Initial state
const initialState = {
  selectedSeats: [],
  selectedDate: '',
  selectedShift: '5-10pm',
  seatAvailability: {},
  totalPrice: 0,
  totalCapacity: 0,
  currentStep: 1,
  bookingData: {
    userDetails: {},
    paymentDetails: {}
  },
  loading: false,
  error: null
};

// Action types
const ACTIONS = {
  SET_SEAT_AVAILABILITY: 'SET_SEAT_AVAILABILITY',
  SELECT_SEAT: 'SELECT_SEAT',
  DESELECT_SEAT: 'DESELECT_SEAT',
  SET_DATE: 'SET_DATE',
  SET_SHIFT: 'SET_SHIFT',
  SET_STEP: 'SET_STEP',
  SET_BOOKING_DATA: 'SET_BOOKING_DATA',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_SELECTION: 'CLEAR_SELECTION',
  RESET_BOOKING: 'RESET_BOOKING',
  UPDATE_PRICING: 'UPDATE_PRICING'
};

// Helper function to get seat price based on seat type
const getSeatPrice = (seatId) => {
  if (seatId.startsWith('A-') || seatId.startsWith('B-')) {
    return SHOW_SEAT_TYPES.VIP.price; // VIP seats ₹1000
  } else if (seatId.startsWith('C-')) {
    return SHOW_SEAT_TYPES.REGULAR_C.price; // Block C ₹1000
  } else if (seatId.startsWith('D-')) {
    return SHOW_SEAT_TYPES.REGULAR_D.price; // Block D ₹500
  }
  return 500; // Default fallback
};

// Reducer function
const showSeatBookingReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_SEAT_AVAILABILITY:
      return {
        ...state,
        seatAvailability: action.payload
      };

    case ACTIONS.SELECT_SEAT:
      const seatId = action.payload;
      const seatAvailability = state.seatAvailability[seatId];
      
      // Check if seat can be selected
      if (seatAvailability?.booked || seatAvailability?.blocked) {
        return state;
      }
      
      if (state.selectedSeats.includes(seatId)) {
        return state; // Already selected
      }
      
      if (state.selectedSeats.length >= 10) {
        return state; // Maximum seats reached
      }
      
      const selectedSeats = [...state.selectedSeats, seatId];
      const totalPrice = selectedSeats.reduce((sum, id) => sum + getSeatPrice(id), 0);
      const totalCapacity = selectedSeats.length; // Each seat = 1 person
      
      return {
        ...state,
        selectedSeats,
        totalPrice,
        totalCapacity
      };

    case ACTIONS.DESELECT_SEAT:
      const seatToRemove = action.payload;
      const filteredSeats = state.selectedSeats.filter(id => id !== seatToRemove);
      const newTotalPrice = filteredSeats.reduce((sum, id) => sum + getSeatPrice(id), 0);
      const newTotalCapacity = filteredSeats.length;
      
      return {
        ...state,
        selectedSeats: filteredSeats,
        totalPrice: newTotalPrice,
        totalCapacity: newTotalCapacity
      };

    case ACTIONS.SET_DATE:
      return {
        ...state,
        selectedDate: action.payload,
        selectedSeats: [], // Clear seats when date changes
        totalPrice: 0,
        totalCapacity: 0
      };

    case ACTIONS.SET_SHIFT:
      return {
        ...state,
        selectedShift: action.payload
      };

    case ACTIONS.SET_STEP:
      return {
        ...state,
        currentStep: action.payload
      };

    case ACTIONS.SET_BOOKING_DATA:
      return {
        ...state,
        bookingData: {
          ...state.bookingData,
          ...action.payload
        }
      };

    case ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };

    case ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload
      };

    case ACTIONS.CLEAR_SELECTION:
      return {
        ...state,
        selectedSeats: [],
        totalPrice: 0,
        totalCapacity: 0
      };

    case ACTIONS.RESET_BOOKING:
      return {
        ...initialState
      };

    case ACTIONS.UPDATE_PRICING:
      // Recalculate pricing when seats are already selected
      const updatedTotalPrice = state.selectedSeats.reduce((sum, id) => sum + getSeatPrice(id), 0);
      return {
        ...state,
        totalPrice: updatedTotalPrice
      };

    default:
      return state;
  }
};

// Provider component
export const ShowSeatBookingProvider = ({ children }) => {
  const [state, dispatch] = useReducer(showSeatBookingReducer, initialState);
  const { user } = useAuth();

  // Listen to real-time seat availability changes
  useEffect(() => {
    if (!state.selectedDate) return;

    const dateKey = state.selectedDate;
    const shift = '5-10pm'; // Fixed show timing
    const availabilityRef = doc(db, 'showSeatAvailability', `${dateKey}_${shift}`);
    
    const unsubscribe = onSnapshot(availabilityRef, (docSnap) => {
      if (docSnap.exists()) {
        const availabilityData = docSnap.data().seats || {};
        dispatch({ type: ACTIONS.SET_SEAT_AVAILABILITY, payload: availabilityData });
        
        // Check if any selected seats are now booked/blocked
        const invalidSeats = state.selectedSeats.filter(seatId => {
          const seatData = availabilityData[seatId];
          return seatData?.booked || seatData?.blocked;
        });
        
        if (invalidSeats.length > 0) {
          invalidSeats.forEach(seatId => {
            dispatch({ type: ACTIONS.DESELECT_SEAT, payload: seatId });
          });
          toast.error(`${invalidSeats.length} selected seat(s) are no longer available`);
        }
      } else {
        dispatch({ type: ACTIONS.SET_SEAT_AVAILABILITY, payload: {} });
      }
    }, (error) => {
      console.error('Error fetching show seat availability:', error);
      toast.error('Failed to load seat availability');
    });

    return () => unsubscribe();
  }, [state.selectedDate]);

  // Actions
  const selectSeat = (seatId) => {
    const seatData = state.seatAvailability[seatId];
    
    if (seatData?.booked) {
      toast.error('This seat is already booked');
      return;
    }

    if (seatData?.blocked) {
      toast.error('This seat is blocked');
      return;
    }

    if (state.selectedSeats.includes(seatId)) {
      dispatch({ type: ACTIONS.DESELECT_SEAT, payload: seatId });
      toast.success(`Seat ${seatId} removed from selection`);
    } else {
      if (state.selectedSeats.length >= 10) {
        toast.error('Maximum 10 seats can be selected at once');
        return;
      }
      dispatch({ type: ACTIONS.SELECT_SEAT, payload: seatId });
      toast.success(`Seat ${seatId} selected`);
    }
  };

  const setSelectedDate = (date) => {
    dispatch({ type: ACTIONS.SET_DATE, payload: date });
    dispatch({ type: ACTIONS.CLEAR_SELECTION });
  };

  const setDateAndShift = (date, shift) => {
    dispatch({ type: ACTIONS.SET_DATE, payload: date });
    dispatch({ type: ACTIONS.SET_SHIFT, payload: shift });
    dispatch({ type: ACTIONS.CLEAR_SELECTION });
  };

  const setCurrentStep = (step) => {
    dispatch({ type: ACTIONS.SET_STEP, payload: step });
  };

  const setBookingData = (data) => {
    dispatch({ type: ACTIONS.SET_BOOKING_DATA, payload: data });
  };

  const clearSelection = () => {
    dispatch({ type: ACTIONS.CLEAR_SELECTION });
  };

  const resetBooking = () => {
    dispatch({ type: ACTIONS.RESET_BOOKING });
  };

  // Get seat status
  const getSeatStatus = (seatId) => {
    const availability = state.seatAvailability[seatId];
    if (!availability) return 'available';
    
    if (availability.blocked) return 'blocked';
    if (availability.booked) return 'booked';
    return 'available';
  };

  // Check if seat is selected
  const isSeatSelected = (seatId) => {
    return state.selectedSeats.includes(seatId);
  };

  // Get pricing breakdown
  const getPricingBreakdown = () => {
    const breakdown = {
      vipSeats: 0,
      blockCSeats: 0,
      blockDSeats: 0,
      vipAmount: 0,
      blockCAmount: 0,
      blockDAmount: 0,
      totalAmount: state.totalPrice
    };

    state.selectedSeats.forEach(seatId => {
      if (seatId.startsWith('A-') || seatId.startsWith('B-')) {
        breakdown.vipSeats++;
        breakdown.vipAmount += SHOW_SEAT_TYPES.VIP.price;
      } else if (seatId.startsWith('C-')) {
        breakdown.blockCSeats++;
        breakdown.blockCAmount += SHOW_SEAT_TYPES.REGULAR_C.price;
      } else if (seatId.startsWith('D-')) {
        breakdown.blockDSeats++;
        breakdown.blockDAmount += SHOW_SEAT_TYPES.REGULAR_D.price;
      }
    });

    return breakdown;
  };

  // Process booking
  const processBooking = async (paymentDetails) => {
    if (!user) {
      toast.error('Please login to complete booking');
      return false;
    }

    if (state.selectedSeats.length === 0) {
      toast.error('Please select seats to book');
      return false;
    }

    dispatch({ type: ACTIONS.SET_LOADING, payload: true });

    try {
      const bookingId = `SHOW-${Date.now()}-${user.uid.slice(-4)}`;
      const pricingBreakdown = getPricingBreakdown();
      
      const bookingData = {
        bookingId: bookingId,
        userId: user.uid,
        userEmail: user.email,
        showDetails: {
          date: state.selectedDate,
          time: '5-10pm', // Fixed show timing
          selectedSeats: state.selectedSeats.map(seatId => ({
            id: seatId,
            price: getSeatPrice(seatId),
            type: seatId.startsWith('A-') || seatId.startsWith('B-') ? 'VIP' : 
                  seatId.startsWith('C-') ? 'REGULAR_C' : 'REGULAR_D'
          }))
        },
        userDetails: {
          name: state.bookingData.userDetails?.name || user.displayName || user.email,
          email: user.email,
          phone: state.bookingData.userDetails?.phone || '',
          aadhar: state.bookingData.userDetails?.aadhar || ''
        },
        payment: {
          amount: state.totalPrice,
          method: paymentDetails.method || 'online',
          transactionId: paymentDetails.transactionId || `TXN-${Date.now()}`,
          status: 'completed'
        },
        pricingBreakdown,
        totalPrice: state.totalPrice,
        totalCapacity: state.totalCapacity,
        status: 'confirmed',
        createdAt: serverTimestamp(),
        type: 'show'
      };

      // Save booking
      await setDoc(doc(db, 'showBookings', bookingId), bookingData);

      // Update seat availability
      const dateKey = state.selectedDate;
      const shift = '5-10pm';
      const availabilityRef = doc(db, 'showSeatAvailability', `${dateKey}_${shift}`);
      
      // Get current availability and update it
      const currentDoc = await getDoc(availabilityRef);
      const currentAvailability = currentDoc.exists() ? currentDoc.data().seats || {} : {};
      
      // Mark selected seats as booked
      const updatedAvailability = { ...currentAvailability };
      state.selectedSeats.forEach(seatId => {
        updatedAvailability[seatId] = {
          ...updatedAvailability[seatId],
          booked: true,
          bookedBy: user.uid,
          bookingId: bookingId,
          bookedAt: serverTimestamp()
        };
      });
      
      await setDoc(availabilityRef, { 
        seats: updatedAvailability,
        lastUpdated: serverTimestamp()
      }, { merge: true });

      // Update booking statistics
      try {
        const statsRef = doc(db, 'showStats', state.selectedDate);
        await setDoc(statsRef, {
          totalBookings: increment(1),
          totalRevenue: increment(state.totalPrice),
          totalSeatsBooked: increment(state.selectedSeats.length),
          vipSeatsBooked: increment(pricingBreakdown.vipSeats),
          regularCSeatsBooked: increment(pricingBreakdown.blockCSeats),
          regularDSeatsBooked: increment(pricingBreakdown.blockDSeats),
          lastUpdated: serverTimestamp()
        }, { merge: true });
      } catch (statsError) {
        console.error('Error updating stats:', statsError);
        // Don't fail the booking if stats update fails
      }

      toast.success('Show booking confirmed successfully!');
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      return { success: true, bookingId };

    } catch (error) {
      console.error('Error processing show booking:', error);
      toast.error('Failed to process booking. Please try again.');
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
      dispatch({ type: ACTIONS.SET_LOADING, payload: false });
      return { success: false, error: error.message };
    }
  };

  const value = {
    ...state,
    SHOW_SEAT_TYPES,
    selectSeat,
    setSelectedDate,
    setDateAndShift,
    setCurrentStep,
    setBookingData,
    clearSelection,
    resetBooking,
    processBooking,
    getSeatStatus,
    isSeatSelected,
    getSeatPrice,
    getPricingBreakdown
  };

  return (
    <ShowSeatBookingContext.Provider value={value}>
      {children}
    </ShowSeatBookingContext.Provider>
  );
};

export const useShowSeatBooking = () => {
  const context = useContext(ShowSeatBookingContext);
  if (!context) {
    throw new Error('useShowSeatBooking must be used within a ShowSeatBookingProvider');
  }
  return context;
};
