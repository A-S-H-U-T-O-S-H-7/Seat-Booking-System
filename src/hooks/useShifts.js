import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export const useShifts = () => {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shiftsMap, setShiftsMap] = useState({});

  useEffect(() => {
    const shiftRef = doc(db, 'settings', 'shifts');
    
    const unsubscribe = onSnapshot(shiftRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const activeShifts = data.shifts?.filter(shift => shift.isActive) || [];
        setShifts(activeShifts);
        
        // Create a map for quick lookup
        const map = {};
        activeShifts.forEach(shift => {
          map[shift.id] = shift;
        });
        setShiftsMap(map);
      } else {
        // Default shifts if none exist
        const defaultShifts = [
          { 
            id: "morning", 
            label: "Morning Session", 
            time: "9:00 AM - 12:00 PM",
            timeFrom: "09:00",
            timeTo: "12:00",
            description: "Start your day with divine blessings",
            icon: "🌅",
            isActive: true
          },
          { 
            id: "afternoon", 
            label: "Afternoon Session", 
            time: "2:00 PM - 5:00 PM",
            timeFrom: "14:00",
            timeTo: "17:00",
            description: "Peaceful afternoon spiritual session",
            icon: "☀️",
            isActive: true
          },
          { 
            id: "evening", 
            label: "Evening Session", 
            time: "4:00 PM - 10:00 PM",
            timeFrom: "16:00",
            timeTo: "22:00",
            description: "Evening spiritual experience",
            icon: "🌆",
            isActive: true
          }
        ];
        setShifts(defaultShifts);
        
        const map = {};
        defaultShifts.forEach(shift => {
          map[shift.id] = shift;
        });
        setShiftsMap(map);
      }
      setLoading(false);
    }, (error) => {
      console.error('Error listening to shift settings:', error);
      // Set default shifts on error
      const defaultShifts = [
        { 
          id: "morning", 
          label: "Morning Session", 
          time: "9:00 AM - 12:00 PM",
          timeFrom: "09:00",
          timeTo: "12:00",
          description: "Start your day with divine blessings",
          icon: "🌅",
          isActive: true
        },
        { 
          id: "afternoon", 
          label: "Afternoon Session", 
          time: "2:00 PM - 5:00 PM",
          timeFrom: "14:00",
          timeTo: "17:00",
          description: "Peaceful afternoon spiritual session",
          icon: "☀️",
          isActive: true
        },
        { 
          id: "evening", 
          label: "Evening Session", 
          time: "4:00 PM - 10:00 PM",
          timeFrom: "16:00",
          timeTo: "22:00",
          description: "Evening spiritual experience",
          icon: "🌆",
          isActive: true
        }
      ];
      setShifts(defaultShifts);
      
      const map = {};
      defaultShifts.forEach(shift => {
        map[shift.id] = shift;
      });
      setShiftsMap(map);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getShiftInfo = (shiftId) => {
    return shiftsMap[shiftId] || null;
  };

  const getShiftLabel = (shiftId) => {
    const shift = shiftsMap[shiftId];
    return shift ? shift.label : (shiftId ? shiftId.charAt(0).toUpperCase() + shiftId.slice(1) : 'Unknown');
  };

  const getShiftTime = (shiftId) => {
    const shift = shiftsMap[shiftId];
    if (shift) {
      if (shift.time) {
        return shift.time;
      } else if (shift.timeFrom && shift.timeTo) {
        return `${formatTime(shift.timeFrom)} - ${formatTime(shift.timeTo)}`;
      }
    }
    
    // Fallback for hardcoded shift IDs
    switch(shiftId) {
      case 'morning':
        return '9:00 AM - 12:00 PM';
      case 'evening':
        return '4:00 PM - 10:00 PM';
      case 'afternoon':
        return '2:00 PM - 5:00 PM';
      default:
        return 'Time not available';
    }
  };

  return {
    shifts,
    loading,
    shiftsMap,
    getShiftInfo,
    getShiftLabel,
    getShiftTime,
    formatTime
  };
};

export default useShifts;
