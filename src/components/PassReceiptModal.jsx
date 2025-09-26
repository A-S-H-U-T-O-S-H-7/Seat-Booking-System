"use client";
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Download } from 'lucide-react';
import MemberPass from './MemberPass';
import DonationReceipt from './Receipt';
import DonationPart from './DonatePart';

const PassReceiptModal = ({ isOpen, onClose, booking }) => {
  const [activeTab, setActiveTab] = useState('pass');
  const [isDownloading, setIsDownloading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Check if booking is free (no receipt needed)
  const isFreeBooking = (booking?.totalAmount || 0) === 0 || 
                       booking?.eventDetails?.delegateType === 'normal';

  // Reset to pass tab if booking becomes free
  useEffect(() => {
    if (isFreeBooking && activeTab === 'receipt') {
      setActiveTab('pass');
    }
  }, [isFreeBooking, activeTab]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  

  if (!isOpen || !mounted) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black/30 backdrop-blur-sm bg-opacity-60 flex items-center justify-center z-[9999] p-2"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden relative">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-1">
              {isFreeBooking ? (
                (booking?.delegateDetails && booking?.eventDetails?.delegateType === 'normal') || 
                (booking?.totalAmount || 0) === 0
                  ? 'Free Entry Pass'
                  : 'Member Pass'
              ) : 'Pass & Receipt'}
            </h2>
            <p className="text-sm text-gray-600">
              {isFreeBooking ? (
                (booking?.delegateDetails && booking?.eventDetails?.delegateType === 'normal') || 
                (booking?.totalAmount || 0) === 0
                  ? 'View your free entry pass'
                  : 'View your member pass'
              ) : 'View and download your documents'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:shadow-md rounded-full transition-all duration-200 transform hover:scale-105"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Tabs */}
        {!isFreeBooking ? (
          <div className="flex bg-gray-50 relative">
            <button
              onClick={() => setActiveTab('pass')}
              className={`flex-1 px-8 py-4 text-base font-semibold transition-all duration-300 relative group ${
                activeTab === 'pass'
                  ? 'text-emerald-600 bg-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              <span className="relative z-10">
                {(booking?.delegateDetails && booking?.eventDetails?.delegateType === 'normal') || 
                 (booking?.totalAmount || 0) === 0
                  ? 'Free Entry Pass'
                  : 'Member Pass'}
              </span>
              {activeTab === 'pass' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-t-full shadow-lg"></div>
              )}
              {activeTab === 'pass' && (
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-50/30 to-transparent rounded-t-lg"></div>
              )}
            </button>
            <button
              onClick={() => setActiveTab('receipt')}
              className={`flex-1 px-8 py-4 text-base font-semibold transition-all duration-300 relative group ${
                activeTab === 'receipt'
                  ? 'text-emerald-600 bg-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              <span className="relative z-10">Receipt</span>
              {activeTab === 'receipt' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-t-full shadow-lg"></div>
              )}
              {activeTab === 'receipt' && (
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-50/30 to-transparent rounded-t-lg"></div>
              )}
            </button>
          </div>
        ) : (
          <div className="bg-emerald-50 border-b border-emerald-100">
            <div className="px-8 py-4">
              <h3 className="text-emerald-700 font-semibold text-center">
                {(booking?.delegateDetails && booking?.eventDetails?.delegateType === 'normal') || 
                 (booking?.totalAmount || 0) === 0
                  ? 'Free Entry Pass'
                  : 'Member Pass'}
              </h3>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto max-h-[60vh] bg-gray-50/30">
          {/* For free bookings, always show member pass */}
          {isFreeBooking && booking && (
            <div className="py-4 px-1 md:px-4">
              <MemberPass booking={booking} />
            </div>
          )}
          
          {/* For paid bookings, show based on active tab */}
          {!isFreeBooking && activeTab === 'pass' && booking && (
            <div className="py-4 px-1 md:px-4">
              <MemberPass booking={booking} />
            </div>
          )}
          
          {!isFreeBooking && activeTab === 'receipt' && booking && (
            <div className="py-4 px-1 md:px-4">
              <DonationReceipt booking={booking} />
            </div>
          )}
        </div>
        <DonationPart />
<div className="text-center py-3 font-semibold text-lg md:text-xl lg:text-2xl text-rose-600">
  Kindly present this complete pass at the time of entry.
</div>

        

        {/* Loading Overlay */}
        {isDownloading && (
          <div className="absolute inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 shadow-xl flex items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-500 border-t-transparent"></div>
              <span className="text-gray-700 font-medium">Preparing download...</span>
            </div>
          </div>
        )}

      </div>
      
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default PassReceiptModal;