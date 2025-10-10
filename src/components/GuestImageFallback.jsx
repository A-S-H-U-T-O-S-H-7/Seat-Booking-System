// Create this as a new file: components/GuestImageWithFallback.jsx
"use client"
import React, { useState } from 'react';

const GuestImageWithFallback = ({ 
  src, 
  alt, 
  className = "",
  size = 120 
}) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  // Generate initials from name
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Generate color from name
  const getColorFromName = (name) => {
    if (!name) return '#9333ea'; // purple-600
    
    const colors = [
      '#9333ea', // purple
      '#db2777', // pink
      '#dc2626', // red
      '#ea580c', // orange
      '#ca8a04', // yellow
      '#16a34a', // green
      '#0891b2', // cyan
      '#2563eb', // blue
      '#7c3aed', // violet
    ];
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  // Fallback to UI Avatars service
  const getFallbackUrl = () => {
    const name = encodeURIComponent(alt || 'Guest');
    return `https://ui-avatars.com/api/?name=${name}&size=${size}&background=random&color=fff&bold=true`;
  };

  // Custom SVG placeholder
  const CustomPlaceholder = () => {
    const initials = getInitials(alt);
    const bgColor = getColorFromName(alt);

    return (
      <div 
        className={`flex items-center justify-center ${className}`}
        style={{ backgroundColor: bgColor }}
      >
        <span className="text-white font-bold" style={{ fontSize: size / 3 }}>
          {initials}
        </span>
      </div>
    );
  };

  if (error || !src) {
    // Try UI Avatars first, then custom placeholder
    return (
      <img 
        src={getFallbackUrl()}
        alt={alt}
        className={className}
        onError={() => <CustomPlaceholder />}
        loading="lazy"
      />
    );
  }

  return (
    <>
      {loading && (
        <div className={`${className} bg-gray-200 animate-pulse`} />
      )}
      <img 
        src={src}
        alt={alt}
        className={`${className} ${loading ? 'hidden' : 'block'}`}
        onLoad={() => setLoading(false)}
        onError={() => {
          setError(true);
          setLoading(false);
        }}
        loading="lazy"
      />
    </>
  );
};

export default GuestImageWithFallback;