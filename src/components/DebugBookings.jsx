// Debug component to check what's in the bookings collection
"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

const DebugBookings = () => {
  const { user } = useAuth();
  const [allBookings, setAllBookings] = useState([]);
  const [userBookings, setUserBookings] = useState([]);

  useEffect(() => {
    if (user) {
      fetchAllBookings();
    }
  }, [user]);

  const fetchAllBookings = async () => {
    try {
      const bookingsRef = collection(db, 'bookings');
      const snapshot = await getDocs(bookingsRef);
      
      const allData = [];
      const userData = [];
      
      snapshot.forEach((doc) => {
        const data = { id: doc.id, ...doc.data() };
        allData.push(data);
        
        if (data.userId === user.uid) {
          userData.push(data);
        }
      });
      
      console.log('All bookings:', allData);
      console.log('User bookings:', userData);
      console.log('Current user ID:', user.uid);
      
      setAllBookings(allData);
      setUserBookings(userData);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  if (!user) return null;

  return (
    <div className="p-4 bg-gray-100 border rounded mb-4">
      <h3 className="font-bold mb-2">Debug Info</h3>
      <p><strong>User ID:</strong> {user.uid}</p>
      <p><strong>User Email:</strong> {user.email}</p>
      <p><strong>Total bookings in DB:</strong> {allBookings.length}</p>
      <p><strong>User's bookings:</strong> {userBookings.length}</p>
      
      {userBookings.length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold">User's booking details:</h4>
          {userBookings.map((booking, index) => (
            <div key={index} className="mt-2 p-2 bg-white rounded text-xs">
              <pre>{JSON.stringify(booking, null, 2)}</pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DebugBookings;
