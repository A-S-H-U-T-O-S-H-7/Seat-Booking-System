"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStallBooking } from '@/context/StallBookingContext';
import { useAdmin } from '@/context/AdminContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, runTransaction, serverTimestamp, setDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { CheckCircle } from 'lucide-react';
import adminLogger from '@/lib/adminLogger';

const AdminStallPayment = ({ vendorDetails, onBookingComplete }) => {
  const [processing, setProcessing] = useState(false);
  const [eventDetails, setEventDetails] = useState({
    startDate: null,
    endDate: null,
    duration: 'Loading...',
    formattedDuration: 'Loading...'
  });
  
  const router = useRouter();
  const { adminUser } = useAdmin();
  const { 
    selectedStalls, 
    getTotalAmount, 
    getBaseAmount, 
    getDiscountAmount, 
    getTaxAmount,
    priceSettings,
    clearSelection,
    eventSettings
  } = useStallBooking();
  
  // Fetch event dates from system settings
  useEffect(() => {
    const fetchEventDates = async () => {
      try {
        const { getStallEventSettings, formatEventDuration, calculateEventDays } = await import('@/services/systemSettingsService');
        const stallSettings = await getStallEventSettings();
        
        const startDate = new Date(stallSettings.startDate);
        const endDate = new Date(stallSettings.endDate);
        const days = calculateEventDays(stallSettings.startDate, stallSettings.endDate);
        const formattedDuration = formatEventDuration(stallSettings.startDate, stallSettings.endDate);
        
        setEventDetails({
          startDate,
          endDate,
          duration: `${days} day${days > 1 ? 's' : ''}`,
          formattedDuration
        });
      } catch (error) {
        // Use fallback values if fetch fails
        const startDate = new Date('2025-11-15');
        const endDate = new Date('2025-11-20');
        setEventDetails({
          startDate,
          endDate,
          duration: '5 days',
          formattedDuration: 'Nov 15 - Nov 20, 2025 (5 Days)'
        });
      }
    };
    
    fetchEventDates();
  }, []);

  const generateBookingId = async () => {
    const { generateSequentialBookingId } = await import('@/services/bookingIdService');
    return await generateSequentialBookingId('stall');
  };

  // Send confirmation email to vendor
  const sendConfirmationEmail = async (bookingId) => {
    try {
      const response = await fetch('/api/emails/booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Required fields as per email API
          name: vendorDetails.ownerName,
          email: vendorDetails.email,
          order_id: bookingId,
          // Optional fields
          details: `Stall Booking - ${selectedStalls.join(', ')} (Total: ${selectedStalls.length} stalls)`,
          event_date: eventDetails.formattedDuration || 'Nov 15-20, 2025',
          booking_type: 'Stall Booking',
          amount: getTotalAmount(),
          mobile: vendorDetails.phone,
          address: vendorDetails.address,
          pan: vendorDetails.pan || '',
          valid_from: eventDetails.startDate ? new Date(eventDetails.startDate).toISOString().split('T')[0] : new Date('2025-11-15').toISOString().split('T')[0],
          valid_to: eventDetails.endDate ? new Date(eventDetails.endDate).toISOString().split('T')[0] : new Date('2025-11-20').toISOString().split('T')[0]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Email API error:', errorData);
        throw new Error(errorData.message || 'Failed to send confirmation email');
      }

      const result = await response.json();
      if (result.status) {
        toast.success(`Confirmation email sent to ${vendorDetails.email}`);
      } else {
        throw new Error(result.message || 'Failed to send email');
      }
    } catch (error) {
      console.error('Email error:', error);
      toast.error('Booking created but failed to send confirmation email');
    }
  };

  // Direct booking without payment gateway
  const handleDirectBooking = async () => {
    if (selectedStalls.length === 0) {
      toast.error('Please select at least one stall before proceeding');
      return;
    }
    
    setProcessing(true);
    
    try {
      const generatedBookingId = await generateBookingId();
      
      // Process booking with transaction
      await runTransaction(db, async (transaction) => {
        // ===== ALL READS FIRST =====
        // Read stall availability
        const availabilityRef = doc(db, 'stallAvailability', 'current');
        const availabilityDoc = await transaction.get(availabilityRef);
        
        // Read user profile
        const userProfileRef = doc(db, 'userProfiles', vendorDetails.email);
        const userProfileDoc = await transaction.get(userProfileRef);
        
        // ===== PROCESS READ DATA =====
        const currentAvailability = availabilityDoc.exists() 
          ? availabilityDoc.data().stalls || {}
          : {};

        // Verify all selected stalls are still available
        for (const stallId of selectedStalls) {
          if (currentAvailability[stallId]?.booked || currentAvailability[stallId]?.blocked) {
            throw new Error(`Stall ${stallId} is no longer available`);
          }
        }

        // Prepare data for writes
        const bookedAt = serverTimestamp();
        
        const updatedAvailability = { ...currentAvailability };
        selectedStalls.forEach(stallId => {
          updatedAvailability[stallId] = {
            booked: true,
            blocked: false,
            userId: vendorDetails.email,
            vendorName: vendorDetails.ownerName,
            businessName: vendorDetails.businessType,
            customerName: vendorDetails.ownerName,
            customerEmail: vendorDetails.email,
            customerPhone: vendorDetails.phone,
            bookingId: generatedBookingId,
            bookedAt: bookedAt,
            bookedByAdmin: true,
            adminUserId: adminUser?.uid || 'admin'
          };
        });

        // ===== ALL WRITES AFTER READS =====
        // Write 1: Update stall availability
        transaction.set(availabilityRef, {
          stalls: updatedAvailability,
          updatedAt: bookedAt
        }, { merge: true });

        // Write 2: Create booking record
        const bookingRef = doc(db, 'stallBookings', generatedBookingId);
        transaction.set(bookingRef, {
          id: generatedBookingId,
          bookingId: generatedBookingId,
          userId: vendorDetails.email,
          vendorDetails: {
            ...vendorDetails,
            bookedByAdmin: true,
            adminUserId: adminUser?.uid || 'admin'
          },
          stallIds: selectedStalls,
          numberOfStalls: selectedStalls.length,
          duration: eventDetails.duration || '5 days',
          totalAmount: getTotalAmount(),
          baseAmount: getBaseAmount(),
          discountAmount: getDiscountAmount(),
          payment: {
            status: 'success',
            method: 'admin_booking',
            transactionId: `ADMIN_${Date.now()}`,
            amount: getTotalAmount(),
            paidAt: bookedAt,
            paymentId: `admin_${generatedBookingId}`,
            orderId: generatedBookingId
          },
          status: 'confirmed',
          type: 'stall',
          createdAt: bookedAt,
          updatedAt: bookedAt,
          bookedByAdmin: true,
          adminUserId: adminUser?.uid || 'admin',
          eventDetails: {
            startDate: eventDetails.startDate || new Date('2025-11-15'),
            endDate: eventDetails.endDate || new Date('2025-11-20'),
            duration: eventDetails.duration || '5 days',
            formattedDuration: eventDetails.formattedDuration || 'Nov 15-20, 2025',
            type: 'vendor_stall'
          }
        });

        // Write 3: Create/Update user profile
        if (userProfileDoc.exists()) {
          // Update existing profile
          const existingData = userProfileDoc.data();
          transaction.update(userProfileRef, {
            name: vendorDetails.ownerName,
            phone: vendorDetails.phone,
            aadhar: vendorDetails.aadhar,
            pan: vendorDetails.pan || '',
            address: vendorDetails.address,
            businessType: vendorDetails.businessType,
            bookings: [...(existingData.bookings || []), generatedBookingId],
            stallBookings: [...(existingData.stallBookings || []), generatedBookingId],
            updatedAt: bookedAt
          });
        } else {
          // Create new profile
          transaction.set(userProfileRef, {
            email: vendorDetails.email,
            name: vendorDetails.ownerName,
            phone: vendorDetails.phone,
            aadhar: vendorDetails.aadhar,
            pan: vendorDetails.pan || '',
            address: vendorDetails.address,
            businessType: vendorDetails.businessType,
            bookings: [generatedBookingId],
            stallBookings: [generatedBookingId],
            createdAt: bookedAt,
            updatedAt: bookedAt
          });
        }
      });
      
      // Log admin activity
      if (adminUser) {
        await adminLogger.logSettingsActivity(
          adminUser,
          'admin_stall_booking',
          'stall_management',
          `Booked ${selectedStalls.length} stalls (${selectedStalls.join(', ')}) for ${vendorDetails.ownerName} - Booking ID: ${generatedBookingId}`
        );
      }

      // Send confirmation email
      await sendConfirmationEmail(generatedBookingId);
      
      toast.success(`Successfully booked ${selectedStalls.length} stalls! Booking ID: ${generatedBookingId}`);
      
      // Clear selection
      clearSelection();
      
      // Call the onBookingComplete callback if provided
      if (onBookingComplete) {
        onBookingComplete(generatedBookingId);
      }
      
    } catch (error) {
      console.error('Booking error:', error);
      toast.error(error.message || 'Failed to process booking. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col justify-center items-center px-2 sm:px-4 py-4 sm:py-8">
      <div className="bg-white shadow-xl rounded-xl sm:rounded-2xl max-w-4xl w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 sm:px-6 py-4 sm:py-5">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white text-center">Complete Stall Booking</h2>
          <p className="text-blue-100 text-center mt-1 sm:mt-2 text-sm sm:text-base">Admin Direct Booking - No Payment Gateway Required</p>
        </div>

        <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
          {/* Final Booking Summary */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg sm:rounded-xl p-3 sm:p-4">
            <h3 className="text-lg sm:text-xl font-bold text-blue-800 mb-3 sm:mb-4 flex items-center">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center mr-2 sm:mr-3">
                <span className="text-white font-bold text-sm sm:text-base">📋</span>
              </div>
              Final Summary
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
              {/* Vendor Details */}
              <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-blue-200">
                <h4 className="font-semibold text-blue-700 mb-2 sm:mb-3 flex items-center text-sm sm:text-base">
                  <span className="text-base sm:text-lg mr-2">👤</span>
                  Vendor Details
                </h4>
                <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-700">
                  <p><span className="font-medium text-gray-900">Contact Person:</span> {vendorDetails.ownerName}</p>
                  <p><span className="font-medium text-gray-900">Email:</span> {vendorDetails.email}</p>
                  <p><span className="font-medium text-gray-900">Phone:</span> {vendorDetails.phone}</p>
                  <p><span className="font-medium text-gray-900">Business Type:</span> {vendorDetails.businessType}</p>
                  <p><span className="font-medium text-gray-900">Aadhar:</span> {vendorDetails.aadhar}</p>
                  {vendorDetails.pan && <p><span className="font-medium text-gray-900">PAN:</span> {vendorDetails.pan}</p>}
                </div>
              </div>

              {/* Stall Details */}
              <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-blue-200">
                <h4 className="font-semibold text-blue-700 mb-2 sm:mb-3 flex items-center text-sm sm:text-base">
                  <span className="text-base sm:text-lg mr-2">🏢</span>
                  Stall Details
                </h4>
                <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-700">
                  <p><span className="font-medium text-gray-900">Stall IDs:</span> {selectedStalls && selectedStalls.length > 0 ? selectedStalls.join(', ') : 'N/A'}</p>
                  <p><span className="font-medium text-gray-900">Total Stalls:</span> {selectedStalls.length}</p>
                  <p><span className="font-medium text-gray-900">Event Duration:</span> {eventDetails.formattedDuration}</p>
                  <p><span className="font-medium text-gray-900">Price per Stall:</span> ₹{priceSettings.defaultStallPrice.toLocaleString()}</p>
                  <p><span className="font-medium text-gray-900">Location:</span> Delhi NCR Noida Stadium</p>
                </div>
              </div>
            </div>

            {/* Pricing Breakdown */}
            <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-blue-200 mb-3 sm:mb-4">
              <h4 className="font-semibold text-blue-700 mb-2 text-sm sm:text-base">💰 Pricing Breakdown</h4>
              <div className="space-y-1 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-700">Base Amount ({selectedStalls.length} × ₹{priceSettings.defaultStallPrice.toLocaleString()}):</span>
                  <span className="font-medium">₹{getBaseAmount().toLocaleString()}</span>
                </div>
                {getDiscountAmount() > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount:</span>
                    <span className="font-medium">-₹{getDiscountAmount().toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-gray-200 font-bold text-base">
                  <span>Total Amount:</span>
                  <span className="text-blue-700">₹{getTotalAmount().toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Total Amount - Highlighted */}
            <div className="bg-gradient-to-r from-purple-100 to-blue-100 border border-purple-300 rounded-lg sm:rounded-xl p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row justify-between items-center text-center sm:text-left">
                <div className="mb-2 sm:mb-0">
                  <h4 className="text-base sm:text-lg font-semibold text-purple-800">Total Amount</h4>
                  <p className="text-xs sm:text-sm text-purple-600 mt-1">Will be marked as successfully paid</p>
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-purple-800 bg-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl shadow-md">
                  ₹{getTotalAmount()}
                </div>
              </div>
            </div>
          </div>

          {/* Admin Booking Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="text-yellow-600 mr-3 text-xl">⚠️</div>
              <div className="text-xs sm:text-sm">
                <p className="font-semibold text-yellow-800 mb-1">Admin Direct Booking</p>
                <p className="text-yellow-700">
                  This booking will be created immediately without payment gateway processing. 
                  Payment status will be marked as "Success" and confirmation email will be sent to <span className="font-medium">{vendorDetails.email}</span>.
                  The booking will appear in the vendor's profile.
                </p>
              </div>
            </div>
          </div>

          {/* Book Button */}
          <button
            onClick={handleDirectBooking}
            disabled={processing}
            className={`w-full py-3 cursor-pointer sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg transition-all duration-300 transform ${
              processing
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl'
            } text-white`}
          >
            {processing ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 sm:h-6 sm:w-6 text-white mr-2 sm:mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
                Processing Booking...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                Confirm & Book Stalls
              </span>
            )}
          </button>

          <p className="text-xs text-gray-500 text-center mt-2 sm:mt-3">
            Clicking "Confirm & Book Stalls" will immediately create the booking with payment marked as successful
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminStallPayment;
