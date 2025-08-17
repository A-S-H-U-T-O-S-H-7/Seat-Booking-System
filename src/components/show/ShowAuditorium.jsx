"use client";
import { useShowSeatBooking } from '@/context/ShowSeatBookingContext';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function ShowAuditorium() {
  const { 
    selectedSeats, 
    selectSeat, 
    seatAvailability, 
    totalPrice, 
    totalCapacity,
    isSeatAvailable,
    getTotalAmount,
    getDiscountAmount,
    getBaseAmount,
    getEarlyBirdDiscount,
    getBulkDiscount,
    getNextMilestone
  } = useShowSeatBooking();
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showSettings, setShowSettings] = useState({
    seatLayout: {
      premiumBlocks: [
        { id: 'A', name: 'Block A', maxRows: 8, maxPairsPerRow: 7, price: 1000, isActive: true },
        { id: 'B', name: 'Block B', maxRows: 8, maxPairsPerRow: 7, price: 1000, isActive: true }
      ],
      regularBlocks: [
        { id: 'C', name: 'Block C', maxRows: 25, maxSeatsPerRow: 15, price: 1000, isActive: true },
        { id: 'D', name: 'Block D', maxRows: 25, maxSeatsPerRow: 15, price: 500, isActive: true }
      ]
    }
  });
  const [loading, setLoading] = useState(true);

  // Fetch show settings from Firebase on component mount
  useEffect(() => {
    const fetchShowSettings = async () => {
      try {
        const showRef = doc(db, 'settings', 'shows');
        const showSnap = await getDoc(showRef);
        
        if (showSnap.exists()) {
          const data = showSnap.data();
          setShowSettings(data);
        }
      } catch (error) {
        console.error('Error fetching show settings:', error);
        toast.error('Failed to load show settings, using defaults');
      } finally {
        setLoading(false);
      }
    };
    
    fetchShowSettings();
  }, []);

  // Generate dynamic seat layout based on show settings
  const generateSeatLayout = () => {
    const seats = {};
    
    // Premium VIP Section - Dynamic based on settings
    showSettings.seatLayout.premiumBlocks.forEach(block => {
      if (!block.isActive) return; // Skip inactive blocks
      
      for (let row = 1; row <= block.maxRows; row++) {
        // Generate seat pairs for this premium block
        for (let pairIndex = 0; pairIndex < block.maxPairsPerRow; pairIndex++) {
          const letter = String.fromCharCode(65 + pairIndex); // A, B, C, D...
          
          // Seat 1 in pair
          const seatId1 = `${block.id}-R${row}-${letter}1`;
          seats[seatId1] = {
            id: seatId1,
            row: row,
            seat: `${letter}1`,
            side: block.id === 'A' ? 'LEFT' : 'RIGHT',
            type: 'VIP',
            section: block.id,
            price: block.price,
            capacity: 1,
            displayName: `${block.id}-R${row}-${letter}1`,
            pairLetter: letter,
            pairPosition: 1
          };
          
          // Seat 2 in pair
          const seatId2 = `${block.id}-R${row}-${letter}2`;
          seats[seatId2] = {
            id: seatId2,
            row: row,
            seat: `${letter}2`,
            side: block.id === 'A' ? 'LEFT' : 'RIGHT',
            type: 'VIP',
            section: block.id,
            price: block.price,
            capacity: 1,
            displayName: `${block.id}-R${row}-${letter}2`,
            pairLetter: letter,
            pairPosition: 2
          };
        }
      }
    });

    // Regular Section - Dynamic based on settings
    showSettings.seatLayout.regularBlocks.forEach(block => {
      if (!block.isActive) return; // Skip inactive blocks
      
      for (let row = 1; row <= block.maxRows; row++) {
        for (let seat = 1; seat <= block.maxSeatsPerRow; seat++) {
          const seatId = `${block.id}-R${row}-S${seat}`;
          seats[seatId] = {
            id: seatId,
            row: row,
            seat: seat,
            side: block.id === 'C' ? 'LEFT' : 'RIGHT',
            type: 'REGULAR',
            section: block.id,
            price: block.price,
            capacity: 1,
            displayName: `${block.id}-R${row}-S${seat}`
          };
        }
      }
    });

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
    // Get active premium blocks and their maximum rows for dynamic rendering
    const activePremiumBlocks = showSettings.seatLayout.premiumBlocks.filter(block => block.isActive);
    const maxVipRows = Math.max(...activePremiumBlocks.map(block => block.maxRows), 0);
    const blockASettings = activePremiumBlocks.find(block => block.id === 'A');
    const blockBSettings = activePremiumBlocks.find(block => block.id === 'B');
    
    if (!blockASettings && !blockBSettings) return null;
    
    const rows = Array.from({ length: maxVipRows }, (_, i) => i + 1);
    const maxPairsPerRow = Math.max(
      blockASettings?.maxPairsPerRow || 0,
      blockBSettings?.maxPairsPerRow || 0
    );
    
    return (
      <div className="mb-10">
        <div className="text-center mb-6">
          <h3 className={`text-xl font-bold text-gray-900`}>
            Premium Seating (₹{blockASettings?.price || blockBSettings?.price || 1000} per seat)
          </h3>
        </div>
        
        <div className="flex items-center justify-center gap-8 mb-4">
          {blockASettings && (
            <div className={`px-8 py-2 rounded-lg border-2 font-bold text-lg bg-amber-50 border-amber-300 text-amber-800`}>
              {blockASettings.name}
            </div>
          )}
          <div className="w-12"></div>
          {blockBSettings && (
            <div className={`px-8 py-2 rounded-lg border-2 font-bold text-lg bg-amber-50 border-amber-300 text-amber-800`}>
              {blockBSettings.name}
            </div>
          )}
        </div>
        
        <div className="space-y-3">
          {rows.map(row => {
            const aBlockSeats = vipSeats.filter(seat => seat.section === 'A' && seat.row === row);
            const bBlockSeats = vipSeats.filter(seat => seat.section === 'B' && seat.row === row);

            return (
              <div key={row} className="flex items-center justify-center gap-8">
                {/* A Block (Left side) */}
                {blockASettings && (
                  <div className="flex gap-1">
                    {Array.from({ length: maxPairsPerRow }, (_, i) => String.fromCharCode(65 + i)).map(letter => (
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
                )}

                {/* Row number */}
                <div className={`w-12 text-center text-lg font-bold px-3 py-1 rounded-lg text-amber-700 bg-amber-100`}>
                  R{row}
                </div>

                {/* B Block (Right side) */}
                {blockBSettings && (
                  <div className="flex gap-1">
                    {Array.from({ length: maxPairsPerRow }, (_, i) => String.fromCharCode(65 + i)).map(letter => (
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
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render Regular section
  const renderRegularSection = () => {
    // Get active regular blocks and their maximum rows for dynamic rendering
    const activeRegularBlocks = showSettings.seatLayout.regularBlocks.filter(block => block.isActive);
    const maxRegularRows = Math.max(...activeRegularBlocks.map(block => block.maxRows), 0);
    const blockCSettings = activeRegularBlocks.find(block => block.id === 'C');
    const blockDSettings = activeRegularBlocks.find(block => block.id === 'D');
    
    if (!blockCSettings && !blockDSettings) return null;
    
    const rows = Array.from({ length: maxRegularRows }, (_, i) => i + 1);

    return (
      <div>
        <div className="text-center mb-6">
          <h3 className={`text-xl font-bold text-gray-900`}>
            Regular Section
          </h3>
          <div className="text-sm mt-2">
            {blockCSettings && (
              <span className="text-emerald-600 font-semibold">
                {blockCSettings.name}: ₹{blockCSettings.price.toLocaleString()}
              </span>
            )}
            {blockCSettings && blockDSettings && <span className="mx-4 text-gray-400">•</span>}
            {blockDSettings && (
              <span className="text-teal-600 font-semibold">
                {blockDSettings.name}: ₹{blockDSettings.price.toLocaleString()}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-center gap-6 mb-4">
          {blockCSettings && (
            <div className={`px-6 py-2 rounded-lg border-2 font-bold text-md bg-emerald-50 border-emerald-300 text-emerald-800`}>
              {blockCSettings.name} (₹{blockCSettings.price.toLocaleString()})
            </div>
          )}
          <div className="w-10"></div>
          {blockDSettings && (
            <div className={`px-6 py-2 rounded-lg border-2 font-bold text-md bg-teal-50 border-teal-300 text-teal-800`}>
              {blockDSettings.name} (₹{blockDSettings.price.toLocaleString()})
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          {rows.map(row => {
            const cBlockSeats = regularSeats.filter(seat => seat.section === 'C' && seat.row === row);
            const dBlockSeats = regularSeats.filter(seat => seat.section === 'D' && seat.row === row);

            return (
              <div key={row} className="flex items-center justify-center gap-8">
                {/* C Block (Left side) */}
                {blockCSettings && (
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
                )}

                {/* Row number */}
                <div className={`w-10 text-center text-sm font-bold px-2 py-1 rounded text-gray-600 bg-gray-100`}>
                  R{row}
                </div>

                {/* D Block (Right side) */}
                {blockDSettings && (
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
                )}
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
      <div className="flex justify-between items-center mb-3">
        <h2 className={`text-sm md:text-xl font-semibold md:font-bold mb-2 text-gray-900`}>
          Show Seats Layout
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

      {/* Free Seats Summary - Mobile Optimized */}
      <div className="mb-4 md:mb-6 p-2 md:p-4 rounded-lg md:rounded-xl border md:border-2 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-blue-300 shadow-md md:shadow-lg">
        <div className="flex flex-col gap-2 md:gap-4">
          <div className="text-center md:text-left">
            <span className="text-base md:text-lg font-bold text-gray-800">🎫 Available Seats</span>
          </div>
          
          <div className="grid grid-cols-2 md:flex md:flex-wrap items-center justify-center gap-2 md:gap-4 text-sm">
            <div className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 md:py-2 bg-amber-100 rounded md:rounded-lg border border-amber-200">
              <div className="w-3 md:w-4 h-3 md:h-4 bg-gradient-to-br from-amber-300 to-yellow-400 rounded-full border border-amber-300 shadow-sm"></div>
              <span className="font-bold text-amber-800 text-xs md:text-sm">A: {freeSeatsCount['A']}</span>
            </div>
            <div className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 md:py-2 bg-amber-100 rounded md:rounded-lg border border-amber-200">
              <div className="w-3 md:w-4 h-3 md:h-4 bg-gradient-to-br from-amber-300 to-yellow-400 rounded-full border border-amber-300 shadow-sm"></div>
              <span className="font-bold text-amber-800 text-xs md:text-sm">B: {freeSeatsCount['B']}</span>
            </div>
            <div className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 md:py-2 bg-emerald-100 rounded md:rounded-lg border border-emerald-200">
              <div className="w-3 md:w-4 h-3 md:h-4 bg-emerald-400 rounded-full border border-emerald-300 shadow-sm"></div>
              <span className="font-bold text-emerald-800 text-xs md:text-sm">C: {freeSeatsCount['C']}</span>
            </div>
            <div className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1 md:py-2 bg-teal-100 rounded md:rounded-lg border border-teal-200">
              <div className="w-3 md:w-4 h-3 md:h-4 bg-teal-400 rounded-full border border-teal-300 shadow-sm"></div>
              <span className="font-bold text-teal-800 text-xs md:text-sm">D: {freeSeatsCount['D']}</span>
            </div>
          </div>
          
          <div className="text-center">
            <div className="inline-block px-3 md:px-4 py-1 md:py-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md">
              <span className="text-sm md:text-base font-bold">
                Total: {freeSeatsCount['A'] + freeSeatsCount['B'] + freeSeatsCount['C'] + freeSeatsCount['D']}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-3 md:gap-6 mb-6 md:mb-8 text-xs md:text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 md:w-5 h-4 md:h-5 bg-gradient-to-br from-amber-300 to-yellow-400 rounded-md border-2 border-amber-200"></div>
          <span className="text-gray-700">Premium Available</span>
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
              <div className="text-center sm:text-right bg-blue-50 rounded-lg p-2 border border-blue-200 w-full sm:w-auto min-w-[200px]">
                {/* Current Total */}
                <div className="text-xl sm:text-2xl font-bold text-blue-700 mb-1">
                  ₹{getTotalAmount().toLocaleString()}
                </div>
                
                {/* Base calculation - Compact */}
                {getDiscountAmount() > 0 ? (
                  <div className="text-xs text-gray-600 space-y-0.5 mb-1">
                    <div className="line-through">
                      ₹{getBaseAmount().toLocaleString()}
                    </div>
                    <div className="text-green-600 font-medium">
                      -₹{getDiscountAmount().toLocaleString()}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-gray-600 mb-1">
                    {selectedSeats.length} seats selected
                  </div>
                )}
                
                {/* Discount Badges - Compact */}
                <div className="space-y-0.5">
                  {getEarlyBirdDiscount() > 0 && (
                    <div className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      🎉 {getEarlyBirdDiscount()}% Early Bird!
                    </div>
                  )}
                  
                  {getBulkDiscount() > 0 && (
                    <div className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                      🎯 {getBulkDiscount()}% Bulk!
                    </div>
                  )}
                  
                  {/* Next Milestone - Compact */}
                  {(() => {
                    const milestone = getNextMilestone();
                    if (milestone) {
                      return (
                        <div className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                          📈 +{milestone.quantityNeeded} for {milestone.discountPercent}%
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
                
                {/* Seat breakdown - Compact */}
                <div className="text-xs text-gray-600 mt-1">
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
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
