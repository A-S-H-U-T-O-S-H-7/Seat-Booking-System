export const GUEST_CATEGORIES = {
  spiritual: {
    label: 'Spiritual Masters',
    color: 'emerald',
    icon: '🕉️',
    gradient: 'from-emerald-500 to-teal-600',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-900'
  },
  artist: {
    label: 'Artists',
    color: 'pink',
    icon: '🎭',
    gradient: 'from-pink-500 to-rose-600',
    bgColor: 'bg-pink-50',
    textColor: 'text-pink-900'
  },
   
  special: {
    label: 'Special Guests',
    color: 'blue',
    icon: '🌟',
    gradient: 'from-blue-800 to-indigo-600',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-900'
  }
};

// Safe category getter
export const getGuestCategory = (category) => {
  return GUEST_CATEGORIES[category] || GUEST_CATEGORIES.spiritual;
};

// Default guest with validation
export const DEFAULT_GUEST = {
  name: '',
  title: '',
  description: '',
  significance: '',
  category: 'spiritual',
  order: 0,
  imageUrl: '',
  imagePath: '',
  isActive: true,
  isExpected: false,
  socialLinks: {
    website: '',
    twitter: '',
    instagram: ''
  },
  achievements: '',
  specialNote: ''
};

// Validation function
export const validateGuest = (guest) => {
  const errors = [];
  
  if (!guest.name?.trim()) errors.push('Name is required');
  if (!guest.title?.trim()) errors.push('Title is required');
  if (!guest.description?.trim()) errors.push('Description is required');
  if (!GUEST_CATEGORIES[guest.category]) errors.push('Invalid category');
  
  return {
    isValid: errors.length === 0,
    errors
  };
};