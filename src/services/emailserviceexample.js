// Email Service for sending booking confirmation emails
// Integrates with https://svsamiti.com/havan-booking/email.php

/**
 * Sends booking confirmation email using the external API
 * @param {Object} bookingData - The booking information
 * @param {string} bookingType - Type of booking (havan, show, stall, delegate, donation)
 * @returns {Promise<Object>} - API response
 */
/**
 * Send donation confirmation email
 * @param {Object} donationData - Donation information
 * @returns {Promise<Object>} - API response
 */
export const sendDonationConfirmationEmail = async (donationData) => {
  try {
    const formData = new FormData();
    formData.append('name', donationData.donorDetails?.name || donationData.name || '');
    formData.append('email', donationData.donorDetails?.email || donationData.email || '');
    formData.append('amount', donationData.amount?.toString() || '');
    formData.append('payment_id', donationData.payment?.transactionId || donationData.payment_id || '');
    formData.append('order_id', donationData.donationId || donationData.order_id || donationData.id || '');
    formData.append('transaction_date', new Date().toISOString().split('T')[0]);
    
    const response = await fetch('https://svsamiti.com/havan-booking/donation-email.php', {
      method: 'POST',
      body: formData,
      headers: {
        'User-Agent': 'Havan-Booking-System/1.0'
      }
    });
    
    const responseText = await response.text();
    
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      return { success: false, error: 'Invalid response from donation email service', rawResponse: responseText };
    }
    
    if (result.status) {
      return { success: true, message: 'Donation confirmation email sent', data: result };
    } else {
      return { success: false, error: 'Donation email service error: ' + (result.errors ? result.errors.join(', ') : 'Unknown error'), data: result };
    }
  } catch (error) {
    return { success: false, error: 'Failed to send donation email: ' + error.message };
  }
};

/**
 * Send delegate confirmation email
 * @param {Object} delegateData - Delegate information
 * @returns {Promise<Object>} - API response
 */
export const sendDelegateConfirmationEmail = async (delegateData) => {
  try {
    // First, try the dedicated delegate email API
    const primaryResult = await tryDelegateSpecificAPI(delegateData);
    
    if (primaryResult.success) {
      return primaryResult;
    }
    
    // Fallback to general email API with proper delegate formatting
    const fallbackResult = await sendDelegateViaGeneralAPI(delegateData);
    
    if (fallbackResult.success) {
      return { 
        success: true, 
        message: 'Delegate confirmation email sent via fallback system', 
        data: fallbackResult.data,
        method: 'fallback'
      };
    } else {
      return { 
        success: false, 
        error: `Both email methods failed. Primary: ${primaryResult.error}. Fallback: ${fallbackResult.error}`,
        primaryError: primaryResult.error,
        fallbackError: fallbackResult.error
      };
    }
  } catch (error) {
    return { success: false, error: 'Failed to send delegate email: ' + error.message };
  }
};

/**
 * Try the dedicated delegate email API first
 * @param {Object} delegateData - Delegate information
 * @returns {Promise<Object>} - API response
 */
const tryDelegateSpecificAPI = async (delegateData) => {
  try {
    const formData = new FormData();
    formData.append('name', delegateData.delegateDetails?.name || delegateData.name || '');
    formData.append('email', delegateData.delegateDetails?.email || delegateData.email || '');
    formData.append('participation_type', delegateData.eventDetails?.participationType || delegateData.participation_type || 'Delegate');
    formData.append('registration_type', delegateData.eventDetails?.registrationType || delegateData.registration_type || '');
    formData.append('duration', delegateData.eventDetails?.duration || delegateData.duration || '');
    formData.append('number_of_person', delegateData.eventDetails?.numberOfPersons || delegateData.number_of_persons || '1');
    formData.append('amount', delegateData.totalAmount?.toString() || delegateData.amount?.toString() || '');
    formData.append('payment_id', delegateData.payment?.transactionId || delegateData.payment_id || '');
    formData.append('order_id', delegateData.bookingId || delegateData.order_id || delegateData.id || '');
    formData.append('transaction_date', new Date().toISOString().split('T')[0]);
    
    const response = await fetch('https://svsamiti.com/havan-booking/delegate-email.php', {
      method: 'POST',
      body: formData,
      headers: {
        'User-Agent': 'Havan-Booking-System/1.0'
      }
    });
    
    const responseText = await response.text();
    
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      return { success: false, error: 'Invalid response from primary delegate email service', rawResponse: responseText };
    }
    
    if (result.status) {
      return { success: true, message: 'Delegate confirmation email sent', data: result };
    } else {
      return { success: false, error: 'Primary delegate API error: ' + (result.errors ? result.errors.join(', ') : 'Unknown error'), data: result };
    }
  } catch (error) {
    return { success: false, error: 'Primary delegate API network error: ' + error.message };
  }
};

