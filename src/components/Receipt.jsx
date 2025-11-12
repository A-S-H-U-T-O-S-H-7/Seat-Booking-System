import React from 'react';
import { format, differenceInDays } from 'date-fns';


const DonationReceipt = ({ booking }) => {

    const orderId = booking?.id || "N/A";
  
  // For name - different booking types store name differently
  // Donations use donorDetails.name, delegates use delegateDetails.name
  const name = booking?.donorDetails?.name ||
               booking?.delegateDetails?.name ||
               booking?.customerDetails?.name || 
               booking?.vendorDetails?.name ||
               booking?.vendorDetails?.ownerName || 
               booking?.userDetails?.name || 
               booking?.name || 
               booking?.fullName ||
               booking?.userName ||
               booking?.displayName ||
               "N/A";
  
  // For PAN
  const pan = booking?.delegateDetails?.pan ||
              booking?.userDetails?.pan || 
              booking?.customerDetails?.pan || 
              booking?.pan || 
              "N/A";
  
  // For address
  const address = booking?.donorDetails?.address ||
                  booking?.delegateDetails?.address ||
                  booking?.userDetails?.address || 
                  booking?.customerDetails?.address || 
                  booking?.vendorDetails?.address || 
                  booking?.address || 
                  "N/A";
  
  // For mobile
  const mobile = booking?.donorDetails?.mobile ||
                 booking?.delegateDetails?.mobile ||
                 booking?.userDetails?.phone || 
                 booking?.customerDetails?.phone || 
                 booking?.userDetails?.mobile || 
                 booking?.vendorDetails?.phone || 
                     booking?.personalDetails?.mobile || 
                 booking?.phone || 
                 booking?.mobile || 
                 "N/A";
  
  // For amount - different booking types store amount differently
  const amount = booking?.totalAmount || 
                 booking?.payment?.amount || 
                 booking?.totalPrice || 
                 booking?.donationAmount || 
                 "0";

    // Handle date safely - check if createdAt is valid
    let date = 'Unknown';
    try {
      if (booking.createdAt) {
        let dateObj = booking.createdAt;
        // Convert Firebase Timestamp to Date if needed
        if (booking.createdAt.toDate && typeof booking.createdAt.toDate === 'function') {
          dateObj = booking.createdAt.toDate();
        } else if (booking.createdAt.seconds) {
          dateObj = new Date(booking.createdAt.seconds * 1000);
        }
        // Format only if valid date
        if (dateObj instanceof Date && !isNaN(dateObj)) {
          date = format(dateObj, 'MMM dd, yyyy \'at\' hh:mm a');
        }
      }
    } catch (error) {
      console.warn('Error formatting date:', error);
      date = 'Unknown';
    }


  const currentDate = new Date().toLocaleDateString('hi-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="max-w-6xl mx-auto p-2 sm:p-4 bg-white">
      <div className="border-2 sm:border-4 border-rose-600 rounded-lg p-3 sm:p-6 bg-white shadow-lg">
        {/* Header - Responsive */}
        <div className="mb-3 sm:mb-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
            <span className="text-green-600 font-bold text-xs sm:text-sm bg-green-50 px-2 sm:px-3 py-1 rounded order-1 sm:order-none">
              Reg. No.: 345529
            </span>
            <h1 className="text-rose-600 font-bold text-lg sm:text-xl tracking-wider order-first sm:order-none">RECEIPT</h1>
            <span className="text-green-600 font-bold text-xs sm:text-sm bg-green-50 px-2 sm:px-3 py-1 rounded order-2 sm:order-none">
              PAN No.: AAJTS7550E
            </span>
          </div>
        </div>

        {/* Organization Info - More Horizontal Layout */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
            {/* Logo */}
            <div className="flex-shrink-0">
              <img 
                src="/logo.png" 
                alt="Samudayik Vikas Samiti Logo" 
                className="w-12 h-12 sm:w-16 sm:h-16 object-contain rounded-lg border border-rose-200"
              />
            </div>
            
            {/* Organization Details - Horizontal Layout */}
            <div className="flex-grow text-center sm:text-left">
              <h2 className="text-rose-700 font-bold text-lg sm:text-xl mb-2">Samudayik Vikas Samiti</h2>
              <div className="text-rose-600 text-xs sm:text-sm leading-relaxed">
                <p className="mb-1 font-semibold">
                  Donations are Income Tax exempted under section 80G of IT Act.
                </p>
                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-1 text-xs">
                  <span>331, Vardhman Tower, Preet Vihar, New Delhi-110092</span>
                  <span className="hidden sm:inline">|</span>
                  <span>info@svsamiti.com | www.svsamiti.com</span>
                </div>
                <div className="mt-1 text-xs">
                  <span className="font-medium">Bank:</span> Samudayik Vikas Samiti | 
                  <span className="font-medium"> A/c:</span> 083101002804 | 
                  <span className="font-medium"> IFSC:</span> ICIC0000831
                </div>
              </div>
            </div>

            {/* QR Code */}
            <div className="flex-shrink-0">
              <img 
                src="/donationqr.jpg" 
                alt="Samudayik Vikas Samiti QR Code" 
                className="w-18 h-18 sm:w-22 sm:h-22 object-contain rounded-lg border border-rose-200"
              />
            </div>
          </div>
        </div>

        {/* Receipt Details - Responsive Grid */}
        <div className="space-y-0">
          {/* Receipt No and Date - Single Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2">
            <div className="text-gray-800 p-2 sm:p-3 border border-gray-400 bg-gray-50">
              <span className="font-bold text-sm">Receipt No:</span> <span className="text-sm">{orderId}</span>
            </div>
            <div className="text-gray-800 p-2 sm:p-3 border border-gray-400 bg-gray-50 sm:text-right">
              <span className="font-bold text-sm">Date:</span> <span className="text-sm">{date}</span>
            </div>
          </div>

          {/* Donor Details - Two Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2">
            <div className="p-2 sm:p-3 text-gray-800 border border-gray-400 bg-gray-50">
              <span className="font-bold text-sm">Donor Name:</span> <span className="text-sm">{name}</span>
            </div>
            <div className="p-2 sm:p-3 text-gray-800 border border-gray-400 bg-gray-50">
              <span className="font-bold text-sm">Phone:</span> <span className="text-sm">{mobile}</span>
            </div>
          </div>

          {/* PAN and Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2">
            <div className="p-2 sm:p-3 border text-gray-800 border-gray-400 bg-gray-50">
              <span className="font-bold text-sm">PAN:</span> <span className="text-sm">{pan}</span>
            </div>
            <div className="p-2 sm:p-3 text-gray-800 border border-gray-400 bg-gray-50">
              <span className="font-bold text-sm">Address:</span> <span className="text-sm">{address}</span>
            </div>
          </div>

          {/* Amount and Payment Mode */}
          <div className="grid grid-cols-1 sm:grid-cols-2">
            <div className="text-gray-800 p-2 sm:p-3 border border-gray-400 bg-gray-50">
              <span className="font-bold text-sm">Amount:</span> <span className="font-semibold text-sm">Rs {amount}/-</span>
            </div>
            <div className="text-gray-800 p-2 sm:p-3 border border-gray-400 bg-gray-50">
              <span className="font-bold text-sm">Payment Mode:</span> <span className="text-emerald-500 font-semibold text-sm">Online</span>
            </div>
          </div>
        </div>

        {/* Note and Footer - Compact */}
        <div className="mt-3 flex flex-col sm:flex-row justify-between items-end gap-2">
          <p className="text-xs text-gray-600 order-2 sm:order-1">
            * Receipt is valid subject to realization of payment
          </p>
          
          <div className="text-center sm:text-right order-1 sm:order-2">
            <p className="font-bold text-gray-800 text-sm mb-2">For Samudayik Vikas Samiti</p>
            <div className="border-t border-gray-400 pt-1 min-w-32">
              <p className="font-bold text-xs text-gray-700">Authorised Signatory</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonationReceipt;