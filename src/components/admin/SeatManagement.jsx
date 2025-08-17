"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, doc, getDoc, updateDoc, setDoc, getDocs, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { format, startOfDay, addDays } from 'date-fns';
import { formatDateKey } from '@/utils/dateUtils';
import { toast } from 'react-hot-toast';
import { useTheme } from '@/context/ThemeContext';
import { useAdmin } from '@/context/AdminContext';
import adminLogger from '@/lib/adminLogger';
import { 
  CalendarDaysIcon, 
  ClockIcon, 
  CubeIcon,
  LockClosedIcon,
  LockOpenIcon,
  EyeIcon,
  UserIcon
} from '@heroicons/react/24/outline';

export default function SeatManagement() {
  const { adminUser } = useAdmin();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedShift, setSelectedShift] = useState('morning');
  const [seatAvailability, setSeatAvailability] = useState({});
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid, list
  const [filterStatus, setFilterStatus] = useState('all'); // all, available, booked, blocked
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [layoutSettings, setLayoutSettings] = useState({
    blocks: []
  });
  const [shifts, setShifts] = useState([]);

  useEffect(() => {
    fetchSeatAvailability();
  }, [selectedDate, selectedShift]);

  // Listen for layout settings changes
  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, 'settings', 'seatLayout'),
      (docSnap) => {
        if (docSnap.exists()) {
          setLayoutSettings(docSnap.data());
        } else {
          setLayoutSettings({ blocks: [] });
        }
      },
      (error) => {
        console.error('Error listening to layout settings:', error);
        toast.error('Failed to load seat layout settings');
      }
    );

    return () => unsubscribe();
  }, []);

  // Listen for shifts changes
  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, 'settings', 'shifts'),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const activeShifts = (data.shifts || []).filter(shift => shift.isActive);
          setShifts(activeShifts);
          
          // Set default shift if none selected and shifts are available
          if (!selectedShift && activeShifts.length > 0) {
            setSelectedShift(activeShifts[0].id);
          }
        } else {
          setShifts([]);
        }
      },
      (error) => {
        console.error('Error listening to shifts:', error);
        toast.error('Failed to load shifts');
      }
    );

    return () => unsubscribe();
  }, [selectedShift]);

  // Listen for real-time seat availability changes
  useEffect(() => {
    if (!selectedDate || !selectedShift) return;
    
    const dateKey = formatDateKey(selectedDate);
    const docId = `${dateKey}_${selectedShift}`;
    
    const unsubscribe = onSnapshot(
      doc(db, 'seatAvailability', docId),
      (docSnap) => {
        if (docSnap.exists()) {
          setSeatAvailability(docSnap.data().seats || {});
        } else {
          setSeatAvailability({});
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error listening to seat availability:', error);
        toast.error('Failed to load real-time seat availability');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [selectedDate, selectedShift]);

  const generateSeats = () => {
    if (!layoutSettings.blocks || layoutSettings.blocks.length === 0) {
      return [];
    }

    const allSeats = [];
    
    layoutSettings.blocks.forEach(block => {
      if (!block.isActive) return; // Skip inactive blocks
      
      for (let col = 1; col <= block.columns; col++) {
        for (let kund = 1; kund <= block.kunds; kund++) {
          for (let seatNum = 1; seatNum <= block.seatsPerKund; seatNum++) {
            const seatId = `${block.id}${col}-K${kund}-S${seatNum}`;
            allSeats.push({
              id: seatId,
              block: block.id,
              column: col,
              kund: kund,
              seat: seatNum,
              displayName: seatId
            });
          }
        }
      }
    });
    
    return allSeats;
  };

  const allSeats = generateSeats();

  const fetchSeatAvailability = async () => {
    if (!selectedDate || !selectedShift) return;
    
    setLoading(true);
    try {
      const dateKey = formatDateKey(selectedDate);
      const availabilityRef = doc(db, 'seatAvailability', `${dateKey}_${selectedShift}`);
      const docSnap = await getDoc(availabilityRef);
      
      if (docSnap.exists()) {
        setSeatAvailability(docSnap.data().seats || {});
      } else {
        setSeatAvailability({});
      }
    } catch (error) {
      console.error('Error fetching seat availability:', error);
      toast.error('Failed to load seat availability');
    } finally {
      setLoading(false);
    }
  };

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

  const getSeatInfo = (seatId) => {
    const availability = seatAvailability[seatId];
    if (!availability) return null;
    
    return {
      status: getSeatStatus(seatId),
      bookedBy: availability.userId,
      customerName: availability.customerName,
      bookingId: availability.bookingId,
      bookedAt: availability.bookedAt,
      blockedReason: availability.blockedReason
    };
  };

  const toggleSeatSelection = (seatId) => {
    setSelectedSeats(prev => 
      prev.includes(seatId) 
        ? prev.filter(id => id !== seatId)
        : [...prev, seatId]
    );
  };

  const handleBulkAction = async (action) => {
    if (selectedSeats.length === 0) {
      toast.error('Please select seats first');
      return;
    }

    // Filter out booked seats for blocking/unblocking
    const eligibleSeats = selectedSeats.filter(seatId => {
      const status = getSeatStatus(seatId);
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

    if (eligibleSeats.length === 0) {
      toast.error(`No eligible seats to ${action}`);
      return;
    }

    setIsUpdating(true);
    try {
      const dateKey = formatDateKey(selectedDate);
      const docId = `${dateKey}_${selectedShift}`;
      const availabilityRef = doc(db, 'seatAvailability', docId);
      
      // First, check if document exists
      const docSnap = await getDoc(availabilityRef);
      
      let currentData = {};
      if (docSnap.exists()) {
        currentData = docSnap.data();
      }
      
      // Prepare updates
      const seats = currentData.seats || {};
      
      eligibleSeats.forEach(seatId => {
        if (action === 'block') {
          seats[seatId] = {
            ...(seats[seatId] || {}),
            blocked: true,
            blockedReason: 'Blocked by admin',
            blockedAt: new Date(),
            booked: false,
            userId: null,
            customerName: null,
            bookingId: null
          };
        } else if (action === 'unblock') {
          seats[seatId] = {
            ...(seats[seatId] || {}),
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
        seats,
        lastUpdated: new Date(),
        date: dateKey,
        shift: selectedShift
      };

      await setDoc(availabilityRef, updatedData, { merge: true });
      
      // Log the admin activity
      if (adminUser) {
        await adminLogger.logSettingsActivity(
          adminUser,
          action === 'block' ? 'block_seats' : 'unblock_seats',
          'seat_management',
          `${action === 'block' ? 'Blocked' : 'Unblocked'} ${eligibleSeats.length} seats for ${format(selectedDate, 'MMM dd, yyyy')} ${selectedShift} shift`
        );
      }
      
      // Update local state
      setSeatAvailability(seats);

      setSelectedSeats([]);
      toast.success(`${eligibleSeats.length} seats ${action}ed successfully`);
    } catch (error) {
      console.error(`Error ${action}ing seats:`, error);
      toast.error(`Failed to ${action} seats. Please try again.`);
    } finally {
      setIsUpdating(false);
    }
  };

  const getSeatColor = (seatId) => {
    const status = getSeatStatus(seatId);
    const isSelected = selectedSeats.includes(seatId);
    
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

  const filteredSeats = allSeats.filter(seat => {
    if (filterStatus === 'all') return true;
    return getSeatStatus(seat.id) === filterStatus;
  });

  const getStatusCounts = () => {
    const counts = { available: 0, booked: 0, blocked: 0 };
    allSeats.forEach(seat => {
      counts[getSeatStatus(seat.id)]++;
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  const renderGridView = () => {
    if (!layoutSettings.blocks || layoutSettings.blocks.length === 0) {
      return (
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-white border-gray-200 text-gray-600'} rounded-xl shadow-sm border p-12 text-center`}>
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0012 15c-2.887 0-5.438.892-7.573 2.573A8.003 8.003 0 012 12V8h20v4a8.003 8.003 0 01-2.427 5.573z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">No Seat Layout Configured</h3>
          <p className="text-sm">Please configure the seat layout in System Settings to view seats.</p>
        </div>
      );
    }

    const seatsByBlock = filteredSeats.reduce((acc, seat) => {
      if (!acc[seat.block]) acc[seat.block] = [];
      acc[seat.block].push(seat);
      return acc;
    }, {});

    // Sort blocks alphabetically to ensure consistent display order
    const sortedBlocks = [...layoutSettings.blocks]
      .filter(block => block.isActive)
      .sort((a, b) => a.id.localeCompare(b.id));

    // Group blocks into rows of 2 (A,B then C,D)
    const blockRows = [];
    for (let i = 0; i < sortedBlocks.length; i += 2) {
      blockRows.push(sortedBlocks.slice(i, i + 2));
    }

    return (
      <div className="space-y-8">
        {blockRows.map((blockRow, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {blockRow.map(block => {
              const blockSeats = seatsByBlock[block.id] || [];
              
              return (
                <div key={block.id} className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border p-4`}>
                  <h3 className={`text-lg font-bold mb-4 text-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    🏛️ Block {block.id} 🏛️
                  </h3>
                  
                  {/* Rectangular seat layout with responsive design */}
                  <div className="space-y-6">
                    {/* Create rows of kunds */}
                    {Array.from({ length: block.kunds }, (_, kundIndex) => {
                      const kund = kundIndex + 1;
                      return (
                        <div key={`kund-${kund}`} className="w-full">
                          {/* Responsive grid with proper column handling */}
                          <div 
                            className="grid gap-1 justify-items-center"
                            style={{
                              gridTemplateColumns: block.columns <= 2 
                                ? `repeat(${block.columns}, 1fr)` 
                                : block.columns <= 4 
                                ? 'repeat(2, 1fr)'
                                : 'repeat(auto-fit, minmax(90px, 1fr))'
                            }}
                          >
                            {/* Create columns for each kund */}
                            {Array.from({ length: block.columns }, (_, colIndex) => {
                              const col = colIndex + 1;
                              const kundSeats = blockSeats.filter(
                                seat => seat.kund === kund && seat.column === col
                              ).sort((a, b) => a.seat - b.seat); // Sort seats by number
                              
                              return (
                                <div 
                                  key={`col-${col}`} 
                                  className={`
                                    ${isDarkMode ? 'border-gray-600 bg-gray-700/50' : 'border-gray-300 bg-gray-100/50'} 
                                    border rounded-md py-2 w-full max-w-[100px] min-w-[80px] 
                                    hover:shadow-sm transition-all duration-200
                                  `}
                                >
                                  <div className={`text-xs text-center font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                    {block.id}{col}-K{kund}
                                  </div>
                                  
                                  {/* Seats arranged in pairs: 1,2 then 3,4 */}
                                  <div className="space-y-1">
                                    {/* Group seats into pairs and create rows */}
                                    {Array.from({ length: Math.ceil(block.seatsPerKund / 2) }, (_, pairIndex) => {
                                      const startSeat = pairIndex * 2;
                                      const seatsInThisPair = kundSeats.slice(startSeat, startSeat + 2);
                                      
                                      return (
                                        <div key={`pair-${pairIndex}`} className="flex justify-center space-x-1">
                                          {seatsInThisPair.map(seat => {
                                            const status = getSeatStatus(seat.id);
                                            return (
                                              <button
                                                key={seat.id}
                                                onClick={() => toggleSeatSelection(seat.id)}
                                                disabled={status === 'booked'}
                                                className={`
                                                  text-xs w-9 h-7 rounded font-bold transition-all duration-200 hover:scale-105 active:scale-95
                                                  ${getSeatColor(seat.id)}
                                                  ${status === 'booked' ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:shadow-sm'}
                                                `}
                                                title={`${seat.id} - ${status.toUpperCase()}${status === 'booked' && seatAvailability[seat.id]?.customerName ? ` - ${seatAvailability[seat.id].customerName}` : ''}${status === 'blocked' && seatAvailability[seat.id]?.blockedReason ? ` - ${seatAvailability[seat.id].blockedReason}` : ''}`}
                                              >
                                                {seat.seat}
                                              </button>
                                            );
                                          })}
                                          {/* Add placeholder for odd number of seats */}
                                          {seatsInThisPair.length === 1 && (
                                            <div className="w-6 h-6"></div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

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
                    checked={selectedSeats.length === filteredSeats.length && filteredSeats.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedSeats(filteredSeats.map(seat => seat.id));
                      } else {
                        setSelectedSeats([]);
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
                  Seat ID
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
                <th className={`px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  Booking Details
                </th>
              </tr>
            </thead>
            <tbody className={`${isDarkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'} divide-y`}>
              {filteredSeats.map(seat => {
                const seatInfo = getSeatInfo(seat.id);
                const status = getSeatStatus(seat.id);
                
                return (
                  <tr key={seat.id} className={`transition-colors duration-150 ${
                    selectedSeats.includes(seat.id) 
                      ? isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'
                      : isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                  }`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedSeats.includes(seat.id)}
                        onChange={() => toggleSeatSelection(seat.id)}
                        disabled={status === 'booked'}
                        className={`h-4 w-4 text-blue-600 focus:ring-blue-500 rounded ${
                          isDarkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'
                        }`}
                      />
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {seat.id}
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
                      {seatInfo?.customerName ? (
                        <div>
                          <div className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {seatInfo.customerName}
                          </div>
                          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            ID: {seatInfo.bookedBy}
                          </div>
                        </div>
                      ) : (
                        <span className={isDarkMode ? 'text-gray-500' : 'text-gray-400'}>-</span>
                      )}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {seatInfo?.bookingId ? (
                        <div>
                          <div className={`font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Booking: {seatInfo.bookingId}
                          </div>
                          {seatInfo.bookedAt && (
                            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {format(seatInfo.bookedAt.toDate(), 'MMM dd, yyyy HH:mm')}
                            </div>
                          )}
                        </div>
                      ) : seatInfo?.blockedReason ? (
                        <div className={`font-medium ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
                          {seatInfo.blockedReason}
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

  const { isDarkMode } = useTheme();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Seat Management
          </h1>
          <p className={`mt-2 text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Manage seat availability and blocking
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border p-6`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Date Selection */}
          <div>
            <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <CalendarDaysIcon className="w-5 h-5 inline mr-2" />
              Event Date
            </label>
            <input
              type="date"
              value={format(selectedDate, 'yyyy-MM-dd')}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              className={`block w-full h-12 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>

          {/* Shift Selection */}
          <div>
            <label className={`block text-sm font-medium mb-3 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <ClockIcon className="w-5 h-5 inline mr-2" />
              Shift Timing
            </label>
            <select
              value={selectedShift}
              onChange={(e) => setSelectedShift(e.target.value)}
              className={`block w-full h-12 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              {shifts.map(shift => (
                <option key={shift.id} value={shift.id}>
                  {shift.label} ({shift.timeFrom} - {shift.timeTo})
                </option>
              ))}
            </select>
          </div>

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
              <CubeIcon className="w-5 h-5 inline mr-2" />
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
              <option value="all">All Seats</option>
              <option value="available">Available</option>
              <option value="booked">Booked</option>
              <option value="blocked">Blocked</option>
            </select>
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
        {selectedSeats.length > 0 && (
          <div className={`mt-6 flex flex-wrap items-center gap-4 p-6 rounded-xl border ${
            isDarkMode ? 'bg-blue-900/20 border-blue-700/50' : 'bg-blue-50 border-blue-200'
          }`}>
            <span className={`text-lg font-semibold ${
              isDarkMode ? 'text-blue-300' : 'text-blue-800'
            }`}>
              {selectedSeats.length} seats selected
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
                  <LockClosedIcon className="w-5 h-5 mr-2" />
                )}
                Block Seats
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
                Unblock Seats
              </button>
              <button
                onClick={() => setSelectedSeats([])}
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

      {/* Seat Display */}
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
