"use client";
import { useState, useEffect } from 'react';
import { Store, ShoppingBag } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

const StallMap = ({ selectedStalls, onStallsSelect }) => {
  const [stallAvailability, setStallAvailability] = useState({});
  const [loading, setLoading] = useState(false);
  
  const priceSettings = { defaultStallPrice: 5000 };
  
  const toggleStall = (stallId) => {
    onStallsSelect(prev => 
      prev.includes(stallId) 
        ? prev.filter(id => id !== stallId)
        : [...prev, stallId]
    );
  };
  
  const getTotalAmount = () => {
    return selectedStalls.length * priceSettings.defaultStallPrice;
  };
  
  // Generate 70 stalls in a normal grid layout
  const generateStalls = () => {
    const stalls = []; 
    
    for (let i = 1; i <= 70; i++) {
      stalls.push({
        id: `S${i}`,
        number: i
      });
    }
    
    return stalls;
  };

  const allStalls = generateStalls();

  // Real-time stall availability listener from Firebase
  useEffect(() => {
    setLoading(true);
    
    const availabilityRef = doc(db, 'stallAvailability', 'current');
    
    const unsubscribe = onSnapshot(availabilityRef, (doc) => {
      try {
        if (doc.exists()) {
          const data = doc.data();
          console.log('StallMap: Received real-time stall availability update:', data.stalls);
          setStallAvailability(data.stalls || {});
        } else {
          // Initialize with empty availability if document doesn't exist
          console.log('StallMap: No stall availability document found, initializing empty');
          setStallAvailability({});
        }
      } catch (error) {
        console.error('Error processing stall availability:', error);
        toast.error('Failed to load stall availability');
      } finally {
        setLoading(false);
      }
    }, (error) => {
      console.error('Error listening to stall availability:', error);
      toast.error('Failed to load stall availability');
      setLoading(false);
    });

    // Cleanup subscription on unmount
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
    return 'bg-green-500 text-white hover:bg-green-600 border border-green-400 hover:shadow-sm transition-all duration-200';
  };

  const handleStallClick = (stallId) => {
    const status = getStallStatus(stallId);
    
    if (status !== 'available' && !selectedStalls.includes(stallId)) {
      alert(`Stall ${stallId} is ${status}`);
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
          relative group w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-18 lg:h-18 rounded-lg font-bold text-xs 
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
        <Store className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
        
        {/* Stall Number */}
        <span className="text-xs sm:text-sm font-bold mt-1">{stall.number}</span>
        
        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md">
            ✓
          </div>
        )}
        
        {/* Hover effect overlay */}
        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 rounded-lg transition-opacity duration-200"></div>
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
  };

  return (
    <div className="w-full space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="text-center mb-4">
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-md border border-gray-200">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Choose Your Stalls</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-3">Select multiple locations for your business (Nov 15-20, 2025)</p>
          
          <div className="flex flex-wrap justify-center gap-2 text-xs sm:text-sm">
            <div className="flex items-center gap-1 bg-green-50 text-green-700 px-3 py-2 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Multiple Selection</span>
            </div>
            <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-3 py-2 rounded-full">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>₹{priceSettings.defaultStallPrice.toLocaleString()} per stall</span>
            </div>
            <div className="flex items-center gap-1 bg-purple-50 text-purple-700 px-3 py-2 rounded-full">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>70 Total Stalls</span>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200 mb-4">
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded flex items-center justify-center">
              <Store className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
            </div>
            <span className="text-green-700 font-medium">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 sm:w-5 sm:h-5 bg-blue-500 rounded flex items-center justify-center">
              <Store className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
            </div>
            <span className="text-blue-700 font-medium">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gray-400 rounded flex items-center justify-center">
              <Store className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
            </div>
            <span className="text-gray-700 font-medium">Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 sm:w-5 sm:h-5 bg-gray-600 rounded flex items-center justify-center">
              <Store className="w-2 h-2 sm:w-3 sm:h-3 text-gray-300" />
            </div>
            <span className="text-gray-700 font-medium">Blocked</span>
          </div>
        </div>
      </div>

      {/* Main Stall Grid */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 sm:p-6 mb-4">
        <div className="mb-4 text-center">
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">Event Stalls Layout</h3>
          <p className="text-sm text-gray-600">Click on available stalls to select them</p>
        </div>

        {/* Responsive Grid Layout */}
        <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-10 lg:grid-cols-14 xl:grid-cols-14 gap-2 sm:gap-3 md:gap-4 justify-items-center max-w-7xl mx-auto">
          {allStalls.map(stall => renderStall(stall))}
        </div>

        {/* Grid Statistics */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-lg sm:text-xl font-bold text-green-700">
                {allStalls.filter(s => getStallStatus(s.id) === 'available').length}
              </div>
              <div className="text-xs sm:text-sm text-green-600">Available</div>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-lg sm:text-xl font-bold text-blue-700">{selectedStalls.length}</div>
              <div className="text-xs sm:text-sm text-blue-600">Selected</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-lg sm:text-xl font-bold text-gray-700">
                {allStalls.filter(s => getStallStatus(s.id) === 'booked').length}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Booked</div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-lg sm:text-xl font-bold text-gray-700">
                {allStalls.filter(s => getStallStatus(s.id) === 'blocked').length}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Blocked</div>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Stalls Summary */}
      {selectedStalls.length > 0 && (
        <div className="bg-white border border-blue-200 rounded-xl p-4 md:py-2 md:px-6 shadow-lg sticky bottom-4 z-20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1 w-full sm:w-auto">
              <div className="flex items-center gap-2 mb-3">
                <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                <h4 className="text-lg sm:text-xl font-semibold text-blue-800">
                  Selected Stalls ({selectedStalls.length})
                </h4>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedStalls.slice(0, 10).map(stallId => (
                  <div key={stallId} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs sm:text-sm font-medium flex items-center gap-2">
                    {stallId}
                    <button 
                      onClick={() => toggleStall(stallId)}
                      className="text-blue-600 hover:text-blue-800 font-bold text-sm hover:bg-blue-200 rounded-full w-4 h-4 flex items-center justify-center"
                      title={`Remove ${stallId}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
                {selectedStalls.length > 10 && (
                  <div className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
                    +{selectedStalls.length - 10} more
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-blue-600">
                <span className="flex items-center gap-1">📅 Nov 15-20, 2025</span>
                <span className="flex items-center gap-1">🔌 Power included</span>
                <span className="flex items-center gap-1">🚿 Water access</span>
              </div>
            </div>
            
            <div className="text-center sm:text-right bg-blue-50 rounded-lg p-2 border border-blue-200 w-full sm:w-auto">
              <div className="text-2xl sm:text-3xl font-bold text-blue-700">
                ₹{getTotalAmount().toLocaleString()}
              </div>
              <div className="text-sm text-blue-600">
                {selectedStalls.length} × ₹{priceSettings.defaultStallPrice.toLocaleString()}
              </div>
              <div className="text-sm text-green-600 font-medium mt-2">✨ Multiple stalls selected</div>
             
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StallMap;