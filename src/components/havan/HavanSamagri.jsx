import React, { useEffect, useRef, useState } from 'react';
import { X, Flame, TreePine, Droplets, Package, Shirt, Crown } from 'lucide-react';

const BenefitsDropdown = ({ isOpen, onClose, triggerRef }) => {
  const dropdownRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        triggerRef?.current &&
        !triggerRef.current.contains(event.target)
      ) {
        onClose();
      }
    };

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll on mobile when dropdown is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, triggerRef]);

  // Don't render if dropdown is not open
  if (!isOpen) return null;

  const benefits = [
    {
      id: 1,
      title: "Dedicated Seat in the Havan Kund",
      icon: <Flame className="w-4 h-4 text-orange-500" />
    },
    {
      id: 2,
      title: "Havan Kund Setup (Sacred Fire Altar)",
      icon: <div className="w-4 h-4 text-orange-600 text-sm flex items-center justify-center">🔥</div>
    },
    {
      id: 3,
      title: "Sacred Wood (Samidha) for Ritual Fire",
      icon: <TreePine className="w-4 h-4 text-amber-600" />
    },
    {
      id: 4,
      title: "Pure Cow Ghee for Divine Offerings",
      icon: <Droplets className="w-4 h-4 text-yellow-500" />
    },
    {
      id: 5,
      title: "Ghee Container & Offering Spoon",
      icon: <div className="w-4 h-4 text-gray-600 text-sm flex items-center justify-center">🥄</div>
    },
    {
      id: 6,
      title: "Havan Samagri",
      icon: <Package className="w-4 h-4 text-green-500" />
    },
    {
      id: 7,
      title: "Dhoti (Traditional Attire for Purity)",
      icon: <Shirt className="w-4 h-4 text-blue-500" />
    },
    {
      id: 8,
      title: "Uttariya (Angavastra for Rituals)",
      icon: <Crown className="w-4 h-4 text-purple-500" />
    }
  ];

  // Calculate dropdown position
  const getDropdownPosition = () => {
    if (!triggerRef?.current) {
      return isMobile 
        ? { top: '50px', left: '16px', right: '16px', width: 'auto' }
        : { top: '50px', left: '50%', transform: 'translateX(-50%)', width: '400px' };
    }

    const rect = triggerRef.current.getBoundingClientRect();
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;
    
    if (isMobile) {
      // Mobile positioning (full width with margins)
      return {
        top: `${rect.bottom + scrollY + 8}px`,
        left: '16px',
        right: '16px',
        width: 'auto'
      };
    } else {
      // Desktop positioning
      return {
        top: `${rect.bottom + scrollY + 8}px`,
        left: `${Math.max(
          16,
          Math.min(
            rect.left + scrollX,
            window.innerWidth - 400 - 16
          )
        )}px`,
        width: '400px'
      };
    }
  };

  const dropdownStyle = getDropdownPosition();

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      {/* Mobile overlay */}
      <div className="sm:hidden fixed inset-0 bg-black/10 bg-opacity-25" />
      
      <div
        ref={dropdownRef}
        className="absolute bg-white rounded-xl shadow-2xl border border-orange-200 transform transition-all duration-200 ease-out"
        onClick={(e) => e.stopPropagation()}
        style={dropdownStyle}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-3 sm:px-4 py-2 sm:py-3 text-white rounded-t-xl relative">
          <h3 className="font-bold text-xs sm:text-sm text-center pr-6">
            🕉️ Complete Havan Essentials Provided
          </h3>
          <button
            onClick={onClose}
            className="absolute top-1.5 sm:top-2 right-2 p-1 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Benefits List */}
        <div className="p-2 sm:p-3 max-h-120 sm:max-h-100 overflow-y-auto">
          <div className="space-y-1.5 sm:space-y-2">
            {benefits.map((benefit) => (
              <div
                key={benefit.id}
                className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-100 hover:shadow-sm transition-shadow"
              >
                {/* Number */}
                <div className="flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {benefit.id}
                </div>

                {/* Icon */}
                <div className="flex-shrink-0">
                  <div className="w-3 h-3 sm:w-4 sm:h-4">
                    {React.cloneElement(benefit.icon, {
                      className: benefit.icon.props.className?.replace('w-4 h-4', 'w-3 h-3 sm:w-4 sm:h-4')
                    })}
                  </div>
                </div>

                {/* Title */}
                <div className="flex-1 min-w-0">
                  <span className="text-gray-800 text-xs sm:text-sm font-medium leading-tight">
                    {benefit.title}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Footer note */}
          <div className="mt-2 sm:mt-3 p-1.5 sm:p-2 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-start gap-1.5 sm:gap-2">
              <div className="text-green-600 text-xs sm:text-sm flex-shrink-0">✨</div>
              <p className="text-green-800 text-xs font-medium leading-tight">
                Your booking ensures a complete, authentic, and spiritually fulfilling Havan experience.
              </p>
            </div>
          </div>
        </div>

        {/* Arrow pointing to trigger button - Hidden on mobile for cleaner look */}
        {!isMobile && (
          <div
            className="absolute -top-2 w-4 h-4 bg-orange-500 transform rotate-45 border-l border-t border-orange-200"
            style={{
              left: triggerRef?.current
                ? `${Math.min(
                    Math.max(20, triggerRef.current.getBoundingClientRect().width / 2),
                    280
                  )}px`
                : '50%',
              marginLeft: !triggerRef?.current ? '-8px' : '0'
            }}
          />
        )}
      </div>
    </div>
  );
};

export default BenefitsDropdown;