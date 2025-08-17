"use client";
import { useState, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useAdmin } from '@/context/AdminContext';
import { 
  getCancellations, 
  updateRefundStatus, 
  CANCELLATION_STATUS, 
  BOOKING_TYPES 
} from '@/utils/cancellationUtils';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { 
  FunnelIcon, 
  ArrowDownTrayIcon,
  CurrencyRupeeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

export default function CancellationManagement() {
  const { isDarkMode } = useTheme();
  const { adminUser, hasPermission } = useAdmin();
  const [cancellations, setCancellations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    bookingType: '',
    status: '',
    refundStatus: '',
    dateRange: 'all'
  });
  const [selectedCancellation, setSelectedCancellation] = useState(null);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundForm, setRefundForm] = useState({
    status: 'refunded',
    amount: 0,
    method: '',
    reference: '',
    notes: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchCancellations();
  }, [filters]);

  const fetchCancellations = async () => {
    setLoading(true);
    try {
      const result = await getCancellations(filters);
      if (result.success) {
        let cancellationsData = result.data;
        
        // Apply date range filter (client-side)
        if (filters.dateRange !== 'all') {
          const now = new Date();
          let startDate = new Date();
          
          switch (filters.dateRange) {
            case 'today':
              startDate.setHours(0, 0, 0, 0);
              break;
            case 'week':
              startDate.setDate(now.getDate() - 7);
              break;
            case 'month':
              startDate.setDate(now.getDate() - 30);
              break;
            case '3months':
              startDate.setDate(now.getDate() - 90);
              break;
          }
          
          cancellationsData = cancellationsData.filter(cancellation => 
            cancellation.cancelledAt >= startDate
          );
        }
        
        // Sort by cancellation date (most recent first)
        cancellationsData.sort((a, b) => b.cancelledAt - a.cancelledAt);
        
        setCancellations(cancellationsData);
      } else {
        toast.error('Failed to fetch cancellations');
      }
    } catch (error) {
      console.error('Error fetching cancellations:', error);
      toast.error('Error loading cancellation data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefundSubmit = async () => {
    if (!selectedCancellation) return;
    
    if (!refundForm.amount || refundForm.amount <= 0) {
      toast.error('Please enter a valid refund amount');
      return;
    }

    setIsUpdating(true);
    try {
      const result = await updateRefundStatus(
        selectedCancellation.id,
        refundForm,
        { ...adminUser, isAdmin: true }
      );
      
      if (result.success) {
        toast.success('Refund status updated successfully');
        setShowRefundModal(false);
        setSelectedCancellation(null);
        setRefundForm({
          status: 'refunded',
          amount: 0,
          method: '',
          reference: '',
          notes: ''
        });
        fetchCancellations(); // Refresh data
      } else {
        toast.error('Failed to update refund status');
      }
    } catch (error) {
      console.error('Error updating refund:', error);
      toast.error('Error processing refund');
    } finally {
      setIsUpdating(false);
    }
  };

  const openRefundModal = (cancellation) => {
    setSelectedCancellation(cancellation);
    setRefundForm({
      status: 'refunded',
      amount: cancellation.originalAmount,
      method: '',
      reference: '',
      notes: ''
    });
    setShowRefundModal(true);
  };

  const getStatusBadge = (status, refundStatus) => {
    if (refundStatus === 'refunded') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircleIcon className="w-3 h-3 mr-1" />
          Refunded
        </span>
      );
    }
    
    switch (status) {
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircleIcon className="w-3 h-3 mr-1" />
            Cancelled
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <ClockIcon className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const getBookingTypeBadge = (bookingType) => {
    const colors = {
      [BOOKING_TYPES.HAVAN]: 'bg-purple-100 text-purple-800',
      [BOOKING_TYPES.STALL]: 'bg-blue-100 text-blue-800',
      [BOOKING_TYPES.SHOW]: 'bg-indigo-100 text-indigo-800'
    };
    
    const labels = {
      [BOOKING_TYPES.HAVAN]: '🕉️ Havan',
      [BOOKING_TYPES.STALL]: '🏪 Stall',
      [BOOKING_TYPES.SHOW]: '🎭 Show'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[bookingType] || 'bg-gray-100 text-gray-800'}`}>
        {labels[bookingType] || bookingType}
      </span>
    );
  };

  const exportData = () => {
    // Simple CSV export functionality
    const csvContent = [
      ['Booking ID', 'Type', 'Status', 'Amount', 'Refund Amount', 'Customer', 'Cancelled Date'].join(','),
      ...cancellations.map(c => [
        c.bookingId,
        c.bookingType,
        c.status,
        c.originalAmount,
        c.refundAmount || 0,
        c.userDetails?.name || 'N/A',
        format(c.cancelledAt, 'yyyy-MM-dd HH:mm')
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cancellations-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (!hasPermission('manage_bookings')) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className={`text-lg ${isDarkMode ? 'text-red-400' : 'text-red-600'}`}>
            You don't have permission to access cancellation management.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Cancellation Management
          </h1>
          <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Track and manage all booking cancellations and refunds
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button
            onClick={exportData}
            className={`inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md ${
              isDarkMode 
                ? 'text-gray-300 bg-gray-700 hover:bg-gray-600' 
                : 'text-gray-700 bg-white hover:bg-gray-50'
            }`}
          >
            <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} overflow-hidden shadow rounded-lg`}>
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <XCircleIcon className="h-6 w-6 text-red-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} truncate`}>
                    Total Cancellations
                  </dt>
                  <dd className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {cancellations.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} overflow-hidden shadow rounded-lg`}>
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyRupeeIcon className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} truncate`}>
                    Pending Refunds
                  </dt>
                  <dd className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {cancellations.filter(c => c.refundStatus === 'pending').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} overflow-hidden shadow rounded-lg`}>
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} truncate`}>
                    Refunds Processed
                  </dt>
                  <dd className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {cancellations.filter(c => c.refundStatus === 'refunded').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} overflow-hidden shadow rounded-lg`}>
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyRupeeIcon className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'} truncate`}>
                    Total Refund Amount
                  </dt>
                  <dd className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    ₹{cancellations.reduce((sum, c) => sum + (c.refundAmount || 0), 0).toLocaleString('en-IN')}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow rounded-lg p-6`}>
        <div className="flex items-center mb-4">
          <FunnelIcon className="h-5 w-5 mr-2 text-gray-500" />
          <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Filters
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
              Booking Type
            </label>
            <select
              value={filters.bookingType}
              onChange={(e) => setFilters(prev => ({ ...prev, bookingType: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-md text-sm ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="">All Types</option>
              <option value="havan">Havan</option>
              <option value="stall">Stall</option>
              <option value="show">Show</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
              Refund Status
            </label>
            <select
              value={filters.refundStatus}
              onChange={(e) => setFilters(prev => ({ ...prev, refundStatus: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-md text-sm ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
              Date Range
            </label>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-md text-sm ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="3months">Last 3 Months</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setFilters({ bookingType: '', status: '', refundStatus: '', dateRange: 'all' })}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                isDarkMode
                  ? 'text-gray-300 bg-gray-700 hover:bg-gray-600'
                  : 'text-gray-700 bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Cancellations Table */}
      <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow rounded-lg overflow-hidden`}>
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Booking Details
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Customer
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Amount
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Status
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Cancelled Date
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {cancellations.map((cancellation) => (
                  <tr key={cancellation.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="flex items-center space-x-2">
                          {getBookingTypeBadge(cancellation.bookingType)}
                          <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {cancellation.bookingId}
                          </span>
                        </div>
                        <div className="mt-1">
                          <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {cancellation.bookingItems?.count} {cancellation.bookingItems?.type}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {cancellation.userDetails?.name || 'N/A'}
                        </span>
                        <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {cancellation.userDetails?.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          ₹{cancellation.originalAmount?.toLocaleString('en-IN')}
                        </span>
                        {cancellation.refundAmount > 0 && (
                          <span className="text-xs text-green-600">
                            Refund: ₹{cancellation.refundAmount.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(cancellation.status, cancellation.refundStatus)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                        {format(cancellation.cancelledAt, 'MMM dd, yyyy')}
                      </span>
                      <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {format(cancellation.cancelledAt, 'hh:mm a')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {cancellation.refundStatus === 'pending' && (
                        <button
                          onClick={() => openRefundModal(cancellation)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          Process Refund
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {cancellations.length === 0 && (
              <div className="text-center py-12">
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  No cancellations found matching your filters.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Refund Modal */}
      {showRefundModal && selectedCancellation && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className={`inline-block align-bottom ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full`}>
              <div className="px-6 pt-6 pb-4">
                <h3 className={`text-lg leading-6 font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Process Refund
                </h3>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Refund Amount
                    </label>
                    <input
                      type="number"
                      value={refundForm.amount}
                      onChange={(e) => setRefundForm(prev => ({ ...prev, amount: Number(e.target.value) }))}
                      className={`mt-1 block w-full px-3 py-2 border rounded-md text-sm ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Refund Method
                    </label>
                    <select
                      value={refundForm.method}
                      onChange={(e) => setRefundForm(prev => ({ ...prev, method: e.target.value }))}
                      className={`mt-1 block w-full px-3 py-2 border rounded-md text-sm ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="">Select method</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="upi">UPI</option>
                      <option value="cash">Cash</option>
                      <option value="credit_card">Credit Card</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Reference Number
                    </label>
                    <input
                      type="text"
                      value={refundForm.reference}
                      onChange={(e) => setRefundForm(prev => ({ ...prev, reference: e.target.value }))}
                      className={`mt-1 block w-full px-3 py-2 border rounded-md text-sm ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Notes
                    </label>
                    <textarea
                      value={refundForm.notes}
                      onChange={(e) => setRefundForm(prev => ({ ...prev, notes: e.target.value }))}
                      rows={3}
                      className={`mt-1 block w-full px-3 py-2 border rounded-md text-sm ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div className={`px-6 py-3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} flex justify-end space-x-3`}>
                <button
                  onClick={() => setShowRefundModal(false)}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    isDarkMode
                      ? 'text-gray-300 bg-gray-600 hover:bg-gray-500'
                      : 'text-gray-700 bg-white hover:bg-gray-50'
                  } border border-gray-300`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleRefundSubmit}
                  disabled={isUpdating}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md disabled:opacity-50"
                >
                  {isUpdating ? 'Processing...' : 'Process Refund'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
