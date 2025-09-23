import React, { useState, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { toast } from 'react-hot-toast';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  SparklesIcon,
  HeartIcon,
  MicrophoneIcon
} from '@heroicons/react/24/outline';
import {
  getAllApplications,
  updateSponsorStatus,
  updatePerformerStatus,
  searchApplications
} from '@/services/sponsorPerformerService';
import adminLogger from '@/lib/adminLogger';
import { useAdmin } from '@/context/AdminContext';

export default function SponsorPerformerManagement() {
  const { isDarkMode } = useTheme();
  const { adminUser } = useAdmin();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusNotes, setStatusNotes] = useState('');

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Load applications
  const loadApplications = async () => {
    try {
      setLoading(true);
      
      let result;
      if (searchTerm.trim()) {
        result = await searchApplications(searchTerm, typeFilter);
        result = { applications: result, total: result.length };
      } else {
        const filters = {
          page: currentPage,
          pageSize: itemsPerPage,
          status: statusFilter,
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null
        };
        result = await getAllApplications(filters);
      }

      // Apply client-side filters
      let filteredApplications = result.applications;
      
      // Type filter
      if (typeFilter !== 'all') {
        filteredApplications = filteredApplications.filter(app => app.type === typeFilter);
      }

      // Status filter
      if (statusFilter !== 'all') {
        filteredApplications = filteredApplications.filter(app => app.status === statusFilter);
      }

      // Date filter
      if (dateFilter !== 'all') {
        const now = new Date();
        let filterDate = null;
        
        switch (dateFilter) {
          case 'today':
            filterDate = new Date();
            filterDate.setHours(0, 0, 0, 0);
            break;
          case 'week':
            filterDate = new Date();
            filterDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            filterDate = new Date();
            filterDate.setMonth(now.getMonth() - 1);
            break;
          default:
            filterDate = null;
        }

        if (filterDate) {
          filteredApplications = filteredApplications.filter(app => 
            app.createdAt && app.createdAt.toDate() >= filterDate
          );
        }
      }

      
      setApplications(filteredApplications);
      setTotalItems(filteredApplications.length);
    } catch (error) {
      console.error('Error loading applications:', error);
      toast.error('Error loading applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, [currentPage, statusFilter, typeFilter, dateFilter, startDate, endDate]);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchTerm !== '') {
        setCurrentPage(1);
        loadApplications();
      }
    }, 500);

    return () => clearTimeout(delayedSearch);
  }, [searchTerm]);

  useEffect(() => {
    if (searchTerm === '') {
      loadApplications();
    }
  }, [searchTerm]);

  const handleStatusUpdate = async (newStatus) => {
    if (!selectedApplication) return;

    try {
      if (selectedApplication.type === 'sponsor') {
        await updateSponsorStatus(selectedApplication.id, newStatus, statusNotes);
      } else {
        await updatePerformerStatus(selectedApplication.id, newStatus, statusNotes);
      }

      // Log the status update activity
      try {
        await adminLogger.logSystemActivity(
          adminUser,
          'update',
          `${selectedApplication.type}_application`,
          `Updated ${selectedApplication.type} application status from '${selectedApplication.status}' to '${newStatus}' for ${selectedApplication.name} (${selectedApplication.email}). ${selectedApplication.performanceType ? `Performance Type: ${selectedApplication.performanceType}. ` : ''}${statusNotes ? `Notes: ${statusNotes}` : 'No notes provided.'}`,
          await adminLogger.getClientIP(),
          adminLogger.getUserAgent()
        );
      } catch (logError) {
        console.error('Failed to log application status update:', logError);
      }

      toast.success(`Application ${newStatus} successfully`);
      setShowStatusModal(false);
      setStatusNotes('');
      setSelectedApplication(null);
      loadApplications();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Error updating application status');
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    return timestamp.toDate().toLocaleDateString() + ' ' + timestamp.toDate().toLocaleTimeString();
  };

  const getStatusBadge = (status) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (status) {
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300`;
      case 'confirmed':
        return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300`;
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300`;
    }
  };

  const getTypeIcon = (type) => {
    return type === 'sponsor' ? 
      <HeartIcon className="h-5 w-5 text-purple-500" /> : 
      <MicrophoneIcon className="h-5 w-5 text-indigo-500" />;
  };

  // Pagination calculations - service already handles pagination
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  // Use applications directly since service already paginated them
  const currentApplications = applications;
  

  return (
    <div className={`p-6 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Sponsor & Performer Applications</h1>
        <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          Manage sponsor partnerships and performer applications
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 border rounded-lg ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
          />
        </div>

        {/* Filter Row */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`px-3 py-2 border rounded-lg ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className={`px-3 py-2 border rounded-lg ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
          >
            <option value="all">All Types</option>
            <option value="sponsor">Sponsors</option>
            <option value="performer">Performers</option>
          </select>

          {/* Date Filter */}
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className={`px-3 py-2 border rounded-lg ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="custom">Custom Range</option>
          </select>

          {/* Start Date */}
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={`px-3 py-2 border rounded-lg ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
          />

          {/* End Date */}
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className={`px-3 py-2 border rounded-lg ${
              isDarkMode 
                ? 'bg-gray-800 border-gray-600 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
          />
        </div>
      </div>

      {/* Applications Table */}
      <div className={`overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600">
            <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide">
                  S.No.
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide">
                  Type & Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide">
                  Applied Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-gray-600 bg-gray-800' : 'divide-gray-200 bg-white'}`}>
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                      <span className="ml-2">Loading applications...</span>
                    </div>
                  </td>
                </tr>
              ) : currentApplications.length === 0 ? (
                <tr>
                  <td colSpan="6" className={`px-6 py-4 text-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    No applications found
                  </td>
                </tr>
              ) : (
                currentApplications.map((application, index) => (
                  <tr key={application.id} className={`hover:${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} transition-colors`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {startIndex + index + 1}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getTypeIcon(application.type)}
                        <div className="ml-3">
                          <div className="text-sm font-medium">
                            {application.name}
                          </div>
                          <div className={`text-sm capitalize ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {application.type}
                            {application.performanceType && ` - ${application.performanceType}`}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <div className="flex items-center mb-1">
                          <EnvelopeIcon className="h-4 w-4 mr-1 text-gray-400" />
                          {application.email}
                        </div>
                        <div className="flex items-center">
                          <PhoneIcon className="h-4 w-4 mr-1 text-gray-400" />
                          {application.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadge(application.status)}>
                        {application.status === 'pending' && <ClockIcon className="h-3 w-3 mr-1" />}
                        {application.status === 'confirmed' && <CheckCircleIcon className="h-3 w-3 mr-1" />}
                        {application.status === 'rejected' && <XCircleIcon className="h-3 w-3 mr-1" />}
                        {application.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {formatDate(application.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button
                        onClick={() => {
                          setSelectedApplication(application);
                          setShowDetailsModal(true);
                        }}
                        className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        View
                      </button>
                      <button
                        onClick={() => {
                          setSelectedApplication(application);
                          setShowStatusModal(true);
                        }}
                        className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-purple-600 hover:bg-purple-700 focus:ring-2 focus:ring-purple-500"
                      >
                        Update Status
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } ${isDarkMode ? 'dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300' : ''}`}
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              } ${isDarkMode ? 'dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300' : ''}`}
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                <span className="font-medium">{endIndex}</span> of{' '}
                <span className="font-medium">{totalItems}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-500 hover:bg-gray-50'
                  } ${isDarkMode ? 'dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300' : ''}`}
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === pageNum
                          ? 'z-10 bg-purple-50 border-purple-500 text-purple-600'
                          : `bg-white border-gray-300 text-gray-500 hover:bg-gray-50 ${
                              isDarkMode ? 'dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300' : ''
                            }`
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-500 hover:bg-gray-50'
                  } ${isDarkMode ? 'dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300' : ''}`}
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedApplication && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/20 backdrop-blur-md bg-opacity-50 flex items-center justify-center p-4">
          <div className={`max-w-2xl w-full rounded-lg shadow-xl ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="px-6 py-4 border-b border-gray-300 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Application Details</h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <div className="flex items-center">
                    {getTypeIcon(selectedApplication.type)}
                    <span className="ml-2 capitalize">{selectedApplication.type}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <span className={getStatusBadge(selectedApplication.status)}>
                    {selectedApplication.status}
                  </span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Full Name</label>
                <p>{selectedApplication.name}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <p>{selectedApplication.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <p>{selectedApplication.phone}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <p>{selectedApplication.address}</p>
              </div>
              
              {selectedApplication.performanceType && (
                <div>
                  <label className="block text-sm font-medium mb-1">Performance Type</label>
                  <p>{selectedApplication.performanceType}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Applied Date</label>
                  <p>{formatDate(selectedApplication.createdAt)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Last Updated</label>
                  <p>{formatDate(selectedApplication.updatedAt)}</p>
                </div>
              </div>
              
              {selectedApplication.notes && (
                <div>
                  <label className="block text-sm font-medium mb-1">Admin Notes</label>
                  <p className={`p-3 rounded-md ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    {selectedApplication.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && selectedApplication && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/20 backdrop-blur-md bg-opacity-50 flex items-center justify-center p-4">
          <div className={`max-w-md w-full rounded-lg shadow-xl ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="px-6 py-4 border-b border-gray-300 dark:border-gray-600">
              <h3 className="text-lg font-medium">Update Application Status</h3>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Application</label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedApplication.name} ({selectedApplication.type})
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Current Status</label>
                <span className={getStatusBadge(selectedApplication.status)}>
                  {selectedApplication.status}
                </span>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Notes (Optional)</label>
                <textarea
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  rows={3}
                  placeholder="Add any notes about this status change..."
                  className={`w-full px-3 py-2 border rounded-md ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={() => handleStatusUpdate('confirmed')}
                  className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-500"
                >
                  <CheckCircleIcon className="h-4 w-4 mr-2" />
                  Confirm
                </button>
                <button
                  onClick={() => handleStatusUpdate('rejected')}
                  className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-500"
                >
                  <XCircleIcon className="h-4 w-4 mr-2" />
                  Reject
                </button>
              </div>
              
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setStatusNotes('');
                }}
                className={`w-full px-4 py-2 border rounded-md text-sm font-medium ${
                  isDarkMode
                    ? 'border-gray-600 text-gray-300 bg-gray-700 hover:bg-gray-600'
                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                } focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
