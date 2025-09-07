import React, { useEffect, useRef } from 'react';
import { X, Flame, TreePine, Droplets, Package, Shirt, Crown } from 'lucide-react';

const BenefitsDropdown = ({ isOpen, onClose, triggerRef }) => {
  const dropdownRef = useRef(null);

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
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
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

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div
        ref={dropdownRef}
className="absolute bg-white rounded-xl shadow-2xl border border-orange-200 w-90 max-w-[100vw] transform transition-all duration-200 ease-out"
      onClick={(e) => e.stopPropagation()}
              style={{
          top: triggerRef?.current
            ? `${triggerRef.current.getBoundingClientRect().bottom + window.scrollY + 8}px`
            : '50px',
          left: triggerRef?.current
            ? `${Math.max(
                16,
                Math.min(
                  triggerRef.current.getBoundingClientRect().left + window.scrollX,
                  window.innerWidth - 320 - 16
                )
              )}px`
            : '50%'
        }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-3 text-white rounded-t-xl relative">
          <h3 className="font-bold text-sm text-center pr-6">
            🕉️ Complete Havan Essentials Provided
          </h3>
          <button
            onClick={onClose}
            className="absolute top-2 right-2 p-1 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Benefits List */}
        <div className="p-3 max-h-80 overflow-y-auto">
          <div className="space-y-2">
            {benefits.map((benefit) => (
              <div
                key={benefit.id}
                className="flex items-center gap-3 p-2 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-100 hover:shadow-sm transition-shadow"
              >
                {/* Number */}
                <div className="flex-shrink-0 w-5 h-5 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {benefit.id}
                </div>

                {/* Icon */}
                <div className="flex-shrink-0">
                  {benefit.icon}
                </div>

                {/* Title */}
                <div className="flex-1 min-w-0">
                  <span className="text-gray-800 text-sm font-medium">
                    {benefit.title}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Footer note */}
          <div className="mt-3 p-2 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-start gap-2">
              <div className="text-green-600 text-sm">✨</div>
              <p className="text-green-800 text-xs font-medium">
                Your booking ensures a complete, authentic, and spiritually fulfilling Havan experience .
              </p>
            </div>
          </div>
        </div>

        {/* Arrow pointing to trigger button */}
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
      </div>
    </div>
  );
};

export default BenefitsDropdown;
