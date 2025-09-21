"use client";
import { useShowSeatBooking } from '@/context/ShowSeatBookingContext';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Calendar, Clock, MapPin, Users, Ticket, Gift } from 'lucide-react';

export default function ShowAuditorium() {
  const { 
    seatAvailability, 
    totalCapacity,
    isSeatAvailable,
    priceSettings
  } = useShowSeatBooking();
  
  const [showSettings, setShowSettings] = useState({
    seatLayout: {
      premiumBlocks: [
        { id: 'A', name: 'Block A', maxRows:11, maxPairsPerRow: 7, price: 1200, isActive: true },
        { id: 'B', name: 'Block B', maxRows:11, maxPairsPerRow: 7, price: 1200, isActive: true }
      ],
      regularBlocks: [
        { id: 'C', name: 'Block C', maxRows: 25, maxSeatsPerRow: 15, price: 600, isActive: true },
        { id: 'D', name: 'Block D', maxRows: 25, maxSeatsPerRow: 15, price: 400, isActive: true }
      ]
    }
  });
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
        console.log('Using default settings');
      } finally {
        setLoading(false);
      }
    };
    
    fetchShowSettings();
  }, []);

  // Generate dynamic seat layout based on show settings
  const generateSeatLayout = () => {
    const seats = {};
    
    // Premium Reserved Section
    showSettings.seatLayout.premiumBlocks.forEach(block => {
      if (!block.isActive) return;
      
      for (let row = 1; row <= block.maxRows; row++) {
        for (let pairIndex = 0; pairIndex < block.maxPairsPerRow; pairIndex++) {
          const letter = String.fromCharCode(65 + pairIndex);
          
          const seatId1 = `${block.id}-R${row}-${letter}1`;
          seats[seatId1] = {
            id: seatId1,
            row: row,
            seat: `${letter}1`,
            side: block.id === 'A' ? 'LEFT' : 'RIGHT',
            type: 'RESERVED',
            section: block.id,
            capacity: 1,
            displayName: `${block.id}-R${row}-${letter}1`,
            pairLetter: letter,
            pairPosition: 1
          };
          
          const seatId2 = `${block.id}-R${row}-${letter}2`;
          seats[seatId2] = {
            id: seatId2,
            row: row,
            seat: `${letter}2`,
            side: block.id === 'A' ? 'LEFT' : 'RIGHT',
            type: 'RESERVED',
            section: block.id,
            capacity: 1,
            displayName: `${block.id}-R${row}-${letter}2`,
            pairLetter: letter,
            pairPosition: 2
          };
        }
      }
    });

    // Free Sitting Section
    showSettings.seatLayout.regularBlocks.forEach(block => {
      if (!block.isActive) return;
      
      for (let row = 1; row <= block.maxRows; row++) {
        for (let seat = 1; seat <= block.maxSeatsPerRow; seat++) {
          const seatId = `${block.id}-R${row}-S${seat}`;
          seats[seatId] = {
            id: seatId,
            row: row,
            seat: seat,
            side: block.id === 'C' ? 'LEFT' : 'RIGHT',
            type: 'FREE',
            section: block.id,
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
      bookingId: availabilityData.bookingId,
      userId: availabilityData.userId
    };
    return acc;
  }, {});

  const reservedSeats = Object.values(allSeats).filter(seat => seat.type === 'RESERVED');
  const freeSeats = Object.values(allSeats).filter(seat => seat.type === 'FREE');

  // Seat colors for static display
  const getSeatColor = (seat) => {
  if (seat.isBooked) return 'bg-red-400';
  if (seat.isBlocked) return 'bg-gray-600';
  
  // First 4 rows of A and B blocks in gray
  if ((seat.section === 'A' || seat.section === 'B') && seat.row <= 4) {
    return 'bg-gray-500';
  }
  
  if (seat.section === 'A' || seat.section === 'B') {
    return 'bg-gradient-to-br from-purple-400 to-purple-600';
  }
  if (seat.section === 'C') {
    return 'bg-gradient-to-br from-blue-400 to-blue-600';
  }
  if (seat.section === 'D') {
    return 'bg-gradient-to-br from-green-400 to-green-600';
  }
  return 'bg-gray-300';
};

  // Render Reserved section
  const renderReservedSection = () => {
    const activePremiumBlocks = showSettings.seatLayout.premiumBlocks.filter(block => block.isActive);
    const maxReservedRows = Math.max(...activePremiumBlocks.map(block => block.maxRows), 0);
    const blockASettings = activePremiumBlocks.find(block => block.id === 'A');
    const blockBSettings = activePremiumBlocks.find(block => block.id === 'B');
    
    if (!blockASettings && !blockBSettings) return null;
    
    const rows = Array.from({ length: maxReservedRows }, (_, i) => i + 1);
    const maxPairsPerRow = Math.max(
      blockASettings?.maxPairsPerRow || 0,
      blockBSettings?.maxPairsPerRow || 0
    );
    
    return (
      <div className="mb-8 md:mb-12">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 border border-purple-300 rounded-lg">
            <Ticket className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg md:text-xl font-bold text-purple-800">
              BookMyShow Reserved Seats
            </h3>
          </div>
          <p className="text-sm text-gray-600 mt-2">Premium seating with guaranteed spots</p>
        </div>
        
        <div className="flex items-center justify-center gap-6 md:gap-8 mb-6">
          {blockASettings && (
            <div className="px-4 md:px-6 py-2 rounded-lg border-2 font-semibold text-sm md:text-base bg-purple-50 border-purple-300 text-purple-800">
              {blockASettings.name}
            </div>
          )}
          <div className="w-8 md:w-12"></div>
          {blockBSettings && (
            <div className="px-4 md:px-6 py-2 rounded-lg border-2 font-semibold text-sm md:text-base bg-purple-50 border-purple-300 text-purple-800">
              {blockBSettings.name}
            </div>
          )}
        </div>
        
        <div className="space-y-2 md:space-y-3">
          {rows.map(row => {
            const aBlockSeats = reservedSeats.filter(seat => seat.section === 'A' && seat.row === row);
            const bBlockSeats = reservedSeats.filter(seat => seat.section === 'B' && seat.row === row);

            return (
              <div key={row} className="flex items-center justify-center gap-6 md:gap-8">
                {/* A Block (Left side) */}
                {blockASettings && (
                  <div className="flex gap-1">
                    {Array.from({ length: maxPairsPerRow }, (_, i) => String.fromCharCode(65 + i)).map(letter => (
                      <div key={letter} className="flex gap-0.5 mr-1 md:mr-2 p-1 rounded bg-white/10">
                        {[1, 2].map(num => {
                          const seat = aBlockSeats.find(s => s.pairLetter === letter && s.pairPosition === num);
                          if (!seat) return null;
                          
                          return (
                            <div
                              key={seat.id}
                              className={`
                                w-6 md:w-7 h-5 md:h-6 rounded-md text-xs font-bold 
                                ${getSeatColor(seat)} 
                                shadow-sm border border-purple-200 flex items-center justify-center text-white
                              `}
                              title={`${seat.displayName} - Reserved Seat`}
                            >
                              {letter}{num}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )}

                {/* Row number */}
                <div className="w-8 md:w-12 text-center text-sm md:text-lg font-bold px-2 md:px-3 py-1 rounded-lg text-purple-700 bg-purple-100">
                  R{row}
                </div>

                {/* B Block (Right side) */}
                {blockBSettings && (
                  <div className="flex gap-1">
                    {Array.from({ length: maxPairsPerRow }, (_, i) => String.fromCharCode(65 + i)).map(letter => (
                      <div key={letter} className="flex gap-0.5 mr-1 md:mr-2 p-1 rounded bg-white/10">
                        {[1, 2].map(num => {
                          const seat = bBlockSeats.find(s => s.pairLetter === letter && s.pairPosition === num);
                          if (!seat) return null;
                          
                          return (
                            <div
                              key={seat.id}
                              className={`
                                w-6 md:w-7 h-5 md:h-6 rounded-md text-xs font-bold 
                                ${getSeatColor(seat)} 
                                shadow-sm border border-purple-200 flex items-center justify-center text-white
                              `}
                              title={`${seat.displayName} - Reserved Seat`}
                            >
                              {letter}{num}
                            </div>
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

  // Render Free sitting section
  const renderFreeSittingSection = () => {
    const activeRegularBlocks = showSettings.seatLayout.regularBlocks.filter(block => block.isActive);
    const maxRegularRows = Math.max(...activeRegularBlocks.map(block => block.maxRows), 0);
    const blockCSettings = activeRegularBlocks.find(block => block.id === 'C');
    const blockDSettings = activeRegularBlocks.find(block => block.id === 'D');
    
    if (!blockCSettings && !blockDSettings) return null;
    
    const rows = Array.from({ length: maxRegularRows }, (_, i) => i + 1);

    return (
      <div>
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 border border-green-300 rounded-lg">
            <Gift className="w-5 h-5 text-green-600" />
            <h3 className="text-lg md:text-xl font-bold text-green-800">
              Free Sitting
            </h3>
          </div>
          <p className="text-sm text-gray-600 mt-2">Entry pass required • First come, first served</p>
        </div>
        
        <div className="flex items-center justify-center gap-6 md:gap-8 mb-6">
          {blockCSettings && (
            <div className="px-4 md:px-6 py-2 rounded-lg border-2 font-semibold text-sm md:text-base bg-blue-50 border-blue-300 text-blue-800">
              {blockCSettings.name}
            </div>
          )}
          <div className="w-8 md:w-10"></div>
          {blockDSettings && (
            <div className="px-4 md:px-6 py-2 rounded-lg border-2 font-semibold text-sm md:text-base bg-green-50 border-green-300 text-green-800">
              {blockDSettings.name}
            </div>
          )}
        </div>
        
        <div className="space-y-1 md:space-y-2">
          {rows.map(row => {
            const cBlockSeats = freeSeats.filter(seat => seat.section === 'C' && seat.row === row);
            const dBlockSeats = freeSeats.filter(seat => seat.section === 'D' && seat.row === row);

            return (
              <div key={row} className="flex items-center justify-center gap-6 md:gap-8">
                {/* C Block (Left side) */}
                {blockCSettings && (
                  <div className="flex gap-0.5 md:gap-1">
                    {cBlockSeats.map(seat => (
                      <div
                        key={seat.id}
                        className={`
                          w-4 md:w-6 h-4 md:h-5 rounded-md text-xs font-bold 
                          ${getSeatColor(seat)} 
                          shadow-sm border border-blue-300 flex items-center justify-center text-white
                        `}
                        title={`${seat.displayName} - Free Sitting`}
                      >
                        {seat.seat}
                      </div>
                    ))}
                  </div>
                )}

                {/* Row number */}
                <div className="w-6 md:w-10 text-center text-xs md:text-sm font-bold px-1 md:px-2 py-1 rounded text-gray-600 bg-gray-100">
                  R{row}
                </div>

                {/* D Block (Right side) */}
                {blockDSettings && (
                  <div className="flex gap-0.5 md:gap-1">
                    {dBlockSeats.map(seat => (
                      <div
                        key={seat.id}
                        className={`
                          w-4 md:w-6 h-4 md:h-5 rounded-md text-xs font-bold 
                          ${getSeatColor(seat)} 
                          shadow-sm border border-green-300 flex items-center justify-center text-white
                        `}
                        title={`${seat.displayName} - Free Sitting`}
                      >
                        {seat.seat}
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

  if (loading) {
    return (
      <div className="flex  min-h-screen bg-teal-100 items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6  border bg-white border-gray-200 shadow-lg">
        
{/* Enhanced Show Details */}
<div className="mb-8 p-6 md:p-8 rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 border-2 border-amber-200/80 shadow-xl shadow-amber-500/10 relative overflow-hidden">
  {/* Background pattern */}
  <div className="absolute inset-0 opacity-10">
    <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-orange-300 to-red-300 rounded-full blur-2xl"></div>
    <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-yellow-300 to-amber-300 rounded-full blur-2xl"></div>
  </div>
  
  <div className="relative z-10">
     {/* Main content */}
  <div className="relative z-10 max-w-4xl mx-auto text-center">
    <div className="inline-flex items-center gap-3 px-6 py-4 bg-white/90 backdrop-blur-sm border border-white/50 rounded-2xl shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition-all duration-300">
      <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-inner">
        <MapPin className="w-6 h-6 text-white" />
      </div>
      <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
        Seating Layout Overview
      </h2>
    </div>
  </div>
    {/* Header */}
    <div className="text-center mb-6">
      
      <h3 className="text-xl md:text-2xl pt-5 font-bold bg-gradient-to-r from-amber-800 to-orange-800 bg-clip-text text-transparent">
        Show Details
      </h3>
    </div>
    
    {/* Details Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
      {/* Event Dates */}
      <div className="group p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-amber-200/50 shadow-md hover:shadow-lg  transition-all duration-300">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl shadow-inner group-hover:shadow-lg transition-shadow duration-300">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">Event Dates</p>
            <p className="text-lg font-bold text-gray-900">3rd Dec - 7th Dec</p>
            <p className="text-xs text-gray-500">5 days spectacular show</p>
          </div>
        </div>
      </div>
      
      {/* Show Timings */}
      <div className="group p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-amber-200/50 shadow-md hover:shadow-lg  transition-all duration-300">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl shadow-inner group-hover:shadow-lg transition-shadow duration-300">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">Show Timings</p>
            <p className="text-lg font-bold text-gray-900">Evening 6 PM - 10 PM</p>
            <p className="text-xs text-gray-500">4 hours of entertainment</p>
          </div>
        </div>
      </div>
    </div>
    
   
  </div>
</div>



      {/* Auditorium Layout */}
      <div className="overflow-auto">
        <div className="min-w-max pb-6">
          
          {/* Stage */}
          <div className="text-center mb-8 md:mb-10">
            <div className="inline-block px-16 md:px-20 py-4 md:py-6 rounded-xl border-3 border-dashed border-yellow-500 bg-gradient-to-r from-yellow-50 via-amber-50 to-orange-50 shadow-lg">
              <div className="flex items-center justify-center gap-3">
                <span className="text-2xl md:text-3xl">🎭</span>
                <span className="text-xl md:text-2xl font-bold text-yellow-700">
                  STAGE
                </span>
                <span className="text-2xl md:text-3xl">🎪</span>
              </div>
              <div className="text-sm md:text-base mt-2 text-yellow-600 font-medium">
                Cultural Shows & Performances
              </div>
            </div>
          </div>

          {/* Reserved Section */}
          {renderReservedSection()}

          {/* Barrier between Reserved and Free */}
          <div className="flex justify-center my-6 md:my-8">
            <div className="w-3/4 h-0.5 bg-gradient-to-r from-transparent via-gray-400 to-transparent"></div>
          </div>
          <div className="text-center mb-6 md:mb-8">
            <span className="text-sm md:text-base px-4 md:px-6 py-2 rounded-full bg-gray-200 text-gray-600 font-medium">
              Barrier
            </span>
          </div>

          {/* Free Sitting Section */}
          {renderFreeSittingSection()}

        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <Users className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-blue-800 mb-1">Important Notes</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Reserved seats require BookMyShow booking</li>
              <li>• Free sitting requires entry pass and is first-come, first-served</li>
              <li>• Jagannath Katha and show time 5.30 pm to 10.30 pm </li>
              <li>• Please arrive 30 minutes before show time due to security reasons</li>
              <li>• No arms and ammunitions allowed inside the venue</li>

            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}