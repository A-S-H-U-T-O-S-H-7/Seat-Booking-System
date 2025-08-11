// src/app/(web)/profile/page.jsx
"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, getDocs, doc, runTransaction, serverTimestamp } from 'firebase/firestore';
import { format, differenceInDays, parseISO } from 'date-fns';
import { toast } from 'react-hot-toast';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingBooking, setCancellingBooking] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);

  useEffect(() => {
    if (user) {
      fetchUserBookings();
    }
  }, [user]);

  const fetchUserBookings = async () => {
    try {
      setLoading(true);
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
        console.log('Booking data:', data);
        
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
            console.warn('Unknown date format:', data.eventDetails.date);
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
        
        bookingsData.push({
          id: doc.id,
          ...data,
          createdAt: createdDate,
          eventDetails: {
            ...data.eventDetails,
            date: eventDate
          }
        });
      });
      
      // Sort by creation date (newest first)
      bookingsData.sort((a, b) => b.createdAt - a.createdAt);
      
      console.log('Processed bookings:', bookingsData);
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load booking history');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (booking) => {
    const eventDate = booking.eventDetails.date;
    const today = new Date();
    const daysUntilEvent = differenceInDays(eventDate, today);
    
    if (daysUntilEvent < 15) {
      toast.error('Cancellation is only allowed 15+ days before the event');
      return;
    }

    // Show confirmation modal
    setBookingToCancel(booking);
    setShowCancelModal(true);
  };

  const confirmCancelBooking = async () => {
    if (!bookingToCancel) return;

    setCancellingBooking(bookingToCancel.id);
    setShowCancelModal(false);
    
    try {
      await runTransaction(db, async (transaction) => {
        // First, do all the reads
        const dateKey = bookingToCancel.eventDetails.date.toISOString().split('T')[0];
        const availabilityRef = doc(db, 'seatAvailability', `${dateKey}_${bookingToCancel.eventDetails.shift}`);
        const availabilityDoc = await transaction.get(availabilityRef);
        
        // Then do all the writes
        // Update booking status
        const bookingRef = doc(db, 'bookings', bookingToCancel.id);
        transaction.update(bookingRef, {
          status: 'cancelled',
          cancelledAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        // Release seats
        if (availabilityDoc.exists()) {
          const currentAvailability = availabilityDoc.data().seats || {};
          const updatedAvailability = { ...currentAvailability };
          
          bookingToCancel.eventDetails.seats.forEach(seatId => {
            delete updatedAvailability[seatId];
          });

          transaction.update(availabilityRef, {
            seats: updatedAvailability,
            updatedAt: serverTimestamp()
          });
        }
      });

      toast.success('Booking cancelled successfully. Refund will be processed within 5-7 business days.');
      fetchUserBookings(); // Refresh bookings
      
    } catch (error) {
      console.error('Cancellation failed:', error);
      toast.error('Failed to cancel booking. Please try again.');
    } finally {
      setCancellingBooking(null);
      setBookingToCancel(null);
    }
  };

  const canCancelBooking = (eventDate) => {
    const today = new Date();
    const daysUntilEvent = differenceInDays(eventDate, today);
    return daysUntilEvent >= 15;
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
                <img 
                  src="/havan.jpg" 
                  alt="Havan Logo" 
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover shadow-md"
                />
                <h1 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold bg-gradient-to-r from-orange-600 via-red-500 to-yellow-600 bg-clip-text text-transparent">
                  Havan Ceremony
                </h1>
              </Link>
              
              <div className="flex items-center gap-4">
                
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
          {/* Profile Header */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center gap-4">
              <div className=" w-10 h-10 md:w-16 md:h-16 bg-gradient-to-r from-orange-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-2xl text-white font-bold">
                  {user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">Welcome </h2>
                <p className="text-gray-600 text-sm md:text-md">{user?.email}</p>
                
              </div>
            </div>
          </div>

          {/* Debug Component - Remove in production
          <DebugBookings /> */}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Booking History */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg p-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-800">Your Bookings</h3>
                  {bookings.length > 0 && (
                    <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                      {bookings.length} booking{bookings.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {bookings.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl text-gray-400">🎫</span>
                    </div>
                    <h4 className="text-lg font-medium text-gray-500 mb-2">No bookings yet</h4>
                    <p className="text-gray-400 mb-4">Book your first seat for the sacred Havan ceremony</p>
                    <Link
                      href="/booking"
                      className="inline-block bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white px-6 py-3 rounded-lg font-medium transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      Book Now
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
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
                              ID: {booking.bookingId}
                            </span>
                          </div>
                          
                          {/* Main booking details */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
                              <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide mb-1">Event Date</p>
                              <p className="text-sm font-bold text-gray-900 leading-tight">
                                {format(booking.eventDetails.date, 'MMM dd, yyyy')}
                              </p>
                              <p className="text-xs text-gray-600">
                                {format(booking.eventDetails.date, 'EEEE')}
                              </p>
                            </div>
                            
                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">Session</p>
                              <p className="text-sm font-bold text-gray-900">
                                {booking.eventDetails.shift === 'morning' ? 'Morning' : 'Afternoon'}
                              </p>
                              <p className="text-xs text-gray-600">
                                {booking.eventDetails.shift === 'morning' 
                                  ? '9:00 AM - 12:00 PM' 
                                  : '2:00 PM - 5:00 PM'}
                              </p>
                            </div>
                            
                            <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                              <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-1">Seats</p>
                              <p className="text-sm font-bold text-gray-900">
                                {booking.eventDetails.seatCount} seat{booking.eventDetails.seatCount > 1 ? 's' : ''}
                              </p>
                              <p className="text-xs text-gray-600 truncate">
                                {booking.eventDetails.seats.join(', ')}
                              </p>
                            </div>
                            
                            <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                              <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1">Amount Paid</p>
                              <p className="text-lg font-bold text-green-600">
                                ₹{booking.payment.amount}
                              </p>
                            </div>
                          </div>

                          {/* Footer with booking info and action */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-3 border-t border-gray-200 gap-3">
                            <div className="text-xs text-gray-500 space-y-1">
                              <p>🕐 Booked: {format(booking.createdAt, 'MMM dd, yyyy \\at hh:mm a')}</p>
                              {booking.customerDetails && (
                                <p>📞 Contact: {booking.customerDetails.phone}</p>
                              )}
                            </div>

                            {booking.status === 'confirmed' && (
                              <div className="flex flex-col sm:flex-row items-center gap-2">
                                {canCancelBooking(booking.eventDetails.date) ? (
                                  <div className="text-center">
                                    <button
                                      onClick={() => handleCancelBooking(booking)}
                                      disabled={cancellingBooking === booking.id}
                                      className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-md disabled:transform-none min-w-[100px]"
                                    >
                                      {cancellingBooking === booking.id ? (
                                        <span className="flex items-center justify-center">
                                          <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                          </svg>
                                          Cancelling...
                                        </span>
                                      ) : 'Cancel Booking'}
                                    </button>
                                    <p className="text-xs text-green-600 mt-1 font-medium">
                                      ✓ Free cancellation
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
                                      Only {differenceInDays(booking.eventDetails.date, new Date())} days left
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Contact Info & Quick Actions */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link
                    href="/booking"
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white px-4 py-3 rounded-lg font-medium transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg text-center block"
                  >
                    🎫 Book More Seats
                  </Link>
                  <button
                    onClick={fetchUserBookings}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-medium transition-colors duration-200"
                  >
                    🔄 Refresh Bookings
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
                      For booking-related queries, please contact us with your Booking ID. 
                      Support is available Monday to Saturday, 9 AM to 6 PM.
                    </p>
                  </div>
                </div>
              </div>

              {/* Important Notes */}
              <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 mb-2">Important Notes</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Free cancellation up to 15 days before event</li>
                  <li>• Confirmation email sent to registered address</li>
                  <li>• Arrive 30 minutes before ceremony time</li>
                  <li>• Refunds processed within 5-7 business days</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Cancel Confirmation Modal */}
        {showCancelModal && bookingToCancel && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[100]">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
              <div className="p-6">
                {/* Modal Header */}
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 15.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
                  Cancel Booking?
                </h3>
                
                <p className="text-sm text-gray-600 text-center mb-6">
                  Are you sure you want to cancel your booking for <strong>{format(bookingToCancel.eventDetails.date, 'MMMM dd, yyyy')}</strong>? 
                  This action cannot be undone.
                </p>

                {/* Booking Details Summary */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="font-medium text-gray-700">Booking ID:</span>
                      <p className="text-gray-900">{bookingToCancel.bookingId}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Amount:</span>
                      <p className="text-gray-900 font-semibold">₹{bookingToCancel.payment.amount}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium text-gray-700">Seats:</span>
                      <p className="text-gray-900">{bookingToCancel.eventDetails.seats.join(', ')}</p>
                    </div>
                  </div>
                </div>

                {/* Refund Notice */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-2">
                      <p className="text-sm font-medium text-green-800">Full Refund Available</p>
                      <p className="text-xs text-green-600 mt-1">
                        Your refund will be processed within 5-7 business days.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowCancelModal(false);
                      setBookingToCancel(null);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                  >
                    Keep Booking
                  </button>
                  <button
                    onClick={confirmCancelBooking}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
                  >
                    Cancel Booking
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default ProfilePage;