/**
 * Send delegate email via general booking email API as fal lback
 * @param {Object} delegateData - Delegate information
 * @returns {Promise<Object>} - API response
 */
const sendDelegateViaGeneralAPI = async (delegateData) => {
  try {
    // Use the existing sendBookingConfirmationEmail function which works with general API
    const result = await sendBookingConfirmationEmail(delegateData, 'delegate');
    
    if (result.success) {
      return { success: true, message: 'Delegate email sent via general API', data: result.data };
    } else {
      return { success: false, error: 'General API error: ' + result.error };
    }
  } catch (error) {
    return { success: false, error: 'General API network error: ' + error.message };
  }
};

/**
 * Send performer confirmation email
 * @param {Object} performerData - Performer information
 * @returns {Promise<Object>} - API response
 */
export const sendPerformerConfirmationEmail = async (performerData) => {
  try {
    const formData = new FormData();
    formData.append('name', performerData.name || '');
    formData.append('email', performerData.email || '');
    
    const response = await fetch('https://svsamiti.com/havan-booking/performer-email.php', {
      method: 'POST',
      body: formData,
      headers: {
        'User-Agent': 'Havan-Booking-System/1.0'
      }
    });
    
    const responseText = await response.text();
    
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      return { success: false, error: 'Invalid response from performer email service', rawResponse: responseText };
    }
    
    if (result.status) {
      return { success: true, message: 'Performer confirmation email sent', data: result };
    } else {
      return { success: false, error: 'Performer email service error: ' + (result.errors ? result.errors.join(', ') : 'Unknown error'), data: result };
    }
  } catch (error) {
    return { success: false, error: 'Failed to send performer email: ' + error.message };
  }
};

/**
 * Send sponsor confirmation email
 * @param {Object} sponsorData - Sponsor information
 * @returns {Promise<Object>} - API response
 */
export const sendSponsorConfirmationEmail = async (sponsorData) => {
  try {
    const formData = new FormData();
    formData.append('name', sponsorData.name || '');
    formData.append('email', sponsorData.email || '');
    
    const response = await fetch('https://svsamiti.com/havan-booking/sponsor-email.php', {
      method: 'POST',
      body: formData,
      headers: {
        'User-Agent': 'Havan-Booking-System/1.0'
      }
    });
    
    const responseText = await response.text();
    
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      return { success: false, error: 'Invalid response from sponsor email service', rawResponse: responseText };
    }
    
    if (result.status) {
      return { success: true, message: 'Sponsor confirmation email sent', data: result };
    } else {
      return { success: false, error: 'Sponsor email service error: ' + (result.errors ? result.errors.join(', ') : 'Unknown error'), data: result };
    }
  } catch (error) {
    return { success: false, error: 'Failed to send sponsor email: ' + error.message };
  }
};

export const sendBookingConfirmationEmail = async (bookingData, bookingType) => {
  try {
    // Prepare email data based on booking type
    const emailData = await prepareEmailData(bookingData, bookingType);
    
    // Validate required fields
    const validation = validateEmailData(emailData);
    if (!validation.isValid) {
      return {
        success: false,
        error: 'Email data validation failed: ' + validation.errors.join(', ')
      };
    }

    // Create FormData for the API request
    const formData = new FormData();
    Object.keys(emailData).forEach(key => {
      if (emailData[key] !== null && emailData[key] !== undefined) {
        formData.append(key, emailData[key]);
      }
    });

    // Send request to the email API
    const response = await fetch('https://svsamiti.com/havan-booking/email.php', {
      method: 'POST',
      body: formData,
      headers: {
        'User-Agent': 'Havan-Booking-System/1.0'
      }
    });

    const responseText = await response.text();

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      return {
        success: false,
        error: 'Invalid response from email service',
        rawResponse: responseText
      };
    }

    if (result.status) {
      return {
        success: true,
        message: 'Confirmation email sent successfully',
        data: result
      };
    } else {
      return {
        success: false,
        error: 'Email service error: ' + (result.errors ? result.errors.join(', ') : 'Unknown error'),
        data: result
      };
    }

  } catch (error) {
    return {
      success: false,
      error: 'Failed to send email: ' + error.message
    };
  }
};

