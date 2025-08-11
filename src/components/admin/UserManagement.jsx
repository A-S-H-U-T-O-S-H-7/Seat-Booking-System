"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
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
    // Fetch from bookings collection instead of users collection
    const bookingsRef = collection(db, 'bookings');
    let bookingsQuery;
    
    try {
      // First try with orderBy (requires index)
      bookingsQuery = query(bookingsRef, orderBy('createdAt', 'desc'), limit(200));
      const snapshot = await getDocs(bookingsQuery);
      
      // Extract unique users from bookings
      const usersMap = new Map();
      
      snapshot.forEach(doc => {
        const data = doc.data();
        const customerDetails = data.customerDetails;
        
        if (customerDetails && customerDetails.email) {
          const userId = customerDetails.email; // Use email as unique identifier
          const existingUser = usersMap.get(userId);
          
          if (!existingUser) {
            // New user - create user object from customerDetails
            usersMap.set(userId, {
              id: userId, // Use email as ID for unique identification
              bookingId: data.bookingId || doc.id, // Store one booking ID as reference
              name: customerDetails.name || 'Unknown User',
              email: customerDetails.email || '',
              phone: customerDetails.phone || '',
              address: customerDetails.address || '',
              createdAt: data.createdAt || null,
              bookingCount: 1,
              lastBookingDate: data.createdAt || null,
              // Store original customer details for reference
              originalCustomerDetails: customerDetails
            });
          } else {
            // Existing user - update booking count and last booking date
            existingUser.bookingCount += 1;
            if (data.createdAt && (!existingUser.lastBookingDate || data.createdAt.toMillis() > existingUser.lastBookingDate.toMillis())) {
              existingUser.lastBookingDate = data.createdAt;
              // Update with more recent booking info if needed
              existingUser.name = customerDetails.name || existingUser.name;
              existingUser.phone = customerDetails.phone || existingUser.phone;
              existingUser.address = customerDetails.address || existingUser.address;
            }
          }
        }
      });

      const usersData = Array.from(usersMap.values());
      console.log(`Extracted ${usersData.length} unique users from ${snapshot.size} bookings`);
      setUsers(usersData);
      
    } catch (indexError) {
      console.log('Index not available, trying simple query:', indexError.message);
      
      // Fallback to simple query without orderBy
      const simpleSnapshot = await getDocs(bookingsRef);
      const usersMap = new Map();
      
      simpleSnapshot.forEach(doc => {
        const data = doc.data();
        const customerDetails = data.customerDetails;
        
        if (customerDetails && customerDetails.email) {
          const userId = customerDetails.email;
          const existingUser = usersMap.get(userId);
          
          if (!existingUser) {
            usersMap.set(userId, {
              id: userId,
              bookingId: data.bookingId || doc.id,
              name: customerDetails.name || 'Unknown User',
              email: customerDetails.email || '',
              phone: customerDetails.phone || '',
              address: customerDetails.address || '',
              createdAt: data.createdAt || null,
              bookingCount: 1,
              lastBookingDate: data.createdAt || null,
              originalCustomerDetails: customerDetails
            });
          } else {
            existingUser.bookingCount += 1;
            if (data.createdAt && (!existingUser.lastBookingDate || data.createdAt.toMillis() > existingUser.lastBookingDate.toMillis())) {
              existingUser.lastBookingDate = data.createdAt;
              existingUser.name = customerDetails.name || existingUser.name;
              existingUser.phone = customerDetails.phone || existingUser.phone;
              existingUser.address = customerDetails.address || existingUser.address;
            }
          }
        }
      });

      const usersData = Array.from(usersMap.values());
      
      // Sort on client side by last booking date
      usersData.sort((a, b) => {
        if (!a.lastBookingDate && !b.lastBookingDate) return 0;
        if (!a.lastBookingDate) return 1;
        if (!b.lastBookingDate) return -1;
        return b.lastBookingDate.toMillis() - a.lastBookingDate.toMillis();
      });

      console.log(`Extracted ${usersData.length} unique users from bookings (fallback method)`);
      setUsers(usersData);
    }
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
    user.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                  User
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                  Contact
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
  Last Booking Date
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
              {filteredUsers.map((user) => (
                <tr key={user.id} className={`${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors duration-150`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 ${isDarkMode ? 'bg-purple-900 text-purple-300' : 'bg-purple-100 text-purple-600'} rounded-full flex items-center justify-center font-bold text-sm`}>
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div className="ml-4">
                        <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{user.name}</div>
                        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>ID: {user.id}</div>
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
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
  {user.lastBookingDate ? format(user.lastBookingDate.toDate(), 'MMM dd, yyyy') : 'N/A'}
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
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="5" className={`px-6 py-12 text-center text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {searchTerm ? 'No users found matching your search.' : 'No users found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
