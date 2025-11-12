"use client";
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  HeartIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  CalendarDaysIcon,
  BanknotesIcon,
  MapPinIcon,
  UserIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CurrencyRupeeIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '@/context/ThemeContext';
import DonationDetailsModal from './DonationDetailsModal';
import DocumentViewerModal from '../DocumentViewerModal';
import { format, isWithinInterval, subDays, startOfDay } from 'date-fns';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';

export default function DonationManagement() {
  const { isDarkMode } = useTheme();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [documentModal, setDocumentModal] = useState({
    isOpen: false,
    donation: null
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Load donations from Firebase
  useEffect(() => {
    loadDonations();
  }, []);

  const loadDonations = async () => {
    try {
      setLoading(true);
      const donationsRef = collection(db, 'donations');
      const donationsQuery = query(donationsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(donationsQuery);
      
      const donationsData = snapshot.docs.map(doc => {
        const data = doc.data();
        let createdAt = data.createdAt;
        
        // Convert Firestore Timestamp to Date if needed
        if (createdAt && typeof createdAt.toDate === 'function') {
          createdAt = createdAt.toDate();
        } else if (typeof createdAt === 'string') {
          createdAt = new Date(createdAt);
        }
        
        return {
          id: doc.id,
          ...data,
          createdAt: createdAt || new Date()
        };
      });

      setDonations(donationsData);
    } catch (error) {
      console.error('Error loading donations:', error);
      toast.error('Failed to load donations');
    } finally {
      setLoading(false);
    }
  };

  // Filter donations based on search and filters
  const filteredDonations = donations.filter(donation => {
    const matchesSearch = !searchTerm || 
      donation.donorDetails?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.donorDetails?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.donationId?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || donation.status === statusFilter;

    const matchesDate = dateFilter === 'all' || (() => {
      const donationDate = donation.createdAt;
      if (!donationDate) return false;
      
      const now = new Date();
      const today = startOfDay(now);
      
      switch (dateFilter) {
        case 'today':
          return format(donationDate, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd');
        case 'week':
          return isWithinInterval(donationDate, {
            start: subDays(today, 7),
            end: now
          });
        case 'month':
          return isWithinInterval(donationDate, {
            start: subDays(today, 30),
            end: now
          });
        default:
          return true;
      }
    })();

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Pagination
  const totalPages = Math.ceil(filteredDonations.length / itemsPerPage);
  const currentItems = filteredDonations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Export to CSV
  const exportToCSV = () => {
    const headers = [
      'Donation ID',
      'Donor Name',
      'Email',
      'Mobile',
      'Amount (₹)',
      'Status',
      'Donor Type',
      'City',
      'State',
      'Country',
      'Payment Gateway',
      'Tax Exemption',
      'Created Date',
      'Tracking ID'
    ];

    const csvData = filteredDonations.map(donation => [
      donation.donationId || donation.id || '',
      donation.donorDetails?.name || '',
      donation.donorDetails?.email || '',
      donation.donorDetails?.mobile || '',
      donation.amount || 0,
      donation.status || '',
      donation.donorType || '',
      donation.donorDetails?.city || '',
      donation.donorDetails?.state || '',
      donation.donorDetails?.country || '',
      donation.paymentGateway || '',
      donation.taxExemption?.eligible ? 'Yes' : 'No',
      donation.createdAt ? format(donation.createdAt, 'yyyy-MM-dd HH:mm:ss') : '',
      donation.paymentDetails?.tracking_id || donation.paymentDetails?.bank_ref_no || ''
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `donations_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success('Donations exported to CSV successfully!');
  };

  // Status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      'confirmed': { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircleIcon, label: 'Confirmed' },
      'completed': { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircleIcon, label: 'Completed' },
      'pending_payment': { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: ClockIcon, label: 'Pending' },
      'failed': { color: 'bg-red-100 text-red-800 border-red-200', icon: XCircleIcon, label: 'Failed' },
      'cancelled': { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: XCircleIcon, label: 'Cancelled' }
    };

    const config = statusConfig[status] || statusConfig['pending_payment'];
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const handleViewDetails = (donation) => {
    setSelectedDonation(donation);
    setShowDetailsModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Loading donations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 p-6 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center mb-4 sm:mb-0">
          <div className="p-2 rounded-lg bg-pink-100 dark:bg-pink-900/30 mr-3">
            <HeartIcon className="h-6 w-6 text-pink-600 dark:text-pink-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Donation Management</h1>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Manage and track all donations
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={loadDonations}
            className={`px-4 py-2 rounded-lg border transition-colors flex items-center ${
              isDarkMode 
                ? 'border-gray-600 bg-gray-800 hover:bg-gray-700' 
                : 'border-gray-300 bg-white hover:bg-gray-50'
            }`}
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
          >
            <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 mr-3">
              <BanknotesIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Donations</p>
              <p className="text-xl font-bold">₹{donations.reduce((sum, d) => sum + (d.amount || 0), 0).toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>
        
        <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 mr-3">
              <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Confirmed</p>
              <p className="text-xl font-bold">{donations.filter(d => ['confirmed', 'completed'].includes(d.status)).length}</p>
            </div>
          </div>
        </div>
        
        <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 mr-3">
              <ClockIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Pending</p>
              <p className="text-xl font-bold">{donations.filter(d => d.status === 'pending_payment').length}</p>
            </div>
          </div>
        </div>
        
        <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 mr-3">
              <UserIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Donors</p>
              <p className="text-xl font-bold">{new Set(donations.map(d => d.donorDetails?.email)).size}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or donation ID..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page when searching
              }}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <FunnelIcon className="h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="pending_payment">Pending</option>
              <option value="failed">Failed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-2">
            <CalendarDaysIcon className="h-4 w-4 text-gray-400" />
            <select
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setCurrentPage(1);
              }}
              className={`px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Donations Table */}
      <div className={`rounded-lg border overflow-hidden ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200 shadow-sm'}`}>
        {currentItems.length === 0 ? (
          <div className="text-center py-12">
            <HeartIcon className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className={`text-lg font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>No donations found</h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
              {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
                ? 'Try adjusting your filters or search query'
                : 'No donations have been made yet'
              }
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <tr>
                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      S.No.
                    </th>
                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      Donation Details
                    </th>
                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      Donor Info
                    </th>
                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      Amount & Status
                    </th>
                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      Location
                    </th>
                    <th className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      Date
                    </th>
                    <th className={`px-4 py-3 text-center text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {currentItems.map((donation, index) => (
                    <tr key={donation.id} className={`hover:${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} transition-colors`}>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {(currentPage - 1) * itemsPerPage + index + 1}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <HeartIcon className="h-4 w-4 text-pink-600 mr-2" />
                            <span className="font-medium text-sm">
                              {donation.donationId || donation.id}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {donation.donorType === 'foreign' ? 'NRI/Foreign' : 'Indian'} Donor
                          </div>
                          {donation.taxExemption?.eligible && (
                            <div className="text-xs text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full inline-block">
                              80G Tax Exemption
                            </div>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <div className="font-medium text-sm">
                            {donation.donorDetails?.name || 'Anonymous'}
                          </div>
                          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {donation.donorDetails?.email}
                          </div>
                          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {donation.donorDetails?.mobile}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-4 py-4">
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <CurrencyRupeeIcon className="h-4 w-4 text-green-600 mr-1" />
                            <span className="font-bold text-lg text-green-600">
                              {(donation.amount || 0).toLocaleString('en-IN')}
                            </span>
                          </div>
                          {getStatusBadge(donation.status)}
                        </div>
                      </td>
                      
                      <td className="px-4 py-4">
                        <div className="flex items-center text-sm">
                          <MapPinIcon className="h-4 w-4 text-gray-400 mr-1" />
                          <div>
                            <div>{donation.donorDetails?.city || 'N/A'}</div>
                            <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {donation.donorDetails?.state || ''}{donation.donorDetails?.state && donation.donorDetails?.country ? ', ' : ''}
                              {donation.donorDetails?.country || ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-4 py-4">
                        <div className="text-sm">
                          <div>{donation.createdAt ? format(donation.createdAt, 'MMM dd, yyyy') : 'N/A'}</div>
                          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {donation.createdAt ? format(donation.createdAt, 'hh:mm a') : ''}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-4 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleViewDetails(donation)}
                            className={`p-2 text-blue-600 hover:text-blue-700 rounded-full transition-colors ${
                              isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-blue-50'
                            }`}
                            title="View Details"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          {donation.status !== 'cancelled' && (
                            <button
                              onClick={() => setDocumentModal({
                                isOpen: true,
                                donation: donation
                              })}
                              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                                isDarkMode 
                                  ? 'bg-blue-900/30 text-blue-300 border border-blue-700 hover:bg-blue-800/40' 
                                  : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
                              }`}
                              title="View Documents"
                            >
                              📄 Documents
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className={`px-4 py-3 border-t ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
                <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
                  <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredDonations.length)} of {filteredDonations.length} donations
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded border ${
                        currentPage === 1 
                          ? 'opacity-50 cursor-not-allowed' 
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                      } ${isDarkMode ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'}`}
                    >
                      Previous
                    </button>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-1 rounded border ${
                        currentPage === totalPages 
                          ? 'opacity-50 cursor-not-allowed' 
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                      } ${isDarkMode ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'}`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedDonation && (
        <DonationDetailsModal
          donation={selectedDonation}
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedDonation(null);
          }}
          onRefresh={loadDonations}
        />
      )}

      {/* Document Viewer Modal */}
      <DocumentViewerModal
        isOpen={documentModal.isOpen}
        onClose={() => setDocumentModal({ isOpen: false, donation: null })}
        booking={documentModal.donation}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}