/**
 * Prepares email data based on booking type and booking data
 */
const prepareEmailData = async (bookingData, bookingType) => {
  const baseData = {
    name: '',
    email: '',
    order_id: bookingData.order_id || bookingData.bookingId || bookingData.id,
    event_date: '',
    booking_type: bookingType,
    amount: bookingData.amount || bookingData.totalAmount || '0',
    mobile: '',
    address: '',
    pan: '',
    valid_from: new Date().toISOString().split('T')[0], // Today's date
    valid_to: getValidityEndDate(bookingType), // Calculate based on booking type
    details: ''
  };

  // Fill data based on booking type
  switch (bookingType) {
    case 'havan':
      return await prepareHavanEmailData(bookingData, baseData);
    case 'show':
      return await prepareShowEmailData(bookingData, baseData);
    case 'stall':
      return await prepareStallEmailData(bookingData, baseData);
    case 'delegate':
      return await prepareDelegateEmailData(bookingData, baseData);
    case 'donation':
      return await prepareDonationEmailData(bookingData, baseData);
    default:
      return baseData;
  }
};

/**
 * Prepare email data for Havan bookings
 */
const prepareHavanEmailData = async (bookingData, baseData) => {
  const customerDetails = bookingData.customerDetails || {};
  const eventDate = bookingData.eventDate || bookingData.selectedDate;
  const shift = bookingData.shift || 'Not specified';
  const seats = bookingData.seats || [];
  
  // Format the event date for email
  const formattedEventDate = formatEventDate(eventDate);

  // Get dynamic shift information from system settings
  let shiftTimeDisplay = formatShiftTime(shift);
  try {
    const { getShiftSettings, getShiftDisplayInfo } = await import('@/services/systemSettingsService');
    const shiftSettings = await getShiftSettings();
    const shiftInfo = getShiftDisplayInfo(shift, shiftSettings.shifts);
    shiftTimeDisplay = `${shiftInfo.label} (${shiftInfo.time})`;
  } catch (error) {
    shiftTimeDisplay = formatShiftTime(shift); // Fallback
  }

  return {
    ...baseData,
    name: customerDetails.name || 'Valued Customer',
    email: customerDetails.email || '',
    mobile: customerDetails.phone || customerDetails.mobile || '',
    address: customerDetails.address || 'Not provided',
    pan: customerDetails.pan || 'Not provided',
    event_date: formatEventDate(eventDate),
    booking_type: 'Havan Seat Booking',
    details: `🕉️ Event: Sacred Havan Ceremony\r\n⏰ Shift: ${shiftTimeDisplay}\r\n🪑 Selected Seats: ${seats.length > 0 ? seats.join(', ') : 'Not specified'}\r\n👥 Number of Seats: ${seats.length || 1}`
.trim()
  };
};

/**
 * Prepare email data for Show bookings
 */
const prepareShowEmailData = async (bookingData, baseData) => {
  const userDetails = bookingData.userDetails || {};
  const showDetails = bookingData.showDetails || {};
  const selectedSeats = showDetails.selectedSeats || [];
  const showDate = showDetails.date || bookingData.selectedDate;

  return {
    ...baseData,
    name: userDetails.name || 'Valued Customer',
    email: userDetails.email || '',
    mobile: userDetails.phone || userDetails.mobile || '',
    address: userDetails.address || 'Not provided',
    pan: userDetails.pan || '',
    event_date: formatEventDate(showDate),
    booking_type: 'Cultural Show Reservation',
    details: `

🎭 Event: Cultural Show & Performance
⏰ Time: 5:00 PM - 10:00 PM
🎫 Selected Seats: ${selectedSeats.length > 0 ? selectedSeats.slice(0, 10).join(', ') : 'Not specified'}${selectedSeats.length > 10 ? ` +${selectedSeats.length - 10} more` : ''}
👥 Number of Seats: ${selectedSeats.length || 1}

    `.trim()
  };
};

/**
 * Prepare email data for Stall bookings
 */
