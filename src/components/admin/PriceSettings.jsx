"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { useTheme } from '@/context/ThemeContext';
import { useAdmin } from '@/context/AdminContext';
import adminLogger from '@/lib/adminLogger';
import { 
  CurrencyRupeeIcon,
  TagIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
  TrashIcon,
  SparklesIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import RealTimeSyncStatus from './RealTimeSyncStatus';

export default function PriceSettings() {
  const { isDarkMode } = useTheme();
  const { adminUser } = useAdmin();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [priceSettings, setPriceSettings] = useState({
    defaultSeatPrice: 500,
    currency: 'INR',
    taxRate: 0,
    bulkDiscounts: [
      { minSeats: 5, discountPercent: 10, isActive: true },
      { minSeats: 10, discountPercent: 15, isActive: true },
      { minSeats: 20, discountPercent: 20, isActive: true }
    ],
    earlyBirdDiscount: {
      isActive: true,
      discountPercent: 15,
      daysBeforeEvent: 7
    },
    seasonalPricing: [
      { 
        name: 'Festival Season', 
        multiplier: 1.5, 
        startDate: '', 
        endDate: '', 
        isActive: false 
      }
    ]
  });

  // Stall pricing settings
  const [stallPriceSettings, setStallPriceSettings] = useState({
    defaultStallPrice: 5000,
    taxRate: 0,
    discountPercent: 0,
    earlyBirdDiscount: {
      isActive: false,
      discountPercent: 0,
      daysBeforeEvent: 7
    }
  });

  // Show seat pricing settings
  const [showSeatPriceSettings, setShowSeatPriceSettings] = useState({
    vipSeatPrice: 1000,
    regularSeatPrice: 300,
    taxRate: 0,
    bulkDiscounts: [
      { minSeats: 5, discountPercent: 5, isActive: true },
      { minSeats: 10, discountPercent: 10, isActive: true }
    ],
    earlyBirdDiscount: {
      isActive: false,
      discountPercent: 0,
      daysBeforeEvent: 7
    }
  });

  const [newBulkDiscount, setNewBulkDiscount] = useState({
    minSeats: '',
    discountPercent: '',
    isActive: true
  });

  const [newSeasonalPricing, setNewSeasonalPricing] = useState({
    name: '',
    multiplier: 1,
    startDate: '',
    endDate: '',
    isActive: true
  });

  useEffect(() => {
    fetchPriceSettings();
  }, []);

  const fetchPriceSettings = async () => {
    setLoading(true);
    try {
      // Fetch havan seat pricing
      const settingsRef = doc(db, 'settings', 'pricing');
      const settingsSnap = await getDoc(settingsRef);
      
      if (settingsSnap.exists()) {
        const data = settingsSnap.data();
        setPriceSettings({ ...priceSettings, ...data });
      }
      
      // Fetch stall pricing
      const stallSettingsRef = doc(db, 'settings', 'stallPricing');
      const stallSettingsSnap = await getDoc(stallSettingsRef);
      
      if (stallSettingsSnap.exists()) {
        const stallData = stallSettingsSnap.data();
        setStallPriceSettings({ ...stallPriceSettings, ...stallData });
      }
      
      // Fetch show seat pricing
      const showSeatSettingsRef = doc(db, 'settings', 'showSeatPricing');
      const showSeatSettingsSnap = await getDoc(showSeatSettingsRef);
      
      if (showSeatSettingsSnap.exists()) {
        const showSeatData = showSeatSettingsSnap.data();
        setShowSeatPriceSettings({ ...showSeatPriceSettings, ...showSeatData });
      }
    } catch (error) {
      console.error('Error fetching price settings:', error);
      toast.error('Failed to load price settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    
    // Store original settings for logging purposes
    let originalSettings = null;
    try {
      const settingsRef = doc(db, 'settings', 'pricing');
      const originalSnap = await getDoc(settingsRef);
      originalSettings = originalSnap.exists() ? originalSnap.data() : null;
    } catch (error) {
      console.log('Could not fetch original settings for logging');
    }

    try {
      const settingsRef = doc(db, 'settings', 'pricing');
      await setDoc(settingsRef, {
        ...priceSettings,
        updatedAt: new Date()
      });

      // Also update the general settings for backward compatibility
      const generalRef = doc(db, 'settings', 'general');
      await setDoc(generalRef, {
        seatPrice: priceSettings.defaultSeatPrice,
        updatedAt: new Date()
      }, { merge: true });
      
      // Save stall pricing settings
      const stallSettingsRef = doc(db, 'settings', 'stallPricing');
      await setDoc(stallSettingsRef, {
        ...stallPriceSettings,
        updatedAt: new Date()
      });
      
      // Save show seat pricing settings
      const showSeatSettingsRef = doc(db, 'settings', 'showSeatPricing');
      await setDoc(showSeatSettingsRef, {
        ...showSeatPriceSettings,
        updatedAt: new Date()
      });

      // Log the activity with detailed changes
      if (adminUser) {
        try {
          const changes = [];
          
          // Check for price changes
          if (!originalSettings || originalSettings.defaultSeatPrice !== priceSettings.defaultSeatPrice) {
            const oldPrice = originalSettings?.defaultSeatPrice || 'Not set';
            changes.push(`Seat price: ₹${oldPrice} → ₹${priceSettings.defaultSeatPrice}`);
          }
          
          // Check for tax rate changes
          if (!originalSettings || originalSettings.taxRate !== priceSettings.taxRate) {
            const oldTax = originalSettings?.taxRate || 0;
            changes.push(`Tax rate: ${oldTax}% → ${priceSettings.taxRate}%`);
          }
          
          // Check for early bird discount changes
          const oldEarlyBird = originalSettings?.earlyBirdDiscount;
          const newEarlyBird = priceSettings.earlyBirdDiscount;
          if (!oldEarlyBird || JSON.stringify(oldEarlyBird) !== JSON.stringify(newEarlyBird)) {
            if (newEarlyBird.isActive) {
              changes.push(`Early bird discount: ${newEarlyBird.discountPercent}% (${newEarlyBird.daysBeforeEvent} days before event)`);
            } else {
              changes.push('Early bird discount: Disabled');
            }
          }
          
          // Create description based on changes
          let description = 'Updated price settings';
          if (changes.length > 0) {
            description = `Updated pricing: ${changes.join(', ')}`;
          }
          
          await adminLogger.logSettingsActivity(
            adminUser,
            'update',
            'pricing',
            description
          );
        } catch (logError) {
          console.error('Error logging price settings update:', logError);
          // Don't fail the main operation if logging fails
        }
      }

      toast.success('✅ Price settings updated successfully! Changes will sync to all user bookings in real-time.', {
        duration: 5000,
        position: 'top-right'
      });
    } catch (error) {
      console.error('Error saving price settings:', error);
      toast.error('Failed to save price settings');
    } finally {
      setSaving(false);
    }
  };

  const handleAddBulkDiscount = () => {
    if (!newBulkDiscount.minSeats || !newBulkDiscount.discountPercent) {
      toast.error('Please fill in all fields');
      return;
    }

    const newDiscount = {
      minSeats: parseInt(newBulkDiscount.minSeats),
      discountPercent: parseFloat(newBulkDiscount.discountPercent),
      isActive: newBulkDiscount.isActive
    };

    setPriceSettings(prev => ({
      ...prev,
      bulkDiscounts: [...prev.bulkDiscounts, newDiscount].sort((a, b) => a.minSeats - b.minSeats)
    }));

    setNewBulkDiscount({ minSeats: '', discountPercent: '', isActive: true });
  };

  const handleRemoveBulkDiscount = (index) => {
    setPriceSettings(prev => ({
      ...prev,
      bulkDiscounts: prev.bulkDiscounts.filter((_, i) => i !== index)
    }));
  };

  const handleUpdateBulkDiscount = (index, field, value) => {
    setPriceSettings(prev => ({
      ...prev,
      bulkDiscounts: prev.bulkDiscounts.map((discount, i) => 
        i === index ? { ...discount, [field]: value } : discount
      )
    }));
  };

  const handleAddSeasonalPricing = () => {
    if (!newSeasonalPricing.name || !newSeasonalPricing.startDate || !newSeasonalPricing.endDate) {
      toast.error('Please fill in all fields');
      return;
    }

    const newPricing = {
      ...newSeasonalPricing,
      multiplier: parseFloat(newSeasonalPricing.multiplier)
    };

    setPriceSettings(prev => ({
      ...prev,
      seasonalPricing: [...prev.seasonalPricing, newPricing]
    }));

    setNewSeasonalPricing({
      name: '',
      multiplier: 1,
      startDate: '',
      endDate: '',
      isActive: true
    });
  };

  const handleRemoveSeasonalPricing = (index) => {
    setPriceSettings(prev => ({
      ...prev,
      seasonalPricing: prev.seasonalPricing.filter((_, i) => i !== index)
    }));
  };

  const handleUpdateSeasonalPricing = (index, field, value) => {
    setPriceSettings(prev => ({
      ...prev,
      seasonalPricing: prev.seasonalPricing.map((pricing, i) => 
        i === index ? { ...pricing, [field]: value } : pricing
      )
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
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
          <h1 className={`text-2xl font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Price Settings
          </h1>
          <p className={`mt-1 text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Configure pricing, discounts, and promotional offers
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <RealTimeSyncStatus />
          <button
            onClick={handleSaveSettings}
            disabled={saving}
            className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              isDarkMode 
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
            } disabled:opacity-50`}
          >
            <CheckCircleIcon className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Basic Pricing */}
        <div className={`rounded-lg border p-6 ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200 shadow-sm'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 flex items-center ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            <CurrencyRupeeIcon className="w-5 h-5 mr-2" />
            Basic Pricing
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Default Seat Price (₹)
              </label>
              <input
                type="number"
                value={priceSettings.defaultSeatPrice}
                onChange={(e) => setPriceSettings({
                  ...priceSettings,
                  defaultSeatPrice: parseFloat(e.target.value) || 0
                })}
                min="0"
                className={`block w-full px-3 py-2 rounded-md border transition-colors focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Tax Rate (%)
              </label>
              <input
                type="number"
                value={priceSettings.taxRate}
                onChange={(e) => setPriceSettings({
                  ...priceSettings,
                  taxRate: parseFloat(e.target.value) || 0
                })}
                min="0"
                max="100"
                step="0.1"
                className={`block w-full px-3 py-2 rounded-md border transition-colors focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>

            <div className={`p-4 rounded-md ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <h4 className={`text-sm font-medium mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Price Preview
              </h4>
              <div className={`space-y-1 text-sm ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                <div className="flex justify-between">
                  <span>Base Price:</span>
                  <span>{formatCurrency(priceSettings.defaultSeatPrice)}</span>
                </div>
                {priceSettings.taxRate > 0 && (
                  <>
                    <div className="flex justify-between">
                      <span>Tax ({priceSettings.taxRate}%):</span>
                      <span>{formatCurrency(priceSettings.defaultSeatPrice * (priceSettings.taxRate / 100))}</span>
                    </div>
                    <div className={`flex justify-between font-medium border-t pt-1 ${
                      isDarkMode ? 'border-gray-600' : 'border-gray-200'
                    }`}>
                      <span>Total:</span>
                      <span>{formatCurrency(priceSettings.defaultSeatPrice * (1 + priceSettings.taxRate / 100))}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Early Bird Discount */}
        <div className={`rounded-lg border p-6 ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200 shadow-sm'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 flex items-center ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            <ClockIcon className="w-5 h-5 mr-2" />
            Early Bird Discount
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                id="earlyBirdActive"
                type="checkbox"
                checked={priceSettings.earlyBirdDiscount.isActive}
                onChange={(e) => setPriceSettings({
                  ...priceSettings,
                  earlyBirdDiscount: {
                    ...priceSettings.earlyBirdDiscount,
                    isActive: e.target.checked
                  }
                })}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <label htmlFor="earlyBirdActive" className={`ml-2 block text-sm ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Enable Early Bird Discount
              </label>
            </div>

            {priceSettings.earlyBirdDiscount.isActive && (
              <>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Discount Percentage (%)
                  </label>
                  <input
                    type="number"
                    value={priceSettings.earlyBirdDiscount.discountPercent}
                    onChange={(e) => setPriceSettings({
                      ...priceSettings,
                      earlyBirdDiscount: {
                        ...priceSettings.earlyBirdDiscount,
                        discountPercent: parseFloat(e.target.value) || 0
                      }
                    })}
                    min="0"
                    max="100"
                    className={`block w-full px-3 py-2 rounded-md border transition-colors focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Days Before Event
                  </label>
                  <input
                    type="number"
                    value={priceSettings.earlyBirdDiscount.daysBeforeEvent}
                    onChange={(e) => setPriceSettings({
                      ...priceSettings,
                      earlyBirdDiscount: {
                        ...priceSettings.earlyBirdDiscount,
                        daysBeforeEvent: parseInt(e.target.value) || 0
                      }
                    })}
                    min="1"
                    className={`block w-full px-3 py-2 rounded-md border transition-colors focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>

                <div className={`p-3 rounded-md ${
                  isDarkMode 
                    ? 'bg-green-900 bg-opacity-30 border border-green-700' 
                    : 'bg-green-50 border border-green-200'
                }`}>
                  <p className={`text-sm ${
                    isDarkMode ? 'text-green-300' : 'text-green-800'
                  }`}>
                    Bookings made {priceSettings.earlyBirdDiscount.daysBeforeEvent} days or more before the event 
                    will receive {priceSettings.earlyBirdDiscount.discountPercent}% discount.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Bulk Discounts */}
        <div className={`rounded-lg border p-6 ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200 shadow-sm'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 flex items-center ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            <TagIcon className="w-5 h-5 mr-2" />
            Bulk Discounts
          </h3>
          
          <div className="space-y-3">
            {priceSettings.bulkDiscounts.map((discount, index) => (
              <div key={index} className={`flex items-center space-x-3 p-3 rounded-md ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <input
                  type="checkbox"
                  checked={discount.isActive}
                  onChange={(e) => handleUpdateBulkDiscount(index, 'isActive', e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <div className="flex-1">
                  <span className={`text-sm font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {discount.minSeats}+ seats: {discount.discountPercent}% off
                  </span>
                </div>
                <button
                  onClick={() => handleRemoveBulkDiscount(index)}
                  className="text-red-600 hover:text-red-900 p-1"
                  title="Remove discount"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            ))}

            <div className={`border-t pt-4 ${
              isDarkMode ? 'border-gray-600' : 'border-gray-200'
            }`}>
              <h4 className={`text-sm font-medium mb-3 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Add New Bulk Discount
              </h4>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min seats"
                  value={newBulkDiscount.minSeats}
                  onChange={(e) => setNewBulkDiscount({...newBulkDiscount, minSeats: e.target.value})}
                  className={`flex-1 px-3 py-2 text-sm rounded-md border transition-colors focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
                <input
                  type="number"
                  placeholder="Discount %"
                  value={newBulkDiscount.discountPercent}
                  onChange={(e) => setNewBulkDiscount({...newBulkDiscount, discountPercent: e.target.value})}
                  className={`flex-1 px-3 py-2 text-sm rounded-md border transition-colors focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
                <button
                  onClick={handleAddBulkDiscount}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stall Pricing */}
        <div className={`rounded-lg border p-6 ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200 shadow-sm'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 flex items-center ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            <div className="w-5 h-5 mr-2 text-blue-500">🏪</div>
            Stall Pricing
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Default Stall Price (₹)
              </label>
              <input
                type="number"
                value={stallPriceSettings.defaultStallPrice}
                onChange={(e) => setStallPriceSettings({
                  ...stallPriceSettings,
                  defaultStallPrice: parseFloat(e.target.value) || 0
                })}
                min="0"
                className={`block w-full px-3 py-2 rounded-md border transition-colors focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                General Discount (%)
              </label>
              <input
                type="number"
                value={stallPriceSettings.discountPercent}
                onChange={(e) => setStallPriceSettings({
                  ...stallPriceSettings,
                  discountPercent: parseFloat(e.target.value) || 0
                })}
                min="0"
                max="100"
                step="0.1"
                className={`block w-full px-3 py-2 rounded-md border transition-colors focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Tax Rate (%)
              </label>
              <input
                type="number"
                value={stallPriceSettings.taxRate}
                onChange={(e) => setStallPriceSettings({
                  ...stallPriceSettings,
                  taxRate: parseFloat(e.target.value) || 0
                })}
                min="0"
                max="100"
                step="0.1"
                className={`block w-full px-3 py-2 rounded-md border transition-colors focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>

            {/* Early Bird Discount for Stalls */}
            <div className="border-t pt-4">
              <div className="flex items-center mb-3">
                <input
                  id="stallEarlyBirdActive"
                  type="checkbox"
                  checked={stallPriceSettings.earlyBirdDiscount.isActive}
                  onChange={(e) => setStallPriceSettings({
                    ...stallPriceSettings,
                    earlyBirdDiscount: {
                      ...stallPriceSettings.earlyBirdDiscount,
                      isActive: e.target.checked
                    }
                  })}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="stallEarlyBirdActive" className={`ml-2 block text-sm ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Enable Stall Early Bird Discount
                </label>
              </div>
              
              {stallPriceSettings.earlyBirdDiscount.isActive && (
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    placeholder="Discount %"
                    value={stallPriceSettings.earlyBirdDiscount.discountPercent}
                    onChange={(e) => setStallPriceSettings({
                      ...stallPriceSettings,
                      earlyBirdDiscount: {
                        ...stallPriceSettings.earlyBirdDiscount,
                        discountPercent: parseFloat(e.target.value) || 0
                      }
                    })}
                    className={`px-3 py-2 text-sm rounded-md border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                  <input
                    type="number"
                    placeholder="Days before"
                    value={stallPriceSettings.earlyBirdDiscount.daysBeforeEvent}
                    onChange={(e) => setStallPriceSettings({
                      ...stallPriceSettings,
                      earlyBirdDiscount: {
                        ...stallPriceSettings.earlyBirdDiscount,
                        daysBeforeEvent: parseInt(e.target.value) || 0
                      }
                    })}
                    className={`px-3 py-2 text-sm rounded-md border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>
              )}
            </div>

            <div className={`p-4 rounded-md ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <h4 className={`text-sm font-medium mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Stall Price Preview
              </h4>
              <div className={`space-y-1 text-sm ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                <div className="flex justify-between">
                  <span>Base Price (5 days):</span>
                  <span>{formatCurrency(stallPriceSettings.defaultStallPrice)}</span>
                </div>
                {stallPriceSettings.discountPercent > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({stallPriceSettings.discountPercent}%):</span>
                    <span>-{formatCurrency(stallPriceSettings.defaultStallPrice * (stallPriceSettings.discountPercent / 100))}</span>
                  </div>
                )}
                {stallPriceSettings.taxRate > 0 && (
                  <div className="flex justify-between">
                    <span>Tax ({stallPriceSettings.taxRate}%):</span>
                    <span>{formatCurrency((stallPriceSettings.defaultStallPrice * (1 - stallPriceSettings.discountPercent / 100)) * (stallPriceSettings.taxRate / 100))}</span>
                  </div>
                )}
                <div className={`flex justify-between font-medium border-t pt-1 ${
                  isDarkMode ? 'border-gray-600' : 'border-gray-200'
                }`}>
                  <span>Total:</span>
                  <span>
                    {formatCurrency(
                      stallPriceSettings.defaultStallPrice * 
                      (1 - stallPriceSettings.discountPercent / 100) * 
                      (1 + stallPriceSettings.taxRate / 100)
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Show Seat Pricing */}
        <div className={`rounded-lg border p-6 ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200 shadow-sm'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 flex items-center ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            <div className="w-5 h-5 mr-2 text-purple-500">🎭</div>
            Show Seat Pricing
          </h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  VIP Seat Price (₹)
                </label>
                <input
                  type="number"
                  value={showSeatPriceSettings.vipSeatPrice}
                  onChange={(e) => setShowSeatPriceSettings({
                    ...showSeatPriceSettings,
                    vipSeatPrice: parseFloat(e.target.value) || 0
                  })}
                  min="0"
                  className={`block w-full px-3 py-2 rounded-md border transition-colors focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
                <p className={`text-xs mt-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>2 people per sofa</p>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Regular Seat Price (₹)
                </label>
                <input
                  type="number"
                  value={showSeatPriceSettings.regularSeatPrice}
                  onChange={(e) => setShowSeatPriceSettings({
                    ...showSeatPriceSettings,
                    regularSeatPrice: parseFloat(e.target.value) || 0
                  })}
                  min="0"
                  className={`block w-full px-3 py-2 rounded-md border transition-colors focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
                <p className={`text-xs mt-1 ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>1 person per seat</p>
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${
                isDarkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Tax Rate (%)
              </label>
              <input
                type="number"
                value={showSeatPriceSettings.taxRate}
                onChange={(e) => setShowSeatPriceSettings({
                  ...showSeatPriceSettings,
                  taxRate: parseFloat(e.target.value) || 0
                })}
                min="0"
                max="100"
                step="0.1"
                className={`block w-full px-3 py-2 rounded-md border transition-colors focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  isDarkMode 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>

            {/* Show Bulk Discounts */}
            <div className="border-t pt-4">
              <h4 className={`text-sm font-medium mb-3 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>Show Bulk Discounts</h4>
              <div className="space-y-2">
                {showSeatPriceSettings.bulkDiscounts.map((discount, index) => (
                  <div key={index} className={`flex items-center space-x-3 p-2 rounded-md ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
                  }`}>
                    <input
                      type="checkbox"
                      checked={discount.isActive}
                      onChange={(e) => {
                        const updated = [...showSeatPriceSettings.bulkDiscounts];
                        updated[index].isActive = e.target.checked;
                        setShowSeatPriceSettings({...showSeatPriceSettings, bulkDiscounts: updated});
                      }}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                    />
                    <span className={`text-sm font-medium flex-1 ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {discount.minSeats}+ seats: {discount.discountPercent}% off
                    </span>
                    <button
                      onClick={() => {
                        const updated = showSeatPriceSettings.bulkDiscounts.filter((_, i) => i !== index);
                        setShowSeatPriceSettings({...showSeatPriceSettings, bulkDiscounts: updated});
                      }}
                      className="text-red-600 hover:text-red-900 p-1"
                      title="Remove discount"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Show Early Bird Discount */}
            <div className="border-t pt-4">
              <div className="flex items-center mb-3">
                <input
                  id="showEarlyBirdActive"
                  type="checkbox"
                  checked={showSeatPriceSettings.earlyBirdDiscount.isActive}
                  onChange={(e) => setShowSeatPriceSettings({
                    ...showSeatPriceSettings,
                    earlyBirdDiscount: {
                      ...showSeatPriceSettings.earlyBirdDiscount,
                      isActive: e.target.checked
                    }
                  })}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="showEarlyBirdActive" className={`ml-2 block text-sm ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Enable Show Early Bird Discount
                </label>
              </div>
              
              {showSeatPriceSettings.earlyBirdDiscount.isActive && (
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    placeholder="Discount %"
                    value={showSeatPriceSettings.earlyBirdDiscount.discountPercent}
                    onChange={(e) => setShowSeatPriceSettings({
                      ...showSeatPriceSettings,
                      earlyBirdDiscount: {
                        ...showSeatPriceSettings.earlyBirdDiscount,
                        discountPercent: parseFloat(e.target.value) || 0
                      }
                    })}
                    className={`px-3 py-2 text-sm rounded-md border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                  <input
                    type="number"
                    placeholder="Days before"
                    value={showSeatPriceSettings.earlyBirdDiscount.daysBeforeEvent}
                    onChange={(e) => setShowSeatPriceSettings({
                      ...showSeatPriceSettings,
                      earlyBirdDiscount: {
                        ...showSeatPriceSettings.earlyBirdDiscount,
                        daysBeforeEvent: parseInt(e.target.value) || 0
                      }
                    })}
                    className={`px-3 py-2 text-sm rounded-md border ${
                      isDarkMode 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>
              )}
            </div>

            <div className={`p-4 rounded-md ${
              isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
            }`}>
              <h4 className={`text-sm font-medium mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Show Seat Price Preview
              </h4>
              <div className={`space-y-1 text-sm ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                <div className="flex justify-between">
                  <span>VIP Sofa (2 people):</span>
                  <span>{formatCurrency(showSeatPriceSettings.vipSeatPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Regular Seat (1 person):</span>
                  <span>{formatCurrency(showSeatPriceSettings.regularSeatPrice)}</span>
                </div>
                {showSeatPriceSettings.taxRate > 0 && (
                  <>
                    <div className="flex justify-between text-xs border-t pt-1">
                      <span>VIP + Tax ({showSeatPriceSettings.taxRate}%):</span>
                      <span>{formatCurrency(showSeatPriceSettings.vipSeatPrice * (1 + showSeatPriceSettings.taxRate / 100))}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Regular + Tax ({showSeatPriceSettings.taxRate}%):</span>
                      <span>{formatCurrency(showSeatPriceSettings.regularSeatPrice * (1 + showSeatPriceSettings.taxRate / 100))}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Seasonal Pricing */}
        <div className={`rounded-lg border p-6 lg:col-span-2 ${
          isDarkMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200 shadow-sm'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 flex items-center ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            <CalendarDaysIcon className="w-5 h-5 mr-2" />
            Seasonal Pricing
          </h3>
          
          <div className="space-y-3">
            {priceSettings.seasonalPricing.map((pricing, index) => (
              <div key={index} className={`flex items-center space-x-3 p-3 rounded-md ${
                isDarkMode ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <input
                  type="checkbox"
                  checked={pricing.isActive}
                  onChange={(e) => handleUpdateSeasonalPricing(index, 'isActive', e.target.checked)}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <div className="flex-1">
                  <div className={`text-sm font-medium ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {pricing.name}
                  </div>
                  <div className={`text-xs ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {pricing.startDate} to {pricing.endDate} • {pricing.multiplier}x price
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveSeasonalPricing(index)}
                  className="text-red-600 hover:text-red-900 p-1"
                  title="Remove seasonal pricing"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            ))}

            <div className={`border-t pt-4 ${
              isDarkMode ? 'border-gray-600' : 'border-gray-200'
            }`}>
              <h4 className={`text-sm font-medium mb-3 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Add New Seasonal Pricing
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2 mb-3">
                <input
                  type="text"
                  placeholder="Season name"
                  value={newSeasonalPricing.name}
                  onChange={(e) => setNewSeasonalPricing({...newSeasonalPricing, name: e.target.value})}
                  className={`px-3 py-2 text-sm rounded-md border transition-colors focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
                <input
                  type="date"
                  value={newSeasonalPricing.startDate}
                  onChange={(e) => setNewSeasonalPricing({...newSeasonalPricing, startDate: e.target.value})}
                  className={`px-3 py-2 text-sm rounded-md border transition-colors focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
                <input
                  type="date"
                  value={newSeasonalPricing.endDate}
                  onChange={(e) => setNewSeasonalPricing({...newSeasonalPricing, endDate: e.target.value})}
                  className={`px-3 py-2 text-sm rounded-md border transition-colors focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  placeholder="Multiplier"
                  value={newSeasonalPricing.multiplier}
                  onChange={(e) => setNewSeasonalPricing({...newSeasonalPricing, multiplier: e.target.value})}
                  className={`px-3 py-2 text-sm rounded-md border transition-colors focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
                <button
                  onClick={handleAddSeasonalPricing}
                  className="inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
