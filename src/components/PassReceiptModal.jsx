"use client";
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Download } from 'lucide-react';
import MemberPass from './MemberPass';
import { toast } from 'react-hot-toast';
import DonationReceipt from './Receipt';

const PassReceiptModal = ({ isOpen, onClose, booking }) => {
  const [activeTab, setActiveTab] = useState('pass');
  const [isDownloading, setIsDownloading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

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

  const handleDownload = async (type) => {
    if (!booking?.id && !booking?.bookingId) {
      toast.error('Booking ID not found');
      return;
    }

    setIsDownloading(true);
    try {
      const orderId = booking.id || booking.bookingId;
      
      const headers = new Headers();
      headers.append("Content-Type", "application/json");
      
      const requestOptions = {
        method: "GET",
        headers: headers,
        redirect: "follow"
      };

      const response = await fetch(`https://svsamiti.com/havan-booking/order.php?order_id=${orderId}`, requestOptions);
      const result = await response.json();
      
      if (result.success) {
        const downloadUrl = type === 'pass' ? result.member_pass_url : result.receipt_url;
        
        if (downloadUrl) {
          // Create a temporary link element and trigger download
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.download = `${orderId}_${type}.pdf`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          toast.success(`${type === 'pass' ? 'Member Pass' : 'Receipt'} downloaded successfully!`);
        } else {
          toast.error(`${type === 'pass' ? 'Member Pass' : 'Receipt'} URL not found`);
        }
      } else {
        toast.error(result.message || 'Failed to get download links');
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Error downloading file');
    } finally {
      setIsDownloading(false);
    }
  };

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
            <h2 className="text-2xl font-bold text-gray-800 mb-1">Pass & Receipt</h2>
            <p className="text-sm text-gray-600">View and download your documents</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:shadow-md rounded-full transition-all duration-200 transform hover:scale-105"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-50 relative">
          <button
            onClick={() => setActiveTab('pass')}
            className={`flex-1 px-8 py-4 text-base font-semibold transition-all duration-300 relative group ${
              activeTab === 'pass'
                ? 'text-emerald-600 bg-white shadow-sm'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            <span className="relative z-10">Member Pass</span>
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

        {/* Content */}
        <div className="overflow-y-auto max-h-[60vh] bg-gray-50/30">
          {activeTab === 'pass' && booking && (
            <div className="py-4 px-1 md:px-4">
              <MemberPass booking={booking} />
            </div>
          )}
          
          {activeTab === 'receipt' && booking && (
            <div className="py-4 px-1 md:px-4">
              <DonationReceipt booking={booking} />
              
            </div>
          )}
        </div>

        {/* Floating Download Button */}
        <div className="absolute bottom-6 right-6 z-10">
          <button
            onClick={() => handleDownload(activeTab)}
            disabled={isDownloading}
            className={`
              relative overflow-hidden
              bg-gradient-to-r from-emerald-500 to-emerald-600 
              hover:from-emerald-600 hover:to-emerald-700 
              text-white p-4 rounded-full shadow-lg hover:shadow-xl 
              transition-all duration-300 transform hover:scale-110 
              disabled:opacity-50 disabled:cursor-not-allowed
              group animate-bounce
              ${isDownloading ? 'animate-pulse' : 'hover:animate-none'}
            `}
            title={`Download ${activeTab === 'pass' ? 'Member Pass' : 'Receipt'}`}
          >
            {/* Ripple Effect */}
            <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 rounded-full transition-opacity duration-300"></div>
            
            {/* Icon */}
            <Download 
              size={24} 
              className={`relative z-10 transition-transform duration-300 ${
                isDownloading ? 'animate-spin' : 'group-hover:scale-110'
              }`} 
            />
            
            {/* Glow Effect */}
            <div className="absolute inset-0 rounded-full bg-emerald-400 opacity-0 group-hover:opacity-30 blur-md scale-150 transition-all duration-300"></div>
          </button>
          
          {/* Download Label */}
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-3 py-1 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            Download {activeTab === 'pass' ? 'Pass' : 'Receipt'}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
          </div>
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