const prepareStallEmailData = async (bookingData, baseData) => {
  const vendorDetails = bookingData.vendorDetails || {};
  const stallIds = bookingData.stallIds || [];
  const eventDetails = bookingData.eventDetails || {};

  // Get dynamic event duration from system settings
  let eventDuration = 'Event duration not available';
  let stallSettings = null;
  try {
    const { getStallEventSettings, formatEventDuration } = await import('@/services/systemSettingsService');
    stallSettings = await getStallEventSettings();
    eventDuration = formatEventDuration(stallSettings.startDate, stallSettings.endDate);
  } catch (error) {
    eventDuration = 'November 15-20, 2025 (5 Days)'; // Fallback
  }

  // Get the actual start date from booking data or system settings
  let startDate = eventDetails.startDate;
  if (!startDate && stallSettings) {
    startDate = stallSettings.startDate;
  }
  if (!startDate) {
    startDate = '2025-11-15'; // Final fallback
  }

  // Format the event date to show full range (Start - End Date)
  let eventDateDisplay = formatEventDate(startDate);
  try {
    if (stallSettings && stallSettings.startDate && stallSettings.endDate) {
      const startFormatted = formatEventDate(stallSettings.startDate);
      const endFormatted = formatEventDate(stallSettings.endDate);
      eventDateDisplay = `${startFormatted} - ${endFormatted}`;
    }
  } catch (error) {
    // Use single date fallback if date range formatting fails
  }

  return {
    ...baseData,
    name: vendorDetails.ownerName || 'Valued Vendor',
    email: vendorDetails.email || '',
    mobile: vendorDetails.phone || vendorDetails.mobile || '',
    address: vendorDetails.address || 'Not provided',
    pan: vendorDetails.pan || '',
    event_date: eventDateDisplay,
    booking_type: 'Vendor Stall Booking',
    details: `

📅 Event Duration: ${eventDuration}
🏷️ Stall Numbers: ${stallIds.length > 0 ? stallIds.join(', ') : 'To be assigned'}
🏢 Business Type: ${vendorDetails.businessType || 'Not specified'}
👤 Contact Person: ${vendorDetails.ownerName || 'Not specified'}
📱 Business Contact: ${vendorDetails.phone || 'Not provided'}
    `.trim()
  };
};

/**
 * Prepare email data for Delegate bookings
 */
const prepareDelegateEmailData = async (bookingData, baseData) => {
  const delegateDetails = bookingData.delegateDetails || {};
  const eventDetails = bookingData.eventDetails || {};
  const registrationType = eventDetails.registrationType || 'Individual';
  const delegateType = eventDetails.delegateType || 'Standard';

  // Determine organization name based on registration type
  let organizationName = 'Individual Registration';
  if (registrationType === 'Company') {
    organizationName = eventDetails.companyName || 'Company Registration';
  } else if (registrationType === 'Temple') {
    organizationName = eventDetails.templeName || 'Temple Registration';
  }

  return {
    ...baseData,
    name: delegateDetails.name || 'Valued Delegate',
    email: delegateDetails.email || '',
    mobile: delegateDetails.mobile || '',
    address: `${delegateDetails.address || ''}, ${delegateDetails.city || ''}, ${delegateDetails.state || ''}, ${delegateDetails.country || ''}`.replace(/,\s*,/g, ',').replace(/^,\s*|,\s*$/g, ''),
    pan: delegateDetails.pan || '',
    event_date: '2025-11-15', // Delegate event start date
    booking_type: 'Delegate Registration',
    details: `

👤 Delegate Name: ${delegateDetails.name || 'Not specified'}
🏢 Registration Type: ${registrationType}
🏛️ Organization: ${organizationName}
📧 Email: ${delegateDetails.email || 'Not provided'}
📱 Mobile: ${delegateDetails.mobile || 'Not provided'}
💰 Registration Fee: ₹${baseData.amount}

📦 Package Details:
• Package Type: ${getDelegateTypeDisplay(delegateType)}
• Duration: ${eventDetails.duration || 'TBD'} days
${eventDetails.designation ? `• Designation: ${eventDetails.designation}` : ''}

📍 Location Details:
• Address: ${delegateDetails.address || 'Not provided'}
• City: ${delegateDetails.city || 'Not provided'}
• State: ${delegateDetails.state || 'Not provided'}
• Country: ${delegateDetails.country || 'Not provided'}
• PIN Code: ${delegateDetails.pincode || 'Not provided'}

🆔 Identity Documents:
${delegateDetails.aadharno ? `• Aadhar: ${maskAadhar(delegateDetails.aadharno)}` : ''}
${delegateDetails.pan ? `• PAN: ${delegateDetails.pan}` : ''}
${delegateDetails.passportno ? `• Passport: ${delegateDetails.passportno}` : ''}

📋 Registration ID: ${baseData.order_id}


    `.trim()
  };
};

