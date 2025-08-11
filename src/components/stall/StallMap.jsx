"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { useStallBooking } from '@/context/StallBookingContext';
import { Store, ShoppingBag } from 'lucide-react';

const StallMap = () => {
  const [stallAvailability, setStallAvailability] = useState({});
  const [loading, setLoading] = useState(true);
  
  const { selectedStalls, toggleStall, priceSettings, getTotalAmount } = useStallBooking();
  
  // Generate stalls in U-shape as per drawing (no premium sections)
  const generateStalls = () => {
    const stalls = []; 
    
    // Left side: 25 stalls (S1-S25)
    for (let i = 1; i <= 25; i++) {
      stalls.push({
        id: `S${i}`,
        position: 'left',
        number: i
      });
    }
    
    // Bottom row: 20 stalls (S26-S45)
    for (let i = 26; i <= 45; i++) {
      stalls.push({
        id: `S${i}`,
        position: 'bottom',
        number: i
      });
    }
    
    // Right side: 25 stalls (S46-S70)
    for (let i = 46; i <= 70; i++) {
      stalls.push({
        id: `S${i}`,
        position: 'right',
        number: i
      });
    }
    
    return stalls;
  };

  const allStalls = generateStalls();

  // Listen to stall availability changes in real-time
  useEffect(() => {
    const availabilityRef = doc(db, 'stallAvailability', 'current');
    
    const unsubscribe = onSnapshot(availabilityRef, (docSnap) => {
      if (docSnap.exists()) {
        setStallAvailability(docSnap.data().stalls || {});
      } else {
        setStallAvailability({});
      }
      setLoading(false);
    }, (error) => {
      console.error('Error fetching stall availability:', error);
      toast.error('Failed to load stall availability');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getStallStatus = (stallId) => {
    const availability = stallAvailability[stallId];
    if (!availability) return 'available';
    
    if (availability.blocked) return 'blocked';
    if (availability.booked) return 'booked';
    return 'available';
  };

  const getStallColor = (stallId) => {
    const status = getStallStatus(stallId);
    const isSelected = selectedStalls.includes(stallId);
    
    if (isSelected) return 'bg-blue-600 text-white shadow-md border border-blue-400 ring-2 ring-blue-200';
    if (status === 'booked') return 'bg-gray-400 text-white border border-gray-300 cursor-not-allowed opacity-70';
    if (status === 'blocked') return 'bg-gray-600 text-gray-300 border border-gray-500 cursor-not-allowed opacity-70';
    return 'bg-green-500 text-white hover:bg-green-600 border border-green-400 hover:shadow-sm';
  };

  const handleStallClick = (stallId) => {
    const status = getStallStatus(stallId);
    
    if (status !== 'available' && !selectedStalls.includes(stallId)) {
      toast.error(`Stall ${stallId} is ${status}`);
      return;
    }
    
    toggleStall(stallId);
  };

  const renderStall = (stall) => {
    const isSelected = selectedStalls.includes(stall.id);
    const status = getStallStatus(stall.id);
    
    return (
      <button
        key={stall.id}
        onClick={() => handleStallClick(stall.id)}
        disabled={status !== 'available' && !isSelected}
        className={`
          relative group w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg font-bold text-xs 
          transition-all duration-200 flex flex-col items-center justify-center 
          ${getStallColor(stall.id)}
          ${(status !== 'available' && !isSelected) 
            ? 'cursor-not-allowed' 
            : 'cursor-pointer hover:scale-105 active:scale-95'}
          focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50
        `}
        title={`Stall ${stall.id} - ${status} ${isSelected ? '(Selected)' : ''}`}
      >
        {/* Stall Icon */}
        <Store className="w-3 h-3 sm:w-4 sm:h-4" />
        
        {/* Stall Number */}
        <span className="text-xs font-bold">{stall.number}</span>
        
        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md">
            ✓
          </div>
        )}
        
        {/* Hover effect overlay */}
        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-xl transition-opacity duration-200"></div>
      </button>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-96 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin animation-delay-150"></div>
        </div>
        <p className="mt-4 text-lg font-medium text-gray-600">Loading stall map...</p>
      </div>
    );
  }

  const stallsByPosition = allStalls.reduce((acc, stall) => {
    if (!acc[stall.position]) acc[stall.position] = [];
    acc[stall.position].push(stall);
    return acc;
  }, {});

  return (
    <div className="w-full space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="text-center mb-4">
        <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Choose Your Stalls</h2>
          <p className="text-sm text-gray-600 mb-3">Select multiple locations for your business</p>
          
          <div className="flex flex-wrap justify-center gap-2 text-xs">
            <div className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded-full">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              <span>Multiple Selection</span>
            </div>
            <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
              <span>₹{priceSettings.defaultStallPrice} per stall</span>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Legend */}
      <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 mb-4">
        <div className="flex flex-wrap justify-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-green-500 rounded flex items-center justify-center">
              <Store className="w-2 h-2 text-white" />
            </div>
            <span className="text-green-700">Available</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-blue-500 rounded flex items-center justify-center">
              <Store className="w-2 h-2 text-white" />
            </div>
            <span className="text-blue-700">Selected</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-gray-400 rounded flex items-center justify-center">
              <Store className="w-2 h-2 text-white" />
            </div>
            <span className="text-gray-700">Booked</span>
          </div>
        </div>
      </div>

      {/* U-Shaped Stall Layout - Compact and Clean */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 mb-4">
        <div className="relative">
          {/* Stage/Event Center */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-6 text-center">
            <div className="text-2xl mb-1">🎪</div>
            <h3 className="text-sm font-bold text-purple-800">Stage</h3>
            <p className="text-xs text-purple-600">Seating Area</p>
          </div>

          {/* U-Shape Container */}
          <div className="flex flex-col items-center gap-4">
            
            {/* Left and Right Sides */}
            <div className="flex justify-between w-full max-w-lg">
              {/* Left Side Stalls */}
              <div className="flex flex-col gap-2">
                {stallsByPosition.left?.map(stall => (
                  <div key={stall.id} className="flex justify-start">
                    {renderStall(stall)}
                  </div>
                ))}
              </div>
              
              {/* Right Side Stalls */}
              <div className="flex flex-col gap-2">
                {stallsByPosition.right?.map(stall => (
                  <div key={stall.id} className="flex justify-end">
                    {renderStall(stall)}
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Row Stalls */}
            <div className="flex flex-wrap justify-center gap-2 max-w-4xl">
              {stallsByPosition.bottom?.map(stall => renderStall(stall))}
            </div>
          </div>
        </div>
      </div>

      {/* Compact Selected Stalls Summary */}
      {selectedStalls.length > 0 && (
        <div className="bg-white border border-blue-200 rounded-xl p-4 shadow-lg sticky bottom-4 z-20">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingBag className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold text-blue-800">Selected ({selectedStalls.length})</h4>
              </div>
              
              <div className="flex flex-wrap gap-1 mb-2">
                {selectedStalls.slice(0, 8).map(stallId => (
                  <div key={stallId} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                    {stallId}
                    <button 
                      onClick={() => toggleStall(stallId)}
                      className="text-blue-600 hover:text-blue-800 font-bold text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {selectedStalls.length > 8 && (
                  <div className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium">
                    +{selectedStalls.length - 8} more
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-4 text-xs text-blue-600">
                <span>📅 5-day event</span>
                <span>🔌 Power</span>
                <span>🚿 Water</span>
              </div>
            </div>
            
            <div className="text-right bg-blue-50 rounded-lg p-3 border border-blue-200">
              <div className="text-2xl font-bold text-blue-700">₹{getTotalAmount()}</div>
              <div className="text-xs text-blue-600">
                {selectedStalls.length} × ₹{priceSettings.defaultStallPrice}
              </div>
              <div className="text-xs text-green-600 font-medium mt-1">✨ Multiple stalls</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StallMap;