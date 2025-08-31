// System Settings Service for fetching configuration from Firebase
// Used by email service, components, and pages to get dynamic values

import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

/**
 * Fetches stall event configuration from system settings
 * @returns {Promise<Object>} - Stall event configuration
 */
export const getStallEventSettings = async () => {
  try {
    const stallRef = doc(db, 'settings', 'stalls');
    const stallSnap = await getDoc(stallRef);
    
    if (stallSnap.exists()) {
      const data = stallSnap.data();
      return {
        startDate: data.eventDates?.startDate || '2025-11-15',
        endDate: data.eventDates?.endDate || '2025-11-20',
        isActive: data.eventDates?.isActive || false,
        totalStalls: data.totalStalls || 70,
        defaultPrice: data.defaultPrice || 5000
      };
    } else {
      // Return default values if no settings found
      return {
        startDate: '2025-11-15',
        endDate: '2025-11-20',
        isActive: false,
        totalStalls: 70,
        defaultPrice: 5000
      };
    }
  } catch (error) {
    console.error('Error fetching stall event settings:', error);
    // Return default values on error
    return {
      startDate: '2025-11-15',
      endDate: '2025-11-20',
      isActive: false,
      totalStalls: 70,
      defaultPrice: 5000
    };
  }
};

/**
 * Fetches shift configuration from system settings
 * @returns {Promise<Object>} - Shift configuration
 */
export const getShiftSettings = async () => {
  try {
    const shiftRef = doc(db, 'settings', 'shifts');
    const shiftSnap = await getDoc(shiftRef);
    
    if (shiftSnap.exists()) {
      const data = shiftSnap.data();
      return {
        shifts: data.shifts || []
      };
    } else {
      // Return default shifts if none exist
      return {
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
            id: "afternoon",
            label: "Afternoon Session",
            timeFrom: "14:00",
            timeTo: "17:00",
            description: "Peaceful afternoon spiritual session",
            icon: "☀️",
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
    }
  } catch (error) {
    console.error('Error fetching shift settings:', error);
    // Return default shifts on error
    return {
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
          id: "afternoon",
          label: "Afternoon Session",
          timeFrom: "14:00",
          timeTo: "17:00",
          description: "Peaceful afternoon spiritual session",
          icon: "☀️",
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
  }
};

/**
 * Formats event duration based on start and end dates
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @returns {string} - Formatted duration string
 */
export const formatEventDuration = (startDate, endDate) => {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return 'Event duration not available';
    }
    
    const timeDiff = end.getTime() - start.getTime();
    const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // +1 to include both start and end dates
    
    const startFormatted = start.toLocaleDateString('en-IN', { 
      month: 'short', 
      day: 'numeric' 
    });
    const endFormatted = end.toLocaleDateString('en-IN', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
    
    return `${startFormatted} - ${endFormatted} (${dayDiff} Day${dayDiff > 1 ? 's' : ''})`;
  } catch (error) {
    console.error('Error formatting event duration:', error);
    return 'Event duration not available';
  }
};

/**
 * Gets shift display information by shift ID
 * @param {string} shiftId - The shift identifier
 * @param {Array} shifts - Array of shift configurations
 * @returns {Object} - Shift display information
 */
export const getShiftDisplayInfo = (shiftId, shifts = []) => {
  const shift = shifts.find(s => s.id === shiftId);
  
  if (!shift) {
    return {
      label: 'Shift not available',
      time: 'Time not available',
      description: 'Description not available'
    };
  }
  
  const formatTime = (timeString) => {
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch (error) {
      return timeString;
    }
  };
  
  return {
    label: shift.label || 'Unknown Shift',
    time: `${formatTime(shift.timeFrom)} - ${formatTime(shift.timeTo)}`,
    description: shift.description || '',
    icon: shift.icon || '🕐'
  };
};

/**
 * Helper function to calculate days between dates
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - End date in YYYY-MM-DD format  
 * @returns {number} - Number of days
 */
export const calculateEventDays = (startDate, endDate) => {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = end.getTime() - start.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
  } catch (error) {
    console.error('Error calculating event days:', error);
    return 1;
  }
};

export default {
  getStallEventSettings,
  getShiftSettings,
  formatEventDuration,
  getShiftDisplayInfo,
  calculateEventDays
};
