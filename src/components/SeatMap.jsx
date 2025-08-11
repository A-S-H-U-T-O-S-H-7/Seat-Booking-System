"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { useBooking } from '@/context/BookingContext';

const SeatMap = ({ selectedDate, selectedShift, onSeatSelect, selectedSeats = [] }) => {
  const [seatAvailability, setSeatAvailability] = useState({});
  const [loading, setLoading] = useState(true);
  
  // Get pricing information from booking context
  const { priceSettings, getTotalAmount, getCurrentDiscountInfo, getNextMilestone } = useBooking();
  
  // Generate seat structure: 4 blocks (A,B,C,D) × 5 columns × 5 kunds × 4 seats = 400 seats
  const generateSeats = () => {
    const blocks = ['A', 'B', 'C', 'D'];
    const columns = [1, 2, 3, 4, 5];
    const kunds = ['K1', 'K2', 'K3', 'K4', 'K5'];
    const seats = ['S1', 'S2', 'S3', 'S4'];
    
    const allSeats = [];
    
    blocks.forEach(block => {
      columns.forEach(col => {
        kunds.forEach(kund => {
          seats.forEach(seat => {
            const seatId = `${block}-${col}-${kund}-${seat}`;
            allSeats.push({
              id: seatId,
              block,
              column: col,
              kund,
              seat,
              displayName: seatId
            });
          });
        });
      });
    });
    
    return allSeats;
  };

  const allSeats = generateSeats();

  // Listen to seat availability changes in real-time
  useEffect(() => {
    if (!selectedDate || !selectedShift) return;

    const dateKey = selectedDate.toISOString().split('T')[0];
    const availabilityRef = doc(db, 'seatAvailability', `${dateKey}_${selectedShift}`);
    
    const unsubscribe = onSnapshot(availabilityRef, (docSnap) => {
      if (docSnap.exists()) {
        setSeatAvailability(docSnap.data().seats || {});
      } else {
        setSeatAvailability({});
      }
      setLoading(false);
    }, (error) => {
      console.error('Error fetching seat availability:', error);
      toast.error('Failed to load seat availability');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [selectedDate, selectedShift]);

  const getSeatStatus = (seatId) => {
    const availability = seatAvailability[seatId];
    if (!availability) return 'available';
    
    if (availability.blocked) return 'blocked';
    if (availability.booked) return 'booked';
    return 'available';
  };

  const getSeatColor = (seatId) => {
    const status = getSeatStatus(seatId);
    const isSelected = selectedSeats.includes(seatId);
    
    if (isSelected) return 'bg-blue-500 text-white shadow-lg border-2 border-blue-300'; // Selected
    if (status === 'booked') return 'bg-gray-400 text-white border border-gray-300'; // Booked
    if (status === 'blocked') return 'bg-gray-300 text-gray-500 border border-gray-200'; // Blocked
    return 'bg-green-500 text-white hover:bg-green-600 border border-green-400 hover:border-green-500'; // Available
  };

  const handleSeatClick = (seatId) => {
    const status = getSeatStatus(seatId);
    
    if (status !== 'available') {
      toast.error(`Seat ${seatId} is ${status}`);
      return;
    }
    
    onSeatSelect(seatId);
  };

  const renderKundUnit = (blockName, col, kund, seats) => {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-1 sm:p-2 md:p-3 hover:shadow-md transition-all duration-200 hover:border-orange-300">
        {/* Kund Label */}
        <div className="text-center text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2 truncate">
          <span className="sm:hidden">{blockName}{col}-{kund}</span>
          <span className="hidden sm:inline">{blockName}{col}-{kund}</span>
        </div>
        
        {/* Seats arranged around havan icon */}
        <div className="relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto">
          {/* Center Havan Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 bg-orange-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
              🔥
            </div>
          </div>
          
          {/* Four seats positioned around the icon */}
          {seats.map((seat, index) => {
            const positions = [
              { top: '0', left: '50%', transform: 'translateX(-50%)' }, // Top (S1)
              { top: '50%', right: '0', transform: 'translateY(-50%)' }, // Right (S2)
              { bottom: '0', left: '50%', transform: 'translateX(-50%)' }, // Bottom (S3)
              { top: '50%', left: '0', transform: 'translateY(-50%)' }  // Left (S4)
            ];
            
            return (
              <button
                key={seat.id}
                onClick={() => handleSeatClick(seat.id)}
                disabled={getSeatStatus(seat.id) !== 'available' && !selectedSeats.includes(seat.id)}
                className={`
                  absolute w-3 h-3 sm:w-4 sm:h-4 text-xs font-bold rounded-full seat-button transition-all duration-200
                  ${getSeatColor(seat.id)}
                  ${(getSeatStatus(seat.id) !== 'available' && !selectedSeats.includes(seat.id)) 
                    ? 'cursor-not-allowed opacity-60' 
                    : 'cursor-pointer hover:scale-110 hover:shadow-lg active:scale-95'}
                  focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50
                `}
                style={positions[index]}
                title={`${seat.id} - ${getSeatStatus(seat.id)}`}
              >
                <span className="text-xs font-bold">
                  {seat.seat.replace('S', '')}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderBlock = (blockName, blockSeats) => {
    // Group seats by column and kund for better layout
    const columnGroups = {};
    
    blockSeats.forEach(seat => {
      const key = `${seat.column}-${seat.kund}`;
      if (!columnGroups[key]) {
        columnGroups[key] = [];
      }
      columnGroups[key].push(seat);
    });

    return (
      <div key={blockName} className="bg-gradient-to-br from-orange-50 to-amber-50 p-2 sm:p-2 rounded-xl border-2 border-orange-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
        {/* Block Header */}
        <div className="text-center mb-2 sm:mb-4">
          <h3 className="text-sm sm:text-lg md:text-xl font-bold text-orange-800 bg-gradient-to-r from-orange-100 to-amber-100 p-2 sm:p-3 rounded-lg border border-orange-300 shadow-sm">
            <span className="sm:hidden">🏛️ {blockName} 🏛️</span>
            <span className="hidden sm:inline">🏛️ Block {blockName} 🏛️</span>
          </h3>
        </div>
        
        {/* Kund grid - Responsive 5x5 layout */}
        <div className="grid grid-cols-5 gap-1 sm:gap-2 md:gap-3 lg:gap-4">
          {['K1', 'K2', 'K3', 'K4', 'K5'].map(kund => (
            [1, 2, 3, 4, 5].map(col => {
              const kundSeats = columnGroups[`${col}-${kund}`] || [];
              return (
                <div key={`${col}-${kund}`} className="aspect-square">
                  {renderKundUnit(blockName, col, kund, kundSeats)}
                </div>
              );
            })
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // Group seats by block
  const seatsByBlock = allSeats.reduce((acc, seat) => {
    if (!acc[seat.block]) acc[seat.block] = [];
    acc[seat.block].push(seat);
    return acc;
  }, {});

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="text-center mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-2">Select Your Seats</h2>
        <p className="text-gray-600 text-sm sm:text-base">Choose your preferred seating arrangement</p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-2 sm:gap-4 text-xs sm:text-sm mb-4 sm:mb-6 bg-gray-50 p-3 sm:p-4 rounded-xl">
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="w-3 h-3 bg-green-500 rounded border border-green-400"></div>
          <span className="text-gray-600 font-medium">Available</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded border-2 border-blue-300"></div>
          <span className="text-gray-600 font-medium">Selected</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="w-3 h-3 bg-gray-400 rounded border border-gray-300"></div>
          <span className="text-gray-600 font-medium">Booked</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="w-3 h-3 bg-gray-300 rounded border border-gray-200"></div>
          <span className="text-gray-600 font-medium">Blocked</span>
        </div>
      </div>

      {/* Stage indicator */}
      <div className="text-center mb-4 sm:mb-6">
        <div className="inline-flex items-center px-3 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-200 rounded-xl text-amber-800 font-semibold text-sm sm:text-base shadow-md">
          🕉️ HAVAN STAGE 🕉️
        </div>
      </div>

      {/* Seat blocks in responsive grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
        {['A', 'B', 'C', 'D'].map(block => 
          renderBlock(block, seatsByBlock[block] || [])
        )}
      </div>

      {/* Selected seats summary - Responsive */}
      {selectedSeats.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 p-3 sm:p-4 md:p-6 rounded-xl sticky bottom-4 z-10 shadow-lg">
          <div className="flex flex-col gap-3">
            {/* Header and seats */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h4 className="font-semibold text-sm sm:text-base mb-2 text-blue-800">
                  Selected Seats ({selectedSeats.length})
                </h4>
                <div className="flex flex-wrap gap-1 sm:gap-2 mb-2 sm:mb-0">
                  {selectedSeats.slice(0, 6).map(seatId => (
                    <span key={seatId} className="bg-blue-500 text-white px-2 py-1 rounded-lg text-xs font-medium">
                      {seatId}
                    </span>
                  ))}
                  {selectedSeats.length > 6 && (
                    <span className="bg-blue-400 text-white px-2 py-1 rounded-lg text-xs font-medium">
                      +{selectedSeats.length - 6} more
                    </span>
                  )}
                </div>
              </div>
              <div className="text-blue-700 text-right sm:text-left">
                <p className="font-bold text-lg sm:text-xl">₹{getTotalAmount()}</p>
                <p className="text-xs sm:text-sm opacity-75">₹{priceSettings.defaultSeatPrice} per seat</p>
              </div>
            </div>
            
            {/* Current Discount Info */}
            {(() => {
              const currentDiscount = getCurrentDiscountInfo();
              if (currentDiscount) {
                return (
                  <div className="bg-green-100 border border-green-300 p-2 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-green-600 font-bold text-xs">🎉</span>
                      <span className="text-green-800 text-xs font-medium">
                        {currentDiscount.percent}% {currentDiscount.label} Applied!
                      </span>
                    </div>
                  </div>
                );
              }
              return null;
            })()}
            
            {/* Next Milestone */}
            {(() => {
              const nextMilestone = getNextMilestone();
              if (nextMilestone) {
                return (
                  <div className="bg-orange-100 border border-orange-300 p-2 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-orange-600 font-bold text-xs">🎯</span>
                      <span className="text-orange-800 text-xs font-medium">
                        Book {nextMilestone.seatsNeeded} more seat{nextMilestone.seatsNeeded > 1 ? 's' : ''} to get {nextMilestone.discountPercent}% discount!
                      </span>
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
};

export default SeatMap;