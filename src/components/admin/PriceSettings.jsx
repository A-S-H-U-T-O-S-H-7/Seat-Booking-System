"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { useTheme } from '@/context/ThemeContext';
import { useAdmin } from '@/context/AdminContext';
import adminLogger from '@/lib/adminLogger';
import { 
  CheckCircleIcon,
  HomeIcon,
  BuildingStorefrontIcon,
  TicketIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import RealTimeSyncStatus from './RealTimeSyncStatus';
import HavanPriceSection from './price-components/HavanPriceSection';
import StallPriceSection from './price-components/StallPriceSection';
import ShowPriceSection from './price-components/ShowPriceSection';
import DelegatePriceSection from './price-components/DelegatePriceSection';

export default function PriceSettings() {
  const { isDarkMode } = useTheme();
  const { adminUser } = useAdmin();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('havan');

  // Havan Price Management
  const [havanSettings, setHavanSettings] = useState({
    seatPrice: 500,
    earlyBirdDiscounts: [
      { daysBeforeEvent: 30, discountPercent: 30, isActive: true },
      { daysBeforeEvent: 15, discountPercent: 15, isActive: true }
    ],
    bulkBookingDiscounts: [
      { minSeats: 5, discountPercent: 10, isActive: true },
      { minSeats: 10, discountPercent: 15, isActive: true }
    ]
  });

  // Stall Price Management
  const [stallSettings, setStallSettings] = useState({
    seatPrice: 5000, // Using seatPrice to match component expectation
    earlyBirdDiscounts: [
      { daysBeforeEvent: 30, discountPercent: 25, isActive: true }
    ],
    bulkBookingDiscounts: [
      { minSeats: 2, discountPercent: 10, isActive: true } // Using minSeats for consistency
    ]
  });

  // Show Price Management
  const [showSettings, setShowSettings] = useState({
    seatTypes: {
      blockA: { price: 1200, label: 'Block A Premium' },
      blockB: { price: 1000, label: 'Block B Premium' },
      blockC: { price: 600, label: 'Block C Regular' },
      blockD: { price: 400, label: 'Block D Regular' }
    },
    earlyBirdDiscounts: [
      { daysBeforeEvent: 30, discountPercent: 20, isActive: true },
      { daysBeforeEvent: 7, discountPercent: 10, isActive: true }
    ],
    bulkBookingDiscounts: [
      { minSeats: 5, discountPercent: 10, isActive: true },
      { minSeats: 10, discountPercent: 15, isActive: true }
    ]
  });

  // Delegate Price Management
  const [delegateSettings, setDelegateSettings] = useState({
    withoutAssistance: {
      pricePerPerson: 5000,
      fixedDays: 5,
      benefits: [
        '🍴 Enjoy complimentary lunch throughout the event',
        '🎟️ Receive a free entry pass valid for 5 days',
        '🤝 Get assistance with basic needs during event',
        '🎫 Avail a complimentary pass to exclusive shows'
      ]
    },
    withAssistance: {
      pricePerPersonPerDay: 1000,
      minDays: 2,
      maxDays: 5,
      benefits: [
        '✈️ Facility of pick-up & drop from airport/station',
        '🏨 Comfortable stay in well-appointed hotel',
        '🚐 Daily transportation between hotel & venue provided',
        '🍽️ Lunch and dinner served throughout your stay',
        '🛎️ Provided all essential amenities for Havan and Shows',
        '🤝 Personalized care and dedicated assistance'
      ]
    }
  });

  useEffect(() => {
    fetchPriceSettings();
  }, []);

  const fetchPriceSettings = async () => {
    setLoading(true);
    try {
      // Fetch Havan pricing
      const havanRef = doc(db, 'settings', 'havanPricing');
      const havanSnap = await getDoc(havanRef);
      if (havanSnap.exists()) {
        setHavanSettings(prev => ({ ...prev, ...havanSnap.data() }));
      }

      // Fetch Stall pricing
      const stallRef = doc(db, 'settings', 'stallPricing');
      const stallSnap = await getDoc(stallRef);
      if (stallSnap.exists()) {
        setStallSettings(prev => ({ ...prev, ...stallSnap.data() }));
      }

      // Fetch Show pricing
      const showRef = doc(db, 'settings', 'showPricing');
      const showSnap = await getDoc(showRef);
      if (showSnap.exists()) {
        setShowSettings(prev => ({ ...prev, ...showSnap.data() }));
      }

      // Fetch Delegate pricing
      const delegateRef = doc(db, 'settings', 'delegatePricing');
      const delegateSnap = await getDoc(delegateRef);
      if (delegateSnap.exists()) {
        setDelegateSettings(prev => ({ ...prev, ...delegateSnap.data() }));
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
    try {
      // Save Havan settings
      const havanRef = doc(db, 'settings', 'havanPricing');
      await setDoc(havanRef, {
        ...havanSettings,
        updatedAt: new Date()
      });

      // Save Stall settings
      const stallRef = doc(db, 'settings', 'stallPricing');
      await setDoc(stallRef, {
        ...stallSettings,
        updatedAt: new Date()
      });

      // Save Show settings
      const showRef = doc(db, 'settings', 'showPricing');
      await setDoc(showRef, {
        ...showSettings,
        updatedAt: new Date()
      });

      // Save Delegate settings
      const delegateRef = doc(db, 'settings', 'delegatePricing');
      await setDoc(delegateRef, {
        ...delegateSettings,
        updatedAt: new Date()
      });

      // Also update legacy general settings for backward compatibility
      const generalRef = doc(db, 'settings', 'general');
      await setDoc(generalRef, {
        seatPrice: havanSettings.seatPrice,
        updatedAt: new Date()
      }, { merge: true });

      // Log the activity
      if (adminUser) {
        try {
          await adminLogger.logSettingsActivity(
            adminUser,
            'update',
            'pricing',
            'Updated comprehensive price settings for Havan, Stall, Show, and Delegate management'
          );
        } catch (logError) {
          console.error('Error logging price settings update:', logError);
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
            🎯 Price Management Center
          </h1>
          <p className={`mt-2 text-sm ${
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Comprehensive pricing control for Havan, Stall, Show, and Delegate bookings with advanced discount management
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <RealTimeSyncStatus />
          <button
            onClick={handleSaveSettings}
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
      </div>

      {/* Tab Navigation */}
      <div className={`flex flex-wrap gap-2 p-1 rounded-xl ${
        isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-gray-100 border border-gray-200'
      }`}>
        <TabButton
          id="havan"
          label="Havan Price Management"
          icon={<HomeIcon className="w-5 h-5" />}
          isActive={activeTab === 'havan'}
          onClick={setActiveTab}
        />
        <TabButton
          id="stall"
          label="Stall Price Management"
          icon={<BuildingStorefrontIcon className="w-5 h-5" />}
          isActive={activeTab === 'stall'}
          onClick={setActiveTab}
        />
        <TabButton
          id="show"
          label="Show Price Management"
          icon={<TicketIcon className="w-5 h-5" />}
          isActive={activeTab === 'show'}
          onClick={setActiveTab}
        />
        <TabButton
          id="delegate"
          label="Delegate Price Management"
          icon={<UserGroupIcon className="w-5 h-5" />}
          isActive={activeTab === 'delegate'}
          onClick={setActiveTab}
        />
      </div>

      {/* Tab Content */}
      <div className={`rounded-xl border shadow-xl ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        
        {/* Havan Price Management */}
        {activeTab === 'havan' && (
          <div className="p-6">
            <HavanPriceSection
              settings={havanSettings}
              onUpdate={setHavanSettings}
              isDarkMode={isDarkMode}
            />
          </div>
        )}

        {/* Stall Price Management */}
        {activeTab === 'stall' && (
          <div className="p-6">
            <StallPriceSection
              settings={stallSettings}
              onUpdate={setStallSettings}
              isDarkMode={isDarkMode}
            />
          </div>
        )}

        {/* Show Price Management */}
        {activeTab === 'show' && (
          <div className="p-6">
            <ShowPriceSection
              settings={showSettings}
              onUpdate={setShowSettings}
              isDarkMode={isDarkMode}
            />
          </div>
        )}

        {/* Delegate Price Management */}
        {activeTab === 'delegate' && (
          <div className="p-6">
            <DelegatePriceSection
              settings={delegateSettings}
              onUpdate={setDelegateSettings}
              isDarkMode={isDarkMode}
            />
          </div>
        )}
      </div>
    </div>
  );
}

