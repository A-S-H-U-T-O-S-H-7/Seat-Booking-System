// src/app/(web)/profile/page.jsx
"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import SimpleUserProfile from '@/components/profile/SimpleUserProfile';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, getDocs, doc, runTransaction, serverTimestamp, updateDoc } from 'firebase/firestore';
import { format, differenceInDays, parseISO } from 'date-fns';
import { toast } from 'react-hot-toast';
import ShowBookingCard from '@/components/show/ShowBookingCard';
import StallBookingCard from '@/components/stall/StallBookingCard';
import DelegateCard from '@/components/profile/DelegateCard';
import ImageModal from '@/components/ImageModal';
import { useShifts } from '@/hooks/useShifts';
import { cancelBooking } from '@/utils/cancellationUtils';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [showBookings, setShowBookings] = useState([]);
  const [stallBookings, setStallBookings] = useState([]);
  const [delegateBookings, setDelegateBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingBooking, setCancellingBooking] = useState(null);
  const [activeTab, setActiveTab] = useState('havan');
  const [showEventLayoutModal, setShowEventLayoutModal] = useState(false);

  const { getShiftLabel, getShiftTime } = useShifts();

  useEffect(() => {
    if (user) {
      fetchUserBookings();
      fetchUserShowBookings();
      fetchUserStallBookings();
      fetchUserDelegateBookings();
    }
  }, [user]);

  const fetchUserBookings = async () => {
    try {
      console.log('Fetching bookings for user:', user.uid);
      
      const bookingsQuery = query(
        collection(db, 'bookings'),
        where('userId', '==', user.uid)
      );
      
      const snapshot = await getDocs(bookingsQuery);
      console.log('Found', snapshot.size, 'bookings');
      
      const bookingsData = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        console.log('Raw booking data:', data);
        console.log('Event details from data:', data.eventDetails);
        console.log('Root level fields:', {
          eventDate: data.eventDate,
          shift: data.shift,
          seats: data.seats,
          seatCount: data.seatCount
        });
        
        // Handle different date formats
        let eventDate;
        if (data.eventDetails?.date) {
          if (data.eventDetails.date.toDate && typeof data.eventDetails.date.toDate === 'function') {
            // Firestore timestamp
            eventDate = data.eventDetails.date.toDate();
          } else if (data.eventDetails.date.seconds) {
            // Firestore timestamp object (sometimes comes as plain object)
            eventDate = new Date(data.eventDetails.date.seconds * 1000);
          } else if (typeof data.eventDetails.date === 'string') {
            // ISO string
            eventDate = parseISO(data.eventDetails.date);
          } else if (data.eventDetails.date instanceof Date) {
            // Already a Date object
            eventDate = data.eventDetails.date;
          } else {
            console.warn('Unknown date format in eventDetails.date:', data.eventDetails.date);
            eventDate = new Date();
          }
        } else if (data.eventDate) {
          // Fallback to root-level eventDate (older Havan bookings)
          if (data.eventDate.toDate && typeof data.eventDate.toDate === 'function') {
            eventDate = data.eventDate.toDate();
          } else if (data.eventDate.seconds) {
            eventDate = new Date(data.eventDate.seconds * 1000);
          } else if (typeof data.eventDate === 'string') {
            eventDate = parseISO(data.eventDate);
          } else if (data.eventDate instanceof Date) {
            eventDate = data.eventDate;
          } else {
            console.warn('Unknown date format in root eventDate:', data.eventDate);
            eventDate = new Date();
          }
        } else {
          eventDate = new Date();
        }
        
        let createdDate;
        if (data.createdAt) {
          if (data.createdAt.toDate && typeof data.createdAt.toDate === 'function') {
            createdDate = data.createdAt.toDate();
          } else if (data.createdAt.seconds) {
            // Firestore timestamp object (sometimes comes as plain object)
            createdDate = new Date(data.createdAt.seconds * 1000);
          } else if (typeof data.createdAt === 'string') {
            createdDate = parseISO(data.createdAt);
          } else if (data.createdAt instanceof Date) {
            createdDate = data.createdAt;
          } else {
            createdDate = new Date();
          }
        } else {
          createdDate = new Date();
        }
        
        // Structure the data properly for Havan bookings
        const structuredData = {
          id: doc.id,
          ...data,
          createdAt: createdDate,
          eventDetails: {
            // If eventDetails already exists, use it, otherwise create from root level fields
            ...(data.eventDetails || {}),
            date: eventDate,
            // For Havan bookings, the data might be at root level
            shift: data.eventDetails?.shift || data.shift,
            seats: data.eventDetails?.seats || data.seats,
            seatCount: data.eventDetails?.seatCount || data.seatCount
          }
        };
        
        console.log('Structured booking data:', structuredData);
        console.log('Shift value in structured data:', structuredData.eventDetails?.shift);
        console.log('Seat count in structured data:', structuredData.eventDetails?.seatCount);
        console.log('Seats array in structured data:', structuredData.eventDetails?.seats);
        bookingsData.push(structuredData);
      });
      
      // Sort by creation date (newest first)
      bookingsData.sort((a, b) => b.createdAt - a.createdAt);
      
      console.log('Processed bookings:', bookingsData);
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load booking history');
    }
  };

  const fetchUserShowBookings = async () => {
    try {
      console.log('Fetching show bookings for user:', user.uid);
      
      const showBookingsQuery = query(
        collection(db, 'showBookings'),
        where('userId', '==', user.uid)
      );
      
      const snapshot = await getDocs(showBookingsQuery);
      console.log('Found', snapshot.size, 'show bookings');
      
      const showBookingsData = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        console.log('Show booking data:', data);
        
        // Handle different date formats for show date
        let showDate;
        if (data.showDetails?.date) {
          if (typeof data.showDetails.date === 'string') {
            showDate = parseISO(data.showDetails.date);
          } else if (data.showDetails.date.toDate && typeof data.showDetails.date.toDate === 'function') {
            showDate = data.showDetails.date.toDate();
          } else if (data.showDetails.date.seconds) {
            showDate = new Date(data.showDetails.date.seconds * 1000);
          } else {
            showDate = new Date();
          }
        } else {
          showDate = new Date();
        }
        
        let createdDate;
        if (data.createdAt) {
          if (data.createdAt.toDate && typeof data.createdAt.toDate === 'function') {
            createdDate = data.createdAt.toDate();
          } else if (data.createdAt.seconds) {
            createdDate = new Date(data.createdAt.seconds * 1000);
          } else if (typeof data.createdAt === 'string') {
            createdDate = parseISO(data.createdAt);
          } else if (data.createdAt instanceof Date) {
            createdDate = data.createdAt;
          } else {
            createdDate = new Date();
          }
        } else {
          createdDate = new Date();
        }
        
        showBookingsData.push({
          id: doc.id,
          ...data,
          createdAt: createdDate,
          showDetails: {
            ...data.showDetails,
            date: showDate
          },
          type: 'show' // Add type identifier
        });
      });
      
      // Sort by creation date (newest first)
      showBookingsData.sort((a, b) => b.createdAt - a.createdAt);
      
      console.log('Processed show bookings:', showBookingsData);
      setShowBookings(showBookingsData);
    } catch (error) {
      console.error('Error fetching show bookings:', error);
      toast.error('Failed to load show booking history');
    }
  };

  const fetchUserStallBookings = async () => {
    try {
      console.log('Fetching stall bookings for user:', user.uid);
      
      const stallBookingsQuery = query(
        collection(db, 'stallBookings'),
        where('userId', '==', user.uid)
      );
      
      const snapshot = await getDocs(stallBookingsQuery);
      console.log('Found', snapshot.size, 'stall bookings');
      
      const stallBookingsData = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        console.log('Stall booking data:', data);
        
        // Handle different date formats for event dates
        let startDate, endDate;
        if (data.eventDetails?.startDate) {
          if (data.eventDetails.startDate.toDate && typeof data.eventDetails.startDate.toDate === 'function') {
            startDate = data.eventDetails.startDate.toDate();
          } else if (data.eventDetails.startDate.seconds) {
            startDate = new Date(data.eventDetails.startDate.seconds * 1000);
          } else if (data.eventDetails.startDate instanceof Date) {
            startDate = data.eventDetails.startDate;
          } else {
            startDate = new Date(data.eventDetails.startDate);
          }
        } else {
          startDate = new Date('2025-11-15');
        }
        
        if (data.eventDetails?.endDate) {
          if (data.eventDetails.endDate.toDate && typeof data.eventDetails.endDate.toDate === 'function') {
            endDate = data.eventDetails.endDate.toDate();
          } else if (data.eventDetails.endDate.seconds) {
            endDate = new Date(data.eventDetails.endDate.seconds * 1000);
          } else if (data.eventDetails.endDate instanceof Date) {
            endDate = data.eventDetails.endDate;
          } else {
            endDate = new Date(data.eventDetails.endDate);
          }
        } else {
          endDate = new Date('2025-11-20');
        }
        
        let createdDate;
        if (data.createdAt) {
          if (data.createdAt.toDate && typeof data.createdAt.toDate === 'function') {
            createdDate = data.createdAt.toDate();
          } else if (data.createdAt.seconds) {
            createdDate = new Date(data.createdAt.seconds * 1000);
          } else if (typeof data.createdAt === 'string') {
            createdDate = parseISO(data.createdAt);
          } else if (data.createdAt instanceof Date) {
            createdDate = data.createdAt;
          } else {
            createdDate = new Date();
          }
        } else {
          createdDate = new Date();
        }
        
        stallBookingsData.push({
          id: doc.id,
          ...data,
          createdAt: createdDate,
          eventDetails: {
            ...data.eventDetails,
            startDate,
            endDate
          },
          type: 'stall' // Add type identifier
        });
      });
      
      // Sort by creation date (newest first)
      stallBookingsData.sort((a, b) => b.createdAt - a.createdAt);
      
      console.log('Processed stall bookings:', stallBookingsData);
      setStallBookings(stallBookingsData);
    } catch (error) {
      console.error('Error fetching stall bookings:', error);
      toast.error('Failed to load stall booking history');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDelegateBookings = async () => {
    try {
      console.log('Fetching delegate bookings for user:', user.uid);
      
      const delegateBookingsQuery = query(
        collection(db, 'delegateBookings'),
        where('userId', '==', user.uid)
      );
      
      const snapshot = await getDocs(delegateBookingsQuery);
      console.log('Found', snapshot.size, 'delegate bookings');
      
      const delegateBookingsData = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        console.log('Delegate booking data:', data);
        
        let createdDate;
        if (data.createdAt) {
          if (data.createdAt.toDate && typeof data.createdAt.toDate === 'function') {
            createdDate = data.createdAt.toDate();
          } else if (data.createdAt.seconds) {
            createdDate = new Date(data.createdAt.seconds * 1000);
          } else if (typeof data.createdAt === 'string') {
            createdDate = parseISO(data.createdAt);
          } else if (data.createdAt instanceof Date) {
            createdDate = data.createdAt;
          } else {
            createdDate = new Date();
          }
        } else {
          createdDate = new Date();
        }
        
        delegateBookingsData.push({
          id: doc.id,
          ...data,
          createdAt: createdDate,
          type: 'delegate' // Add type identifier
        });
      });
      
      // Sort by creation date (newest first)
      delegateBookingsData.sort((a, b) => b.createdAt - a.createdAt);
      
      console.log('Processed delegate bookings:', delegateBookingsData);
      setDelegateBookings(delegateBookingsData);
    } catch (error) {
      console.error('Error fetching delegate bookings:', error);
      toast.error('Failed to load delegate booking history');
    }
  };


  const canCancelBooking = (eventDate) => {
    const today = new Date();
    const daysUntilEvent = differenceInDays(eventDate, today);
    return daysUntilEvent >= 15;
  };

  const refreshBookings = () => {
    if (activeTab === 'havan') {
      fetchUserBookings();
    } else if (activeTab === 'show') {
      fetchUserShowBookings();
    } else if (activeTab === 'stall') {
      fetchUserStallBookings();
    } else if (activeTab === 'delegates') {
      fetchUserDelegateBookings();
    }
  };

  const renderBookingCard = (booking) => {
    return (
      <div 
        key={booking.id} 
        className={`border rounded-xl p-3 sm:p-6 transform hover:scale-[1.02] transition-all duration-200 ${
          booking.status === 'cancelled' 
            ? 'border-red-200 bg-red-50 shadow-md' 
            : 'border-gray-200 bg-white shadow-lg hover:shadow-xl'
        }`}
      >
        {/* Mobile-first layout */}
        <div className="space-y-4">
          {/* Status and ID Row */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${
                booking.status === 'confirmed' 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : booking.status === 'cancelled'
                  ? 'bg-red-100 text-red-800 border border-red-200'
                  : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
              }`}>
                {booking.status === 'confirmed' ? '✓ Confirmed' : 
                 booking.status === 'cancelled' ? '✗ Cancelled' : 
                 booking.status}
              </span>
            </div>
            <span className="text-xs sm:text-sm text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
              ID: {booking.id || booking.bookingId || 'N/A'}
            </span>
          </div>
          
          {/* Main booking details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
              <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide mb-1">Event Date</p>
              <p className="text-sm font-bold text-gray-900 leading-tight">
                {booking.eventDetails?.date ? format(booking.eventDetails.date, 'MMM dd, yyyy') : 'N/A'}
              </p>
              <p className="text-xs text-gray-600">
                {booking.eventDetails?.date ? format(booking.eventDetails.date, 'EEEE') : 'N/A'}
              </p>
            </div>
            
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">Session</p>
              <p className="text-sm font-bold text-gray-900">
                {getShiftLabel(booking.eventDetails.shift) || 'N/A'}
              </p>
              <p className="text-xs text-gray-600">
                {getShiftTime(booking.eventDetails.shift) || 'N/A'}
              </p>
            </div>
            
            <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
              <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-1">Seats</p>
              <p className="text-sm font-bold text-gray-900">
                {booking.eventDetails?.seatCount || 0} seat{(booking.eventDetails?.seatCount || 0) > 1 ? 's' : ''}
              </p>
              <p className="text-xs text-gray-600 truncate">
                {(booking.eventDetails?.seats || []).join(', ') || 'No seats specified'}
              </p>
            </div>
            
            <div className="bg-green-50 p-3 rounded-lg border border-green-100">
              <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1">Amount Paid</p>
              <p className="text-lg font-bold text-green-600">
                ₹{booking.payment?.amount || 0}
              </p>
            </div>
          </div>

          {/* Footer with booking info and action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 border-t border-gray-200 gap-3">
            <div className="text-xs text-gray-500 space-y-1">
              <p>🕐 Reserved: {format(booking.createdAt, 'MMM dd, yyyy \'at\' hh:mm a')}</p>
              {/* {booking.customerDetails && (
                <p>📞 Contact: {booking.customerDetails.phone}</p>
              )} */}
            </div>

            {/* {booking.status === 'confirmed' && (
              <div className="flex flex-col sm:flex-row items-center gap-2">
                {canCancelBooking(booking.eventDetails?.date) ? (
                  <div className="text-center">
                    <button
                      onClick={async () => {
                        const eventDate = booking.eventDetails?.date;
                        const daysUntilEvent = eventDate ? differenceInDays(eventDate, new Date()) : 0;
                        
                        if (daysUntilEvent < 15) {
                          toast.error('Cancellation is only allowed 15+ days before the event date');
                          return;
                        }
                        
                        if (window.confirm(`Are you sure you want to cancel this Havan booking?\n\nBooking Details:\n• Date: ${eventDate ? format(eventDate, 'MMMM dd, yyyy') : 'N/A'}\n• Seats: ${(booking.eventDetails?.seats || []).join(', ')}\n• Amount: ₹${booking.payment?.amount || 0}\n\nThis action cannot be undone and a full refund will be processed within 5-7 business days.`)) {
                          setCancellingBooking(booking.id);
                          try {
                            const result = await cancelBooking(
                              booking,
                              'User requested cancellation - 15+ days before event',
                              { uid: user?.uid, name: user?.displayName || user?.email, email: user?.email, isAdmin: false },
                              true // Release seats back to availability
                            );
                            
                            if (result.success) {
                              toast.success('✅ Havan booking cancelled successfully! Your refund will be processed within 5-7 business days.');
                              fetchUserBookings(); // Refresh bookings to show updated status
                            } else {
                              toast.error(result.error || 'Failed to cancel Havan booking. Please try again.');
                            }
                          } catch (error) {
                            toast.error('Error cancelling Havan booking. Please contact support.');
                            console.error('Havan cancellation error:', error);
                          } finally {
                            setCancellingBooking(null);
                          }
                        }
                      }}
                      disabled={cancellingBooking === booking.id}
                      className={`${cancellingBooking === booking.id ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-600'} bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-md min-w-[100px]`}
                    >
                      {cancellingBooking === booking.id ? 'Cancelling...' : 'Cancel Booking'}
                    </button>
                    <p className="text-xs text-green-600 mt-1 font-medium">
                      ✓ Free cancellation ({booking.eventDetails?.date ? differenceInDays(booking.eventDetails.date, new Date()) : 0} days left)
                    </p>
                  </div>
                ) : (
                  <div className="text-center">
                    <button
                      disabled
                      className="bg-gray-300 text-gray-500 px-4 py-2 rounded-lg text-sm cursor-not-allowed min-w-[100px]"
                    >
                      Cannot Cancel
                    </button>
                    <p className="text-xs text-red-500 mt-1">
                      ❌ Only {booking.eventDetails?.date ? differenceInDays(booking.eventDetails.date, new Date()) : 0} days left (15+ required)
                    </p>
                  </div>
                )}
              </div>
            )} */}
          </div>
        </div>
      </div>
    );
  };

  const renderShowBookingCard = (booking) => {
    return <ShowBookingCard key={booking.id} booking={booking} onCancel={() => {
      // Refresh show bookings after cancellation
      setTimeout(() => {
        fetchUserShowBookings();
      }, 1000);
    }} />;
  };

  const renderStallBookingCard = (booking) => {
    return <StallBookingCard key={booking.id} booking={booking} onCancel={() => {
      // Refresh stall bookings after cancellation
      setTimeout(() => {
        fetchUserStallBookings();
      }, 1000);
    }} />;
  };

  const renderDelegateBookingCard = (booking) => {
    return <DelegateCard key={booking.id} booking={booking} />;
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your profile...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50">
        {/* Header */}
        <header className="bg-white/95 backdrop-blur-sm shadow-lg sticky top-0 z-50 border-b border-orange-100">
          <div className="px-2 sm:px-6  py-3 sm:py-4">
            <div className="flex justify-between items-center">
              <Link href="/" className="flex items-center gap-3">
               <div className="flex items-center pr-2">
            <img 
              src="/header-logo.png" 
              alt="Havan Logo" 
              
            />
            
          </div>
              </Link>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowEventLayoutModal(true)}
                  className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                  <span className="hidden sm:inline">Event Layout</span>
                </button>
                
                <button
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white px-4 py-2 rounded-lg text-sm font-medium transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Simple Profile Information */}
          <div className="mb-8">
            <SimpleUserProfile user={user} />
          </div>

          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Booking History */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-lg p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                  <h3 className="text-xl font-bold text-gray-800">Your Reservations</h3>
                  
                  {/* Tab Navigation */}
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setActiveTab('havan')}
                      className={`flex-1 px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                        activeTab === 'havan'
                          ? 'bg-white text-orange-600 shadow-sm'
                          : 'text-gray-600 hover:text-orange-600'
                      }`}
                    >
                      Havan ({bookings.length})
                    </button>
                    <button
                      onClick={() => setActiveTab('show')}
                      className={`flex-1 px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                        activeTab === 'show'
                          ? 'bg-white text-purple-600 shadow-sm'
                          : 'text-gray-600 hover:text-purple-600'
                      }`}
                    >
                      Shows ({showBookings.length})
                    </button>
                    <button
                      onClick={() => setActiveTab('stall')}
                      className={`flex-1 px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                        activeTab === 'stall'
                          ? 'bg-white text-green-600 shadow-sm'
                          : 'text-gray-600 hover:text-green-600'
                      }`}
                    >
                      Stalls ({stallBookings.length})
                    </button>
                    <button
                      onClick={() => setActiveTab('delegates')}
                      className={`flex-1 px-3 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                        activeTab === 'delegates'
                          ? 'bg-white text-emerald-600 shadow-sm'
                          : 'text-gray-600 hover:text-emerald-600'
                      }`}
                    >
                      Delegates ({delegateBookings.length})
                    </button>
                  </div>
                </div>

                {/* Render bookings based on active tab */}
                {activeTab === 'havan' ? (
                  bookings.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl text-gray-400">🎫</span>
                      </div>
                      <h4 className="text-lg font-medium text-gray-500 mb-2">No Havan reservations yet</h4>
                      <p className="text-gray-400 mb-4">Reserve your first seat for the sacred Havan ceremony</p>
                      <Link
                        href="/booking"
                        className="inline-block bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white px-6 py-3 rounded-lg font-medium transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        Reserve Havan Spots
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {bookings.map((booking) => renderBookingCard(booking))}
                    </div>
                  )
                ) : activeTab === 'show' ? (
                  showBookings.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl text-gray-400">🎭</span>
                      </div>
                      <h4 className="text-lg font-medium text-gray-500 mb-2">No Show reservations yet</h4>
                      <p className="text-gray-400 mb-4">Reserve your first seat for cultural shows and performances</p>
                      <Link
                        href="/booking/show"
                        className="inline-block bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-medium transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        Reserve Show Spots
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {showBookings.map((booking) => renderShowBookingCard(booking))}
                    </div>
                  )
                ) : activeTab === 'stall' ? (
                  stallBookings.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl text-gray-400">🏪</span>
                      </div>
                      <h4 className="text-lg font-medium text-gray-500 mb-2">No Stall reservations yet</h4>
                      <p className="text-gray-400 mb-4">Reserve your first stall for business opportunities</p>
                      <Link
                        href="/booking/stall"
                        className="inline-block bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-medium transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        Reserve Stalls
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {stallBookings.map((booking) => renderStallBookingCard(booking))}
                    </div>
                  )
                ) : activeTab === 'delegates' ? (
                  delegateBookings.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl text-gray-400">🎓</span>
                      </div>
                      <h4 className="text-lg font-medium text-gray-500 mb-2">No Delegate registrations yet</h4>
                      <p className="text-gray-400 mb-4">Register as a delegate for the event</p>
                      <Link
                        href="/booking/delegate"
                        className="inline-block bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 py-3 rounded-lg font-medium transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        Register as Delegate
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {delegateBookings.map((booking) => renderDelegateBookingCard(booking))}
                    </div>
                  )
                ) : null}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link
                    href="/booking"
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white px-4 py-3 rounded-lg font-medium transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg text-center block"
                  >
                    🎫 Reserve Havan Spot
                  </Link>
                  <Link
                    href="/booking/show"
                    className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-4 py-3 rounded-lg font-medium transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg text-center block"
                  >
                    🎭 Reserve Show Spot
                  </Link>
                  <Link
                    href="/booking/stall"
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-3 rounded-lg font-medium transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg text-center block"
                  >
                    🏪 Reserve Your Stall
                  </Link>
                  <Link
                    href="/booking/delegate"
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-4 py-3 rounded-lg font-medium transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg text-center block"
                  >
                    🎓 Register as Delegate
                  </Link>
                  <button
                    onClick={refreshBookings}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-medium transition-colors duration-200"
                  >
                    🔄 Refresh Reservations
                  </button>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Contact Support</h3>
                <div className="space-y-4 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600">📞</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Phone Support</p>
                      <p className="text-gray-600">+91 730 339 7090</p>
                      <p className="text-gray-600">0120-4348458</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600">✉️</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Email Support</p>
                      <p className="text-gray-600">info@svsamiti.com</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-600">🌐</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Website</p>
                      <p className="text-gray-600">www.svsamiti.com</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 leading-relaxed">
                      For reservation-related queries, please contact us with your Reservation ID. 
                      Support is available Monday to Saturday, 9 AM to 6 PM.
                    </p>
                  </div>
                </div>
              </div>

              
            </div>
          </div>
        </div>

        {/* Event Layout Modal */}
        <ImageModal
          show={showEventLayoutModal}
          onClose={() => setShowEventLayoutModal(false)}
          imageSrc="/eventlayout2.jpg"
          imageAlt="Event Layout"
          title="Event Layout"
        />
      </div>
    </ProtectedRoute>
  );
};

export default ProfilePage;
