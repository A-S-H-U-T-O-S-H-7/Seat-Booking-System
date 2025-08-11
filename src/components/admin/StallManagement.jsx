"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { 
  collection, 
  query, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  orderBy,
  onSnapshot,
  serverTimestamp,
  setDoc
} from 'firebase/firestore';
import { format } from 'date-fns';
import { useTheme } from '@/context/ThemeContext';
import { useAdmin } from '@/context/AdminContext';
import { toast } from 'react-hot-toast';
import adminLogger from '@/lib/adminLogger';
import {
  CalendarDaysIcon,
  BuildingStorefrontIcon,
  CurrencyRupeeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  PlusIcon,
  PencilIcon
} from '@heroicons/react/24/outline';

export default function StallManagement() {
  const { isDarkMode } = useTheme();
  const { hasPermission, adminUser } = useAdmin();
  const [stalls, setStalls] = useState([]);
  const [filteredStalls, setFilteredStalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStall, setSelectedStall] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    searchTerm: '',
    size: 'all'
  });
  const [stats, setStats] = useState({
    totalStalls: 0,
    availableStalls: 0,
    bookedStalls: 0,
    totalRevenue: 0
  });
  const [newStall, setNewStall] = useState({
    stallNumber: '',
    size: 'small',
    category: 'food',
    pricePerDay: '',
    description: '',
    amenities: [],
    location: '',
    status: 'available'
  });

  const stallCategories = [
    { id: 'food', name: 'Food & Beverages', icon: '🍽️' },
    { id: 'handicrafts', name: 'Handicrafts', icon: '🎨' },
    { id: 'clothing', name: 'Clothing', icon: '👕' },
    { id: 'jewelry', name: 'Jewelry', icon: '💍' },
    { id: 'books', name: 'Books & Literature', icon: '📚' },
    { id: 'toys', name: 'Toys & Games', icon: '🧸' },
    { id: 'electronics', name: 'Electronics', icon: '📱' },
    { id: 'general', name: 'General Merchandise', icon: '🛍️' }
  ];

  const stallSizes = [
    { id: 'small', name: 'Small (10x10 ft)', basePrice: 2000 },
    { id: 'medium', name: 'Medium (15x15 ft)', basePrice: 3500 },
    { id: 'large', name: 'Large (20x20 ft)', basePrice: 5000 }
  ];

  const amenitiesList = [
    'electricity', 'water_connection', 'wifi', 'storage_space', 
    'display_rack', 'counter', 'chair', 'canopy'
  ];

  useEffect(() => {
    if (hasPermission('view_events') || hasPermission('manage_stalls')) {
      fetchStalls();
    }
  }, [hasPermission]);

  useEffect(() => {
    applyFilters();
  }, [stalls, filters]);

  const fetchStalls = async () => {
    try {
      setLoading(true);
      const stallsRef = collection(db, 'stalls');
      const q = query(stallsRef, orderBy('stallNumber', 'asc'));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const stallsData = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          stallsData.push({
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate(),
          });
        });
        
        setStalls(stallsData);
        calculateStats(stallsData);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error fetching stalls:', error);
      toast.error('Failed to load stalls');
      setLoading(false);
    }
  };

  const calculateStats = (stallsData) => {
    const stats = {
      totalStalls: stallsData.length,
      availableStalls: stallsData.filter(s => s.status === 'available').length,
      bookedStalls: stallsData.filter(s => s.status === 'booked').length,
      totalRevenue: stallsData
        .filter(s => s.status === 'booked')
        .reduce((sum, stall) => sum + (parseFloat(stall.pricePerDay) || 0) * 5, 0) // 5 days event
    };
    setStats(stats);
  };

  const applyFilters = () => {
    let filtered = [...stalls];

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(stall => stall.status === filters.status);
    }

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(stall => stall.category === filters.category);
    }

    // Size filter
    if (filters.size !== 'all') {
      filtered = filtered.filter(stall => stall.size === filters.size);
    }

    // Search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(stall => 
        stall.stallNumber?.toLowerCase().includes(searchLower) ||
        stall.description?.toLowerCase().includes(searchLower) ||
        stall.location?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredStalls(filtered);
  };

  const handleAddStall = async (e) => {
    e.preventDefault();
    if (!hasPermission('manage_stalls')) {
      toast.error('You do not have permission to add stalls');
      return;
    }

    try {
      setUpdating(true);
      const stallId = `stall_${newStall.stallNumber}_${Date.now()}`;
      
      const stallData = {
        ...newStall,
        pricePerDay: parseFloat(newStall.pricePerDay),
        createdAt: serverTimestamp(),
        createdBy: adminUser?.uid,
        updatedAt: serverTimestamp()
      };

      await setDoc(doc(db, 'stalls', stallId), stallData);

      // Log the activity
      if (adminUser) {
        await adminLogger.logSystemActivity(
          adminUser,
          'create',
          'stall_management',
          `Added new stall: ${newStall.stallNumber}`
        );
      }

      setShowAddModal(false);
      setNewStall({
        stallNumber: '',
        size: 'small',
        category: 'food',
        pricePerDay: '',
        description: '',
        amenities: [],
        location: '',
        status: 'available'
      });
      
      toast.success('Stall added successfully');
    } catch (error) {
      console.error('Error adding stall:', error);
      toast.error('Failed to add stall');
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdateStallStatus = async (stallId, newStatus) => {
    if (!hasPermission('manage_stalls')) {
      toast.error('You do not have permission to update stalls');
      return;
    }

    try {
      setUpdating(true);
      const stallRef = doc(db, 'stalls', stallId);
      await updateDoc(stallRef, {
        status: newStatus,
        updatedAt: serverTimestamp(),
        updatedBy: adminUser?.uid
      });

      // Log the activity
      if (adminUser) {
        await adminLogger.logSystemActivity(
          adminUser,
          'update',
          'stall_management',
          `Updated stall status to ${newStatus}`
        );
      }
      
      toast.success('Stall status updated successfully');
    } catch (error) {
      console.error('Error updating stall:', error);
      toast.error('Failed to update stall');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteStall = async (stallId) => {
    if (!hasPermission('manage_stalls')) {
      toast.error('You do not have permission to delete stalls');
      return;
    }

    if (!confirm('Are you sure you want to permanently delete this stall? This action cannot be undone.')) {
      return;
    }

    try {
      setUpdating(true);
      await deleteDoc(doc(db, 'stalls', stallId));
      
      // Log the activity
      if (adminUser) {
        await adminLogger.logSystemActivity(
          adminUser,
          'delete',
          'stall_management',
          `Deleted stall: ${stallId}`
        );
      }
      
      toast.success('Stall deleted successfully');
    } catch (error) {
      console.error('Error deleting stall:', error);
      toast.error('Failed to delete stall');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      available: isDarkMode ? 'bg-green-900/50 text-green-300' : 'bg-green-100 text-green-800',
      booked: isDarkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-800',
      maintenance: isDarkMode ? 'bg-yellow-900/50 text-yellow-300' : 'bg-yellow-100 text-yellow-800',
      blocked: isDarkMode ? 'bg-red-900/50 text-red-300' : 'bg-red-100 text-red-800'
    };

    const statusIcons = {
      available: CheckCircleIcon,
      booked: ClockIcon,
      maintenance: ExclamationTriangleIcon,
      blocked: XCircleIcon
    };

    const Icon = statusIcons[status] || CheckCircleIcon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status] || (isDarkMode ? 'bg-gray-900/50 text-gray-300' : 'bg-gray-100 text-gray-800')}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getCategoryIcon = (category) => {
    return stallCategories.find(c => c.id === category)?.icon || '🛍️';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className={`h-8 rounded w-1/4 mb-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className={`h-4 rounded w-1/2 mb-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                <div className={`h-6 rounded w-1/3 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
              </div>
            ))}
          </div>
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
            Stall Management
          </h1>
          <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage event stalls and vendor spaces
          </p>
        </div>
        {hasPermission('manage_stalls') && (
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 transition-colors duration-200"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Stall
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center">
            <BuildingStorefrontIcon className={`w-6 h-6 mr-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Total Stalls
              </p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.totalStalls}
              </p>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center">
            <CheckCircleIcon className={`w-6 h-6 mr-2 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Available
              </p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.availableStalls}
              </p>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center">
            <ClockIcon className={`w-6 h-6 mr-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Booked
              </p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {stats.bookedStalls}
              </p>
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center">
            <CurrencyRupeeIcon className={`w-6 h-6 mr-2 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
            <div>
              <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                Revenue
              </p>
              <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                ₹{stats.totalRevenue.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className={`p-4 rounded-lg border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <MagnifyingGlassIcon className="w-4 h-4 inline mr-1" />
              Search
            </label>
            <input
              type="text"
              value={filters.searchTerm}
              onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
              placeholder="Search by number, location..."
              className={`block w-full rounded-lg border transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900'
              } px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent`}
            />
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <AdjustmentsHorizontalIcon className="w-4 h-4 inline mr-1" />
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className={`block w-full rounded-lg border transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent`}
            >
              <option value="all">All Statuses</option>
              <option value="available">Available</option>
              <option value="booked">Booked</option>
              <option value="maintenance">Maintenance</option>
              <option value="blocked">Blocked</option>
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({...filters, category: e.target.value})}
              className={`block w-full rounded-lg border transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent`}
            >
              <option value="all">All Categories</option>
              {stallCategories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              Size
            </label>
            <select
              value={filters.size}
              onChange={(e) => setFilters({...filters, size: e.target.value})}
              className={`block w-full rounded-lg border transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              } px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent`}
            >
              <option value="all">All Sizes</option>
              {stallSizes.map(size => (
                <option key={size.id} value={size.id}>
                  {size.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stalls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStalls.length === 0 ? (
          <div className={`col-span-full text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <ExclamationTriangleIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No stalls found</p>
            <p className="text-sm">Try adjusting your filters</p>
          </div>
        ) : (
          filteredStalls.map((stall) => (
            <div 
              key={stall.id}
              className={`rounded-lg border p-6 transition-all duration-200 hover:shadow-lg ${
                isDarkMode ? 'bg-gray-800 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Stall Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <span className="text-2xl mr-2">{getCategoryIcon(stall.category)}</span>
                  <div>
                    <h3 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      Stall #{stall.stallNumber}
                    </h3>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {stallSizes.find(s => s.id === stall.size)?.name || stall.size}
                    </p>
                  </div>
                </div>
                {getStatusBadge(stall.status)}
              </div>

              {/* Stall Details */}
              <div className="space-y-3">
                <div>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Category
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {stallCategories.find(c => c.id === stall.category)?.name || stall.category}
                  </p>
                </div>

                {stall.location && (
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Location
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {stall.location}
                    </p>
                  </div>
                )}

                <div>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Price per Day
                  </p>
                  <p className={`text-lg font-bold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                    ₹{stall.pricePerDay?.toLocaleString('en-IN') || 0}
                  </p>
                </div>

                {stall.description && (
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Description
                    </p>
                    <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} line-clamp-2`}>
                      {stall.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedStall(stall);
                      setShowDetailsModal(true);
                    }}
                    className={`p-2 rounded-md transition-colors duration-200 ${
                      isDarkMode 
                        ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-900/50' 
                        : 'text-blue-600 hover:text-blue-900 hover:bg-blue-50'
                    }`}
                    title="View Details"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </button>

                  {hasPermission('manage_stalls') && (
                    <>
                      {stall.status === 'available' && (
                        <button
                          onClick={() => handleUpdateStallStatus(stall.id, 'maintenance')}
                          disabled={updating}
                          className={`p-2 rounded-md transition-colors duration-200 disabled:opacity-50 ${
                            isDarkMode 
                              ? 'text-yellow-400 hover:text-yellow-300 hover:bg-yellow-900/50' 
                              : 'text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50'
                          }`}
                          title="Set to Maintenance"
                        >
                          <ExclamationTriangleIcon className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteStall(stall.id)}
                        disabled={updating}
                        className={`p-2 rounded-md transition-colors duration-200 disabled:opacity-50 ${
                          isDarkMode 
                            ? 'text-red-400 hover:text-red-300 hover:bg-red-900/50' 
                            : 'text-red-600 hover:text-red-900 hover:bg-red-50'
                        }`}
                        title="Delete Stall"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>

                {hasPermission('manage_stalls') && stall.status !== 'available' && stall.status !== 'booked' && (
                  <button
                    onClick={() => handleUpdateStallStatus(stall.id, 'available')}
                    disabled={updating}
                    className="text-xs px-3 py-1 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
                  >
                    Make Available
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Stall Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`relative ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden`}>
            <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Add New Stall
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className={`p-2 rounded-md transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
              >
                <XCircleIcon className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddStall} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Stall Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={newStall.stallNumber}
                    onChange={(e) => setNewStall({...newStall, stallNumber: e.target.value})}
                    className={`block w-full rounded-lg border transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                    placeholder="e.g., A01, B15"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Size *
                  </label>
                  <select
                    required
                    value={newStall.size}
                    onChange={(e) => setNewStall({...newStall, size: e.target.value})}
                    className={`block w-full rounded-lg border transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                  >
                    {stallSizes.map(size => (
                      <option key={size.id} value={size.id}>
                        {size.name} - ₹{size.basePrice}/day
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Category *
                  </label>
                  <select
                    required
                    value={newStall.category}
                    onChange={(e) => setNewStall({...newStall, category: e.target.value})}
                    className={`block w-full rounded-lg border transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                  >
                    {stallCategories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Price per Day (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={newStall.pricePerDay}
                    onChange={(e) => setNewStall({...newStall, pricePerDay: e.target.value})}
                    className={`block w-full rounded-lg border transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                    placeholder="e.g., 2000"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Location
                  </label>
                  <input
                    type="text"
                    value={newStall.location}
                    onChange={(e) => setNewStall({...newStall, location: e.target.value})}
                    className={`block w-full rounded-lg border transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                    placeholder="e.g., Near Main Gate, Section A"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Description
                  </label>
                  <textarea
                    value={newStall.description}
                    onChange={(e) => setNewStall({...newStall, description: e.target.value})}
                    rows={3}
                    className={`block w-full rounded-lg border transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                    placeholder="Additional details about the stall..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                    isDarkMode 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updating ? 'Adding...' : 'Add Stall'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stall Details Modal */}
      {showDetailsModal && selectedStall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`relative ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden`}>
            <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
              <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Stall #{selectedStall.stallNumber} Details
              </h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className={`p-2 rounded-md transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
              >
                <XCircleIcon className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Basic Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Number:</span>
                      <span className={`ml-2 font-mono ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {selectedStall.stallNumber}
                      </span>
                    </div>
                    <div>
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Status:</span>
                      <span className="ml-2">{getStatusBadge(selectedStall.status)}</span>
                    </div>
                    <div>
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Size:</span>
                      <span className={`ml-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {stallSizes.find(s => s.id === selectedStall.size)?.name || selectedStall.size}
                      </span>
                    </div>
                    <div>
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Category:</span>
                      <span className={`ml-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {getCategoryIcon(selectedStall.category)} {stallCategories.find(c => c.id === selectedStall.category)?.name || selectedStall.category}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Pricing & Location
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Price per Day:</span>
                      <span className={`ml-2 font-bold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                        ₹{selectedStall.pricePerDay?.toLocaleString('en-IN') || 0}
                      </span>
                    </div>
                    <div>
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Total (5 days):</span>
                      <span className={`ml-2 font-bold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                        ₹{((selectedStall.pricePerDay || 0) * 5).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div>
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Location:</span>
                      <span className={`ml-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {selectedStall.location || 'Not specified'}
                      </span>
                    </div>
                    <div>
                      <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Created:</span>
                      <span className={`ml-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {selectedStall.createdAt ? format(selectedStall.createdAt, 'MMM dd, yyyy') : 'Unknown'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedStall.description && (
                <div className="mt-6">
                  <h4 className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Description
                  </h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {selectedStall.description}
                  </p>
                </div>
              )}

              {selectedStall.amenities && selectedStall.amenities.length > 0 && (
                <div className="mt-6">
                  <h4 className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-3`}>
                    Amenities
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {selectedStall.amenities.map((amenity, index) => (
                      <div 
                        key={index}
                        className={`px-3 py-2 rounded-lg text-center text-xs font-medium ${
                          isDarkMode ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {amenity.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