/**
 * Prepare email data for Donation bookings
 */
const prepareDonationEmailData = async (bookingData, baseData) => {
  const donorDetails = bookingData.donorDetails || {};
  const donationType = donorDetails.donorType || 'general';

  return {
    ...baseData,
    name: donorDetails.name || 'Valued Donor',
    email: donorDetails.email || '',
    mobile: donorDetails.mobile || '',
    address: `${donorDetails.address || ''}, ${donorDetails.city || ''}, ${donorDetails.state || ''} - ${donorDetails.pincode || ''}`.replace(/,\s*,/g, ',').replace(/^,\s*|,\s*$/g, ''),
    pan: donorDetails.pan || '',
    event_date: new Date().toISOString().split('T')[0],
    booking_type: 'Donation',
    details: `
Donation Receipt & Acknowledgment:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🙏 Thank You for Your Generous Contribution!

👤 Donor Name: ${donorDetails.name || 'Anonymous Donor'}
🌍 Donor Type: ${donationType === 'indian' ? 'Indian Resident' : 'NRI/Foreign National'}
📧 Email: ${donorDetails.email || 'Not provided'}
📱 Mobile: ${donorDetails.mobile || 'Not provided'}
💰 Donation Amount: ₹${baseData.amount}

📍 Address:
${donorDetails.address || 'Not provided'}
${donorDetails.city || ''}, ${donorDetails.state || ''} - ${donorDetails.pincode || ''}

🧾 Receipt Details:
• Receipt Number: ${baseData.order_id}
• Date of Donation: ${new Date().toLocaleDateString('en-IN')}
• Payment Method: Online Transfer
• Transaction Status: Completed ✅

📜 Tax Benefits:
• This donation is eligible for tax exemption under Section 80G
• Tax exemption certificate will be issued within 15 working days
• Please retain this receipt for your tax filing records
• 50% of donation amount is eligible for tax deduction

How Your Donation Helps:
━━━━━━━━━━━━━━━━━━━━━━
✨ Community Development Programs
✨ Educational Initiatives & Scholarships
✨ Healthcare Support for Underprivileged
✨ Spiritual & Cultural Event Organization
✨ Infrastructure Development Projects
✨ Emergency Relief & Support Programs

Organization Details:
━━━━━━━━━━━━━━━━━━━━
🏛️ Samudayik Vikas Samiti (SVS)
📍 Registered Office: [Address]
📞 Contact: +91-XXXXXXXXXX
📧 Email: donations@svsamiti.com
🌐 Website: www.svsamiti.com
🆔 Registration Number: [Reg. No.]
📜 80G Certificate Number: [80G No.]

📞 For donation queries: accounts@svsamiti.com
📄 For 80G certificate: tax@svsamiti.com

Your generosity makes a real difference in countless lives. Thank you for being a part of our mission to create positive change in society.

May your kindness be blessed manifold! 🙏✨

With heartfelt gratitude,
Team Samudayik Vikas Samiti
    `.trim()
  };
};

/**
 * Helper function to get customer email based on booking type
 */
const getCustomerEmail = (bookingData, bookingType) => {
  switch (bookingType) {
    case 'havan':
      return bookingData.customerDetails?.email;
    case 'show':
      return bookingData.userDetails?.email;
    case 'stall':
      return bookingData.vendorDetails?.email;
    case 'delegate':
      return bookingData.delegateDetails?.email;
    case 'donation':
      return bookingData.donorDetails?.email;
    default:
      return null;
  }
};

/**
 * Helper function to format event dates
 * Fixed to prevent timezone conversion issues in emails
 */
