"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { useTheme } from '@/context/ThemeContext';
import { useAdmin } from '@/context/AdminContext';
import adminLogger from '@/lib/adminLogger';
import { 
  CalendarDaysIcon,
  ClockIcon,
  Cog6ToothIcon,
  CheckCircleIcon,
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  PencilIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  HomeIcon,
  BuildingStorefrontIcon,
  TicketIcon
} from '@heroicons/react/24/outline';

const SystemSettings = () => {
  const { isDarkMode } = useTheme();
  const { adminUser } = useAdmin();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('havan');

  // Date Range Settings
  const [dateSettings, setDateSettings] = useState({
    startDate: '',
    endDate: '',
    isActive: true
  });

  // Shift Settings
  const [shiftSettings, setShiftSettings] = useState({
    shifts: []
  });

  // Seat Layout Settings
  const [layoutSettings, setLayoutSettings] = useState({
    blocks: [
      { id: 'A', name: 'Block A', columns: 5, kunds: 5, seatsPerKund: 4, isActive: true },
      { id: 'B', name: 'Block B', columns: 5, kunds: 5, seatsPerKund: 4, isActive: true },
      { id: 'C', name: 'Block C', columns: 5, kunds: 5, seatsPerKund: 4, isActive: true },
      { id: 'D', name: 'Block D', columns: 5, kunds: 5, seatsPerKund: 4, isActive: true }
    ]
  });

  // Stall Settings
  const [stallSettings, setStallSettings] = useState({
    eventDates: {
      startDate: '2025-11-15',
      endDate: '2025-11-20',
      isActive: true
    },
    totalStalls: 70,
    defaultPrice: 5000,
    stalls: []
  });

  // Show Settings
  const [showSettings, setShowSettings] = useState({
    eventDates: {
      startDate: '',
      endDate: '',
      isActive: false,
      availableDays: 5 // Default 5 days from tomorrow
    },
    shows: [],
    seatLayout: {
      premiumBlocks: [
        { id: 'A', name: 'Block A', maxRows: 8, maxPairsPerRow: 7, price: 1000, isActive: true },
        { id: 'B', name: 'Block B', maxRows: 8, maxPairsPerRow: 7, price: 1000, isActive: true }
      ],
      regularBlocks: [
        { id: 'C', name: 'Block C', maxRows: 25, maxSeatsPerRow: 15, price: 1000, isActive: true },
        { id: 'D', name: 'Block D', maxRows: 25, maxSeatsPerRow: 15, price: 500, isActive: true }
      ]
    }
  });

  // Generate 70 stalls function
  const generateAllStalls = () => {
    const stalls = [];
    for (let i = 1; i <= stallSettings.totalStalls; i++) {
      stalls.push({
        id: `S${i}`,
        name: `Stall S${i}`,
        size: '10x10 ft',
        price: stallSettings.defaultPrice,
        isActive: true
      });
    }
    return stalls;
  };

  // Initialize stalls on component load
  useEffect(() => {
    if (stallSettings.stalls.length === 0) {
      setStallSettings(prev => ({
        ...prev,
        stalls: generateAllStalls()
      }));
    }
  }, [stallSettings.totalStalls, stallSettings.defaultPrice]);

  // New shift form state
  const [newShift, setNewShift] = useState({
    id: '',
    label: '',
    timeFrom: '',
    timeTo: '',
    description: '',
    icon: '🌅',
    isActive: true
  });

  // New block form state
  const [newBlock, setNewBlock] = useState({
    id: '',
    name: '',
    columns: 5,
    kunds: 5,
    seatsPerKund: 4,
    isActive: true
  });

  // Editing states
  const [editingShift, setEditingShift] = useState(null);
  const [editingBlock, setEditingBlock] = useState(null);
  
  // Date validation state
  const [dateValidationErrors, setDateValidationErrors] = useState({
    startDate: '',
    endDate: ''
  });

  // Date validation function
  const validateDateRange = (startDate, endDate) => {
    const today = new Date().toISOString().split('T')[0];
    const errors = { startDate: '', endDate: '' };

    // Check if dates are provided when validation is needed
    if (dateSettings.isActive) {
      if (!startDate) {
        errors.startDate = 'Start date is required';
      } else if (startDate < today) {
        errors.startDate = 'Start date cannot be in the past';
      }

      if (!endDate) {
        errors.endDate = 'End date is required';
      } else if (endDate < today) {
        errors.endDate = 'End date cannot be in the past';
      }

      // Check if end date is after start date
      if (startDate && endDate && startDate >= endDate) {
        errors.endDate = 'End date must be after start date';
      }
    }

    return errors;
  };

  // Tab component
  const TabButton = ({ id, label, icon, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center px-6 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
        isActive
          ? isDarkMode
            ? 'bg-purple-600 text-white shadow-lg'
            : 'bg-purple-600 text-white shadow-lg'
          : isDarkMode
            ? 'text-gray-300 hover:text-white hover:bg-gray-700'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      {icon}
      <span className="ml-2">{label}</span>
    </button>
  );

  const iconOptions = ['🌅', '🌆', '🌙', '☀️', '⭐', '🔥', '🕉️', '🙏', '🎭', '🎪'];

  useEffect(() => {
    fetchSystemSettings();
  }, []);

  const fetchSystemSettings = async () => {
    setLoading(true);
    try {
      // Fetch date settings
      const dateRef = doc(db, 'settings', 'dateRange');
      const dateSnap = await getDoc(dateRef);
      if (dateSnap.exists()) {
        setDateSettings(dateSnap.data());
      }

      // Fetch shift settings
      const shiftRef = doc(db, 'settings', 'shifts');
      const shiftSnap = await getDoc(shiftRef);
      if (shiftSnap.exists()) {
        setShiftSettings(shiftSnap.data());
      } else {
        // Set default shifts if none exist
        const defaultShifts = {
          shifts: [
            {
              id: "morning",
              label: "Morning Session",
              timeFrom: "09:00",
              timeTo: "12:00",
              description: "Start your day with divine blessings",
              icon: "🌅",
              isActive: true
            },
            {
              id: "evening",
              label: "Evening Session", 
              timeFrom: "16:00",
              timeTo: "22:00",
              description: "Evening spiritual experience",
              icon: "🌆",
              isActive: true
            }
          ]
        };
        setShiftSettings(defaultShifts);
      }

      // Fetch layout settings
      const layoutRef = doc(db, 'settings', 'seatLayout');
      const layoutSnap = await getDoc(layoutRef);
      if (layoutSnap.exists()) {
        setLayoutSettings(layoutSnap.data());
      }

      // Fetch stall settings
      const stallRef = doc(db, 'settings', 'stalls');
      const stallSnap = await getDoc(stallRef);
      if (stallSnap.exists()) {
        setStallSettings(stallSnap.data());
      }

      // Fetch show settings
      const showRef = doc(db, 'settings', 'shows');
      const showSnap = await getDoc(showRef);
      if (showSnap.exists()) {
        setShowSettings(showSnap.data());
      }

    } catch (error) {
      console.error('Error fetching system settings:', error);
      toast.error('Failed to load system settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      // Save date settings
      const dateRef = doc(db, 'settings', 'dateRange');
      await setDoc(dateRef, {
        ...dateSettings,
        updatedAt: new Date()
      });

      // Save shift settings
      const shiftRef = doc(db, 'settings', 'shifts');
      await setDoc(shiftRef, {
        ...shiftSettings,
        updatedAt: new Date()
      });

      // Save layout settings
      const layoutRef = doc(db, 'settings', 'seatLayout');
      await setDoc(layoutRef, {
        ...layoutSettings,
        updatedAt: new Date()
      });

      // Save stall settings
      const stallRef = doc(db, 'settings', 'stalls');
      await setDoc(stallRef, {
        ...stallSettings,
        updatedAt: new Date()
      });

      // Save show settings
      const showRef = doc(db, 'settings', 'shows');
      await setDoc(showRef, {
        ...showSettings,
        updatedAt: new Date()
      });

      // Log the activity
      if (adminUser) {
        await adminLogger.logSettingsActivity(
          adminUser,
          'update',
          'system',
          'Updated system settings (date range, shifts, seat layout, stalls, shows)'
        );
      }

      toast.success('✅ System settings updated successfully!', {
        duration: 4000,
        position: 'top-right'
      });
    } catch (error) {
      console.error('Error saving system settings:', error);
      toast.error('Failed to save system settings');
    } finally {
      setSaving(false);
    }
  };

  // Shift Management Functions
  const addShift = () => {
    if (!newShift.id || !newShift.label || !newShift.timeFrom || !newShift.timeTo) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (shiftSettings.shifts.some(shift => shift.id === newShift.id)) {
      toast.error('Shift ID already exists');
      return;
    }

    const shift = {
      ...newShift,
      time: `${newShift.timeFrom} - ${newShift.timeTo}`
    };

    setShiftSettings(prev => ({
      ...prev,
      shifts: [...prev.shifts, shift]
    }));

    setNewShift({
      id: '',
      label: '',
      timeFrom: '',
      timeTo: '',
      description: '',
      icon: '🌅',
      isActive: true
    });

    toast.success('Shift added successfully');
  };

  const updateShift = (index, updatedShift) => {
    const updatedShifts = [...shiftSettings.shifts];
    updatedShifts[index] = {
      ...updatedShift,
      time: `${updatedShift.timeFrom} - ${updatedShift.timeTo}`
    };
    
    setShiftSettings(prev => ({
      ...prev,
      shifts: updatedShifts
    }));
  };

  const toggleShiftStatus = (index) => {
    const updatedShifts = [...shiftSettings.shifts];
    updatedShifts[index].isActive = !updatedShifts[index].isActive;
    
    setShiftSettings(prev => ({
      ...prev,
      shifts: updatedShifts
    }));
  };

  const removeShift = (index) => {
    const updatedShifts = shiftSettings.shifts.filter((_, i) => i !== index);
    setShiftSettings(prev => ({
      ...prev,
      shifts: updatedShifts
    }));
    toast.success('Shift removed successfully');
  };

  // Block Management Functions
  const addBlock = () => {
    if (!newBlock.id || !newBlock.name) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (layoutSettings.blocks.some(block => block.id === newBlock.id)) {
      toast.error('Block ID already exists');
      return;
    }

    setLayoutSettings(prev => ({
      ...prev,
      blocks: [...prev.blocks, { ...newBlock }]
    }));

    setNewBlock({
      id: '',
      name: '',
      columns: 5,
      kunds: 5,
      seatsPerKund: 4,
      isActive: true
    });

    toast.success('Block added successfully');
  };

  const updateBlock = (index, updatedBlock) => {
    const updatedBlocks = [...layoutSettings.blocks];
    updatedBlocks[index] = updatedBlock;
    
    setLayoutSettings(prev => ({
      ...prev,
      blocks: updatedBlocks
    }));
  };

  const toggleBlockStatus = (index) => {
    const updatedBlocks = [...layoutSettings.blocks];
    updatedBlocks[index].isActive = !updatedBlocks[index].isActive;
    
    setLayoutSettings(prev => ({
      ...prev,
      blocks: updatedBlocks
    }));
  };

  const removeBlock = (index) => {
    const updatedBlocks = layoutSettings.blocks.filter((_, i) => i !== index);
    setLayoutSettings(prev => ({
      ...prev,
      blocks: updatedBlocks
    }));
    toast.success('Block removed successfully');
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${
          isDarkMode ? 'border-orange-400' : 'border-purple-600'
        }`}></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`text-3xl font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            ⚙️ System Settings Center
          </h1>
          <p className={`mt-2 text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Comprehensive system configuration for Havan, Show, and Stall management
          </p>
        </div>
        <button
          onClick={saveSettings}
          disabled={saving}
          className={`inline-flex items-center px-6 py-3 text-sm font-medium rounded-lg transition-colors shadow-lg ${
            isDarkMode 
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <CheckCircleIcon className="w-5 h-5 mr-2" />
          {saving ? 'Saving Changes...' : 'Save All Settings'}
        </button>
      </div>

      {/* Tab Navigation */}
      <div className={`flex flex-wrap gap-2 p-1 rounded-xl ${
        isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-gray-100 border border-gray-200'
      }`}>
        <TabButton
          id="havan"
          label="Havan Settings"
          icon={<HomeIcon className="w-5 h-5" />}
          isActive={activeTab === 'havan'}
          onClick={setActiveTab}
        />
        <TabButton
          id="show"
          label="Show Settings"
          icon={<TicketIcon className="w-5 h-5" />}
          isActive={activeTab === 'show'}
          onClick={setActiveTab}
        />
        <TabButton
          id="stall"
          label="Stall Settings"
          icon={<BuildingStorefrontIcon className="w-5 h-5" />}
          isActive={activeTab === 'stall'}
          onClick={setActiveTab}
        />
      </div>

      {/* Tab Content */}
      <div className={`rounded-xl border shadow-xl ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        
        {/* Havan Settings */}
        {activeTab === 'havan' && (
          <div className="p-6 space-y-8">
            {/* Date Range Section */}
            <div className={`rounded-lg border p-6 ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 flex items-center ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                <CalendarDaysIcon className="w-5 h-5 mr-2" />
                Event Date Range
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center mb-4">
                  <input
                    id="dateRangeActive"
                    type="checkbox"
                    checked={dateSettings.isActive}
                    onChange={(e) => setDateSettings({
                      ...dateSettings,
                      isActive: e.target.checked
                    })}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="dateRangeActive" className={`ml-2 block text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Enable custom date range
                  </label>
                </div>

                {dateSettings.isActive && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={dateSettings.startDate}
                        onChange={(e) => {
                          const newStartDate = e.target.value;
                          setDateSettings({
                            ...dateSettings,
                            startDate: newStartDate
                          });
                          // Validate on change
                          const errors = validateDateRange(newStartDate, dateSettings.endDate);
                          setDateValidationErrors(errors);
                        }}
                        className={`block w-full px-3 py-2 rounded-md border transition-colors focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                          isDarkMode 
                            ? 'bg-gray-600 border-gray-500 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        End Date
                      </label>
                      <input
                        type="date"
                        value={dateSettings.endDate}
                        onChange={(e) => {
                          const newEndDate = e.target.value;
                          setDateSettings({
                            ...dateSettings,
                            endDate: newEndDate
                          });
                          // Validate on change
                          const errors = validateDateRange(dateSettings.startDate, newEndDate);
                          setDateValidationErrors(errors);
                        }}
                        className={`block w-full px-3 py-2 rounded-md border transition-colors focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                          isDarkMode 
                            ? 'bg-gray-600 border-gray-500 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                  </div>
                )}

                {/* Validation Errors */}
                {dateSettings.isActive && (dateValidationErrors.startDate || dateValidationErrors.endDate) && (
                  <div className={`p-3 rounded-md ${
                    isDarkMode 
                      ? 'bg-red-900 bg-opacity-30 border border-red-700' 
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    <div className="space-y-1">
                      {dateValidationErrors.startDate && (
                        <p className={`text-sm ${
                          isDarkMode ? 'text-red-300' : 'text-red-800'
                        }`}>
                          ⚠️ Start Date: {dateValidationErrors.startDate}
                        </p>
                      )}
                      {dateValidationErrors.endDate && (
                        <p className={`text-sm ${
                          isDarkMode ? 'text-red-300' : 'text-red-800'
                        }`}>
                          ⚠️ End Date: {dateValidationErrors.endDate}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className={`p-3 rounded-md ${
                  isDarkMode 
                    ? 'bg-blue-900 bg-opacity-30 border border-blue-700' 
                    : 'bg-blue-50 border border-blue-200'
                }`}>
                  <p className={`text-sm ${
                    isDarkMode ? 'text-blue-300' : 'text-blue-800'
                  }`}>
                    {dateSettings.isActive && dateSettings.startDate && dateSettings.endDate
                      ? `Event dates will be available from ${dateSettings.startDate} to ${dateSettings.endDate}`
                      : 'When disabled, the default 5-day range from today will be used'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Shift Management Section */}
            <div className={`rounded-lg border p-6 ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 flex items-center ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                <ClockIcon className="w-5 h-5 mr-2" />
                Shift Management
              </h3>

              {/* Existing Shifts */}
              <div className="space-y-3 mb-6">
                {shiftSettings.shifts.map((shift, index) => (
                  <div key={shift.id} className={`flex items-center space-x-3 p-3 rounded-md ${
                    isDarkMode ? 'bg-gray-600' : 'bg-white'
                  } ${!shift.isActive ? 'opacity-60' : ''}`}>
                    <button
                      onClick={() => toggleShiftStatus(index)}
                      className={`p-1 rounded ${
                        shift.isActive 
                          ? 'text-green-600 hover:bg-green-100' 
                          : 'text-gray-400 hover:bg-gray-200'
                      }`}
                      title={shift.isActive ? 'Disable shift' : 'Enable shift'}
                    >
                      {shift.isActive ? <EyeIcon className="w-4 h-4" /> : <EyeSlashIcon className="w-4 h-4" />}
                    </button>
                    
                    <div className="text-2xl">{shift.icon}</div>
                    
                    <div className="flex-1">
                      {editingShift === index ? (
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={shift.label}
                            onChange={(e) => updateShift(index, { ...shift, label: e.target.value })}
                            className={`px-2 py-1 text-sm rounded border ${
                              isDarkMode ? 'bg-gray-500 border-gray-400 text-white' : 'bg-gray-100 border-gray-300'
                            }`}
                          />
                          <div className="flex space-x-1">
                            <input
                              type="time"
                              value={shift.timeFrom}
                              onChange={(e) => updateShift(index, { ...shift, timeFrom: e.target.value })}
                              className={`px-2 py-1 text-xs rounded border ${
                                isDarkMode ? 'bg-gray-500 border-gray-400 text-white' : 'bg-gray-100 border-gray-300'
                              }`}
                            />
                            <input
                              type="time"
                              value={shift.timeTo}
                              onChange={(e) => updateShift(index, { ...shift, timeTo: e.target.value })}
                              className={`px-2 py-1 text-xs rounded border ${
                                isDarkMode ? 'bg-gray-500 border-gray-400 text-white' : 'bg-gray-100 border-gray-300'
                              }`}
                            />
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className={`text-sm font-medium ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {shift.label}
                          </div>
                          <div className={`text-xs ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-500'
                          }`}>
                            {formatTime(shift.timeFrom)} - {formatTime(shift.timeTo)}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-1">
                      <button
                        onClick={() => setEditingShift(editingShift === index ? null : index)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="Edit shift"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeShift(index)}
                        className="text-red-600 hover:text-red-900 p-1"
                        title="Remove shift"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add New Shift */}
              <div className={`border-t pt-4 ${
                isDarkMode ? 'border-gray-600' : 'border-gray-300'
              }`}>
                <h4 className={`text-sm font-medium mb-3 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Add New Shift
                </h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Shift ID (e.g., morning)"
                      value={newShift.id}
                      onChange={(e) => setNewShift({...newShift, id: e.target.value})}
                      className={`px-3 py-2 text-sm rounded-md border ${
                        isDarkMode 
                          ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                    <input
                      type="text"
                      placeholder="Shift Name"
                      value={newShift.label}
                      onChange={(e) => setNewShift({...newShift, label: e.target.value})}
                      className={`px-3 py-2 text-sm rounded-md border ${
                        isDarkMode 
                          ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="time"
                      value={newShift.timeFrom}
                      onChange={(e) => setNewShift({...newShift, timeFrom: e.target.value})}
                      className={`px-3 py-2 text-sm rounded-md border ${
                        isDarkMode 
                          ? 'bg-gray-600 border-gray-500 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                    <input
                      type="time"
                      value={newShift.timeTo}
                      onChange={(e) => setNewShift({...newShift, timeTo: e.target.value})}
                      className={`px-3 py-2 text-sm rounded-md border ${
                        isDarkMode 
                          ? 'bg-gray-600 border-gray-500 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                    <select
                      value={newShift.icon}
                      onChange={(e) => setNewShift({...newShift, icon: e.target.value})}
                      className={`px-3 py-2 text-sm rounded-md border ${
                        isDarkMode 
                          ? 'bg-gray-600 border-gray-500 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      {iconOptions.map(icon => (
                        <option key={icon} value={icon}>{icon}</option>
                      ))}
                    </select>
                  </div>
                  <input
                    type="text"
                    placeholder="Description"
                    value={newShift.description}
                    onChange={(e) => setNewShift({...newShift, description: e.target.value})}
                    className={`w-full px-3 py-2 text-sm rounded-md border ${
                      isDarkMode 
                        ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                  <button
                    onClick={addShift}
                    className="w-full inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 transition-colors"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Add Shift
                  </button>
                </div>
              </div>
            </div>

            {/* Seat Layout Section */}
            <div className={`rounded-lg border p-6 ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 flex items-center ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                <Cog6ToothIcon className="w-5 h-5 mr-2" />
                Seat Layout Configuration
              </h3>

              {/* Existing Blocks */}
              <div className="space-y-3 mb-6">
                {layoutSettings.blocks.map((block, index) => (
                  <div key={block.id} className={`flex items-center space-x-4 p-4 rounded-md ${
                    isDarkMode ? 'bg-gray-600' : 'bg-white'
                  } ${!block.isActive ? 'opacity-60' : ''}`}>
                    <button
                      onClick={() => toggleBlockStatus(index)}
                      className={`p-1 rounded ${
                        block.isActive 
                          ? 'text-green-600 hover:bg-green-100' 
                          : 'text-gray-400 hover:bg-gray-200'
                      }`}
                      title={block.isActive ? 'Disable block' : 'Enable block'}
                    >
                      {block.isActive ? <EyeIcon className="w-4 h-4" /> : <EyeSlashIcon className="w-4 h-4" />}
                    </button>

                    <div className="flex-1">
                      {editingBlock === index ? (
                        <div>
                          {/* Edit Field Labels */}
                          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-1">
                            <label className={`text-xs font-medium ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                              Block ID
                            </label>
                            <label className={`text-xs font-medium ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                              Block Name
                            </label>
                            <label className={`text-xs font-medium ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                              Columns
                            </label>
                            <label className={`text-xs font-medium ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                              Kunds
                            </label>
                            <label className={`text-xs font-medium ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                              Seats/Kund
                            </label>
                          </div>
                          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                            <input
                              type="text"
                              value={block.id}
                              onChange={(e) => updateBlock(index, { ...block, id: e.target.value })}
                              className={`px-2 py-1 text-sm rounded border ${
                                isDarkMode ? 'bg-gray-500 border-gray-400 text-white' : 'bg-gray-100 border-gray-300'
                              }`}
                              placeholder="Block ID"
                            />
                            <input
                              type="text"
                              value={block.name}
                              onChange={(e) => updateBlock(index, { ...block, name: e.target.value })}
                              className={`px-2 py-1 text-sm rounded border ${
                                isDarkMode ? 'bg-gray-500 border-gray-400 text-white' : 'bg-gray-100 border-gray-300'
                              }`}
                              placeholder="Block Name"
                            />
                            <input
                              type="number"
                              min="1"
                              max="10"
                              value={block.columns}
                              onChange={(e) => updateBlock(index, { ...block, columns: parseInt(e.target.value) || 1 })}
                              className={`px-2 py-1 text-sm rounded border ${
                                isDarkMode ? 'bg-gray-500 border-gray-400 text-white' : 'bg-gray-100 border-gray-300'
                              }`}
                              placeholder="Columns"
                            />
                            <input
                              type="number"
                              min="1"
                              max="10"
                              value={block.kunds}
                              onChange={(e) => updateBlock(index, { ...block, kunds: parseInt(e.target.value) || 1 })}
                              className={`px-2 py-1 text-sm rounded border ${
                                isDarkMode ? 'bg-gray-500 border-gray-400 text-white' : 'bg-gray-100 border-gray-300'
                              }`}
                              placeholder="Kunds"
                            />
                            <input
                              type="number"
                              min="1"
                              max="8"
                              value={block.seatsPerKund}
                              onChange={(e) => updateBlock(index, { ...block, seatsPerKund: parseInt(e.target.value) || 1 })}
                              className={`px-2 py-1 text-sm rounded border ${
                                isDarkMode ? 'bg-gray-500 border-gray-400 text-white' : 'bg-gray-100 border-gray-300'
                              }`}
                              placeholder="Seats/Kund"
                            />
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className={`text-sm font-medium mb-1 ${
                            isDarkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {block.name} ({block.id})
                          </div>
                          <div className={`text-xs ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-500'
                          }`}>
                            {block.columns} columns × {block.kunds} kunds × {block.seatsPerKund} seats = {block.columns * block.kunds * block.seatsPerKund} seats
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-1">
                      <button
                        onClick={() => setEditingBlock(editingBlock === index ? null : index)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="Edit block"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeBlock(index)}
                        className="text-red-600 hover:text-red-900 p-1"
                        title="Remove block"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add New Block */}
              <div className={`border-t pt-4 ${
                isDarkMode ? 'border-gray-600' : 'border-gray-300'
              }`}>
                <h4 className={`text-sm font-medium mb-3 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Add New Block
                </h4>
                
                {/* Field Labels */}
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-2">
                  <label className={`text-xs font-medium ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Block ID
                  </label>
                  <label className={`text-xs font-medium ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Block Name
                  </label>
                  <label className={`text-xs font-medium ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Columns
                  </label>
                  <label className={`text-xs font-medium ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Kunds
                  </label>
                  <label className={`text-xs font-medium ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Seats/Kund
                  </label>
                  <label className={`text-xs font-medium ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Action
                  </label>
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-3">
                  <input
                    type="text"
                    placeholder="e.g., E"
                    value={newBlock.id}
                    onChange={(e) => setNewBlock({...newBlock, id: e.target.value})}
                    className={`px-3 py-2 text-sm rounded-md border ${
                      isDarkMode 
                        ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                  <input
                    type="text"
                    placeholder="Block Name"
                    value={newBlock.name}
                    onChange={(e) => setNewBlock({...newBlock, name: e.target.value})}
                    className={`px-3 py-2 text-sm rounded-md border ${
                      isDarkMode 
                        ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                  <input
                    type="number"
                    min="1"
                    max="10"
                    placeholder="5"
                    value={newBlock.columns}
                    onChange={(e) => setNewBlock({...newBlock, columns: parseInt(e.target.value) || 5})}
                    className={`px-3 py-2 text-sm rounded-md border ${
                      isDarkMode 
                        ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                  <input
                    type="number"
                    min="1"
                    max="10"
                    placeholder="5"
                    value={newBlock.kunds}
                    onChange={(e) => setNewBlock({...newBlock, kunds: parseInt(e.target.value) || 5})}
                    className={`px-3 py-2 text-sm rounded-md border ${
                      isDarkMode 
                        ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                  <input
                    type="number"
                    min="1"
                    max="8"
                    placeholder="4"
                    value={newBlock.seatsPerKund}
                    onChange={(e) => setNewBlock({...newBlock, seatsPerKund: parseInt(e.target.value) || 4})}
                    className={`px-3 py-2 text-sm rounded-md border ${
                      isDarkMode 
                        ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                  <button
                    onClick={addBlock}
                    className="inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 transition-colors"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Add Block
                  </button>
                </div>
                
                <div className={`p-3 rounded-md ${
                  isDarkMode 
                    ? 'bg-yellow-900 bg-opacity-30 border border-yellow-700' 
                    : 'bg-yellow-50 border border-yellow-200'
                }`}>
                  <p className={`text-sm ${
                    isDarkMode ? 'text-yellow-300' : 'text-yellow-800'
                  }`}>
                    <strong>Preview:</strong> {newBlock.id || 'New'} block will have {newBlock.columns * newBlock.kunds * newBlock.seatsPerKund} total seats ({newBlock.columns} columns × {newBlock.kunds} kunds × {newBlock.seatsPerKund} seats per kund)
                  </p>
                </div>
              </div>

              {/* Layout Summary */}
              <div className={`mt-6 p-4 rounded-md ${
                isDarkMode ? 'bg-gray-600' : 'bg-white'
              }`}>
                <h4 className={`text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Current Layout Summary
                </h4>
                <div className={`text-sm ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  <div className="flex flex-wrap gap-4">
                    <span>Active Blocks: {layoutSettings.blocks.filter(b => b.isActive).length}</span>
                    <span>Total Seats: {layoutSettings.blocks
                      .filter(b => b.isActive)
                      .reduce((sum, b) => sum + (b.columns * b.kunds * b.seatsPerKund), 0)}</span>
                    <span>Total Kunds: {layoutSettings.blocks
                      .filter(b => b.isActive)
                      .reduce((sum, b) => sum + (b.columns * b.kunds), 0)}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Show Settings */}
        {activeTab === 'show' && (
          <div className="p-6 space-y-8">
            {/* Show Date Configuration */}
            <div className={`rounded-lg border p-6 ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 flex items-center ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                <CalendarDaysIcon className="w-5 h-5 mr-2" />
                Show Date Configuration
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center mb-4">
                  <input
                    id="showDatesActive"
                    type="checkbox"
                    checked={showSettings.eventDates.isActive}
                    onChange={(e) => setShowSettings({
                      ...showSettings,
                      eventDates: {
                        ...showSettings.eventDates,
                        isActive: e.target.checked
                      }
                    })}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="showDatesActive" className={`ml-2 block text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Enable custom show date range
                  </label>
                </div>

                {showSettings.eventDates.isActive && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={showSettings.eventDates.startDate}
                        onChange={(e) => setShowSettings({
                          ...showSettings,
                          eventDates: {
                            ...showSettings.eventDates,
                            startDate: e.target.value
                          }
                        })}
                        className={`block w-full px-3 py-2 rounded-md border transition-colors focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                          isDarkMode 
                            ? 'bg-gray-600 border-gray-500 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        End Date
                      </label>
                      <input
                        type="date"
                        value={showSettings.eventDates.endDate}
                        onChange={(e) => setShowSettings({
                          ...showSettings,
                          eventDates: {
                            ...showSettings.eventDates,
                            endDate: e.target.value
                          }
                        })}
                        className={`block w-full px-3 py-2 rounded-md border transition-colors focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                          isDarkMode 
                            ? 'bg-gray-600 border-gray-500 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Available Days
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={showSettings.eventDates.availableDays}
                        onChange={(e) => setShowSettings({
                          ...showSettings,
                          eventDates: {
                            ...showSettings.eventDates,
                            availableDays: parseInt(e.target.value) || 5
                          }
                        })}
                        className={`block w-full px-3 py-2 rounded-md border transition-colors focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                          isDarkMode 
                            ? 'bg-gray-600 border-gray-500 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                  </div>
                )}

                <div className={`p-3 rounded-md ${
                  isDarkMode 
                    ? 'bg-blue-900 bg-opacity-30 border border-blue-700' 
                    : 'bg-blue-50 border border-blue-200'
                }`}>
                  <p className={`text-sm ${
                    isDarkMode ? 'text-blue-300' : 'text-blue-800'
                  }`}>
                    {showSettings.eventDates.isActive && showSettings.eventDates.startDate && showSettings.eventDates.endDate
                      ? `Show dates will be available from ${showSettings.eventDates.startDate} to ${showSettings.eventDates.endDate}`
                      : `When disabled, the default ${showSettings.eventDates.availableDays}-day range from today will be used`
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Show Seat Layout Management */}
            <div className={`rounded-lg border p-6 ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 flex items-center ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                <Cog6ToothIcon className="w-5 h-5 mr-2" />
                Show Seat Layout Configuration
              </h3>

              {/* Premium Blocks Configuration */}
              <div className={`mb-6 p-4 rounded-md ${
                isDarkMode ? 'bg-gray-600' : 'bg-white'
              }`}>
                <h4 className={`text-sm font-medium mb-3 flex items-center ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  ⭐ Premium Blocks (VIP Seating)
                </h4>
                
                <div className="space-y-3">
                  {showSettings.seatLayout.premiumBlocks.map((block, index) => (
                    <div key={block.id} className={`flex items-center space-x-4 p-4 rounded-md border ${
                      isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                    } ${!block.isActive ? 'opacity-60' : ''}`}>
                      <button
                        onClick={() => {
                          const updatedBlocks = [...showSettings.seatLayout.premiumBlocks];
                          updatedBlocks[index].isActive = !updatedBlocks[index].isActive;
                          setShowSettings({
                            ...showSettings,
                            seatLayout: {
                              ...showSettings.seatLayout,
                              premiumBlocks: updatedBlocks
                            }
                          });
                        }}
                        className={`p-1 rounded ${
                          block.isActive 
                            ? 'text-green-600 hover:bg-green-100' 
                            : 'text-gray-400 hover:bg-gray-200'
                        }`}
                        title={block.isActive ? 'Disable block' : 'Enable block'}
                      >
                        {block.isActive ? <EyeIcon className="w-4 h-4" /> : <EyeSlashIcon className="w-4 h-4" />}
                      </button>

                      <div className="flex-1">
                        <div className={`text-sm font-medium mb-1 ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {block.name} ({block.id})
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className={`block text-xs font-medium mb-1 ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                              Max Rows
                            </label>
                            <input
                              type="number"
                              min="1"
                              max="20"
                              value={block.maxRows}
                              onChange={(e) => {
                                const updatedBlocks = [...showSettings.seatLayout.premiumBlocks];
                                updatedBlocks[index].maxRows = parseInt(e.target.value) || 1;
                                setShowSettings({
                                  ...showSettings,
                                  seatLayout: {
                                    ...showSettings.seatLayout,
                                    premiumBlocks: updatedBlocks
                                  }
                                });
                              }}
                              className={`w-full px-2 py-1 text-sm rounded border ${
                                isDarkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                              }`}
                            />
                          </div>
                          <div>
                            <label className={`block text-xs font-medium mb-1 ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                              Pairs Per Row
                            </label>
                            <input
                              type="number"
                              min="1"
                              max="15"
                              value={block.maxPairsPerRow}
                              onChange={(e) => {
                                const updatedBlocks = [...showSettings.seatLayout.premiumBlocks];
                                updatedBlocks[index].maxPairsPerRow = parseInt(e.target.value) || 1;
                                setShowSettings({
                                  ...showSettings,
                                  seatLayout: {
                                    ...showSettings.seatLayout,
                                    premiumBlocks: updatedBlocks
                                  }
                                });
                              }}
                              className={`w-full px-2 py-1 text-sm rounded border ${
                                isDarkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                              }`}
                            />
                          </div>
                          <div>
                            <label className={`block text-xs font-medium mb-1 ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                              Total Seats
                            </label>
                            <div className={`px-2 py-1 text-sm rounded border bg-gray-100 border-gray-300 ${
                              isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-300' : 'text-gray-600'
                            }`}>
                              {block.maxRows * block.maxPairsPerRow * 2}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Regular Blocks Configuration */}
              <div className={`mb-6 p-4 rounded-md ${
                isDarkMode ? 'bg-gray-600' : 'bg-white'
              }`}>
                <h4 className={`text-sm font-medium mb-3 flex items-center ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  🎫 Regular Blocks (Standard Seating)
                </h4>
                
                <div className="space-y-3">
                  {showSettings.seatLayout.regularBlocks.map((block, index) => (
                    <div key={block.id} className={`flex items-center space-x-4 p-4 rounded-md border ${
                      isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                    } ${!block.isActive ? 'opacity-60' : ''}`}>
                      <button
                        onClick={() => {
                          const updatedBlocks = [...showSettings.seatLayout.regularBlocks];
                          updatedBlocks[index].isActive = !updatedBlocks[index].isActive;
                          setShowSettings({
                            ...showSettings,
                            seatLayout: {
                              ...showSettings.seatLayout,
                              regularBlocks: updatedBlocks
                            }
                          });
                        }}
                        className={`p-1 rounded ${
                          block.isActive 
                            ? 'text-green-600 hover:bg-green-100' 
                            : 'text-gray-400 hover:bg-gray-200'
                        }`}
                        title={block.isActive ? 'Disable block' : 'Enable block'}
                      >
                        {block.isActive ? <EyeIcon className="w-4 h-4" /> : <EyeSlashIcon className="w-4 h-4" />}
                      </button>

                      <div className="flex-1">
                        <div className={`text-sm font-medium mb-1 ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {block.name} ({block.id})
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className={`block text-xs font-medium mb-1 ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                              Max Rows
                            </label>
                            <input
                              type="number"
                              min="1"
                              max="50"
                              value={block.maxRows}
                              onChange={(e) => {
                                const updatedBlocks = [...showSettings.seatLayout.regularBlocks];
                                updatedBlocks[index].maxRows = parseInt(e.target.value) || 1;
                                setShowSettings({
                                  ...showSettings,
                                  seatLayout: {
                                    ...showSettings.seatLayout,
                                    regularBlocks: updatedBlocks
                                  }
                                });
                              }}
                              className={`w-full px-2 py-1 text-sm rounded border ${
                                isDarkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                              }`}
                            />
                          </div>
                          <div>
                            <label className={`block text-xs font-medium mb-1 ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                              Seats Per Row
                            </label>
                            <input
                              type="number"
                              min="1"
                              max="25"
                              value={block.maxSeatsPerRow}
                              onChange={(e) => {
                                const updatedBlocks = [...showSettings.seatLayout.regularBlocks];
                                updatedBlocks[index].maxSeatsPerRow = parseInt(e.target.value) || 1;
                                setShowSettings({
                                  ...showSettings,
                                  seatLayout: {
                                    ...showSettings.seatLayout,
                                    regularBlocks: updatedBlocks
                                  }
                                });
                              }}
                              className={`w-full px-2 py-1 text-sm rounded border ${
                                isDarkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                              }`}
                            />
                          </div>
                          <div>
                            <label className={`block text-xs font-medium mb-1 ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                              Total Seats
                            </label>
                            <div className={`px-2 py-1 text-sm rounded border bg-gray-100 border-gray-300 ${
                              isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-300' : 'text-gray-600'
                            }`}>
                              {block.maxRows * block.maxSeatsPerRow}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>


              {/* Layout Summary */}
              <div className={`p-4 rounded-md border ${
                isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
              }`}>
                <h4 className={`text-lg font-semibold mb-4 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  🎭 Show Layout Summary
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className={`p-4 rounded-lg text-center ${
                    isDarkMode ? 'bg-amber-900/30 border border-amber-700' : 'bg-amber-50 border border-amber-200'
                  }`}>
                    <div className={`text-3xl font-bold mb-1 ${
                      isDarkMode ? 'text-amber-400' : 'text-amber-600'
                    }`}>
                      {showSettings.seatLayout.premiumBlocks.filter(b => b.isActive).length}
                    </div>
                    <div className={`text-sm font-medium ${
                      isDarkMode ? 'text-amber-300' : 'text-amber-700'
                    }`}>Premium Blocks</div>
                  </div>
                  <div className={`p-4 rounded-lg text-center ${
                    isDarkMode ? 'bg-green-900/30 border border-green-700' : 'bg-green-50 border border-green-200'
                  }`}>
                    <div className={`text-3xl font-bold mb-1 ${
                      isDarkMode ? 'text-green-400' : 'text-green-600'
                    }`}>
                      {showSettings.seatLayout.regularBlocks.filter(b => b.isActive).length}
                    </div>
                    <div className={`text-sm font-medium ${
                      isDarkMode ? 'text-green-300' : 'text-green-700'
                    }`}>Regular Blocks</div>
                  </div>
                  <div className={`p-4 rounded-lg text-center ${
                    isDarkMode ? 'bg-blue-900/30 border border-blue-700' : 'bg-blue-50 border border-blue-200'
                  }`}>
                    <div className={`text-3xl font-bold mb-1 ${
                      isDarkMode ? 'text-blue-400' : 'text-blue-600'
                    }`}>
                      {showSettings.seatLayout.premiumBlocks
                        .filter(b => b.isActive)
                        .reduce((sum, b) => sum + (b.maxRows * b.maxPairsPerRow * 2), 0)}
                    </div>
                    <div className={`text-sm font-medium ${
                      isDarkMode ? 'text-blue-300' : 'text-blue-700'
                    }`}>Premium Seats</div>
                  </div>
                  <div className={`p-4 rounded-lg text-center ${
                    isDarkMode ? 'bg-purple-900/30 border border-purple-700' : 'bg-purple-50 border border-purple-200'
                  }`}>
                    <div className={`text-3xl font-bold mb-1 ${
                      isDarkMode ? 'text-purple-400' : 'text-purple-600'
                    }`}>
                      {showSettings.seatLayout.regularBlocks
                        .filter(b => b.isActive)
                        .reduce((sum, b) => sum + (b.maxRows * b.maxSeatsPerRow), 0)}
                    </div>
                    <div className={`text-sm font-medium ${
                      isDarkMode ? 'text-purple-300' : 'text-purple-700'
                    }`}>Regular Seats</div>
                  </div>
                </div>
                
                <div className={`mt-4 p-3 rounded-md ${
                  isDarkMode 
                    ? 'bg-blue-900 bg-opacity-30 border border-blue-700' 
                    : 'bg-blue-50 border border-blue-200'
                }`}>
                  <p className={`text-sm font-medium ${
                    isDarkMode ? 'text-blue-300' : 'text-blue-800'
                  }`}>
                    🎫 Total Show Capacity: {(
                      showSettings.seatLayout.premiumBlocks
                        .filter(b => b.isActive)
                        .reduce((sum, b) => sum + (b.maxRows * b.maxPairsPerRow * 2), 0) +
                      showSettings.seatLayout.regularBlocks
                        .filter(b => b.isActive)
                        .reduce((sum, b) => sum + (b.maxRows * b.maxSeatsPerRow), 0)
                    )} seats
                  </p>
                </div>
              </div>
            </div>

            {/* Show Timing Management */}
            <div className={`rounded-lg border p-6 ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 flex items-center ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                <ClockIcon className="w-5 h-5 mr-2" />
                Show Timing Management
              </h3>

              {/* Existing Show Timings */}
              <div className="space-y-3 mb-6">
                {showSettings.shows.map((show, index) => (
                  <div key={show.id || index} className={`flex items-center space-x-3 p-4 rounded-md border ${
                    isDarkMode ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-200'
                  } ${!show.isActive ? 'opacity-60' : ''}`}>
                    <button
                      onClick={() => {
                        const updatedShows = [...showSettings.shows];
                        updatedShows[index].isActive = !updatedShows[index].isActive;
                        setShowSettings({
                          ...showSettings,
                          shows: updatedShows
                        });
                      }}
                      className={`p-1 rounded ${
                        show.isActive 
                          ? 'text-green-600 hover:bg-green-100' 
                          : 'text-gray-400 hover:bg-gray-200'
                      }`}
                      title={show.isActive ? 'Disable show' : 'Enable show'}
                    >
                      {show.isActive ? <EyeIcon className="w-4 h-4" /> : <EyeSlashIcon className="w-4 h-4" />}
                    </button>
                    
                    <div className="text-2xl">{show.icon}</div>
                    
                    <div className="flex-1">
                      <div className={`text-sm font-medium mb-1 ${
                        isDarkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {show.name}
                        {show.badgeText && (
                          <span className="ml-2 px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                            {show.badgeText}
                          </span>
                        )}
                      </div>
                      <div className={`text-xs mb-1 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-500'
                      }`}>
                        {formatTime(show.timeFrom)} - {formatTime(show.timeTo)}
                      </div>
                      {show.description && (
                        <div className={`text-xs ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {show.description}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-1">
                      <button
                        onClick={() => {
                          const updatedShows = showSettings.shows.filter((_, i) => i !== index);
                          setShowSettings({
                            ...showSettings,
                            shows: updatedShows
                          });
                          toast.success('Show timing removed successfully');
                        }}
                        className="text-red-600 hover:text-red-900 p-1"
                        title="Remove show timing"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                
                {showSettings.shows.length === 0 && (
                  <div className={`text-center py-6 ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    No show timings configured. Add one below.
                  </div>
                )}
              </div>

              {/* Add New Show Timing */}
              <div className={`border-t pt-4 ${
                isDarkMode ? 'border-gray-600' : 'border-gray-300'
              }`}>
                <h4 className={`text-sm font-medium mb-3 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Add New Show Timing
                </h4>
                <div className="space-y-3" id="newShowForm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Show ID (e.g., morning_show)"
                      className={`px-3 py-2 text-sm rounded-md border ${
                        isDarkMode 
                          ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                      id="newShowId"
                    />
                    <input
                      type="text"
                      placeholder="Show Name"
                      className={`px-3 py-2 text-sm rounded-md border ${
                        isDarkMode 
                          ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                      id="newShowName"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <input
                      type="time"
                      className={`px-3 py-2 text-sm rounded-md border ${
                        isDarkMode 
                          ? 'bg-gray-600 border-gray-500 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      id="newShowTimeFrom"
                    />
                    <input
                      type="time"
                      className={`px-3 py-2 text-sm rounded-md border ${
                        isDarkMode 
                          ? 'bg-gray-600 border-gray-500 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      id="newShowTimeTo"
                    />
                    <select
                      className={`px-3 py-2 text-sm rounded-md border ${
                        isDarkMode 
                          ? 'bg-gray-600 border-gray-500 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      id="newShowIcon"
                    >
                      {iconOptions.map(icon => (
                        <option key={icon} value={icon}>{icon}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      placeholder="Badge Text (Optional)"
                      className={`px-3 py-2 text-sm rounded-md border ${
                        isDarkMode 
                          ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                      id="newShowBadgeText"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Description"
                    className={`w-full px-3 py-2 text-sm rounded-md border ${
                      isDarkMode 
                        ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    id="newShowDescription"
                  />
                  <button
                    onClick={() => {
                      const form = document.getElementById('newShowForm');
                      const id = form.querySelector('#newShowId').value.trim();
                      const name = form.querySelector('#newShowName').value.trim();
                      const timeFrom = form.querySelector('#newShowTimeFrom').value;
                      const timeTo = form.querySelector('#newShowTimeTo').value;
                      const icon = form.querySelector('#newShowIcon').value;
                      const badgeText = form.querySelector('#newShowBadgeText').value.trim();
                      const description = form.querySelector('#newShowDescription').value.trim();
                      
                      if (!id || !name || !timeFrom || !timeTo) {
                        toast.error('Please fill in all required fields');
                        return;
                      }
                      
                      if (showSettings.shows.some(show => show.id === id)) {
                        toast.error('Show ID already exists');
                        return;
                      }
                      
                      const newShow = {
                        id,
                        name,
                        timeFrom,
                        timeTo,
                        icon,
                        badgeText,
                        description,
                        isActive: true
                      };
                      
                      setShowSettings({
                        ...showSettings,
                        shows: [...showSettings.shows, newShow]
                      });
                      
                      // Clear form
                      form.querySelectorAll('input, select').forEach(input => {
                        if (input.type === 'text' || input.type === 'time') {
                          input.value = '';
                        } else if (input.tagName === 'SELECT') {
                          input.selectedIndex = 0;
                        }
                      });
                      
                      toast.success('Show timing added successfully');
                    }}
                    className="w-full inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 transition-colors"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Add Show Timing
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stall Settings */}
        {activeTab === 'stall' && (
          <div className="p-6 space-y-8">
            {/* Stall Configuration Section */}
            <div className={`rounded-lg border p-6 ${
              isDarkMode 
                ? 'bg-gray-700 border-gray-600' 
                : 'bg-gray-50 border-gray-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 flex items-center ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                <Cog6ToothIcon className="w-5 h-5 mr-2" />
                Stall Configuration
              </h3>

              {/* Global Stall Settings */}
              <div className={`mb-6 p-4 rounded-md ${
                isDarkMode ? 'bg-gray-600' : 'bg-white'
              }`}>
                <h4 className={`text-sm font-medium mb-3 flex items-center ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  <Cog6ToothIcon className="w-4 h-4 mr-2" />
                  Global Configuration
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Total Stalls
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="200"
                      value={stallSettings.totalStalls}
                      onChange={(e) => {
                        const newTotal = parseInt(e.target.value) || 70;
                        setStallSettings(prev => ({
                          ...prev,
                          totalStalls: newTotal
                        }));
                      }}
                      className={`block w-full px-3 py-2 rounded-md border transition-colors focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        isDarkMode 
                          ? 'bg-gray-600 border-gray-500 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Default Price (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={stallSettings.defaultPrice}
                      onChange={(e) => {
                        const newPrice = parseInt(e.target.value) || 5000;
                        setStallSettings(prev => ({
                          ...prev,
                          defaultPrice: newPrice
                        }));
                      }}
                      className={`block w-full px-3 py-2 rounded-md border transition-colors focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        isDarkMode 
                          ? 'bg-gray-600 border-gray-500 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Actions
                    </label>
                    <button
                      onClick={() => {
                        setStallSettings(prev => ({
                          ...prev,
                          stalls: generateAllStalls()
                        }));
                        toast.success(`Generated ${stallSettings.totalStalls} stalls successfully!`);
                      }}
                      className="w-full inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
                    >
                      <PlusIcon className="w-4 h-4 mr-2" />
                      Generate All Stalls
                    </button>
                  </div>
                </div>

                <div className={`p-3 rounded-md ${
                  isDarkMode 
                    ? 'bg-blue-900 bg-opacity-30 border border-blue-700' 
                    : 'bg-blue-50 border border-blue-200'
                }`}>
                  <p className={`text-sm ${
                    isDarkMode ? 'text-blue-300' : 'text-blue-800'
                  }`}>
                    💡 This will generate stalls S1 through S{stallSettings.totalStalls}, each with the default price of ₹{stallSettings.defaultPrice.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Event Dates Configuration */}
              <div className={`mb-6 p-4 rounded-md ${
                isDarkMode ? 'bg-gray-600' : 'bg-white'
              }`}>
                <h4 className={`text-sm font-medium mb-3 flex items-center ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  <CalendarDaysIcon className="w-4 h-4 mr-2" />
                  Stall Event Dates
                </h4>
                
                <div className="flex items-center mb-3">
                  <input
                    id="stallDatesActive"
                    type="checkbox"
                    checked={stallSettings.eventDates.isActive}
                    onChange={(e) => setStallSettings({
                      ...stallSettings,
                      eventDates: {
                        ...stallSettings.eventDates,
                        isActive: e.target.checked
                      }
                    })}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="stallDatesActive" className={`ml-2 block text-sm ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Enable custom stall booking dates
                  </label>
                </div>

                {stallSettings.eventDates.isActive && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={stallSettings.eventDates.startDate}
                        onChange={(e) => setStallSettings({
                          ...stallSettings,
                          eventDates: {
                            ...stallSettings.eventDates,
                            startDate: e.target.value
                          }
                        })}
                        className={`block w-full px-3 py-2 rounded-md border transition-colors focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                          isDarkMode 
                            ? 'bg-gray-600 border-gray-500 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        End Date
                      </label>
                      <input
                        type="date"
                        value={stallSettings.eventDates.endDate}
                        onChange={(e) => setStallSettings({
                          ...stallSettings,
                          eventDates: {
                            ...stallSettings.eventDates,
                            endDate: e.target.value
                          }
                        })}
                        className={`block w-full px-3 py-2 rounded-md border transition-colors focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                          isDarkMode 
                            ? 'bg-gray-600 border-gray-500 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        }`}
                      />
                    </div>
                  </div>
                )}

                <div className={`mt-3 p-3 rounded-md ${
                  isDarkMode 
                    ? 'bg-blue-900 bg-opacity-30 border border-blue-700' 
                    : 'bg-blue-50 border border-blue-200'
                }`}>
                  <p className={`text-sm ${
                    isDarkMode ? 'text-blue-300' : 'text-blue-800'
                  }`}>
                    {stallSettings.eventDates.isActive && stallSettings.eventDates.startDate && stallSettings.eventDates.endDate
                      ? `Stall bookings will be available from ${stallSettings.eventDates.startDate} to ${stallSettings.eventDates.endDate}`
                      : 'When disabled, default date range will be used for stall bookings'
                    }
                  </p>
                </div>
              </div>

              {/* Existing Stalls */}
              <div className="space-y-3 mb-6">
                <h4 className={`text-sm font-medium mb-3 flex items-center justify-between ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  <span>Current Stalls ({stallSettings.stalls.length})</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    isDarkMode ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-600'
                  }`}>
                    All Stalls
                  </span>
                </h4>
                
                <div className="max-h-96 overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {stallSettings.stalls.map((stall, index) => (
                    <div key={stall.id} className={`flex items-center space-x-3 p-3 rounded-md ${
                      isDarkMode ? 'bg-gray-600' : 'bg-white'
                    } ${!stall.isActive ? 'opacity-60' : ''} border`}>
                      <button
                        onClick={() => {
                          const updatedStalls = [...stallSettings.stalls];
                          updatedStalls[index].isActive = !updatedStalls[index].isActive;
                          setStallSettings({
                            ...stallSettings,
                            stalls: updatedStalls
                          });
                        }}
                        className={`p-1 rounded ${
                          stall.isActive 
                            ? 'text-green-600 hover:bg-green-100' 
                            : 'text-gray-400 hover:bg-gray-200'
                        }`}
                        title={stall.isActive ? 'Disable stall' : 'Enable stall'}
                      >
                        {stall.isActive ? <EyeIcon className="w-4 h-4" /> : <EyeSlashIcon className="w-4 h-4" />}
                      </button>
                      
                      <div className="text-xl">🏪</div>
                      
                      <div className="flex-1">
                        <div className={`text-sm font-medium ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {stall.name}
                        </div>
                        <div className={`text-xs ${
                          isDarkMode ? 'text-gray-300' : 'text-gray-500'
                        }`}>
                          {stall.size} • ₹{stall.price.toLocaleString()}
                        </div>
                      </div>
                      
                      <div className="flex space-x-1">
                        <button
                          onClick={() => {
                            const updatedStalls = stallSettings.stalls.filter((_, i) => i !== index);
                            setStallSettings({
                              ...stallSettings,
                              stalls: updatedStalls
                            });
                            toast.success(`Stall ${stall.id} removed successfully!`);
                          }}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Remove stall"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Add New Stall */}
              <div className={`border-t pt-4 ${
                isDarkMode ? 'border-gray-600' : 'border-gray-300'
              }`}>
                <h4 className={`text-sm font-medium mb-3 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Add Individual Stall
                </h4>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Stall ID (Auto-generated)
                      </label>
                      <input
                        type="text"
                        value={`S${stallSettings.stalls.length + 1}`}
                        readOnly
                        className={`px-3 py-2 text-sm rounded-md border cursor-not-allowed ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-gray-300' 
                            : 'bg-gray-100 border-gray-300 text-gray-600'
                        }`}
                        id="newStallId"
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Stall Name (Auto-generated)
                      </label>
                      <input
                        type="text"
                        value={`Stall S${stallSettings.stalls.length + 1}`}
                        readOnly
                        className={`px-3 py-2 text-sm rounded-md border cursor-not-allowed ${
                          isDarkMode 
                            ? 'bg-gray-700 border-gray-600 text-gray-300' 
                            : 'bg-gray-100 border-gray-300 text-gray-600'
                        }`}
                        id="newStallName"
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-medium mb-1 ${
                        isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Price (₹)
                      </label>
                      <input
                        type="number"
                        placeholder={`Default: ₹${stallSettings.defaultPrice.toLocaleString()}`}
                        min="0"
                        step="100"
                        className={`px-3 py-2 text-sm rounded-md border transition-colors focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                          isDarkMode 
                            ? 'bg-gray-600 border-gray-500 text-white placeholder-gray-400' 
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                        }`}
                        id="newStallPrice"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const priceInput = document.getElementById('newStallPrice');
                      
                      const price = parseInt(priceInput.value) || stallSettings.defaultPrice;
                      const nextNumber = stallSettings.stalls.length + 1;
                      const id = `S${nextNumber}`;
                      const name = `Stall S${nextNumber}`;
                      
                      if (stallSettings.stalls.some(stall => stall.id === id)) {
                        toast.error('Stall ID already exists');
                        return;
                      }
                      
                      const newStall = {
                        id,
                        name,
                        size: '10x10 ft', // Default size
                        price,
                        isActive: true
                      };
                      
                      setStallSettings({
                        ...stallSettings,
                        stalls: [...stallSettings.stalls, newStall]
                      });
                      
                      // Clear form
                      priceInput.value = '';
                      
                      toast.success(`Stall ${id} added successfully!`);
                    }}
                    className="w-full inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 transition-colors"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Add Next Stall (S{stallSettings.stalls.length + 1})
                  </button>
                </div>
              </div>

              {/* Stall Summary */}
              <div className={`mt-6 p-4 rounded-md border ${
                isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
              }`}>
                <h4 className={`text-lg font-semibold mb-4 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  📊 Stall Overview
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className={`p-4 rounded-lg text-center ${
                    isDarkMode ? 'bg-green-900/30 border border-green-700' : 'bg-green-50 border border-green-200'
                  }`}>
                    <div className={`text-3xl font-bold mb-1 ${
                      isDarkMode ? 'text-green-400' : 'text-green-600'
                    }`}>
                      {stallSettings.stalls.filter(s => s.isActive).length}
                    </div>
                    <div className={`text-sm font-medium ${
                      isDarkMode ? 'text-green-300' : 'text-green-700'
                    }`}>Active Stalls</div>
                  </div>
                  <div className={`p-4 rounded-lg text-center ${
                    isDarkMode ? 'bg-blue-900/30 border border-blue-700' : 'bg-blue-50 border border-blue-200'
                  }`}>
                    <div className={`text-3xl font-bold mb-1 ${
                      isDarkMode ? 'text-blue-400' : 'text-blue-600'
                    }`}>
                      {stallSettings.stalls.length}
                    </div>
                    <div className={`text-sm font-medium ${
                      isDarkMode ? 'text-blue-300' : 'text-blue-700'
                    }`}>Total Stalls</div>
                  </div>
                  <div className={`p-4 rounded-lg text-center ${
                    isDarkMode ? 'bg-purple-900/30 border border-purple-700' : 'bg-purple-50 border border-purple-200'
                  }`}>
                    <div className={`text-3xl font-bold mb-1 ${
                      isDarkMode ? 'text-purple-400' : 'text-purple-600'
                    }`}>
                      ₹{stallSettings.stalls.length > 0 ? Math.min(...stallSettings.stalls.map(s => s.price)).toLocaleString() : '0'}
                    </div>
                    <div className={`text-sm font-medium ${
                      isDarkMode ? 'text-purple-300' : 'text-purple-700'
                    }`}>Min Price</div>
                  </div>
                  <div className={`p-4 rounded-lg text-center ${
                    isDarkMode ? 'bg-orange-900/30 border border-orange-700' : 'bg-orange-50 border border-orange-200'
                  }`}>
                    <div className={`text-3xl font-bold mb-1 ${
                      isDarkMode ? 'text-orange-400' : 'text-orange-600'
                    }`}>
                      ₹{stallSettings.stalls.length > 0 ? Math.max(...stallSettings.stalls.map(s => s.price)).toLocaleString() : '0'}
                    </div>
                    <div className={`text-sm font-medium ${
                      isDarkMode ? 'text-orange-300' : 'text-orange-700'
                    }`}>Max Price</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemSettings;
