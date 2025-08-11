"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';

const AdminContext = createContext();

export function AdminProvider({ children }) {
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adminData, setAdminData] = useState(null);
  const router = useRouter();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let adminUnsubscribe = null;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
  // Clear any existing admin listener
  if (adminUnsubscribe) {
    adminUnsubscribe();
    adminUnsubscribe = null;
  }

  if (user) {
    try {
      // Check if user is admin
      const adminDoc = await getDoc(doc(db, 'admins', user.uid));
      
      if (adminDoc.exists()) {
        const data = adminDoc.data();
        const adminInfo = {
          uid: user.uid,
          email: user.email,
          name: data.name,
          role: data.role,
          permissions: data.permissions || [],
          createdAt: data.createdAt,
          lastLogin: data.lastLogin
        };
        
        setAdminUser(adminInfo);
        setAdminData(data);
        
        // Set up real-time listener for admin data updates
        const adminRef = doc(db, 'admins', user.uid);
        adminUnsubscribe = onSnapshot(adminRef, (doc) => {
          if (doc.exists()) {
            const updatedData = doc.data();
            setAdminData(updatedData);
            const updatedAdminInfo = {
              uid: user.uid,
              email: user.email,
              name: updatedData.name,
              role: updatedData.role,
              permissions: updatedData.permissions || [],
              createdAt: updatedData.createdAt,
              lastLogin: updatedData.lastLogin
            };
            setAdminUser(updatedAdminInfo);
          }
        });
      } else {
        // User is not admin - just clear admin state, DON'T sign out
        setAdminUser(null);
        setAdminData(null);
        // Remove this line: await signOut(auth);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      setAdminUser(null);
      setAdminData(null);
    }
  } else {
    setAdminUser(null);
    setAdminData(null);
  }
  
  setLoading(false);
});

    return () => {
      unsubscribe();
      if (adminUnsubscribe) {
        adminUnsubscribe();
      }
    };
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      setAdminUser(null);
      setAdminData(null);
      localStorage.removeItem('adminUser');
      router.push('/admin/login');
    } catch (error) {
      console.error('Admin logout error:', error);
      throw error;
    }
  };

  const hasPermission = (permission) => {
    if (!adminUser || !adminUser.permissions) return false;
    return adminUser.role === 'super_admin' || adminUser.permissions.includes(permission);
  };

  const value = {
    adminUser,
    adminData,
    loading,
    logout,
    hasPermission,
    isAdmin: !!adminUser,
    isSuperAdmin: adminUser?.role === 'super_admin'
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}

export default AdminContext;
