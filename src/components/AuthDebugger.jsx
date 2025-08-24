"use client";
import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const AuthDebugger = () => {
  const [debugInfo, setDebugInfo] = useState({
    user: null,
    loading: true,
    error: null,
    authDomain: '',
    projectId: ''
  });

  useEffect(() => {
    // Get configuration info
    setDebugInfo(prev => ({
      ...prev,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    }));

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, 
      (user) => {
        console.log('Auth state changed:', user);
        setDebugInfo(prev => ({
          ...prev,
          user: user ? {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            emailVerified: user.emailVerified
          } : null,
          loading: false,
          error: null
        }));
      },
      (error) => {
        console.error('Auth error:', error);
        setDebugInfo(prev => ({
          ...prev,
          loading: false,
          error: {
            code: error.code,
            message: error.message
          }
        }));
      }
    );

    return () => unsubscribe();
  }, []);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-black bg-opacity-80 text-white p-4 rounded-lg max-w-sm text-xs font-mono">
      <div className="mb-2 font-bold text-yellow-300">🔥 Firebase Auth Debug</div>
      
      <div className="mb-2">
        <div className="text-blue-300">Config:</div>
        <div>Domain: {debugInfo.authDomain}</div>
        <div>Project: {debugInfo.projectId}</div>
      </div>

      <div className="mb-2">
        <div className="text-green-300">Status:</div>
        <div>Loading: {debugInfo.loading ? 'Yes' : 'No'}</div>
        <div>User: {debugInfo.user ? 'Logged in' : 'Not logged in'}</div>
      </div>

      {debugInfo.user && (
        <div className="mb-2">
          <div className="text-green-300">User Info:</div>
          <div>Email: {debugInfo.user.email}</div>
          <div>UID: {debugInfo.user.uid?.substring(0, 8)}...</div>
          <div>Verified: {debugInfo.user.emailVerified ? 'Yes' : 'No'}</div>
        </div>
      )}

      {debugInfo.error && (
        <div className="mb-2">
          <div className="text-red-300">Error:</div>
          <div>Code: {debugInfo.error.code}</div>
          <div>Message: {debugInfo.error.message}</div>
        </div>
      )}
    </div>
  );
};

export default AuthDebugger;
