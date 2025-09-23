"use client";
import { useState, useEffect } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, query, orderBy, getDocs, doc, updateDoc, where, limit, startAfter } from 'firebase/firestore';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { useAdmin } from '@/context/AdminContext';
import { useTheme } from '@/context/ThemeContext';
import { 
  MagnifyingGlassIcon,
  UserPlusIcon,
  PencilIcon,
  TrashIcon,
  EnvelopeIcon,
  PhoneIcon,
  XMarkIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function UserManagement() {
  const { adminUser, hasPermission } = useAdmin();
  const { isDarkMode } = useTheme();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
  // Check if user has permission to view users
  if (!hasPermission('view_users')) {
    setError('You do not have permission to view users');
    setLoading(false);
    return;
  }

  setLoading(true);
  setError(null);
  
  try {
    // Extract unique users from multiple collections
    const usersMap = new Map();
    
    // Helper function to add user to map
    const addUserToMap = (email, name, phone, address, aadhar, createdAt, source) => {
      if (!email) return;
      
      const existingUser = usersMap.get(email);
      if (!existingUser) {
        usersMap.set(email, {
          id: email,
          name: name || 'Unknown User',
          email: email,
          phone: phone || '',
          address: address || '',
          aadhar: aadhar || '',
          createdAt: createdAt || null,
          bookingCount: 1,
          lastBookingDate: createdAt || null,
          bookingSources: [source]
        });
      } else {
        existingUser.bookingCount += 1;
        if (!existingUser.bookingSources.includes(source)) {
          existingUser.bookingSources.push(source);
        }
        if (createdAt && (!existingUser.lastBookingDate || createdAt.toMillis() > existingUser.lastBookingDate.toMillis())) {
          existingUser.lastBookingDate = createdAt;
          existingUser.name = name || existingUser.name;
          existingUser.phone = phone || existingUser.phone;
          existingUser.address = address || existingUser.address;
          existingUser.aadhar = aadhar || existingUser.aadhar;
        }
      }
    };
    
    // Fetch from bookings collection (Havan bookings)
    try {
      const bookingsRef = collection(db, 'bookings');
      const bookingsSnapshot = await getDocs(bookingsRef);
      
      bookingsSnapshot.forEach(doc => {
        const data = doc.data();
        const customer = data.customerDetails;
        if (customer && customer.email) {
          addUserToMap(
            customer.email,
            customer.name,
            customer.phone,
            customer.address,
            customer.aadhar || customer.aadharNumber,
            data.createdAt,
            'Havan'
          );
        }
      });
    } catch (error) {
      console.log('Could not fetch from bookings:', error.message);
    }
    
    // Fetch from delegateBookings collection
    try {
      const delegateRef = collection(db, 'delegateBookings');
      const delegateSnapshot = await getDocs(delegateRef);
      
      delegateSnapshot.forEach(doc => {
        const data = doc.data();
        const delegate = data.delegateDetails;
        if (delegate && delegate.email) {
          addUserToMap(
            delegate.email,
            delegate.name,
            delegate.mobile,
            null, // No address in delegate bookings
            delegate.aadharno,
            data.createdAt,
            'Delegate'
          );
        }
      });
    } catch (error) {
      console.log('Could not fetch from delegateBookings:', error.message);
    }
    
    // Fetch from donations collection
    try {
      const donationsRef = collection(db, 'donations');
      const donationsSnapshot = await getDocs(donationsRef);
      
      donationsSnapshot.forEach(doc => {
        const data = doc.data();
        const donor = data.donorDetails;
        if (donor && donor.email) {
          addUserToMap(
            donor.email,
            donor.name,
            donor.mobile,
            null, // No address in donations
            null, // No aadhar in donations
            data.createdAt,
            'Donation'
          );
        }
      });
    } catch (error) {
      console.log('Could not fetch from donations:', error.message);
    }
    
    // Fetch from stallBookings collection
    try {
      const stallRef = collection(db, 'stallBookings');
      const stallSnapshot = await getDocs(stallRef);
      
      stallSnapshot.forEach(doc => {
        const data = doc.data();
        const customer = data.customerDetails;
        if (customer && customer.email) {
          addUserToMap(
            customer.email,
            customer.name,
            customer.phone,
            customer.address,
            customer.aadhar || customer.aadharNumber,
            data.createdAt,
            'Stall'
          );
        }
      });
    } catch (error) {
      console.log('Could not fetch from stallBookings:', error.message);
    }

    const usersData = Array.from(usersMap.values());
    
    // Sort by last booking date (newest first)
    usersData.sort((a, b) => {
      if (!a.lastBookingDate && !b.lastBookingDate) return 0;
      if (!a.lastBookingDate) return 1;
      if (!b.lastBookingDate) return -1;
      return b.lastBookingDate.toMillis() - a.lastBookingDate.toMillis();
    });

    console.log(`Found ${usersData.length} unique users from all collections`);
    setUsers(usersData);
  } catch (error) {
    console.error('Error fetching users from bookings:', error);
    setError(`Failed to load users: ${error.message}`);
    toast.error('Failed to load users');
  } finally {
    setLoading(false);
  }
};

  const handleSearch = (e) => {
    e.preventDefault();
    // The filtering is done on client-side for simplicity
  };

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.aadhar?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleEditUser = (user) => {
    setCurrentUser(user);
    setIsEditing(true);
    setShowUserModal(true);
  };

  const handleUpdateUser = async () => {
  if (!currentUser) return;
  
  // Check permission
  if (!hasPermission('manage_users')) {
    toast.error('You do not have permission to edit users');
    return;
  }

  // Show warning that user data is read-only
  toast.error('User data is read-only as it comes from booking records. To modify user information, please update individual booking records directly.');
  
  // Close modal
  setShowUserModal(false);
  setCurrentUser(null);
  setIsEditing(false);
};

  const handleUserModalChange = (e) => {
    const { name, value } = e.target;
    setCurrentUser(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Show error if permission denied or other errors
  if (error) {
    return (
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border p-8 text-center`}>
        <ExclamationTriangleIcon className={`w-12 h-12 ${isDarkMode ? 'text-red-400' : 'text-red-500'} mx-auto mb-4`} />
        <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Access Error</h3>
        <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-4`}>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 transition-colors duration-200"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>User Management</h1>
          <p className={`mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>View and manage registered users ({users.length} total)</p>
        </div>
      </div>

      {/* Search and Actions */}
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border p-6`}>
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`block w-full pl-10 pr-3 py-2 rounded-md border shadow-sm transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500' 
                  : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500 focus:ring-purple-500'
              }`}
            />
          </div>
        </form>
      </div>

      {/* Users Table */}
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className={`min-w-full divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
            <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                  S.No.
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                  User
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                  Contact
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                  Address
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                  Aadhar Number
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                  Booking Activity
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                  Total Bookings
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={`${isDarkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'} divide-y`}>
              {currentUsers.map((user, index) => (
                <tr key={user.id} className={`${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors duration-150`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {startIndex + index + 1}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 ${isDarkMode ? 'bg-purple-900 text-purple-300' : 'bg-purple-100 text-purple-600'} rounded-full flex items-center justify-center font-bold text-sm`}>
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="ml-4">
                        <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{user.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      <EnvelopeIcon className={`w-4 h-4 inline mr-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                      {user.email}
                    </div>
                    <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <PhoneIcon className={`w-4 h-4 inline mr-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                      {user.phone || 'N/A'}
                    </div>
                  </td>
                  <td className={`px-6 py-4 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} max-w-xs`}>
                    <div className="truncate" title={user.address || 'Not provided'}>
                      {user.address || 'Not provided'}
                    </div>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {user.aadhar ? user.aadhar : 'Not provided'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        Last: {user.lastBookingDate ? format(user.lastBookingDate.toDate(), 'MMM dd, yyyy') : 'N/A'}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {user.bookingSources && user.bookingSources.map(source => (
                          <span key={source} className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                            source === 'Havan' ? (isDarkMode ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-700') :
                            source === 'Stall' ? (isDarkMode ? 'bg-orange-900/30 text-orange-300' : 'bg-orange-100 text-orange-700') :
                            source === 'Delegate' ? (isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700') :
                            source === 'Donation' ? (isDarkMode ? 'bg-pink-900/30 text-pink-300' : 'bg-pink-100 text-pink-700') :
                            (isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600')
                          }`}>
                            {source}
                          </span>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {user.bookingCount || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {hasPermission('manage_users') && (
                      <button
                        onClick={() => handleEditUser(user)}
                        className={`p-1.5 rounded-md transition-colors duration-200 ${
                          isDarkMode 
                            ? 'text-purple-400 hover:text-purple-300 hover:bg-purple-900/50' 
                            : 'text-purple-600 hover:text-purple-900 hover:bg-purple-50'
                        } flex items-center`}
                        title="Edit User"
                      >
                        <PencilIcon className="w-4 h-4 mr-1" /> Edit
                      </button>
                    )}
                    {!hasPermission('manage_users') && (
                      <span className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>View Only</span>
                    )}
                  </td>
                </tr>
              ))}
              {currentUsers.length === 0 && (
                <tr>
                  <td colSpan="8" className={`px-6 py-12 text-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {searchTerm ? 'No users found matching your search.' : 'No users found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className={`px-6 py-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
            <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Showing {startIndex + 1} to {Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} users
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  currentPage === 1 
                    ? isDarkMode ? 'text-gray-500 cursor-not-allowed' : 'text-gray-400 cursor-not-allowed'
                    : isDarkMode 
                      ? 'text-purple-400 hover:text-purple-300 hover:bg-purple-900/50'
                      : 'text-purple-600 hover:text-purple-700 hover:bg-purple-50'
                }`}
              >
                Previous
              </button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      currentPage === pageNum
                        ? 'text-white bg-purple-600'
                        : isDarkMode
                          ? 'text-purple-400 hover:text-purple-300 hover:bg-purple-900/50'
                          : 'text-purple-600 hover:text-purple-700 hover:bg-purple-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  currentPage === totalPages 
                    ? isDarkMode ? 'text-gray-500 cursor-not-allowed' : 'text-gray-400 cursor-not-allowed'
                    : isDarkMode 
                      ? 'text-purple-400 hover:text-purple-300 hover:bg-purple-900/50'
                      : 'text-purple-600 hover:text-purple-700 hover:bg-purple-50'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit User Modal */}
      {showUserModal && currentUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/20 backdrop-blur-sm bg-opacity-60 transition-opacity"
            onClick={() => {
              setShowUserModal(false);
              setCurrentUser(null);
              setIsEditing(false);
            }}
          ></div>
          
          {/* Modal */}
          <div className={`relative ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden`}>
            {/* Header */}
            <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {isEditing ? 'Edit User' : 'Add User'}
              </h3>
              <button
                onClick={() => {
                  setShowUserModal(false);
                  setCurrentUser(null);
                  setIsEditing(false);
                }}
                className={`p-1 rounded-md transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={currentUser.name || ''}
                  onChange={handleUserModalChange}
                  className={`block w-full px-3 py-2 rounded-md border transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500 focus:ring-purple-500'
                  }`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={currentUser.email || ''}
                  disabled
                  className={`block w-full px-3 py-2 rounded-md border cursor-not-allowed ${
                    isDarkMode 
                      ? 'bg-gray-600 border-gray-500 text-gray-400' 
                      : 'bg-gray-100 border-gray-300 text-gray-500'
                  }`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={currentUser.phone || ''}
                  onChange={handleUserModalChange}
                  className={`block w-full px-3 py-2 rounded-md border transition-colors ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500 focus:ring-purple-500'
                  }`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Aadhar Number
                </label>
                <input
                  type="text"
                  name="aadhar"
                  value={currentUser.aadhar || ''}
                  disabled
                  className={`block w-full px-3 py-2 rounded-md border cursor-not-allowed ${
                    isDarkMode 
                      ? 'bg-gray-600 border-gray-500 text-gray-400' 
                      : 'bg-gray-100 border-gray-300 text-gray-500'
                  }`}
                  placeholder={currentUser.aadhar ? `****-****-${currentUser.aadhar.slice(-4)}` : 'Not provided'}
                />
              </div>

              {/* User Info */}
              <div className={`p-3 rounded-md ${isDarkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'} border`}>
                <div className="flex items-center justify-between text-sm">
                  <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Total Bookings:</span>
                  <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {currentUser.bookingCount || 0}
                  </span>
                </div>
                {currentUser.createdAt && (
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Joined:</span>
                    <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {format(currentUser.createdAt.toDate(), 'MMM dd, yyyy')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className={`px-6 py-4 border-t ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'} flex justify-end space-x-3`}>
              <button
                type="button"
                onClick={() => {
                  setShowUserModal(false);
                  setCurrentUser(null);
                  setIsEditing(false);
                }}
                className={`px-4 py-2 text-sm font-medium rounded-md border transition-colors ${
                  isDarkMode 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateUser}
                disabled={isUpdating}
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? 'Updating...' : 'Update User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
