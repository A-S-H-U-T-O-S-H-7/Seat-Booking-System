"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, getDocs, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import adminLogger from '@/lib/adminLogger';
import { toast } from 'react-hot-toast';
import { useAdmin } from '@/context/AdminContext';
import { useTheme } from '@/context/ThemeContext';
import { 
  UserPlusIcon,
  TrashIcon,
  ShieldCheckIcon,
  PencilIcon,
  UserIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

export default function AdminManagement() {
  const { adminUser, isSuperAdmin } = useAdmin();
  const { isDarkMode } = useTheme();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const [newAdmin, setNewAdmin] = useState({
    name: '',
    email: '',
    role: 'admin',
    permissions: []
  });

  const [editingAdmin, setEditingAdmin] = useState(null);

  const availablePermissions = [
    // Based on actual dashboard navigation items - each section gets its own permission
    
    // Overview (always visible, but we can add permission for it)
    { id: 'view_overview', name: 'Overview Dashboard' },
    
    // Core Management
    { id: 'manage_seats', name: 'Havan Seats' },
    { id: 'manage_stalls', name: 'Stall Seats' },
    { id: 'manage_show_seats', name: 'Show Seats' },
    
    // Booking Management - Separate permission for each booking type
    { id: 'view_havan_bookings', name: 'Havan Bookings' },
    { id: 'view_stall_bookings', name: 'Stall Bookings' },
    { id: 'view_show_bookings', name: 'Show Bookings' },
    { id: 'view_delegate_bookings', name: 'Delegate Bookings' },
    
    // New Management Sections
    { id: 'view_donations', name: 'Donations' },
    { id: 'view_sponsor_performer', name: 'Sponsors & Performers' },
    
    // Cancellation & Refund Management
    { id: 'manage_cancellations', name: 'Cancellation & Refunds' },
    
    // User & System Management
    { id: 'view_users', name: 'User Management' },
    { id: 'manage_pricing', name: 'Price Settings' },
    { id: 'manage_settings', name: 'System Settings' },
    { id: 'manage_admins', name: 'Admin Management' },
    { id: 'view_logs', name: 'Activity Logs' }
  ];

  const roles = [
    { id: 'admin', name: 'Admin', description: 'Regular admin with limited permissions' },
    { id: 'super_admin', name: 'Super Admin', description: 'Full access to all features' }
  ];

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const adminsRef = collection(db, 'admins');
      const snapshot = await getDocs(adminsRef);
      const adminsData = [];
      
      snapshot.forEach(doc => {
        adminsData.push({ id: doc.id, ...doc.data() });
      });

      setAdmins(adminsData);
    } catch (error) {
      console.error('Error fetching admins:', error);
      toast.error('Failed to load admins');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    if (!newAdmin.name || !newAdmin.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsUpdating(true);
    try {
      // For now, create admin with email-based ID since we don't have Firebase Auth UID yet
      // In production, you would create the Firebase Auth account first
      const adminId = newAdmin.email.replace(/[.@]/g, '_');
      
      const adminData = {
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role,
        permissions: newAdmin.role === 'super_admin' ? [] : newAdmin.permissions,
        createdAt: new Date(),
        createdBy: adminUser.uid,
        isActive: true,
        // Add flag to indicate this admin needs to complete setup
        setupCompleted: false
      };

      await setDoc(doc(db, 'admins', adminId), adminData);
      
      setAdmins(prev => [...prev, { id: adminId, ...adminData }]);
      setShowAddModal(false);
      setNewAdmin({ name: '', email: '', role: 'admin', permissions: [] });
      toast.success(
        'Admin added successfully! They need to create their account first, then contact you to link their account.'
      );
    } catch (error) {
      console.error('Error adding admin:', error);
      toast.error('Failed to add admin');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditAdmin = (admin) => {
    setEditingAdmin(admin);
    setShowEditModal(true);
  };

  const handleUpdateAdmin = async (e) => {
    e.preventDefault();
    if (!editingAdmin) return;

    setIsUpdating(true);
    try {
      const adminRef = doc(db, 'admins', editingAdmin.id);
      const updates = {
        name: editingAdmin.name,
        role: editingAdmin.role,
        permissions: editingAdmin.role === 'super_admin' ? [] : editingAdmin.permissions,
        updatedAt: new Date(),
        updatedBy: adminUser.uid
      };

      await updateDoc(adminRef, updates);
      
      setAdmins(prev => prev.map(admin => 
        admin.id === editingAdmin.id 
          ? { ...admin, ...updates }
          : admin
      ));
      
      setShowEditModal(false);
      setEditingAdmin(null);
      toast.success('Admin updated successfully');
    } catch (error) {
      console.error('Error updating admin:', error);
      toast.error('Failed to update admin');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAdmin = async (adminId) => {
    if (adminId === adminUser.uid) {
      toast.error('You cannot delete yourself');
      return;
    }

    // Find the admin to be deleted for logging
    const adminToDelete = admins.find(admin => admin.id === adminId);
    if (!adminToDelete) {
      toast.error('Admin not found');
      return;
    }

    if (!confirm(`Are you sure you want to remove admin "${adminToDelete.name}"? This action cannot be undone and will immediately revoke their access.`)) {
      return;
    }

    setIsUpdating(true);
    try {
      // Delete admin document from Firestore
      await deleteDoc(doc(db, 'admins', adminId));
      
      // Log the admin deletion activity
      await adminLogger.logAdminActivity(
        adminUser,
        'delete',
        adminId,
        `Removed admin: ${adminToDelete.name} (${adminToDelete.email})`
      );
      
      // Update local state
      setAdmins(prev => prev.filter(admin => admin.id !== adminId));
      toast.success(`Admin "${adminToDelete.name}" has been removed successfully. Their access has been revoked immediately.`);
    } catch (error) {
      console.error('Error deleting admin:', error);
      toast.error('Failed to remove admin');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleTogglePermission = (permissionId, isForNewAdmin = true) => {
    if (isForNewAdmin) {
      setNewAdmin(prev => ({
        ...prev,
        permissions: prev.permissions.includes(permissionId)
          ? prev.permissions.filter(p => p !== permissionId)
          : [...prev.permissions, permissionId]
      }));
    } else if (editingAdmin) {
      setEditingAdmin(prev => ({
        ...prev,
        permissions: prev.permissions.includes(permissionId)
          ? prev.permissions.filter(p => p !== permissionId)
          : [...prev.permissions, permissionId]
      }));
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border p-8 text-center`}>
        <ShieldCheckIcon className={`w-12 h-12 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} mx-auto mb-4`} />
        <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>Access Restricted</h3>
        <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Only Super Admins can manage admin users.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Admin Management</h1>
          <p className={`mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Manage admin users and their permissions</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 transition-colors duration-200"
        >
          <UserPlusIcon className="w-4 h-4 mr-2" />
          Add Admin
        </button>
      </div>

      {/* Admins Table */}
      <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl shadow-sm border overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <tr>
                <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                  Admin
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                  Role
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                  Permissions
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                  Status
                </th>
                <th className={`px-6 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={`${isDarkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'} divide-y`}>
              {admins.map((admin) => (
                <tr key={admin.id} className={`${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors duration-150`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 ${isDarkMode ? 'bg-purple-900 text-purple-300' : 'bg-purple-100 text-purple-600'} rounded-full flex items-center justify-center font-bold text-sm`}>
                        {admin.name?.charAt(0).toUpperCase() || 'A'}
                      </div>
                      <div className="ml-4">
                        <div className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{admin.name}</div>
                        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{admin.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      admin.role === 'super_admin' 
                        ? (isDarkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800')
                        : (isDarkMode ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800')
                    }`}>
                      {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>
                      {admin.role === 'super_admin' ? (
                        <span className={`${isDarkMode ? 'text-green-400' : 'text-green-600'} font-medium`}>All Permissions</span>
                      ) : admin.permissions && admin.permissions.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {admin.permissions.slice(0, 3).map(permission => (
                            <span key={permission} className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              isDarkMode ? 'bg-gray-600 text-gray-200' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {availablePermissions.find(p => p.id === permission)?.name || permission}
                            </span>
                          ))}
                          {admin.permissions.length > 3 && (
                            <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              +{admin.permissions.length - 3} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className={`${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>No permissions</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      admin.isActive !== false 
                        ? (isDarkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800')
                        : (isDarkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800')
                    }`}>
                      {admin.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleEditAdmin(admin)}
                        className={`p-1.5 rounded-md transition-colors duration-200 ${
                          isDarkMode 
                            ? 'text-purple-400 hover:text-purple-300 hover:bg-purple-900/50' 
                            : 'text-purple-600 hover:text-purple-900 hover:bg-purple-50'
                        }`}
                        title="Edit Admin"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      {admin.id !== adminUser.uid && (
                        <button
                          onClick={() => handleDeleteAdmin(admin.id)}
                          disabled={isUpdating}
                          className={`p-1.5 rounded-md transition-colors duration-200 disabled:opacity-50 ${
                            isDarkMode 
                              ? 'text-red-400 hover:text-red-300 hover:bg-red-900/50' 
                              : 'text-red-600 hover:text-red-900 hover:bg-red-50'
                          }`}
                          title="Remove Admin"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Admin Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/20 backdrop-blur-md bg-opacity-60 transition-opacity"
            onClick={() => setShowAddModal(false)}
          ></div>
          
          {/* Modal */}
          <div className={`relative ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden`}>
            {/* Header */}
            <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Add New Admin
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className={`p-1 rounded-md transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddAdmin} className="overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Name *
                  </label>
                  <input
                    type="text"
                    value={newAdmin.name}
                    onChange={(e) => setNewAdmin({...newAdmin, name: e.target.value})}
                    className={`block w-full px-3 py-2 rounded-md border transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500' 
                        : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500 focus:ring-purple-500'
                    }`}
                    required
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Email *
                  </label>
                  <input
                    type="email"
                    value={newAdmin.email}
                    onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})}
                    className={`block w-full px-3 py-2 rounded-md border transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500' 
                        : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500 focus:ring-purple-500'
                    }`}
                    required
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Role
                  </label>
                  <select
                    value={newAdmin.role}
                    onChange={(e) => setNewAdmin({...newAdmin, role: e.target.value})}
                    className={`block w-full px-3 py-2 rounded-md border transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500' 
                        : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500 focus:ring-purple-500'
                    }`}
                  >
                    {roles.map(role => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>
                </div>
                
                {newAdmin.role !== 'super_admin' && (
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      Page Access Permissions
                    </label>
                    <div className={`border rounded-md p-4 max-h-64 overflow-y-auto space-y-4 ${isDarkMode ? 'border-gray-600 bg-gray-700/50' : 'border-gray-300 bg-gray-50'}`}>
                      {/* Quick Select All/None */}
                      <div className="flex gap-2 pb-2 border-b border-gray-300 dark:border-gray-600">
                        <button
                          type="button"
                          onClick={() => setNewAdmin({...newAdmin, permissions: availablePermissions.map(p => p.id)})}
                          className={`px-2 py-1 text-xs rounded ${isDarkMode ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'}`}
                        >
                          Select All
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewAdmin({...newAdmin, permissions: []})}
                          className={`px-2 py-1 text-xs rounded ${isDarkMode ? 'bg-gray-600 text-white hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                          Clear All
                        </button>
                      </div>
                      
                      {/* All Permissions */}
                      <div className="space-y-2">
                        {availablePermissions.map(permission => (
                          <label key={permission.id} className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={newAdmin.permissions.includes(permission.id)}
                              onChange={() => handleTogglePermission(permission.id, true)}
                              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded transition-colors"
                            />
                            <span className={`ml-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{permission.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className={`px-6 py-4 border-t ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'} flex justify-end space-x-3`}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className={`px-4 py-2 text-sm font-medium rounded-md border transition-colors ${
                    isDarkMode 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? 'Adding...' : 'Add Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Admin Modal */}
      {showEditModal && editingAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/20 backdrop-blur-md bg-opacity-60 transition-opacity"
            onClick={() => setShowEditModal(false)}
          ></div>
          
          {/* Modal */}
          <div className={`relative ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden`}>
            {/* Header */}
            <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Edit Admin
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className={`p-1 rounded-md transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleUpdateAdmin} className="overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Name *
                  </label>
                  <input
                    type="text"
                    value={editingAdmin.name}
                    onChange={(e) => setEditingAdmin({...editingAdmin, name: e.target.value})}
                    className={`block w-full px-3 py-2 rounded-md border transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500' 
                        : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500 focus:ring-purple-500'
                    }`}
                    required
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={editingAdmin.email}
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
                    Role
                  </label>
                  <select
                    value={editingAdmin.role}
                    onChange={(e) => setEditingAdmin({...editingAdmin, role: e.target.value})}
                    className={`block w-full px-3 py-2 rounded-md border transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-purple-500 focus:ring-purple-500' 
                        : 'bg-white border-gray-300 text-gray-900 focus:border-purple-500 focus:ring-purple-500'
                    }`}
                  >
                    {roles.map(role => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>
                </div>
                
                {editingAdmin.role !== 'super_admin' && (
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      Permissions
                    </label>
                    <div className={`border rounded-md p-3 max-h-32 overflow-y-auto space-y-2 ${isDarkMode ? 'border-gray-600 bg-gray-700/50' : 'border-gray-300 bg-gray-50'}`}>
                      {availablePermissions.map(permission => (
                        <label key={permission.id} className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editingAdmin.permissions?.includes(permission.id) || false}
                            onChange={() => handleTogglePermission(permission.id, false)}
                            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded transition-colors"
                          />
                          <span className={`ml-2 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{permission.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className={`px-6 py-4 border-t ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'} flex justify-end space-x-3`}>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className={`px-4 py-2 text-sm font-medium rounded-md border transition-colors ${
                    isDarkMode 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? 'Updating...' : 'Update Admin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