const formatEventDate = (dateValue) => {
  if (!dateValue) return 'To be announced';
  
  try {
    let targetDate;
    
    // Handle different date input types and extract the intended date
    if (typeof dateValue === 'object' && dateValue.seconds) {
      // Firestore timestamp with seconds property
      const utcDate = new Date(dateValue.seconds * 1000);
      // Convert to IST and extract date components
      const istDate = new Date(utcDate.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
      targetDate = { year: istDate.getFullYear(), month: istDate.getMonth(), day: istDate.getDate() };
    } else if (typeof dateValue === 'object' && dateValue.toDate) {
      // Firestore timestamp with toDate method
      const utcDate = dateValue.toDate();
      const istDate = new Date(utcDate.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
      targetDate = { year: istDate.getFullYear(), month: istDate.getMonth(), day: istDate.getDate() };
    } else if (typeof dateValue === 'string') {
      // String date formats
      if (dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // YYYY-MM-DD format - parse directly as local date
        const [year, month, day] = dateValue.split('-').map(Number);
        targetDate = { year, month: month - 1, day }; // month is 0-indexed
      } else {
        // Other string formats - parse and convert to IST
        const parsedDate = new Date(dateValue);
        const istDate = new Date(parsedDate.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
        targetDate = { year: istDate.getFullYear(), month: istDate.getMonth(), day: istDate.getDate() };
      }
    } else if (dateValue instanceof Date) {
      // Date object - convert to IST and extract components
      const istDate = new Date(dateValue.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
      targetDate = { year: istDate.getFullYear(), month: istDate.getMonth(), day: istDate.getDate() };
    } else {
      // Fallback for other types (timestamp numbers, etc.)
      const parsedDate = new Date(dateValue);
      const istDate = new Date(parsedDate.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
      targetDate = { year: istDate.getFullYear(), month: istDate.getMonth(), day: istDate.getDate() };
    }
    
    // Create a clean date object in local timezone to avoid any shifts
    const cleanDate = new Date(targetDate.year, targetDate.month, targetDate.day);
    
    // Format the date - simple approach without timezone specification to avoid conversion
    const options = {
      weekday: 'long',
      year: 'numeric', 
      month: 'long',
      day: 'numeric'
    };
    
    return cleanDate.toLocaleDateString('en-IN', options);
  } catch (error) {
    return 'Date not available';
  }
};

/**
 * Helper function to format shift time
 */
const formatShiftTime = (shift) => {
  const shifts = {
    'morning': 'Morning Shift (9:00 AM - 12:00 PM)',
    'evening': 'Evening Shift (4:00 PM - 10:00 PM)',
    'afternoon': 'Afternoon Shift (2:00 PM - 5:00 PM)',
    'full_day': 'Full Day (9:00 AM - 10:00 PM)'
  };
  return shifts[shift] || `${shift.charAt(0).toUpperCase() + shift.slice(1)} Shift`;
};

/**
 * Helper function to get delegate type display
 */
const getDelegateTypeDisplay = (type) => {
  const types = {
    'withoutAssistance': 'Without Assistance Package',
    'withAssistance': 'With Assistance Package'
  };
  return types[type] || type || 'Standard Package';
};

/**
 * Helper function to mask Aadhar number for security
 */
const maskAadhar = (aadhar) => {
  if (!aadhar || aadhar.length < 8) return aadhar;
  return aadhar.substring(0, 4) + '****' + aadhar.substring(8);
};

/**
 * Helper function to calculate validity end date based on booking type
 */
const getValidityEndDate = (bookingType) => {
  const today = new Date();
  let validityDays;
  
  switch (bookingType) {
    case 'havan':
      validityDays = 30; // 30 days validity
      break;
    case 'show':
      validityDays = 7; // 7 days validity
      break;
    case 'stall':
      validityDays = 180; // 6 months validity
      break;
    case 'delegate':
      validityDays = 365; // 1 year validity
      break;
    case 'donation':
      validityDays = 3650; // 10 years for tax purposes
      break;
    default:
      validityDays = 30;
  }
  
  const validUntil = new Date(today.getTime() + (validityDays * 24 * 60 * 60 * 1000));
  return validUntil.toISOString().split('T')[0];
};

/**
 * Validates email data before sending
 */
const validateEmailData = (emailData) => {
  const errors = [];
  
  if (!emailData.name || emailData.name.trim().length < 2) {
    errors.push('Name is required and must be at least 2 characters');
  }
  
  if (!emailData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailData.email)) {
    errors.push('Valid Email is required');
  }
  
  if (!emailData.order_id || emailData.order_id.trim().length === 0) {
    errors.push('Order ID is required');
  }
  
  if (!emailData.details || emailData.details.trim().length === 0) {
    errors.push('Details is required');
  }
  
  if (!emailData.event_date || emailData.event_date.trim().length === 0) {
    errors.push('Event Date is required');
  }
  
  if (!emailData.booking_type || emailData.booking_type.trim().length === 0) {
    errors.push('Booking Type is required');
  }
  
  if (!emailData.amount || parseFloat(emailData.amount) <= 0) {
    errors.push('Amount is required and must be greater than 0');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export default {
  sendBookingConfirmationEmail
};
