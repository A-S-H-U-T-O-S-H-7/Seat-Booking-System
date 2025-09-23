"use client";
import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function ImageModal({ 
  show = false, 
  onClose, 
  imageSrc, 
  imageAlt = "Image", 
  title = "Image Viewer" 
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Reset image states when modal opens/closes
  useEffect(() => {
    if (show) {
      setImageLoaded(false);
      setImageError(false);
    }
  }, [show]);

  // Handle escape key press
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && show) {
        onClose();
      }
    };

    if (show) {
      document.addEventListener('keydown', handleEscapeKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [show, onClose]);

  if (!show) {
    return null;
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50 transition-opacity duration-300"
      onClick={handleBackdropClick}
    >
      <div className="max-w-7xl w-full max-h-full bg-white rounded-xl shadow-2xl overflow-hidden transform transition-all duration-300 scale-100 flex flex-col">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-amber-50 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-orange-100">
                <svg 
                  className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  {title}
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 group"
            >
              <XMarkIcon className="w-5 h-5 text-gray-500 group-hover:text-gray-700" />
            </button>
          </div>
        </div>

        {/* Image Container - Flexible height */}
        <div className="flex-1 bg-gray-50 p-2 sm:p-4 overflow-hidden">
          <div className="relative bg-white rounded-lg shadow-inner h-full flex items-center justify-center">
            {!imageLoaded && !imageError && (
              <div className="flex items-center justify-center h-64 bg-gray-100 w-full">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
                  <span className="text-gray-600">Loading image...</span>
                </div>
              </div>
            )}

            {imageError ? (
              <div className="flex flex-col items-center justify-center h-64 bg-red-50 text-red-600 w-full">
                <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-lg font-medium mb-2">Failed to load image</p>
                <p className="text-sm text-red-500">Please check if the image file exists</p>
              </div>
            ) : (
              <img
                src={imageSrc}
                alt={imageAlt}
                className="max-w-full max-h-full object-contain transition-opacity duration-300 rounded"
                style={{ 
                  opacity: imageLoaded ? 1 : 0 
                }}
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
            )}
          </div>
          
          {imageLoaded && !imageError && (
            <div className="mt-2 text-center">
              <p className="text-xs sm:text-sm text-gray-500">
                {imageAlt}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white px-4 sm:px-6 py-2 rounded-lg transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg font-medium text-sm sm:text-base"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}