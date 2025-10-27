"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { useTheme } from '@/context/ThemeContext';
import { useAdmin } from '@/context/AdminContext';
import adminLogger from '@/lib/adminLogger';
import { 
  Store,
  FolderLockIcon,
  LockOpenIcon,
  EyeIcon,
  FilterIcon,
  GridIcon,
  ListIcon,
  CheckIcon,
  XIcon
} from 'lucide-react';

export default function StallManagement() {
  const { adminUser } = useAdmin();
  const { isDarkMode } = useTheme();
  
  // State management
  const [stallAvailability, setStallAvailability] = useState({});
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid, list
  const [filterStatus, setFilterStatus] = useState('all'); // all, available, booked, blocked
  const [selectedStalls, setSelectedStalls] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [stallSettings, setStallSettings] = useState({ stalls: [] }); // Add stall settings state

  // Get stalls from system settings instead of hardcoded generation
  const getAllStalls = () => {
    return stallSettings.stalls.map((stall, index) => ({
      id: stall.id,
      number: parseInt(stall.id.replace('S', '')),
      row: Math.ceil((index + 1) / 14),
      position: (index + 1) % 14 || 14,
      name: stall.name,
      price: stall.price,
      size: stall.size,
      isActive: stall.isActive
    }));
  };

  const allStalls = getAllStalls();

  // Fetch stall settings from SystemSettings
  useEffect(() => {
    const fetchStallSettings = async () => {
      try {
        const stallRef = doc(db, 'settings', 'stalls');
        const stallSnap = await getDoc(stallRef);
        if (stallSnap.exists()) {
          setStallSettings(stallSnap.data());
        } else {
          // If no settings exist, create default 70 stalls
          const defaultStalls = [];
          for (let i = 1; i <= 70; i++) {
            defaultStalls.push({
              id: `S${i}`,
              name: `Stall S${i}`,
              size: '10x10 ft',
              price: 5000,
              isActive: true
            });
          }
          const defaultSettings = {
            totalStalls: 70,
            defaultPrice: 5000,
            stalls: defaultStalls,
            eventDates: {
              startDate: '2025-11-15',
              endDate: '2025-11-20',
              isActive: true
            }
          };
          setStallSettings(defaultSettings);
          // Save default settings
          await setDoc(stallRef, defaultSettings);
        }
      } catch (error) {
        console.error('Error fetching stall settings:', error);
        toast.error('Failed to load stall settings');
      }
    };

    fetchStallSettings();
  }, []);

  // Real-time stall availability listener
  useEffect(() => {
    setLoading(true);
    
    const availabilityRef = doc(db, 'stallAvailability', 'current');
    
    const unsubscribe = onSnapshot(availabilityRef, (docSnap) => {
      try {
        if (docSnap.exists()) {
          setStallAvailability(docSnap.data().stalls || {});
        } else {
          setStallAvailability({});
        }
      } catch (error) {
        console.error('Error fetching stall availability:', error);
        toast.error('Failed to load stall availability');
      } finally {
        setLoading(false);
      }
    }, (error) => {
      console.error('Error listening to stall availability:', error);
      toast.error('Failed to load stall availability');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Get stall status
  const getStallStatus = (stallId) => {
    const availability = stallAvailability[stallId];
    if (!availability) return 'available';
    
    if (availability.blocked) return 'blocked';
    if (availability.booked) return 'booked';
    return 'available';
  };

  // Get stall info
  const getStallInfo = (stallId) => {
    const availability = stallAvailability[stallId];
    if (!availability) return null;
    
    return {
      status: getStallStatus(stallId),
      bookedBy: availability.userId,
      customerName: availability.customerName,
      bookingId: availability.bookingId,
      bookedAt: availability.bookedAt
    };
  };

  // Toggle stall selection
  const toggleStallSelection = (stallId) => {
    setSelectedStalls(prev => 
      prev.includes(stallId) 
        ? prev.filter(id => id !== stallId)
        : [...prev, stallId]
    );
  };

  // Select all filtered stalls
  const selectAllFiltered = () => {
    const eligibleStalls = filteredStalls
      .filter(stall => getStallStatus(stall.id) !== 'booked')
      .map(stall => stall.id);
    
    setSelectedStalls(eligibleStalls);
  };

  // Clear all selections
  const clearSelection = () => {
    setSelectedStalls([]);
  };

  // Bulk action handler
  const handleBulkAction = async (action) => {
    if (selectedStalls.length === 0) {
      toast.error('Please select stalls first');
      return;
    }

    // Filter out booked stalls for blocking/unblocking
    const eligibleStalls = selectedStalls.filter(stallId => {
      const status = getStallStatus(stallId);
      if (status === 'booked') {
        return false;
      }
      if (action === 'block' && status === 'blocked') {
        return false;
      }
      if (action === 'unblock' && status !== 'blocked') {
        return false;
      }
      return true;
    });

    if (eligibleStalls.length === 0) {
      toast.error(`No eligible stalls to ${action}`);
      return;
    }

    setIsUpdating(true);
    try {
      const availabilityRef = doc(db, 'stallAvailability', 'current');
      
      // First, check if document exists
      const docSnap = await getDoc(availabilityRef);
      
      let currentData = {};
      if (docSnap.exists()) {
        currentData = docSnap.data();
      }
      
      // Prepare updates
      const stalls = currentData.stalls || {};
      
      eligibleStalls.forEach(stallId => {
        if (action === 'block') {
          stalls[stallId] = {
            ...(stalls[stallId] || {}),
            blocked: true,
            blockedReason: 'Blocked by admin',
            blockedAt: new Date(),
            booked: false,
            userId: null,
            customerName: null,
            bookingId: null
          };
        } else if (action === 'unblock') {
          stalls[stallId] = {
            ...(stalls[stallId] || {}),
            blocked: false,
            blockedReason: null,
            blockedAt: null,
            booked: false,
            userId: null,
            customerName: null,
            bookingId: null
          };
        }
      });

      // Update or create the document
      const updatedData = {
        ...currentData,
        stalls,
        lastUpdated: new Date()
      };

      await setDoc(availabilityRef, updatedData, { merge: true });
      
      // Log the admin activity
      if (adminUser) {
        await adminLogger.logSettingsActivity(
          adminUser,
          action === 'block' ? 'block_stalls' : 'unblock_stalls',
          'stall_management',
          `${action === 'block' ? 'Blocked' : 'Unblocked'} ${eligibleStalls.length} stalls`
        );
      }
      
      // Update local state
      setStallAvailability(stalls);
      setSelectedStalls([]);
      toast.success(`${eligibleStalls.length} stalls ${action}ed successfully`);
    } catch (error) {
      console.error(`Error ${action}ing stalls:`, error);
      toast.error(`Failed to ${action} stalls. Please try again.`);
    } finally {
      setIsUpdating(false);
    }
  };

  // Get stall color based on status
  const getStallColor = (stallId) => {
    const status = getStallStatus(stallId);
    const isSelected = selectedStalls.includes(stallId);
    
    if (isSelected) {
      return isDarkMode 
        ? 'ring-2 ring-blue-400 bg-blue-800 text-blue-200 shadow-lg' 
        : 'ring-2 ring-blue-500 bg-blue-100 text-blue-900 shadow-lg';
    }
    if (status === 'booked') {
      return isDarkMode 
        ? 'bg-blue-600 text-blue-100 border border-blue-500' 
        : 'bg-blue-500 text-white border border-blue-400';
    }
    if (status === 'blocked') {
      return isDarkMode 
        ? 'bg-red-700 text-red-200 border border-red-600' 
        : 'bg-red-500 text-white border border-red-400';
    }
    return isDarkMode 
      ? 'bg-green-700 text-green-100 hover:bg-green-600 border border-green-600' 
      : 'bg-green-500 text-white hover:bg-green-600 border border-green-400';
  };

  // Filter stalls based on status
  const filteredStalls = allStalls.filter(stall => {
    if (filterStatus === 'all') return true;
    return getStallStatus(stall.id) === filterStatus;
  });

  // Get status counts
  const getStatusCounts = () => {
    const counts = { available: 0, booked: 0, blocked: 0 };
    allStalls.forEach(stall => {
      counts[getStallStatus(stall.id)]++;
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  // Render grid view
  const renderGridView = () => {
    return (
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border p-6`}>
        <div className="grid grid-cols-7 sm:grid-cols-14 gap-2 sm:gap-3 justify-items-center">
          {filteredStalls.map(stall => (
            <button
              key={stall.id}
              onClick={() => toggleStallSelection(stall.id)}
              disabled={getStallStatus(stall.id) === 'booked'}
              className={`
                w-10 h-10 sm:w-12 sm:h-12 flex flex-col items-center justify-center rounded-lg font-bold transition-all duration-200
                ${getStallColor(stall.id)}
                ${getStallStatus(stall.id) !== 'available' ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:shadow-lg'}
                relative
              `}
              title={`${stall.id} - ${getStallStatus(stall.id)}`}
            >
              <Store className="w-4 h-4" />
              <span className="text-xs mt-1">{stall.number}</span>
              {selectedStalls.includes(stall.id) && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                  <CheckIcon className="w-3 h-3" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Render list view
  const renderListView = () => {
    return (
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
              <tr>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  <input
                    type="checkbox"
                    checked={selectedStalls.length === filteredStalls.length && filteredStalls.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        selectAllFiltered();
                      } else {
                        clearSelection();
                      }
                    }}
                    className={`h-4 w-4 text-blue-600 focus:ring-blue-500 rounded ${
                      isDarkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'
                    }`}
                  />
                </th>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Stall ID
                </th>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Position
                </th>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Status
                </th>
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Customer Info
                </th>
              </tr>
            </thead>
            <tbody className={`${isDarkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'} divide-y`}>
              {filteredStalls.map(stall => {
                const stallInfo = getStallInfo(stall.id);
                const status = getStallStatus(stall.id);
                
                return (
                  <tr key={stall.id} className={`transition-colors duration-150 ${
                    selectedStalls.includes(stall.id) 
                      ? isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'
                      : isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                  }`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedStalls.includes(stall.id)}
                        onChange={() => toggleStallSelection(stall.id)}
                        disabled={status === 'booked'}
                        className={`h-4 w-4 text-blue-600 focus:ring-blue-500 rounded ${
                          isDarkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'
                        }`}
                      />
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {stall.id}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Row {stall.row}, Pos {stall.position}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        status === 'available' 
                          ? isDarkMode ? 'bg-green-900/50 text-green-300 border border-green-700' : 'bg-green-100 text-green-800 border border-green-200'
                          : status === 'booked' 
                          ? isDarkMode ? 'bg-blue-900/50 text-blue-300 border border-blue-700' : 'bg-blue-100 text-blue-800 border border-blue-200'
                          : isDarkMode ? 'bg-red-900/50 text-red-300 border border-red-700' : 'bg-red-100 text-red-800 border border-red-200'
                      }`}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-900'
                    }`}>
                      {stallInfo?.customerName ? (
                        <div>
                          <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {stallInfo.customerName}
                          </div>
                          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            ID: {stallInfo.bookedBy}
                          </div>
                        </div>
                      ) : (
                        <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Stall Management
          </h1>
          <p className={`mt-2 text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Manage stall availability and blocking
          </p>
        </div>
        
        {/* Book Stall Button */}
        <a
          href="/admin/stall-bookings"
          className={`inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl ${
            isDarkMode 
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white' 
              : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white'
          }`}
        >
          <Store className="w-5 h-5 mr-2" />
          Book Stall
        </a>
      </div>

      {/* Controls */}
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border p-6`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* View Mode */}
          <div>
            <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <EyeIcon className="w-5 h-5 inline mr-2" />
              View Mode
            </label>
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              className={`block w-full h-12 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="grid">Grid View</option>
              <option value="list">List View</option>
            </select>
          </div>

          {/* Filter */}
          <div>
            <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <FilterIcon className="w-5 h-5 inline mr-2" />
              Filter Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`block w-full h-12 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">All Stalls</option>
              <option value="available">Available</option>
              <option value="booked">Booked</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>

          {/* Quick Actions */}
          <div className="flex items-end gap-2">
            <button
              onClick={() => selectAllFiltered()}
              disabled={filteredStalls.length === 0}
              className={`flex-1 h-12 rounded-lg shadow-sm border font-medium transition-all duration-200 ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' 
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              } ${filteredStalls.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Select All
            </button>
            <button
              onClick={clearSelection}
              disabled={selectedStalls.length === 0}
              className={`flex-1 h-12 rounded-lg shadow-sm border font-medium transition-all duration-200 ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' 
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              } ${selectedStalls.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Clear
            </button>
          </div>
        </div>

        {/* Status Summary */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className={`${isDarkMode ? 'bg-green-900/30 border-green-700' : 'bg-green-50 border-green-200'} rounded-xl p-6 border`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                <span className={`text-sm font-semibold ${isDarkMode ? 'text-green-300' : 'text-green-800'}`}>
                  Available
                </span>
              </div>
              <div className={`text-3xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-900'}`}>
                {statusCounts.available}
              </div>
            </div>
          </div>
          <div className={`${isDarkMode ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-200'} rounded-xl p-6 border`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-blue-500 rounded-full mr-3"></div>
                <span className={`text-sm font-semibold ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                  Booked
                </span>
              </div>
              <div className={`text-3xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-900'}`}>
                {statusCounts.booked}
              </div>
            </div>
          </div>
          <div className={`${isDarkMode ? 'bg-red-900/30 border-red-700' : 'bg-red-50 border-red-200'} rounded-xl p-6 border`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-500 rounded-full mr-3"></div>
                <span className={`text-sm font-semibold ${isDarkMode ? 'text-red-300' : 'text-red-800'}`}>
                  Blocked
                </span>
              </div>
              <div className={`text-3xl font-bold ${isDarkMode ? 'text-red-400' : 'text-red-900'}`}>
                {statusCounts.blocked}
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedStalls.length > 0 && (
          <div className={`mt-6 flex flex-wrap items-center gap-4 p-6 rounded-xl border ${
            isDarkMode ? 'bg-blue-900/20 border-blue-700/50' : 'bg-blue-50 border-blue-200'
          }`}>
            <span className={`text-lg font-semibold ${
              isDarkMode ? 'text-blue-300' : 'text-blue-800'
            }`}>
              {selectedStalls.length} stalls selected
            </span>
            <div className="flex gap-3">
              <button
                onClick={() => handleBulkAction('block')}
                disabled={isUpdating}
                className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-semibold rounded-lg text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg"
              >
                {isUpdating ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <FolderLockIcon className="w-5 h-5 mr-2" />
                )}
                Block Stalls
              </button>
              <button
                onClick={() => handleBulkAction('unblock')}
                disabled={isUpdating}
                className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-semibold rounded-lg text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg"
              >
                {isUpdating ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <LockOpenIcon className="w-5 h-5 mr-2" />
                )}
                Unblock Stalls
              </button>
              <button
                onClick={clearSelection}
                className={`inline-flex items-center px-6 py-3 border text-sm font-semibold rounded-lg transition-all duration-200 hover:shadow-lg ${
                  isDarkMode 
                    ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600'
                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                }`}
              >
                Clear Selection
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Stall Display */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      ) : (
        <div> 
          {viewMode === 'grid' ? renderGridView() : renderListView()}
        </div>
      )}
    </div>
  );
}