// ToastNotification.jsx
import React from 'react';

const ToastNotification = ({ showToast, toastMessage }) => {
  if (!showToast) return null;
  
  return (
    <div className="fixed top-6 right-6 bg-white rounded-2xl shadow-2xl p-6 max-w-md z-60 border border-green-100 animate-slideDown">
      <div className="flex items-start">
        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h4 className="font-semibold text-gray-800 mb-1">Application Submitted!</h4>
          <p className="text-sm text-gray-600 leading-relaxed">{toastMessage}</p>
        </div>
      </div>
    </div>
  );
};

export default ToastNotification;