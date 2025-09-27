// Form validation utilities
export const validateForm = (formData) => {
  const errors = {};
  
  // Required field validations
  if (!formData.name.trim()) errors.name = 'Name is required';
  
  if (!formData.email.trim()) {
    errors.email = 'Email is required';
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    errors.email = 'Email is invalid';
  }
  
  if (!formData.mobile.trim()) {
    errors.mobile = 'Mobile is required';
  } else {
    const cleanMobile = formData.mobile.replace(/\D/g, '');
    if (cleanMobile.length !== 10) {
      errors.mobile = 'Mobile number must be exactly 10 digits';
    } else if (!/^[6-9]\d{9}$/.test(cleanMobile)) {
      errors.mobile = 'Mobile number must start with 6, 7, 8, or 9';
    }
  }
  
  if (!formData.country) errors.country = 'Country is required';
  if (!formData.state || !formData.state.trim()) errors.state = 'State is required';
  if (!formData.city || !formData.city.trim()) errors.city = 'City is required';
  if (!formData.participation) errors.participation = 'Participation type is required';
  if (!formData.registrationType) errors.registrationType = 'Registration type is required';
  
  // Registration type specific validations
  if (formData.registrationType === 'Company') {
    if (!formData.companyname || !formData.companyname.trim()) {
      errors.companyname = 'Company name is required';
    }
  }
  
  if (formData.registrationType === 'Temple') {
    if (!formData.templename || !formData.templename.trim()) {
      errors.templename = 'Temple name is required';
    }
    if (!formData.brief || !formData.brief.trim()) {
      errors.brief = 'Brief profile is required for temple registration';
    }
  }
  
  // Address and location validations
  if (!formData.address || !formData.address.trim()) {
    errors.address = 'Address is required';
  } else if (formData.address.trim().length < 10) {
    errors.address = 'Address must be at least 10 characters long';
  }
  
  if (!formData.pincode || !formData.pincode.trim()) {
    errors.pincode = 'Pincode is required';
  } else if (!/^\d{6}$/.test(formData.pincode.trim())) {
    errors.pincode = 'Pincode must be exactly 6 digits';
  }
  
  // Country-based document validation
  const isIndianResident = formData.country && formData.country.toLowerCase().includes('india');
  
  if (isIndianResident) {
    // For Indian residents: Aadhar is mandatory, PAN optional
    if (!formData.aadharno || !formData.aadharno.trim()) {
      errors.aadharno = 'Aadhar number is required for Indian residents';
    } else {
      const cleanAadhar = formData.aadharno.replace(/\D/g, '');
      if (cleanAadhar.length !== 12) {
        errors.aadharno = 'Aadhar number must be exactly 12 digits';
      } else if (cleanAadhar.startsWith('0') || cleanAadhar.startsWith('1')) {
        errors.aadharno = 'Aadhar number cannot start with 0 or 1';
      }
    }
    
    // PAN validation (optional but must be valid if provided)
    if (formData.pan && formData.pan.trim()) {
      if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.pan.trim().toUpperCase())) {
        errors.pan = 'PAN must be in format: 5 letters + 4 digits + 1 letter (e.g., ABCDE1234F)';
      }
    }
  } else {
    // For non-Indian residents: Passport is mandatory
    if (!formData.passportno || !formData.passportno.trim()) {
      errors.passportno = 'Passport number is required for international delegates';
    } else if (formData.passportno.trim().length < 6) {
      errors.passportno = 'Passport number must be at least 6 characters';
    }
  }

  // Delegate specific validations
  if (formData.participation === 'Delegate') {
    if (!formData.delegateType) errors.delegateType = 'Delegate type is required';
    
    if (!formData.numberOfPersons) {
      errors.numberOfPersons = 'Number of persons is required';
    } else if (parseInt(formData.numberOfPersons) < 1) {
      errors.numberOfPersons = 'Number of persons must be at least 1';
    }
    
    if (formData.delegateType === 'withAssistance' && !formData.days) {
      errors.days = 'Number of days is required';
    }
    
    // Normal delegate type doesn't require days field as it's fixed to 5 days
  }

  return errors;
};

// Calculate amount utility
export const calculateAmount = (formData, PRICING_CONFIG) => {
  if (formData.participation !== 'Delegate' || !formData.delegateType || !formData.numberOfPersons) {
    return 0;
  }

  const persons = parseInt(formData.numberOfPersons) || 1;

  if (formData.delegateType === 'normal') {
    // Normal delegate type is always free
    return 0;
  } else if (formData.delegateType === 'withoutAssistance') {
    return persons * PRICING_CONFIG.withoutAssistance.pricePerPerson;
  } else if (formData.delegateType === 'withAssistance') {
    const days = parseInt(formData.days) || PRICING_CONFIG.withAssistance.minDays;
    return persons * days * PRICING_CONFIG.withAssistance.pricePerPersonPerDay;
  }

  return 0;
};
