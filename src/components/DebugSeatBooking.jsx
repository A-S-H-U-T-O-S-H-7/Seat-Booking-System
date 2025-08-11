"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs, doc, getDoc } from 'firebase/firestore';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

export default function DebugSeatBooking() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedShift, setSelectedShift] = useState('evening');
  const [seatAvailability, setSeatAvailability] = useState({});
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchDebugData = async () => {
    setLoading(true);
    try {
      // Fetch seat availability
      const dateKey = selectedDate;
      const availabilityRef = doc(db, 'seatAvailability', `${dateKey}_${selectedShift}`);
      const availabilityDoc = await getDoc(availabilityRef);
      
      if (availabilityDoc.exists()) {
        setSeatAvailability(availabilityDoc.data().seats || {});
      } else {
        setSeatAvailability({});
      }

      // Fetch recent bookings
      const bookingsQuery = query(
        collection(db, 'bookings'), 
        orderBy('createdAt', 'desc')
      );
      const bookingsSnapshot = await getDocs(bookingsQuery);
      
      const bookingsData = [];
      bookingsSnapshot.forEach(doc => {
        const data = doc.data();
        bookingsData.push({
          id: doc.id,
          ...data,
          // Convert Firestore timestamps to readable dates
          createdAt: data.createdAt?.toDate?.() || new Date(),
          eventDate: data.eventDate?.toDate?.() || new Date()
        });
      });
      
      setRecentBookings(bookingsData.slice(0, 5)); // Show only last 5 bookings
      
    } catch (error) {
      console.error('Error fetching debug data:', error);
      toast.error('Failed to fetch debug data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDebugData();
  }, [selectedDate, selectedShift]);

  const getBookedSeats = () => {
    const bookedSeats = [];
    Object.entries(seatAvailability).forEach(([seatId, seatInfo]) => {
      if (seatInfo.booked) {
        bookedSeats.push({
          seatId,
          customerName: seatInfo.customerName,
          bookingId: seatInfo.bookingId,
          bookedAt: seatInfo.bookedAt?.toDate?.() || 'Unknown'
        });
      }
    });
    return bookedSeats;
  };

  const bookedSeats = getBookedSeats();

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">🔍 Seat Booking Debug Tool</h1>
      
      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4">Debug Controls</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Shift
            </label>
            <select
              value={selectedShift}
              onChange={(e) => setSelectedShift(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="morning">Morning</option>
              <option value="evening">Evening</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={fetchDebugData}
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Refresh Data'}
            </button>
          </div>
        </div>
      </div>

      {/* Seat Availability Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4">
          Seat Availability for {selectedDate} ({selectedShift})
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-800">
              {400 - bookedSeats.length}
            </div>
            <div className="text-sm text-green-600">Available Seats</div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-800">
              {bookedSeats.length}
            </div>
            <div className="text-sm text-blue-600">Booked Seats</div>
          </div>
          
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-orange-800">
              {Object.keys(seatAvailability).filter(seatId => 
                seatAvailability[seatId].blocked && !seatAvailability[seatId].booked
              ).length}
            </div>
            <div className="text-sm text-orange-600">Blocked Seats</div>
          </div>
        </div>

        {/* Booked Seats List */}
        {bookedSeats.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-3">Currently Booked Seats</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Seat ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Booking ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Booked At
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookedSeats.map((seat) => (
                    <tr key={seat.seatId}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {seat.seatId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {seat.customerName || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {seat.bookingId || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {seat.bookedAt instanceof Date 
                          ? format(seat.bookedAt, 'MMM dd, yyyy HH:mm') 
                          : 'Unknown'
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Bookings</h2>
        
        {recentBookings.length === 0 ? (
          <p className="text-gray-500">No bookings found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booking ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Shift
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Seats
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {booking.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {booking.customerDetails?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(booking.eventDate, 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {booking.shift}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {booking.seats?.join(', ') || 'N/A'} ({booking.seats?.length || 0})
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        booking.status === 'confirmed' 
                          ? 'bg-green-100 text-green-800'
                          : booking.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {booking.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
