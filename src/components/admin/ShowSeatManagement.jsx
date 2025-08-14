// src/app/admin/dashboard/show-seat-management/page.jsx
"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { 
  doc, getDoc, setDoc, updateDoc, 
  serverTimestamp, onSnapshot 
} from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { useTheme } from '@/context/ThemeContext';
import { useAdmin } from '@/context/AdminContext';
import {
  CalendarDaysIcon,
  CurrencyRupeeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  LockClosedIcon,
  LockOpenIcon,
  ViewColumnsIcon,
  ListBulletIcon,
  TicketIcon,
  UserIcon,
  TrashIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

const generateSeatLayout = () => {
  const seats = [];
  
  // VIP Section - 8 rows, 14 seats per row (7 left, 7 right) - 2 people per sofa
  for (let row = 1; row <= 8; row++) {
    // A Block (Left side)
    const leftSeats = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    leftSeats.forEach((letter) => {
      // A1 seat
      const seatIdA1 = `A-R${row}-${letter}1`;
      seats.push({
        id: seatIdA1,
        row: row,
        seat: `${letter}1`,
        side: 'LEFT',
        type: 'VIP',
        section: 'A',
        price: 1000,
        capacity: 1,
        displayName: `${letter}1`,
        pairLetter: letter,
        pairPosition: 1,
        status: 'available'
      });
      
      // A2 seat
      const seatIdA2 = `A-R${row}-${letter}2`;
      seats.push({
        id: seatIdA2,
        row: row,
        seat: `${letter}2`,
        side: 'LEFT',
        type: 'VIP',
        section: 'A',
        price: 1000,
        capacity: 1,
        displayName: `${letter}2`,
        pairLetter: letter,
        pairPosition: 2,
        status: 'available'
      });
    });
    
    // B Block (Right side)
    const rightSeats = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    rightSeats.forEach((letter) => {
      // B1 seat
      const seatIdB1 = `B-R${row}-${letter}1`;
      seats.push({
        id: seatIdB1,
        row: row,
        seat: `${letter}1`,
        side: 'RIGHT',
        type: 'VIP',
        section: 'B',
        price: 1000,
        capacity: 1,
        displayName: `${letter}1`,
        pairLetter: letter,
        pairPosition: 1,
        status: 'available'
      });
      
      // B2 seat
      const seatIdB2 = `B-R${row}-${letter}2`;
      seats.push({
        id: seatIdB2,
        row: row,
        seat: `${letter}2`,
        side: 'RIGHT',
        type: 'VIP',
        section: 'B',
        price: 1000,
        capacity: 1,
        displayName: `${letter}2`,
        pairLetter: letter,
        pairPosition: 2,
        status: 'available'
      });
    });
  }

  // Regular Section - 25 rows, 30 seats per row (15 left, 15 right)
  for (let row = 1; row <= 25; row++) {
    // C Block (Left side) - 15 seats per row, ₹1000
    for (let seat = 1; seat <= 15; seat++) {
      const seatId = `C-R${row}-S${seat}`;
      seats.push({
        id: seatId,
        row: row,
        seat: seat,
        side: 'LEFT',
        type: 'REGULAR',
        section: 'C',
        price: 1000,
        capacity: 1,
        displayName: `${seat}`,
        status: 'available'
      });
    }
    
    // D Block (Right side) - 15 seats per row, ₹500
    for (let seat = 1; seat <= 15; seat++) {
      const seatId = `D-R${row}-S${seat}`;
      seats.push({
        id: seatId,
        row: row,
        seat: seat,
        side: 'RIGHT',
        type: 'REGULAR',
        section: 'D',
        price: 500,
        capacity: 1,
        displayName: `${seat}`,
        status: 'available'
      });
    }
  }
  
  return seats;
};

export default function ShowSeatManagement() {
  const { isDarkMode } = useTheme();
  const { hasPermission, adminUser } = useAdmin();
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(null);
  const [dateLoading, setDateLoading] = useState(false);

  // Check permissions early
  if (!hasPermission('view_bookings') && !hasPermission('manage_shows')) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className={`text-center ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          <p>Access denied. You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  // Initialize seats layout
  useEffect(() => {
    const seatLayout = generateSeatLayout();
    setSeats(seatLayout);
    setLoading(false);
  }, []);

  // Memoized filtered seats for better performance
  const filteredSeats = useMemo(() => {
    return seats.filter(seat => {
      if (filterStatus === 'all') return true;
      return seat.status === filterStatus;
    });
  }, [seats, filterStatus]);

  // Memoized status counts
  const statusCounts = useMemo(() => {
    return seats.reduce((acc, seat) => {
      acc[seat.status] = (acc[seat.status] || 0) + 1;
      return acc;
    }, { available: 0, booked: 0, blocked: 0 });
  }, [seats]);

  // Handle date change with proper loading state
  const handleDateChange = useCallback((newDate) => {
    if (newDate === selectedDate) return;
    
    setDateLoading(true);
    setSelectedDate(newDate);
    setSelectedSeats([]); // Clear selection when date changes
    
    if (!newDate) {
      // Reset all seats to available when no date is selected
      setSeats(prev => prev.map(seat => ({ 
        ...seat, 
        status: 'available',
        bookingId: undefined,
        userId: undefined,
        bookedAt: undefined,
        userEmail: undefined,
        userName: undefined,
        userPhone: undefined
      })));
      setDateLoading(false);
    }
  }, [selectedDate]);

  // Real-time updates for selected date
  useEffect(() => {
    if (!selectedDate) return;
    
    const dateKey = selectedDate;
    const availabilityRef = doc(db, 'showSeatAvailability', `${dateKey}_evening`);
    
    const unsubscribe = onSnapshot(
      availabilityRef, 
      (doc) => {
        try {
          if (doc.exists()) {
            const data = doc.data();
            const seatAvailability = data.seats || {};
            
            setSeats(prev => prev.map(seat => {
              const availability = seatAvailability[seat.id];
              if (availability) {
                return {
                  ...seat,
                  status: availability.blocked ? 'blocked' : (availability.booked ? 'booked' : 'available'),
                  bookingId: availability.bookingId,
                  userId: availability.userId,
                  bookedAt: availability.bookedAt,
                  userEmail: availability.userEmail,
                  userName: availability.userName,
                  userPhone: availability.userPhone
                };
              }
              return { ...seat, status: 'available' };
            }));
          } else {
            // No availability data for this date, all seats are available
            setSeats(prev => prev.map(seat => ({ 
              ...seat, 
              status: 'available',
              bookingId: undefined,
              userId: undefined,
              bookedAt: undefined,
              userEmail: undefined,
              userName: undefined,
              userPhone: undefined
            })));
          }
        } catch (error) {
          console.error('Error processing seat availability:', error);
          toast.error('Failed to update seat availability');
        } finally {
          setDateLoading(false);
        }
      },
      (error) => {
        console.error('Error listening to seat availability:', error);
        toast.error('Failed to fetch seat availability');
        setDateLoading(false);
      }
    );
    
    return () => unsubscribe();
  }, [selectedDate]);

  const handleSeatClick = useCallback((seat) => {
    if (seat.status === 'booked') {
      // Show user details for booked seats
      setShowUserDetails({
        id: seat.id,
        userName: seat.userName || 'N/A',
        userEmail: seat.userEmail || 'N/A',
        userPhone: seat.userPhone || 'N/A',
        bookingId: seat.bookingId || 'N/A',
        bookedAt: seat.bookedAt?.toDate?.() ? 
          seat.bookedAt.toDate().toLocaleString() : 'N/A'
      });
      return;
    }
    
    setSelectedSeats(prev => 
      prev.includes(seat.id) 
        ? prev.filter(id => id !== seat.id)
        : [...prev, seat.id]
    );
  }, []);

  const handleStatusChange = useCallback(async (seatIds, newStatus) => {
    if (!selectedDate) {
      toast.error('Please select a date first');
      return;
    }
    
    try {
      setIsUpdating(true);
      const dateKey = selectedDate;
      const availabilityRef = doc(db, 'showSeatAvailability', `${dateKey}_evening`);
      
      // Get current availability
      const currentDoc = await getDoc(availabilityRef);
      const currentSeats = currentDoc.exists() ? currentDoc.data().seats || {} : {};
      
      // Prepare updates
      const updatedSeats = { ...currentSeats };
      
      seatIds.forEach(seatId => {
        if (newStatus === 'blocked') {
          updatedSeats[seatId] = {
            ...(updatedSeats[seatId] || {}),
            blocked: true,
            blockedAt: serverTimestamp(),
            blockedBy: adminUser?.uid || 'admin',
            blockedReason: 'Blocked by admin',
            booked: false,
            bookingId: null,
            userId: null,
            userEmail: null,
            userName: null,
            userPhone: null
          };
        } else if (newStatus === 'available') {
          // Remove blocked status
          if (updatedSeats[seatId] && updatedSeats[seatId].blocked) {
            delete updatedSeats[seatId].blocked;
            delete updatedSeats[seatId].blockedAt;
            delete updatedSeats[seatId].blockedBy;
            delete updatedSeats[seatId].blockedReason;
            
            // If no other status, remove the seat entry entirely
            if (Object.keys(updatedSeats[seatId]).length === 0) {
              delete updatedSeats[seatId];
            }
          }
        }
      });
      
      // Save to Firestore
      await setDoc(availabilityRef, {
        seats: updatedSeats,
        lastUpdated: serverTimestamp(),
        date: dateKey,
        shift: 'evening'
      }, { merge: true });
      
      // Clear selection
      setSelectedSeats([]);
      
      toast.success(`${seatIds.length} seats ${newStatus === 'blocked' ? 'blocked' : 'unblocked'} for ${dateKey}`);
      
    } catch (error) {
      console.error('Error updating seat status:', error);
      toast.error('Failed to update seat status');
    } finally {
      setIsUpdating(false);
    }
  }, [selectedDate, adminUser?.uid]);

  const clearSelection = useCallback(() => {
    setSelectedSeats([]);
  }, []);

  const getStatusColor = useCallback((status) => {
    switch (status) {
      case 'available': 
        return isDarkMode ? 'bg-green-800/80 text-green-100' : 'bg-green-100 text-green-800';
      case 'booked': 
        return isDarkMode ? 'bg-blue-800/80 text-blue-100' : 'bg-blue-100 text-blue-800';
      case 'blocked': 
        return isDarkMode ? 'bg-red-800/80 text-red-100' : 'bg-red-100 text-red-800';
      default: 
        return isDarkMode ? 'bg-gray-800/80 text-gray-100' : 'bg-gray-100 text-gray-800';
    }
  }, [isDarkMode]);

  const getSeatColor = useCallback((seat) => {
    if (seat.status === 'booked') 
      return isDarkMode ? 'bg-blue-700/70 text-blue-100' : 'bg-blue-500/80 text-white';
    if (seat.status === 'blocked') 
      return isDarkMode ? 'bg-red-700/70 text-red-100' : 'bg-red-500/80 text-white';
    if (selectedSeats.includes(seat.id)) 
      return isDarkMode ? 'bg-purple-600 text-purple-100' : 'bg-purple-500 text-white';
    
    if (seat.type === 'VIP') 
      return isDarkMode ? 'bg-gradient-to-br from-amber-700/80 via-yellow-700/80 to-amber-800/80 text-yellow-100' : 'bg-gradient-to-br from-amber-300 via-yellow-300 to-amber-400 text-amber-900';
    if (seat.section === 'C') 
      return isDarkMode ? 'bg-emerald-700/80 text-emerald-100' : 'bg-emerald-400 text-emerald-900';
    return isDarkMode ? 'bg-teal-700/80 text-teal-100' : 'bg-teal-400 text-teal-900';
  }, [isDarkMode, selectedSeats]);

  // Render VIP section in grid view
  const renderVIPSection = () => {
    const rows = Array.from({ length: 8 }, (_, i) => i + 1);
    
    return (
      <div className={`rounded-xl border p-3 md:p-4 mb-4 md:mb-6 ${
        isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <h3 className={`text-base md:text-lg font-bold mb-3 md:mb-4 text-center ${
          isDarkMode ? 'text-yellow-400' : 'text-amber-700'
        }`}>
          🎭 VIP Sections A & B (₹1000 per seat)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-2 md:gap-4">
          {/* A Block (Left) */}
          <div>
            <div className={`text-center mb-2 py-1 rounded-lg text-sm ${
              isDarkMode ? 'bg-amber-900/50 text-yellow-300' : 'bg-amber-100 text-amber-800'
            }`}>
              Block A
            </div>
            <div className="space-y-1 md:space-y-2">
              {rows.map(row => (
                <div key={`A-${row}`} className="flex flex-wrap justify-center gap-1">
                  {filteredSeats
                    .filter(seat => seat.section === 'A' && seat.row === row)
                    .map(seat => (
                      <button
                        key={seat.id}
                        onClick={() => handleSeatClick(seat)}
                        className={`w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded text-xs font-bold transition-all ${
                          seat.status === 'booked' ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-110'
                        } ${getSeatColor(seat)}`}
                        title={`${seat.id} - ${seat.status}`}
                      >
                        {seat.displayName}
                      </button>
                    ))}
                </div>
              ))}
            </div>
          </div>
          
          {/* Row Numbers */}
          <div className="flex flex-col items-center justify-center gap-1 md:gap-2">
            {rows.map(row => (
              <div key={`row-${row}`} className={`w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded text-xs ${
                isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
              }`}>
                {row}
              </div>
            ))}
          </div>
          
          {/* B Block (Right) */}
          <div>
            <div className={`text-center mb-2 py-1 rounded-lg text-sm ${
              isDarkMode ? 'bg-amber-900/50 text-yellow-300' : 'bg-amber-100 text-amber-800'
            }`}>
              Block B
            </div>
            <div className="space-y-1 md:space-y-2">
              {rows.map(row => (
                <div key={`B-${row}`} className="flex flex-wrap justify-center gap-1">
                  {filteredSeats
                    .filter(seat => seat.section === 'B' && seat.row === row)
                    .map(seat => (
                      <button
                        key={seat.id}
                        onClick={() => handleSeatClick(seat)}
                        className={`w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded text-xs font-bold transition-all ${
                          seat.status === 'booked' ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-110'
                        } ${getSeatColor(seat)}`}
                        title={`${seat.id} - ${seat.status}`}
                      >
                        {seat.displayName}
                      </button>
                    ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render regular section in grid view
  const renderRegularSection = () => {
    const rows = Array.from({ length: 25 }, (_, i) => i + 1);
    
    return (
      <div className={`rounded-xl border p-3 md:p-4 ${
        isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <h3 className={`text-base md:text-lg font-bold mb-3 md:mb-4 text-center ${
          isDarkMode ? 'text-emerald-400' : 'text-emerald-700'
        }`}>
          🪑 Regular Sections C (₹1000) & D (₹500)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-2 md:gap-4">
          {/* C Block (Left) */}
          <div>
            <div className={`text-center mb-2 py-1 rounded-lg text-sm ${
              isDarkMode ? 'bg-emerald-900/50 text-emerald-300' : 'bg-emerald-100 text-emerald-800'
            }`}>
              Block C (₹1000)
            </div>
            <div className="space-y-1">
              {rows.map(row => (
                <div key={`C-${row}`} className="flex flex-wrap justify-center gap-1">
                  {filteredSeats
                    .filter(seat => seat.section === 'C' && seat.row === row)
                    .map(seat => (
                      <button
                        key={seat.id}
                        onClick={() => handleSeatClick(seat)}
                        className={`w-4 h-4 md:w-6 md:h-6 flex items-center justify-center rounded text-xs font-bold transition-all ${
                          seat.status === 'booked' ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-110'
                        } ${getSeatColor(seat)}`}
                        title={`${seat.id} - ${seat.status}`}
                      >
                        {seat.displayName}
                      </button>
                    ))}
                </div>
              ))}
            </div>
          </div>
          
          {/* Row Numbers */}
          <div className="flex flex-col items-center justify-center gap-1">
            {rows.map(row => (
              <div key={`row-${row}`} className={`w-4 h-4 md:w-6 md:h-6 flex items-center justify-center rounded text-xs ${
                isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
              }`}>
                {row}
              </div>
            ))}
          </div>
          
          {/* D Block (Right) */}
          <div>
            <div className={`text-center mb-2 py-1 rounded-lg text-sm ${
              isDarkMode ? 'bg-teal-900/50 text-teal-300' : 'bg-teal-100 text-teal-800'
            }`}>
              Block D (₹500)
            </div>
            <div className="space-y-1">
              {rows.map(row => (
                <div key={`D-${row}`} className="flex flex-wrap justify-center gap-1">
                  {filteredSeats
                    .filter(seat => seat.section === 'D' && seat.row === row)
                    .map(seat => (
                      <button
                        key={seat.id}
                        onClick={() => handleSeatClick(seat)}
                        className={`w-4 h-4 md:w-6 md:h-6 flex items-center justify-center rounded text-xs font-bold transition-all ${
                          seat.status === 'booked' ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-110'
                        } ${getSeatColor(seat)}`}
                        title={`${seat.id} - ${seat.status}`}
                      >
                        {seat.displayName}
                      </button>
                    ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render list view
  const renderListView = () => {
    return (
      <div className={`rounded-xl border overflow-hidden ${
        isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
              <tr>
                <th className="px-3 md:px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
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
                    className={`rounded ${
                      isDarkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'
                    }`}
                  />
                </th>
                <th className="px-3 md:px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Seat
                </th>
                <th className="px-3 md:px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Row
                </th>
                <th className="px-3 md:px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Section
                </th>
                <th className="px-3 md:px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Type
                </th>
                <th className="px-3 md:px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Price
                </th>
                <th className="px-3 md:px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 md:px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y divide-gray-200 dark:divide-gray-700 ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              {filteredSeats.map(seat => (
                <tr key={seat.id} className={`${
                  isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'
                } ${selectedSeats.includes(seat.id) ? 
                  isDarkMode ? 'bg-purple-900/30' : 'bg-purple-50' : ''}`}>
                  <td className="px-3 md:px-4 py-3 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedSeats.includes(seat.id)}
                      onChange={() => handleSeatClick(seat)}
                      disabled={seat.status === 'booked'}
                      className={`rounded ${
                        isDarkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'
                      }`}
                    />
                  </td>
                  <td className={`px-3 md:px-4 py-3 whitespace-nowrap text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-900'
                  }`}>
                    <div className="font-medium">{seat.displayName}</div>
                    <div className="text-xs opacity-70">{seat.id}</div>
                  </td>
                  <td className={`px-3 md:px-4 py-3 whitespace-nowrap text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-900'
                  }`}>
                    R{seat.row}
                  </td>
                  <td className={`px-3 md:px-4 py-3 whitespace-nowrap text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-900'
                  }`}>
                    {seat.section}
                  </td>
                  <td className={`px-3 md:px-4 py-3 whitespace-nowrap text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-900'
                  }`}>
                    {seat.type}
                  </td>
                  <td className={`px-3 md:px-4 py-3 whitespace-nowrap text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-900'
                  }`}>
                    ₹{seat.price}
                  </td>
                  <td className="px-3 md:px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(seat.status)}`}>
                      {seat.status}
                    </span>
                  </td>
                  <td className="px-3 md:px-4 py-3 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleSeatClick(seat)}
                      className={`px-2 py-1 rounded text-xs transition-colors ${
                        selectedSeats.includes(seat.id)
                          ? isDarkMode ? 'bg-purple-800 text-purple-100' : 'bg-purple-500 text-white'
                          : isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {seat.status === 'booked' ? 'View' : 
                       selectedSeats.includes(seat.id) ? 'Selected' : 'Select'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 max-w-7xl mx-auto px-2 md:px-4 py-3 md:py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
        <div>
          <h1 className={`text-xl md:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Show Seat Management
          </h1>
          <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Manage seat availability and blocking for show events
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
            title={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
          >
            {viewMode === 'grid' ? 
              <ListBulletIcon className="w-5 h-5" /> : 
              <ViewColumnsIcon className="w-5 h-5" />
            }
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 rounded-xl p-4 md:p-6 ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } border`}>
        {/* Date Selection */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <CalendarDaysIcon className="w-4 h-4 inline mr-2" />
            Event Date
          </label>
          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              disabled={dateLoading}
              className={`block w-full p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } ${dateLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
            {dateLoading && (
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
              </div>
            )}
          </div>
        </div>

        {/* View Mode */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <EyeIcon className="w-4 h-4 inline mr-2" />
            View Mode
          </label>
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            className={`block w-full p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
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
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <FunnelIcon className="w-4 h-4 inline mr-2" />
            Filter Status
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`block w-full p-2 rounded-lg shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        <div className={`rounded-xl p-3 md:p-4 border ${
          isDarkMode ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 md:w-4 md:h-4 bg-green-500 rounded-full mr-2 md:mr-3"></div>
              <span className={`text-sm font-semibold ${isDarkMode ? 'text-green-300' : 'text-green-800'}`}>
                Available
              </span>
            </div>
            <div className={`text-xl md:text-2xl font-bold ${isDarkMode ? 'text-green-400' : 'text-green-900'}`}>
              {statusCounts.available}
            </div>
          </div>
        </div>
        
        <div className={`rounded-xl p-3 md:p-4 border ${
          isDarkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 md:w-4 md:h-4 bg-blue-500 rounded-full mr-2 md:mr-3"></div>
              <span className={`text-sm font-semibold ${isDarkMode ? 'text-blue-300' : 'text-blue-800'}`}>
                Booked
              </span>
            </div>
            <div className={`text-xl md:text-2xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-900'}`}>
              {statusCounts.booked}
            </div>
          </div>
        </div>
        
        <div className={`rounded-xl p-3 md:p-4 border ${
          isDarkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-3 h-3 md:w-4 md:h-4 bg-red-500 rounded-full mr-2 md:mr-3"></div>
              <span className={`text-sm font-semibold ${isDarkMode ? 'text-red-300' : 'text-red-800'}`}>
                Blocked
              </span>
            </div>
            <div className={`text-xl md:text-2xl font-bold ${isDarkMode ? 'text-red-400' : 'text-red-900'}`}>
              {statusCounts.blocked}
            </div>
          </div>
        </div>
      </div>

      {/* Selected Seats Actions */}
      {selectedSeats.length > 0 && (
        <div className={`rounded-xl p-3 md:p-4 border ${
          isDarkMode ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 md:gap-4">
            <div>
              <h3 className={`text-sm font-semibold mb-1 ${isDarkMode ? 'text-purple-300' : 'text-purple-800'}`}>
                Selected ({selectedSeats.length})
              </h3>
              <div className="flex flex-wrap gap-1">
                {selectedSeats.slice(0, 5).map(seatId => (
                  <span key={seatId} className={`px-2 py-1 rounded text-xs ${
                    isDarkMode ? 'bg-purple-800 text-purple-200' : 'bg-purple-200 text-purple-800'
                  }`}>
                    {seatId}
                  </span>
                ))}
                {selectedSeats.length > 5 && (
                  <span className={`text-xs ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                    +{selectedSeats.length - 5} more
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleStatusChange(selectedSeats, 'blocked')}
                disabled={isUpdating}
                className="flex items-center gap-1 px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isUpdating ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <LockClosedIcon className="w-4 h-4" />
                )}
                Block Seats
              </button>
              
              <button
                onClick={() => handleStatusChange(selectedSeats, 'available')}
                disabled={isUpdating}
                className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isUpdating ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <LockOpenIcon className="w-4 h-4" />
                )}
                Unblock Seats
              </button>
              
              <button
                onClick={clearSelection}
                className={`flex items-center gap-1 px-3 py-2 rounded text-sm transition-colors ${
                  isDarkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <TrashIcon className="w-4 h-4" />
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Seats Display */}
      {!selectedDate ? (
        <div className={`text-center py-8 md:py-12 rounded-xl border ${
          isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <CalendarDaysIcon className={`w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
          <h3 className={`text-lg md:text-xl font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-1`}>
            Select a Date
          </h3>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Choose a date to view and manage seat availability
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="space-y-4 md:space-y-6">
          <div className="text-center mb-3 md:mb-4">
            <div className={`inline-flex items-center px-4 md:px-6 py-2 md:py-3 rounded-xl text-sm md:text-base ${
              isDarkMode ? 'bg-amber-900/30 text-amber-300 border-amber-700' : 'bg-amber-100 text-amber-800 border-amber-300'
            } border`}>
              🕉️ HAVAN STAGE 🕉️
            </div>
          </div>
          
          {renderVIPSection()}
          {renderRegularSection()}
        </div>
      ) : (
        renderListView()
      )}

      {/* Legend */}
      <div className={`rounded-xl p-3 md:p-4 border ${
        isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <h3 className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Seat Status Legend
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 md:w-4 md:h-4 rounded bg-gradient-to-br from-amber-300 via-yellow-300 to-amber-400"></div>
            <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>VIP Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 md:w-4 md:h-4 rounded bg-emerald-400"></div>
            <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Block C Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 md:w-4 md:h-4 rounded bg-teal-300"></div>
            <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Block D Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 md:w-4 md:h-4 rounded bg-blue-500"></div>
            <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Booked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 md:w-4 md:h-4 rounded bg-red-500"></div>
            <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Blocked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 md:w-4 md:h-4 rounded bg-purple-500"></div>
            <span className={`text-xs ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Selected</span>
          </div>
        </div>
      </div>

      {/* User Details Modal */}
      {showUserDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl w-full max-w-md p-4 md:p-6 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Booking Details
              </h3>
              <button 
                onClick={() => setShowUserDetails(null)}
                className={`p-1 rounded-full ${
                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
                }`}
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Seat ID</p>
                <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{showUserDetails.id}</p>
              </div>
              
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Booked By</p>
                <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{showUserDetails.userName}</p>
              </div>
              
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Email</p>
                <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{showUserDetails.userEmail}</p>
              </div>
              
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Phone</p>
                <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{showUserDetails.userPhone}</p>
              </div>
              
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Booking ID</p>
                <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{showUserDetails.bookingId}</p>
              </div>
              
              <div>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Booked At</p>
                <p className={`${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{showUserDetails.bookedAt}</p>
              </div>
              
              <div className="mt-4">
                <button
                  onClick={() => setShowUserDetails(null)}
                  className={`w-full py-2 rounded-lg ${
                    isDarkMode 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}