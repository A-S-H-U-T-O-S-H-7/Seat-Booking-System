"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { useBooking } from '@/context/BookingContext';
import { formatDateKey } from '@/utils/dateUtils';
import { Info } from 'lucide-react';

const SeatMap = ({ selectedDate, selectedShift, onSeatSelect, selectedSeats = [] }) => {
  const [seatAvailability, setSeatAvailability] = useState({});
  const [loading, setLoading] = useState(true);
  const [layoutSettings, setLayoutSettings] = useState({
    blocks: []
  });
  
  // Get pricing information from booking context
  const { priceSettings, getTotalAmount, getCurrentDiscountInfo, getNextMilestone } = useBooking();
  
  // Listen to layout settings changes in real-time
  useEffect(() => {
    const layoutRef = doc(db, 'settings', 'seatLayout');
    
    const unsubscribe = onSnapshot(layoutRef, (docSnap) => {
      if (docSnap.exists()) {
        setLayoutSettings(docSnap.data());
      } else {
        // Default layout settings if none exist
        const defaultLayout = {
          blocks: [
            { id: 'A', name: 'Block A', columns: 5, kunds: 5, seatsPerKund: 4, isActive: true },
            { id: 'B', name: 'Block B', columns: 5, kunds: 5, seatsPerKund: 4, isActive: true },
            { id: 'C', name: 'Block C', columns: 5, kunds: 5, seatsPerKund: 4, isActive: true },
            { id: 'D', name: 'Block D', columns: 5, kunds: 5, seatsPerKund: 4, isActive: true }
          ]
        };
        setLayoutSettings(defaultLayout);
      }
    }, (error) => {
      console.error('Error listening to layout settings:', error);
      // Set default layout on error
      const defaultLayout = {
        blocks: [
          { id: 'A', name: 'Block A', columns: 5, kunds: 5, seatsPerKund: 4, isActive: true },
          { id: 'B', name: 'Block B', columns: 5, kunds: 5, seatsPerKund: 4, isActive: true },
          { id: 'C', name: 'Block C', columns: 5, kunds: 5, seatsPerKund: 4, isActive: true },
          { id: 'D', name: 'Block D', columns: 5, kunds: 5, seatsPerKund: 4, isActive: true }
        ]
      };
      setLayoutSettings(defaultLayout);
    });

    return () => unsubscribe();
  }, []);

  // Generate seat structure dynamically based on layout settings
  const generateSeats = () => {
    const allSeats = [];
    
    // Only process active blocks
    const activeBlocks = layoutSettings.blocks?.filter(block => block.isActive) || [];
    
    activeBlocks.forEach(blockConfig => {
      for (let col = 1; col <= blockConfig.columns; col++) {
        for (let kundIndex = 1; kundIndex <= blockConfig.kunds; kundIndex++) {
          const kund = `K${kundIndex}`;
          for (let seatIndex = 1; seatIndex <= blockConfig.seatsPerKund; seatIndex++) {
            const seat = `S${seatIndex}`;
            const seatId = `${blockConfig.id}${col}-K${kundIndex}-S${seatIndex}`;
            allSeats.push({
              id: seatId,
              block: blockConfig.id,
              blockName: blockConfig.name,
              column: col,
              kund,
              seat,
              displayName: seatId,
              blockConfig
            });
          }
        }
      }
    });
    
    return allSeats;
  };

  const allSeats = generateSeats();

  // Listen to seat availability changes in real-time
  useEffect(() => {
    if (!selectedDate || !selectedShift) return;

    const dateKey = formatDateKey(selectedDate);
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
    // First try the exact seat ID
    let availability = seatAvailability[seatId];
    
    // If not found, try the old format (backward compatibility)
    if (!availability) {
      // Convert new format A1-K1-S1 to old format A-1-K1-S1
      const oldFormatId = seatId.replace(/^([A-Z])(\d+)-/, '$1-$2-');
      availability = seatAvailability[oldFormatId];
    }
    
    // If still not found, try the new format (in case current ID is old format)
    if (!availability) {
      // Convert old format A-1-K1-S1 to new format A1-K1-S1
      const newFormatId = seatId.replace(/^([A-Z])-(\d+)-/, '$1$2-');
      availability = seatAvailability[newFormatId];
    }
    
    if (!availability) return 'available';
    
    if (availability.blocked) return 'blocked';
    if (availability.booked) return 'booked';
    return 'available';
  };

  const getSeatColor = (seatId) => {
    const status = getSeatStatus(seatId);
    const isSelected = selectedSeats.includes(seatId);
    
    if (isSelected) return 'bg-blue-500 text-white shadow-lg border-2 border-blue-300'; // Selected
    if (status === 'booked') return 'bg-gray-500 text-white border border-gray-400 cursor-not-allowed'; // Booked - Gray
    if (status === 'blocked') return 'bg-gray-300 text-gray-600 border border-gray-300 cursor-not-allowed'; // Blocked - Light Gray
    return 'bg-green-500 text-white hover:bg-green-600 border border-green-400 hover:border-green-500'; // Available - Green
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
    // Generate dynamic seat positions based on number of seats
    const generateSeatPositions = (numSeats) => {
      switch (numSeats) {
        case 1:
          return [{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }];
        case 2:
          return [
            { top: '25%', left: '50%', transform: 'translate(-50%, -50%)' },
            { bottom: '25%', left: '50%', transform: 'translate(-50%, 50%)' }
          ];
        case 3:
          return [
            { top: '10%', left: '50%', transform: 'translate(-50%, -50%)' },
            { bottom: '10%', left: '25%', transform: 'translate(-50%, 50%)' },
            { bottom: '10%', right: '25%', transform: 'translate(50%, 50%)' }
          ];
        case 4:
        default:
          return [
            { top: '2px', left: '25%', transform: 'translateX(-50%)' }, // Top S1 (left side)
            { top: '2px', right: '25%', transform: 'translateX(50%)' }, // Top S2 (right side)
            { bottom: '2px', left: '25%', transform: 'translateX(-50%)' }, // Bottom S3 (left side)
            { bottom: '2px', right: '25%', transform: 'translateX(50%)' }  // Bottom S4 (right side)
          ];
        case 5:
          return [
            { top: '0', left: '50%', transform: 'translateX(-50%)' },
            { top: '25%', right: '0', transform: 'translateY(-50%)' },
            { bottom: '25%', right: '0', transform: 'translateY(-50%)' },
            { bottom: '0', left: '50%', transform: 'translateX(-50%)' },
            { top: '50%', left: '0', transform: 'translateY(-50%)' }
          ];
        case 6:
          return [
            { top: '0', left: '35%', transform: 'translateX(-50%)' },
            { top: '0', right: '35%', transform: 'translateX(50%)' },
            { top: '50%', right: '0', transform: 'translateY(-50%)' },
            { bottom: '0', right: '35%', transform: 'translateX(50%)' },
            { bottom: '0', left: '35%', transform: 'translateX(-50%)' },
            { top: '50%', left: '0', transform: 'translateY(-50%)' }
          ];
        case 7:
          return [
            { top: '0', left: '50%', transform: 'translateX(-50%)' },
            { top: '15%', right: '15%', transform: 'translate(50%, -50%)' },
            { top: '50%', right: '0', transform: 'translateY(-50%)' },
            { bottom: '15%', right: '15%', transform: 'translate(50%, 50%)' },
            { bottom: '0', left: '50%', transform: 'translateX(-50%)' },
            { bottom: '15%', left: '15%', transform: 'translate(-50%, 50%)' },
            { top: '50%', left: '0', transform: 'translateY(-50%)' }
          ];
        case 8:
          return [
            { top: '0', left: '35%', transform: 'translateX(-50%)' },
            { top: '0', right: '35%', transform: 'translateX(50%)' },
            { top: '25%', right: '0', transform: 'translateY(-50%)' },
            { bottom: '25%', right: '0', transform: 'translateY(-50%)' },
            { bottom: '0', right: '35%', transform: 'translateX(50%)' },
            { bottom: '0', left: '35%', transform: 'translateX(-50%)' },
            { bottom: '25%', left: '0', transform: 'translateY(-50%)' },
            { top: '25%', left: '0', transform: 'translateY(-50%)' }
          ];
      }
    };

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-1 sm:p-2 md:p-2 hover:shadow-md transition-all duration-200 hover:border-orange-300">
        {/* Kund Label */}
        <div className="text-center text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2 truncate">
          <span className="sm:hidden">{blockName}{col}-{kund}</span>
          <span className="hidden sm:inline">{blockName}{col}-{kund}</span>
        </div>
        
        {/* Seats arranged around havan icon */}
        <div className="relative w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20 lg:w-24 lg:h-24 mx-auto">
          {/* Center Havan Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 bg-orange-400 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold">
              🔥
            </div>
          </div>
          
          {/* Dynamic seats positioned around the icon */}
          {seats.map((seat, index) => {
            const positions = generateSeatPositions(seats.length);
            
            return (
              <button
                key={seat.id}
                onClick={() => handleSeatClick(seat.id)}
                disabled={getSeatStatus(seat.id) !== 'available' && !selectedSeats.includes(seat.id)}
                className={`
                  absolute w-5 h-4 sm:w-6 sm:h-5 md:w-7 md:h-6 lg:w-8 lg:h-7 text-xs font-bold rounded-md seat-button transition-all duration-200 flex items-center justify-center
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

  const renderBlock = (blockConfig, blockSeats) => {
    // Group seats by column and kund for better layout
    const columnGroups = {};
    
    blockSeats.forEach(seat => {
      const key = `${seat.column}-${seat.kund}`;
      if (!columnGroups[key]) {
        columnGroups[key] = [];
      }
      columnGroups[key].push(seat);
    });

    // Generate dynamic grid classes based on block configuration
    const getGridCols = (cols) => {
      const gridClasses = {
        1: 'grid-cols-1',
        2: 'grid-cols-2', 
        3: 'grid-cols-3',
        4: 'grid-cols-4',
        5: 'grid-cols-5',
        6: 'grid-cols-6',
        7: 'grid-cols-7',
        8: 'grid-cols-8',
        9: 'grid-cols-9',
        10: 'grid-cols-10'
      };
      return gridClasses[cols] || 'grid-cols-5';
    };

    return (
      <div key={blockConfig.id} className="bg-gradient-to-br from-orange-50 to-amber-50 p-2 sm:p-3 md:p-4 rounded-xl border-2 border-orange-200 shadow-lg hover:shadow-xl transition-shadow duration-300">
        {/* Block Header */}
        <div className="text-center mb-2 sm:mb-4">
          <h3 className="text-sm sm:text-lg md:text-xl font-bold text-orange-800 bg-gradient-to-r from-orange-100 to-amber-100 p-2 sm:p-3 rounded-lg border border-orange-300 shadow-sm">
            <span className="sm:hidden">🏦 {blockConfig.id} 🏦</span>
            <span className="hidden sm:inline">🏦 {blockConfig.name} 🏦</span>
          </h3>
        </div>
        
        {/* Dynamic Kund grid based on block configuration */}
        <div className={`grid ${getGridCols(blockConfig.columns)} gap-1 sm:gap-2 md:gap-2 lg:gap-3`}>
          {Array.from({ length: blockConfig.kunds }, (_, kundIndex) => {
            const kund = `K${kundIndex + 1}`;
            return Array.from({ length: blockConfig.columns }, (_, colIndex) => {
              const col = colIndex + 1;
              const kundSeats = columnGroups[`${col}-${kund}`] || [];
              return (
                <div key={`${col}-${kund}`} className="aspect-square">
                  {renderKundUnit(blockConfig.id, col, kund, kundSeats)}
                </div>
              );
            });
          }).flat()}
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
          <div className="w-3 h-3 bg-gray-500 rounded border border-gray-400"></div>
          <span className="text-gray-600 font-medium">Booked</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="w-3 h-3 bg-gray-300 rounded border border-gray-300"></div>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-4 md:gap-6">
        {layoutSettings.blocks?.filter(block => block.isActive).map(blockConfig => 
          renderBlock(blockConfig, seatsByBlock[blockConfig.id] || [])
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
                  <div className=" max-w-md ">
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
                  <div className="max-w-md ">
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

      <div className="bg-rose-50 border border-rose-200 rounded-lg p-2  w-full shadow-sm">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <Info className="h-5 w-5 text-rose-500 mt-0.5" />
          </div>
          <div className="flex-1">
            <p className="text-rose-800 text-sm font-medium">
              Please scroll down to proceed to the next step
            </p>
          </div>
        </div>
      </div>


     </div>
        </div>
      )}
    </div>
  );
};

export default SeatMap;