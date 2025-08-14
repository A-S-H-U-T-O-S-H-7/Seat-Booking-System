"use client";
import { useShowSeatBooking } from '@/context/ShowSeatBookingContext';
import { useState } from 'react';
import { toast } from 'react-hot-toast';

export default function ShowAuditorium() {
  const { 
    selectedSeats, 
    selectSeat, 
    seatAvailability, 
    totalPrice, 
    totalCapacity,
    isSeatAvailable
  } = useShowSeatBooking();
  const [zoomLevel, setZoomLevel] = useState(1);

  // Generate seat layout for the auditorium
  const generateSeatLayout = () => {
    const seats = {};
    
    // VIP Section - 8 rows, 14 seats per row (7 left, 7 right) - 2 people per sofa
    for (let row = 1; row <= 8; row++) {
      // A Block (Left side)
      const leftSeats = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
      leftSeats.forEach((letter) => {
        // A1 seat
        const seatIdA1 = `A-R${row}-${letter}1`;
        seats[seatIdA1] = {
          id: seatIdA1,
          row: row,
          seat: `${letter}1`,
          side: 'LEFT',
          type: 'VIP',
          section: 'A',
          price: 1000,
          capacity: 1,
          displayName: `A-R${row}-${letter}1`,
          pairLetter: letter,
          pairPosition: 1
        };
        
        // A2 seat
        const seatIdA2 = `A-R${row}-${letter}2`;
        seats[seatIdA2] = {
          id: seatIdA2,
          row: row,
          seat: `${letter}2`,
          side: 'LEFT',
          type: 'VIP',
          section: 'A',
          price: 1000,
          capacity: 1,
          displayName: `A-R${row}-${letter}2`,
          pairLetter: letter,
          pairPosition: 2
        };
      });
      
      // B Block (Right side)
      const rightSeats = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
      rightSeats.forEach((letter) => {
        // B1 seat
        const seatIdB1 = `B-R${row}-${letter}1`;
        seats[seatIdB1] = {
          id: seatIdB1,
          row: row,
          seat: `${letter}1`,
          side: 'RIGHT',
          type: 'VIP',
          section: 'B',
          price: 1000,
          capacity: 1,
          displayName: `B-R${row}-${letter}1`,
          pairLetter: letter,
          pairPosition: 1
        };
        
        // B2 seat
        const seatIdB2 = `B-R${row}-${letter}2`;
        seats[seatIdB2] = {
          id: seatIdB2,
          row: row,
          seat: `${letter}2`,
          side: 'RIGHT',
          type: 'VIP',
          section: 'B',
          price: 1000,
          capacity: 1,
          displayName: `B-R${row}-${letter}2`,
          pairLetter: letter,
          pairPosition: 2
        };
      });
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
          displayName: `D-R${row}-S${seat}`
        };
      }
    }

    return seats;
  };

  // Get seats with availability data
  const baseSeats = generateSeatLayout();
  const allSeats = Object.keys(baseSeats).reduce((acc, seatId) => {
    const baseSeat = baseSeats[seatId];
    const availabilityData = seatAvailability[seatId] || {};
    
    acc[seatId] = {
      ...baseSeat,
      isBooked: !!availabilityData.booked,
      isBlocked: !!availabilityData.blocked,
      isAvailable: isSeatAvailable(seatId),
      isSelected: selectedSeats.includes(seatId)
    };
    return acc;
  }, {});

  const vipSeats = Object.values(allSeats).filter(seat => seat.type === 'VIP');
  const regularSeats = Object.values(allSeats).filter(seat => seat.type === 'REGULAR');

  // Calculate free seats
  const getFreeSeatsCount = () => {
    const freeSeats = {
      'A': 0, 'B': 0, 'C': 0, 'D': 0
    };
    
    Object.values(allSeats).forEach(seat => {
      if (seat.isAvailable) {
        freeSeats[seat.section]++;
      }
    });
    
    return freeSeats;
  };

  const freeSeatsCount = getFreeSeatsCount();

  // Seat colors based on status
  const getSeatColor = (seat) => {
    if (seat.isBooked) return 'bg-gray-400 cursor-not-allowed';
    if (seat.isBlocked) return 'bg-gray-600 cursor-not-allowed';
    if (seat.isSelected) return 'bg-blue-600 text-white';
    
    if (seat.section === 'A' || seat.section === 'B') {
      return 'bg-gradient-to-br from-amber-300 to-yellow-400';
    }
    if (seat.section === 'C') {
      return 'bg-emerald-400';
    }
    if (seat.section === 'D') {
      return 'bg-teal-300';
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
      toast.error('This seat is not available');
      return;
    }

    // Toggle selection by calling context function
    selectSeat(seat.id);
  };

  // Render VIP section
  const renderVIPSection = () => {
    const rows = Array.from({ length: 8 }, (_, i) => i + 1);

    return (
      <div className="mb-10">
        <div className="text-center mb-6">
          <h3 className={`text-xl font-bold text-gray-900`}>
            VIP Section - Premium Sofa Seating (₹1,000 per seat)
          </h3>
        </div>
        
        <div className="flex items-center justify-center gap-8 mb-4">
          <div className={`px-8 py-2 rounded-lg border-2 font-bold text-lg bg-amber-50 border-amber-300 text-amber-800`}>
            Block A
          </div>
          <div className="w-12"></div>
          <div className={`px-8 py-2 rounded-lg border-2 font-bold text-lg bg-amber-50 border-amber-300 text-amber-800`}>
            Block B
          </div>
        </div>
        
        <div className="space-y-3">
          {rows.map(row => {
            const aBlockSeats = vipSeats.filter(seat => seat.section === 'A' && seat.row === row);
            const bBlockSeats = vipSeats.filter(seat => seat.section === 'B' && seat.row === row);

            return (
              <div key={row} className="flex items-center justify-center gap-8">
                {/* A Block (Left side) */}
                <div className="flex gap-1">
                  {['A', 'B', 'C', 'D', 'E', 'F', 'G'].map(letter => (
                    <div key={letter} className="flex gap-0.5 mr-2 p-1 rounded bg-white/10">
                      {[1, 2].map(num => {
                        const seat = aBlockSeats.find(s => s.pairLetter === letter && s.pairPosition === num);
                        if (!seat) return null;
                        
                        return (
                          <button
                            key={seat.id}
                            onClick={() => handleSeatClick(seat)}
                            disabled={!seat.isAvailable && !seat.isSelected}
                            className={`
                              w-7 h-6 rounded-md text-xs font-bold transition-all duration-200 
                              ${getSeatColor(seat)} 
                              ${seat.isAvailable || seat.isSelected ? 'hover:scale-105 cursor-pointer hover:shadow-md' : 'cursor-not-allowed opacity-50'} 
                              shadow-sm border border-amber-200
                            `}
                            title={`${seat.displayName} - ₹${seat.price} - ${seat.isAvailable ? 'Available' : 'Booked'}`}
                          >
                            {letter}{num}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>

                {/* Row number */}
                <div className={`w-12 text-center text-lg font-bold px-3 py-1 rounded-lg text-amber-700 bg-amber-100`}>
                  R{row}
                </div>

                {/* B Block (Right side) */}
                <div className="flex gap-1">
                  {['A', 'B', 'C', 'D', 'E', 'F', 'G'].map(letter => (
                    <div key={letter} className="flex gap-0.5 mr-2 p-1 rounded bg-white/10">
                      {[1, 2].map(num => {
                        const seat = bBlockSeats.find(s => s.pairLetter === letter && s.pairPosition === num);
                        if (!seat) return null;
                        
                        return (
                          <button
                            key={seat.id}
                            onClick={() => handleSeatClick(seat)}
                            disabled={!seat.isAvailable && !seat.isSelected}
                            className={`
                              w-7 h-6 rounded-md text-xs font-bold transition-all duration-200 
                              ${getSeatColor(seat)} 
                              ${seat.isAvailable || seat.isSelected ? 'hover:scale-105 cursor-pointer hover:shadow-md' : 'cursor-not-allowed opacity-50'} 
                              shadow-sm border border-amber-200
                            `}
                            title={`${seat.displayName} - ₹${seat.price} - ${seat.isAvailable ? 'Available' : 'Booked'}`}
                          >
                            {letter}{num}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render Regular section
  const renderRegularSection = () => {
    const rows = Array.from({ length: 25 }, (_, i) => i + 1);

    return (
      <div>
        <div className="text-center mb-6">
          <h3 className={`text-xl font-bold text-gray-900`}>
            Regular Section
          </h3>
          <div className="text-sm mt-2">
            <span className="text-emerald-600 font-semibold">Block C: ₹1,000</span>
            <span className="mx-4 text-gray-400">•</span>
            <span className="text-teal-600 font-semibold">Block D: ₹500</span>
          </div>
        </div>
        
        <div className="flex items-center justify-center gap-6 mb-4">
          <div className={`px-6 py-2 rounded-lg border-2 font-bold text-md bg-emerald-50 border-emerald-300 text-emerald-800`}>
            Block C (₹1,000)
          </div>
          <div className="w-10"></div>
          <div className={`px-6 py-2 rounded-lg border-2 font-bold text-md bg-teal-50 border-teal-300 text-teal-800`}>
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
                  {cBlockSeats.map(seat => (
                    <button
                      key={seat.id}
                      onClick={() => handleSeatClick(seat)}
                      disabled={!seat.isAvailable && !seat.isSelected}
                      className={`
                        w-6 h-5 rounded-md text-xs font-bold transition-all duration-200 
                        ${getSeatColor(seat)} 
                        ${seat.isAvailable || seat.isSelected ? 'hover:scale-110 cursor-pointer hover:shadow-md' : 'cursor-not-allowed opacity-50'} 
                        shadow-sm border border-emerald-300
                      `}
                      title={`${seat.displayName} - ₹${seat.price} - ${seat.isAvailable ? 'Available' : 'Booked'}`}
                    >
                      {seat.seat}
                    </button>
                  ))}
                </div>

                {/* Row number */}
                <div className={`w-10 text-center text-sm font-bold px-2 py-1 rounded text-gray-600 bg-gray-100`}>
                  R{row}
                </div>

                {/* D Block (Right side) */}
                <div className="flex gap-1">
                  {dBlockSeats.map(seat => (
                    <button
                      key={seat.id}
                      onClick={() => handleSeatClick(seat)}
                      disabled={!seat.isAvailable && !seat.isSelected}
                      className={`
                        w-6 h-5 rounded-md text-xs font-bold transition-all duration-200 
                        ${getSeatColor(seat)} 
                        ${seat.isAvailable || seat.isSelected ? 'hover:scale-110 cursor-pointer hover:shadow-md' : 'cursor-not-allowed opacity-50'} 
                        shadow-sm border border-teal-300
                      `}
                      title={`${seat.displayName} - ₹${seat.price} - ${seat.isAvailable ? 'Available' : 'Booked'}`}
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
    <div className={`p-2 md:p-6 rounded-lg border bg-white border-gray-200`}>
      {/* Header with zoom controls */}
      <div className="flex justify-between items-center mb-4 md:mb-6">
        <h2 className={`text-lg md:text-xl font-bold text-gray-900`}>
          Show Auditorium Layout
        </h2>
        <div className="flex items-center gap-2">
          <span className={`text-xs md:text-sm text-gray-600`}>Zoom:</span>
          <button
            onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.1))}
            className={`px-2 py-1 text-xs rounded bg-gray-200 text-gray-700 hover:bg-gray-300`}
          >
            -
          </button>
          <span className={`text-xs md:text-sm text-gray-600`}>
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.1))}
            className={`px-2 py-1 text-xs rounded bg-gray-200 text-gray-700 hover:bg-gray-300`}
          >
            +
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-3 md:gap-6 mb-6 md:mb-8 text-xs md:text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 md:w-5 h-4 md:h-5 bg-gradient-to-br from-amber-300 to-yellow-400 rounded-md border-2 border-amber-200"></div>
          <span className="text-gray-700">VIP Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 md:w-5 h-4 md:h-5 bg-emerald-400 rounded-md border border-emerald-300"></div>
          <span className="text-gray-700">Block C Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 md:w-5 h-4 md:h-5 bg-teal-300 rounded-md border border-teal-300"></div>
          <span className="text-gray-700">Block D Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 md:w-5 h-4 md:h-5 bg-blue-600 rounded-md"></div>
          <span className="text-gray-700">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 md:w-5 h-4 md:h-5 bg-gray-400 rounded-md"></div>
          <span className="text-gray-700">Booked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 md:w-5 h-4 md:h-5 bg-gray-600 rounded-md"></div>
          <span className="text-gray-700">Blocked</span>
        </div>
      </div>

      {/* Auditorium Layout */}
      <div 
        className="overflow-auto max-h-screen"
        style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
      >
        <div className="min-w-max">
          
          {/* Stage */}
          <div className="text-center mb-6 md:mb-8">
            <div className={`inline-block px-12 md:px-16 py-3 md:py-4 rounded-lg border-2 border-dashed border-yellow-500 bg-yellow-50`}>
              <div className="flex items-center justify-center gap-2">
                <span className="text-xl md:text-2xl">🎭</span>
                <span className={`text-base md:text-lg font-bold text-yellow-700`}>
                  STAGE
                </span>
                <span className="text-xl md:text-2xl">🎪</span>
              </div>
              <div className={`text-xs md:text-sm mt-1 text-yellow-600`}>
                Cultural Shows & Performances
              </div>
            </div>
          </div>

          {/* VIP Section */}
          {renderVIPSection()}

          {/* Barrier between VIP and Regular */}
          <div className="flex justify-center my-4 md:my-6">
            <div className={`w-3/4 h-px bg-gray-300`}></div>
          </div>
          <div className="text-center mb-4 md:mb-6">
            <span className={`text-xs md:text-sm px-3 md:px-4 py-1 rounded-full bg-gray-200 text-gray-600`}>
              Barrier
            </span>
          </div>

          {/* Regular Section */}
          {renderRegularSection()}

        </div>
      </div>

      {/* Free Seats Summary */}
      <div className={`mt-4 md:mt-6 p-3 md:p-4 rounded-xl border-2 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200`}>
        <h4 className={`font-bold mb-2 text-base md:text-lg text-center text-gray-900`}>
          🎫 Available Seats
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
          <div className={`text-center p-2 md:p-4 rounded-lg border-2 bg-amber-50 border-amber-300`}>
            <div className={`text-xl md:text-3xl font-bold mb-1 text-amber-600`}>
              {freeSeatsCount['A']}
            </div>
            <div className={`text-xs md:text-sm font-semibold text-amber-700`}>
              Block A
            </div>
            <div className={`text-xs text-amber-600`}>
              VIP Premium
            </div>
          </div>
          <div className={`text-center p-2 md:p-4 rounded-lg border-2 bg-amber-50 border-amber-300`}>
            <div className={`text-xl md:text-3xl font-bold mb-1 text-amber-600`}>
              {freeSeatsCount['B']}
            </div>
            <div className={`text-xs md:text-sm font-semibold text-amber-700`}>
              Block B
            </div>
            <div className={`text-xs text-amber-600`}>
              VIP Premium
            </div>
          </div>
          <div className={`text-center p-2 md:p-4 rounded-lg border-2 bg-emerald-50 border-emerald-300`}>
            <div className={`text-xl md:text-3xl font-bold mb-1 text-emerald-600`}>
              {freeSeatsCount['C']}
            </div>
            <div className={`text-xs md:text-sm font-semibold text-emerald-700`}>
              Block C
            </div>
            <div className={`text-xs text-emerald-600`}>
              ₹1,000
            </div>
          </div>
          <div className={`text-center p-2 md:p-4 rounded-lg border-2 bg-teal-50 border-teal-300`}>
            <div className={`text-xl md:text-3xl font-bold mb-1 text-teal-600`}>
              {freeSeatsCount['D']}
            </div>
            <div className={`text-xs md:text-sm font-semibold text-teal-700`}>
              Block D
            </div>
            <div className={`text-xs text-teal-600`}>
              ₹500
            </div>
          </div>
        </div>
        
        {/* Total available seats */}
        <div className="text-center mt-3 md:mt-4">
          <div className={`inline-block px-4 md:px-6 py-2 rounded-full border-2 bg-blue-100 border-blue-400 text-blue-800`}>
            <span className="font-bold text-base md:text-lg">
              Total Available: {freeSeatsCount['A'] + freeSeatsCount['B'] + freeSeatsCount['C'] + freeSeatsCount['D']}
            </span>
          </div>
        </div>
      </div>

      {/* Selection Summary */}
      {selectedSeats.length > 0 && (
        <div className={`mt-3 md:mt-4 p-3 md:p-4 rounded-xl border-2 shadow-lg sticky bottom-4 z-10 bg-white border-gray-200`}>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h4 className={`font-semibold text-sm sm:text-base mb-2 text-gray-800`}>
                  Selected Seats ({selectedSeats.length})
                </h4>
                <div className="flex flex-wrap gap-1 sm:gap-2 mb-2 sm:mb-0">
                  {selectedSeats.slice(0, 6).map(seatId => {
                    const seat = allSeats[seatId];
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
                        {seatId} (₹{seat.price})
                      </span>
                    );
                  })}
                  {selectedSeats.length > 6 && (
                    <span className={`px-2 py-1 text-xs rounded font-medium bg-gray-200 text-gray-700`}>
                      +{selectedSeats.length - 6} more
                    </span>
                  )}
                </div>
              </div>
              <div className={`text-right sm:text-left text-gray-700`}>
                <p className="font-bold text-lg sm:text-xl">₹{totalPrice.toLocaleString('en-IN')}</p>
                <p className="text-xs sm:text-sm opacity-75">
                  {(() => {
                    const breakdown = {
                      vipSeats: 0,
                      blockCSeats: 0,
                      blockDSeats: 0
                    };
                    selectedSeats.forEach(seatId => {
                      const seat = allSeats[seatId];
                      if (seat.section === 'A' || seat.section === 'B') breakdown.vipSeats++;
                      else if (seat.section === 'C') breakdown.blockCSeats++;
                      else if (seat.section === 'D') breakdown.blockDSeats++;
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
          </div>
        </div>
      )}
    </div>
  );
}