"use client"
import React, { useState, useEffect } from 'react';
import { 
  getAllDistinguishedGuests,
  createDistinguishedGuest,
  updateDistinguishedGuest,
  deleteDistinguishedGuest,
  uploadGuestImage
} from '@/lib/distinguishedGuestsService';
import { GUEST_CATEGORIES, DEFAULT_GUEST } from '@/lib/guestConstants';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';

const AdminGuests = () => {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingGuest, setEditingGuest] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(DEFAULT_GUEST);
  const [uploading, setUploading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    loadGuests();
  }, [retryCount]);

  const loadGuests = async () => {
    try {
      setLoading(true);
      const result = await getAllDistinguishedGuests();
      
      if (result.success) {
        setGuests(result.data || []);
        if (result.data?.length > 0) {
          toast.success(`Loaded ${result.data.length} guests successfully`);
        }
      } else {
        console.error('Error loading guests:', result.error);
        
        // Check if it's an index building error
        if (result.error?.includes('index is currently building')) {
          toast.warning(
            <div>
              <p>Database index is building...</p>
              <button 
                onClick={() => setRetryCount(prev => prev + 1)}
                className="mt-2 bg-blue-500 text-white px-3 py-1 rounded text-sm"
              >
                Retry Now
              </button>
            </div>,
            {
              autoClose: 10000,
              closeButton: true
            }
          );
        } else {
          toast.error('Failed to load guests: ' + result.error);
        }
      }
    } catch (error) {
      console.error('Error loading guests:', error);
      toast.error('Error loading guests: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      if (editingGuest) {
        result = await updateDistinguishedGuest(editingGuest.id, formData);
      } else {
        result = await createDistinguishedGuest(formData);
      }
      
      if (result.success) {
        await loadGuests();
        resetForm();
        toast.success(editingGuest ? 'Guest updated successfully!' : 'Guest created successfully!');
      } else {
        toast.error(`Error: ${result.error}`);
      }
    } catch (error) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (guest) => {
    setEditingGuest(guest);
    setFormData({
      ...guest,
      name: guest.name || '',
      title: guest.title || '',
      description: guest.description || '',
      category: guest.category || 'spiritual',
      order: guest.order || 0,
      isActive: guest.isActive !== undefined ? guest.isActive : true,
      isExpected: guest.isExpected !== undefined ? guest.isExpected : false,
      significance: guest.significance || '',
      imageUrl: guest.imageUrl || '',
      imagePath: guest.imagePath || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        const deleteResult = await deleteDistinguishedGuest(id);
        if (deleteResult.success) {
          await loadGuests();
          toast.success('Guest deleted successfully!');
        } else {
          toast.error(`Error: ${deleteResult.error}`);
        }
      } catch (error) {
        toast.error(`Error: ${error.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const result = await uploadGuestImage(file, editingGuest?.id || 'new');
      if (result.success) {
        setFormData(prev => ({
          ...prev,
          imageUrl: result.imageUrl,
          imagePath: result.imagePath
        }));
        toast.success('Image uploaded successfully!');
      } else {
        toast.error(`Error uploading image: ${result.error}`);
      }
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error(`Error uploading image: ${error.message}`);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const resetForm = () => {
    setEditingGuest(null);
    setFormData(DEFAULT_GUEST);
    setShowForm(false);
  };

  const AdminGuestCard = ({ guest }) => {
    const category = GUEST_CATEGORIES[guest.category] || GUEST_CATEGORIES.spiritual;

    return (
      <div className="bg-white  rounded-lg shadow-md border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-lg">
        <div className="p-4">
          <div className="flex items-start gap-4">
            <div className={`flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br ${category.gradient} p-0.5`}>
              <div className="w-full h-full rounded-full bg-white p-1">
                <img 
                  src={guest.imageUrl || '/api/placeholder/120/120'} 
                  alt={guest.name}
                  className="w-full h-full rounded-full object-cover"
                  onError={(e) => {
                    e.target.src = '/api/placeholder/120/120';
                  }}
                />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg mb-1 text-gray-900 truncate">
                {guest.name}
              </h3>
              <p className="text-sm mb-1 text-gray-600 line-clamp-1">
                {guest.title}
              </p>
              <p className="text-xs mb-2 text-gray-500 line-clamp-2">
                {guest.description}
              </p>
              
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                  {category.label}
                </span>
                <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                  Order: {guest.order || 0}
                </span>
                <span className={`px-2 py-1 rounded-full ${!guest.isActive ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                  {guest.isActive ? 'Active' : 'Inactive'}
                </span>
                {guest.isExpected && (
    <span className="px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
      Expected
    </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <button
              onClick={() => handleEdit(guest)}
              className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(guest.id)}
              className="flex-1 bg-red-600 text-white py-2 px-3 rounded-md text-sm font-medium hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Sort guests by order and then by name
  const sortedGuests = [...guests].sort((a, b) => {
    const orderA = a.order || 0;
    const orderB = b.order || 0;
    if (orderA !== orderB) return orderA - orderB;
    return (a.name || '').localeCompare(b.name || '');
  });

  if (loading && guests.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading guests...</p>
          <p className="text-sm text-gray-500 mt-2">Index might be building, this may take a few minutes</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 border rounded-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold dark:text-gray-100 text-gray-900">
              Manage Distinguished Guests
            </h1>
            <p className="mt-2 text-gray-600">
              Add, edit, and manage spiritual masters, artists, and dignitaries
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={loadGuests}
              className="bg-gray-600 text-white py-2 px-4 rounded-md font-medium hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Refresh
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="bg-purple-600 text-white py-2 px-4 rounded-md font-medium hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              Add New Guest
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="text-2xl font-bold text-gray-900">{guests.length}</div>
            <div className="text-sm text-gray-600">Total Guests</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="text-2xl font-bold text-gray-900">
              {guests.filter(g => g.category === 'spiritual').length}
            </div>
            <div className="text-sm text-gray-600">Spiritual Gurus</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="text-2xl font-bold text-gray-900">
              {guests.filter(g => g.category === 'artist').length}
            </div>
            <div className="text-sm text-gray-600">Artists</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="text-2xl font-bold text-gray-900">
              {guests.filter(g => g.category === 'special').length}
            </div>
            <div className="text-sm text-gray-600">Special Guests</div>
          </div>
        </div>

        {/* Guest Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingGuest ? 'Edit Guest' : 'Add New Guest'}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">
                        Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">
                        Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full text-gray-800 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter title/position"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">
                      Description *
                    </label>
                    <textarea
                      required
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows="3"
                      className="w-full text-gray-800 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter description"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">
                      Significance
                    </label>
                    <textarea
                      value={formData.significance}
                      onChange={(e) => setFormData(prev => ({ ...prev, significance: e.target.value }))}
                      rows="2"
                      className="w-full text-gray-800 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter sacred significance"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">
                        Category *
                      </label>
                      <select
                        required
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full text-gray-800 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        {Object.entries(GUEST_CATEGORIES).map(([key, cat]) => (
                          <option key={key} value={key}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 text-gray-700">
                        Display Order
                      </label>
                      <input
                        type="number"
                        value={formData.order}
                        onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                        className="w-full text-gray-800 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Display order (0 = first)"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="w-4 h-4  text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                      Active (visible on website)
                    </label>
                  </div>

{/* //expected checkbox */}
                  <div className="flex items-center">
  <input
    type="checkbox"
    id="isExpected"
    checked={formData.isExpected || false}
    onChange={(e) => setFormData(prev => ({ ...prev, isExpected: e.target.checked }))}
    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
  />
  <label htmlFor="isExpected" className="ml-2 text-sm text-gray-700">
    Expected
  </label>
</div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-700">
                      Profile Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="w-full text-gray-800 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    {uploading && (
                      <p className="text-sm mt-1 text-gray-600">
                        Uploading image...
                      </p>
                    )}
                    {formData.imageUrl && (
                      <div className="mt-2 flex items-center gap-4">
                        <img 
                          src={formData.imageUrl} 
                          alt="Preview" 
                          className="w-20 h-20 rounded-full object-cover border-2 border-purple-500"
                          onError={(e) => {
                            e.target.src = '/api/placeholder/120/120';
                          }}
                        />
                        <span className="text-sm text-gray-600">Image preview</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <button
                      type="submit"
                      disabled={loading || uploading}
                      className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {loading ? 'Saving...' : (editingGuest ? 'Update Guest' : 'Create Guest')}
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md font-medium hover:bg-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Guests Grid */}
        {sortedGuests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedGuests.map(guest => (
              <AdminGuestCard key={guest.id} guest={guest} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Guests Found</h3>
            <p className="text-gray-600 mb-4">Get started by adding your first distinguished guest.</p>
            <p className="text-sm text-gray-500 mb-6">
              If you just created guests, the database index might still be building. 
              This usually takes 2-5 minutes.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={loadGuests}
                className="bg-gray-600 text-white py-2 px-4 rounded-md font-medium hover:bg-gray-700 transition-colors"
              >
                Refresh
              </button>
              <button
                onClick={() => setShowForm(true)}
                className="bg-purple-600 text-white py-2 px-6 rounded-md font-medium hover:bg-purple-700 transition-colors"
              >
                Add First Guest
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminGuests;