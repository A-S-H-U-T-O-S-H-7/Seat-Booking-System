import { useState, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useAdmin } from '@/context/AdminContext';
import { toast } from 'react-hot-toast';
import { db } from '@/lib/firebase';
import { 
  collection, 
  query, 
  getDocs, 
  updateDoc,
  doc,
  orderBy,
  where,
  serverTimestamp
} from 'firebase/firestore';
import CancellationFilters from './CancellationFilters';
import CancellationTable from './CancellationTable';
import CancellationPagination from './CancellationPagination';
import RefundModal from './RefundModal';
import CancellationDetailsModal from './CancellationDetailsModal';
import { 
  BanknotesIcon,
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';

export default function CancellationRefundManagement() {
  const { isDarkMode } = useTheme();
  const { adminUser, hasPermission } = useAdmin();
  
  // State management
  const [cancellations, setCancellations] = useState([]);
  const [filteredCancellations, setFilteredCancellations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Modal states
  const [selectedCancellation, setSelectedCancellation] = useState(null);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [processingRefund, setProcessingRefund] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    bookingType: 'all', // all, havan, stall, show
    refundStatus: 'all', // all, pending, processed, rejected
    dateRange: 'all', // all, today, week, month, custom
    searchQuery: '',
    customStartDate: '',
    customEndDate: '',
    sortBy: 'cancellationDate',
    sortOrder: 'desc'
  });

  // Sorting state for table
  const [currentSort, setCurrentSort] = useState({
    field: 'cancellationDate',
    order: 'desc'
  });

  // Check permissions
  const canManageRefunds = hasPermission('manage_cancellations') || adminUser?.role === 'super_admin';

  useEffect(() => {
    if (canManageRefunds) {
      fetchCancellations();
    }
  }, [canManageRefunds]);

  useEffect(() => {
    applyFilters();
  }, [cancellations, filters]);

  const fetchCancellations = async () => {
    setLoading(true);
    try {
      // Try to fetch cancellations from Firebase
      let snapshot;
      
      try {
        // Try with orderBy first
        const cancellationsQuery = query(
          collection(db, 'cancellations'),
          orderBy('cancelledAt', 'desc')
        );
        snapshot = await getDocs(cancellationsQuery);
      } catch (orderError) {
        console.log('OrderBy failed, trying simple collection query:', orderError);
        // Fallback to simple collection query without orderBy
        snapshot = await getDocs(collection(db, 'cancellations'));
      }
      
      if (snapshot.empty) {
        console.log('No cancellations found in Firebase');
        setCancellations([]);
        return;
      }
      
      console.log(`Found ${snapshot.size} cancellation records`);
      const cancellationsData = [];
      
      snapshot.forEach(doc => {
        try {
          const data = doc.data();
          console.log('Processing cancellation:', doc.id, data);
          
          // Transform Firebase data to match our component structure
          const transformedData = {
            id: doc.id,
            bookingId: data.bookingId,
            bookingType: data.bookingType,
            
            // Customer details
            customerName: data.userDetails?.name || data.userDetails?.email || 'Unknown',
            customerEmail: data.userDetails?.email || '',
            customerPhone: data.userDetails?.phone || '',
            
            // Amount details
            originalAmount: data.originalAmount || 0,
            refundAmount: data.refundAmount || 0,
            cancellationFee: (data.originalAmount || 0) - (data.refundAmount || 0),
            
            // Dates and status
            cancellationDate: data.cancelledAt?.toDate() || data.createdAt?.toDate() || new Date(),
            cancellationReason: data.cancellationReason || '',
            refundStatus: data.refundStatus || 'pending',
            
            // Processing details
            processedBy: data.processedBy || null,
            processedAt: data.processedAt?.toDate() || null,
            rejectionReason: data.rejectionReason || null,
            adminNotes: data.adminNotes || '',
            
            // Payment details (might need to fetch from original booking)
            paymentMethod: data.paymentMethod || 'Unknown',
            transactionId: data.transactionId || '',
            
            // Booking details based on type
            bookingDetails: transformBookingDetails(data),
            
            // Keep original data for reference
            originalData: data
          };
          
          cancellationsData.push(transformedData);
        } catch (transformError) {
          console.error('Error transforming cancellation data for doc:', doc.id, transformError);
          // Skip this record but continue with others
        }
      });
      
      console.log(`Successfully processed ${cancellationsData.length} cancellations`);
      setCancellations(cancellationsData);
      
    } catch (error) {
      console.error('Error fetching cancellations:', error);
      if (error.code === 'failed-precondition' || error.code === 'unimplemented') {
        toast.error('Cancellations collection needs to be set up. No data available yet.');
      } else {
        toast.error('Failed to load cancellations. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to transform booking details based on booking type
  const transformBookingDetails = (data) => {
    const bookingType = data.bookingType;
    const eventDetails = data.eventDetails || {};
    
    // Ensure bookingItems is always an array
    let bookingItems = data.bookingItems || [];
    if (!Array.isArray(bookingItems)) {
      bookingItems = [];
    }
    
    // Helper function to safely convert dates
    const safeDate = (dateValue) => {
      if (!dateValue) return null;
      try {
        if (typeof dateValue === 'string') {
          return new Date(dateValue);
        }
        if (dateValue.toDate && typeof dateValue.toDate === 'function') {
          return dateValue.toDate();
        }
        return new Date(dateValue);
      } catch (error) {
        console.warn('Invalid date value:', dateValue);
        return null;
      }
    };
    
    switch (bookingType) {
      case 'havan':
        // Try multiple possible sources for seat data
        let havanSeats = [];
        if (bookingItems.length > 0) {
          havanSeats = bookingItems.map(item => item.seat || item).filter(Boolean);
        } else if (eventDetails.seats) {
          havanSeats = Array.isArray(eventDetails.seats) ? eventDetails.seats : [eventDetails.seats];
        } else if (data.seats) {
          havanSeats = Array.isArray(data.seats) ? data.seats : [data.seats];
        }
        
        return {
          seats: havanSeats,
          date: safeDate(eventDetails.date),
          shift: eventDetails.shift || 'Unknown'
        };
        
      case 'stall':
        let stallNumber = 'Unknown';
        if (bookingItems.length > 0) {
          stallNumber = bookingItems[0]?.stallNumber || bookingItems[0]?.stall || bookingItems[0];
        } else if (eventDetails.stallNumber) {
          stallNumber = eventDetails.stallNumber;
        } else if (data.stallNumber) {
          stallNumber = data.stallNumber;
        }
        
        return {
          stallNumber: stallNumber,
          date: safeDate(eventDetails.date),
          duration: eventDetails.duration || 'Unknown'
        };
        
      case 'show':
        // Try multiple possible sources for seat data
        let showSeats = [];
        if (bookingItems.length > 0) {
          showSeats = bookingItems.map(item => item.seat || item).filter(Boolean);
        } else if (eventDetails.seats) {
          showSeats = Array.isArray(eventDetails.seats) ? eventDetails.seats : [eventDetails.seats];
        } else if (data.seats) {
          showSeats = Array.isArray(data.seats) ? data.seats : [data.seats];
        }
        
        return {
          seats: showSeats,
          showDate: safeDate(eventDetails.date),
          showTime: eventDetails.time || eventDetails.showTime || 'Unknown'
        };
        
      default:
        return {
          items: bookingItems,
          eventDetails: eventDetails
        };
    }
  };

  const applyFilters = () => {
    let filtered = [...cancellations];

    // Filter by booking type
    if (filters.bookingType !== 'all') {
      filtered = filtered.filter(item => item.bookingType === filters.bookingType);
    }

    // Filter by refund status
    if (filters.refundStatus !== 'all') {
      filtered = filtered.filter(item => item.refundStatus === filters.refundStatus);
    }

    // Filter by date range
    const now = new Date();
    switch (filters.dateRange) {
      case 'today':
        filtered = filtered.filter(item => {
          const itemDate = new Date(item.cancellationDate);
          return itemDate.toDateString() === now.toDateString();
        });
        break;
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(item => new Date(item.cancellationDate) >= weekAgo);
        break;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(item => new Date(item.cancellationDate) >= monthAgo);
        break;
      case 'custom':
        if (filters.customStartDate && filters.customEndDate) {
          const startDate = new Date(filters.customStartDate);
          const endDate = new Date(filters.customEndDate);
          filtered = filtered.filter(item => {
            const itemDate = new Date(item.cancellationDate);
            return itemDate >= startDate && itemDate <= endDate;
          });
        }
        break;
    }

    // Filter by search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.customerName.toLowerCase().includes(query) ||
        item.customerEmail.toLowerCase().includes(query) ||
        item.bookingId.toLowerCase().includes(query) ||
        item.id.toLowerCase().includes(query)
      );
    }

    // Sort results
    filtered.sort((a, b) => {
      const aValue = a[filters.sortBy];
      const bValue = b[filters.sortBy];
      
      if (filters.sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredCancellations(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleRefund = (cancellation) => {
    setSelectedCancellation(cancellation);
    setShowRefundModal(true);
  };

  const handleViewDetails = (cancellation) => {
    setSelectedCancellation(cancellation);
    setShowDetailsModal(true);
  };

  const handleSort = (field) => {
    const newOrder = currentSort.field === field && currentSort.order === 'desc' ? 'asc' : 'desc';
    setCurrentSort({ field, order: newOrder });
    
    // Also update filters to keep consistency
    setFilters(prev => ({
      ...prev,
      sortBy: field,
      sortOrder: newOrder
    }));
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const processRefund = async (refundData) => {
    setProcessingRefund(true);
    try {
      // Update the cancellation record in Firebase
      const cancellationRef = doc(db, 'cancellations', selectedCancellation.id);
      
      const updates = {
        refundStatus: 'processed',
        refundAmount: refundData.refundAmount,
        adminNotes: refundData.notes,
        processedBy: {
          uid: adminUser.uid,
          name: adminUser.name || adminUser.email,
          email: adminUser.email
        },
        processedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await updateDoc(cancellationRef, updates);
      
      // Log the refund activity (optional - you can expand this)
      console.log(`Refund processed by ${adminUser.email} for cancellation ${selectedCancellation.id}`);
      
      // Update local state
      setCancellations(prev => prev.map(item => 
        item.id === selectedCancellation.id 
          ? { 
              ...item, 
              refundStatus: 'processed',
              processedBy: adminUser.uid,
              processedAt: new Date(),
              refundAmount: refundData.refundAmount,
              adminNotes: refundData.notes
            }
          : item
      ));

      toast.success('Refund processed successfully');
      setShowRefundModal(false);
      setSelectedCancellation(null);
      
      // Optionally refresh data to ensure consistency
      // fetchCancellations();
      
    } catch (error) {
      console.error('Error processing refund:', error);
      toast.error('Failed to process refund. Please try again.');
    } finally {
      setProcessingRefund(false);
    }
  };

  // Pagination
  const totalItems = filteredCancellations.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredCancellations.slice(startIndex, endIndex);

  if (!canManageRefunds) {
    return (
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border p-8 text-center`}>
        <ExclamationTriangleIcon className={`w-12 h-12 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} mx-auto mb-4`} />
        <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Access Restricted</h3>
        <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          You don't have permission to access cancellation and refund management.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Cancellation & Refund Management
          </h1>
          <p className={`mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Manage cancellations and process refunds for all booking types
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
          <BanknotesIcon className={`w-5 h-5 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
          <span className={`text-sm font-medium ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
            {filteredCancellations.filter(c => c.refundStatus === 'pending').length} Pending Refunds
          </span>
        </div>
      </div>

      {/* Filters */}
      <CancellationFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        totalItems={totalItems}
        loading={loading}
      />

      {/* Table */}
      <CancellationTable
        cancellations={currentItems}
        loading={loading}
        onRefund={handleRefund}
        onViewDetails={handleViewDetails}
        currentSort={currentSort}
        onSort={handleSort}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <CancellationPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={handleItemsPerPageChange}
          loading={loading}
        />
      )}

      {/* Modals */}
      {showRefundModal && selectedCancellation && (
        <RefundModal
          isOpen={showRefundModal}
          cancellation={selectedCancellation}
          onClose={() => setShowRefundModal(false)}
          onConfirmRefund={processRefund}
          loading={processingRefund}
        />
      )}

      {showDetailsModal && selectedCancellation && (
        <CancellationDetailsModal
          isOpen={showDetailsModal}
          cancellation={selectedCancellation}
          onClose={() => setShowDetailsModal(false)}
        />
      )}
    </div>
  );
}
