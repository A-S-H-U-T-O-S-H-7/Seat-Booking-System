// Email Service for sending booking confirmation emails
// Integrates with https://svsamiti.com/havan-booking/email.php

/**
 * Sends booking confirmation email using the external API
 * @param {Object} bookingData - The booking information
 * @param {string} bookingType - Type of booking (havan, show, stall, delegate, donation)
 * @returns {Promise<Object>} - API response
 */
export const sendBookingConfirmationEmail = async (bookingData, bookingType) => {
  try {
    console.log('📧 Preparing to send confirmation email:', {
      bookingType,
      orderId: bookingData.order_id || bookingData.bookingId,
      customerEmail: getCustomerEmail(bookingData, bookingType)
    });

    // Prepare email data based on booking type
    const emailData = await prepareEmailData(bookingData, bookingType);
    
    // Validate required fields
    const validation = validateEmailData(emailData);
    if (!validation.isValid) {
      console.error('❌ Email data validation failed:', validation.errors);
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

    console.log('📤 Sending email API request to:', 'https://svsamiti.com/havan-booking/email.php');
    console.log('📋 Email data summary:', {
      name: emailData.name,
      email: emailData.email,
      order_id: emailData.order_id,
      booking_type: emailData.booking_type,
      amount: emailData.amount
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
    console.log('📨 Email API response status:', response.status);
    console.log('📨 Email API raw response:', responseText);

    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error('❌ Failed to parse email API response:', parseError);
      return {
        success: false,
        error: 'Invalid response from email service',
        rawResponse: responseText
      };
    }

    if (result.status) {
      console.log('✅ Email sent successfully');
      return {
        success: true,
        message: 'Confirmation email sent successfully',
        data: result
      };
    } else {
      console.error('❌ Email API returned error:', result.errors);
      return {
        success: false,
        error: 'Email service error: ' + (result.errors ? result.errors.join(', ') : 'Unknown error'),
        data: result
      };
    }

  } catch (error) {
    console.error('❌ Email service error:', error);
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
      console.warn('⚠️ Unknown booking type:', bookingType);
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

  return {
    ...baseData,
    name: customerDetails.name || 'Valued Customer',
    email: customerDetails.email || '',
    mobile: customerDetails.phone || customerDetails.mobile || '',
    address: customerDetails.address || 'Not provided',
    pan: customerDetails.pan || '',
    event_date: formatEventDate(eventDate),
    booking_type: 'Havan Seat Booking',
    details: `
Havan Seat Booking Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🕉️ Event: Sacred Havan Ceremony
📅 Date: ${formatEventDate(eventDate)}
⏰ Shift: ${formatShiftTime(shift)}
🪑 Selected Seats: ${seats.length > 0 ? seats.join(', ') : 'Not specified'}
👥 Number of Seats: ${seats.length || 1}
💰 Total Amount: ₹${baseData.amount}

📍 Venue: Samudayik Vikas Samiti
🎯 Booking ID: ${baseData.order_id}

Important Information:
• Please arrive 30 minutes before the ceremony begins
• Carry a valid ID proof for verification
• Dress code: Traditional Indian attire recommended
• Mobile phones to be kept on silent mode during ceremony
• Photography/videography may be restricted in certain areas

Your participation in this sacred ceremony will bring peace and prosperity. Thank you for your devotion and contribution to this noble cause.

🙏 May this sacred ritual bring blessings to you and your family.
    `.trim()
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
    booking_type: 'Cultural Show Booking',
    details: `
Cultural Show Booking Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎭 Event: Cultural Show & Performance
📅 Date: ${formatEventDate(showDate)}
⏰ Time: 5:00 PM - 10:00 PM
🎫 Selected Seats: ${selectedSeats.length > 0 ? selectedSeats.slice(0, 10).join(', ') : 'Not specified'}${selectedSeats.length > 10 ? ` +${selectedSeats.length - 10} more` : ''}
👥 Number of Seats: ${selectedSeats.length || 1}
💰 Total Amount: ₹${baseData.amount}

📍 Venue: Samudayik Vikas Samiti Cultural Centre
🎯 Booking ID: ${baseData.order_id}

Show Highlights:
• Traditional Indian classical music performances
• Cultural dance presentations
• Community talent showcase
• Inspirational speeches and presentations
• Light refreshments will be served

Entry Guidelines:
• Gates open at 4:30 PM
• Please arrive at least 15 minutes before start time
• Carry this booking confirmation and a valid ID
• Children under 5 can enter free (no separate seat)
• Outside food and beverages not allowed

🎊 Get ready for an evening filled with culture, community, and celebration!
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

  return {
    ...baseData,
    name: vendorDetails.ownerName || 'Valued Vendor',
    email: vendorDetails.email || '',
    mobile: vendorDetails.phone || vendorDetails.mobile || '',
    address: vendorDetails.address || 'Not provided',
    pan: vendorDetails.pan || '',
    event_date: formatEventDate(eventDetails.startDate || '2025-11-15'),
    booking_type: 'Vendor Stall Booking',
    details: `
Vendor Stall Booking Details:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🏪 Stall Booking Confirmation
📅 Event Duration: November 15-20, 2025 (5 Days)
🏷️ Stall Numbers: ${stallIds.length > 0 ? stallIds.join(', ') : 'To be assigned'}
🏢 Business Type: ${vendorDetails.businessType || 'Not specified'}
👤 Contact Person: ${vendorDetails.ownerName || 'Not specified'}
📱 Business Contact: ${vendorDetails.phone || 'Not provided'}
💰 Total Amount: ₹${baseData.amount}

📍 Location: Main Exhibition Area, SVS Premises
🎯 Booking ID: ${baseData.order_id}
📄 Aadhar: ${vendorDetails.aadhar || 'Not provided'}

Stall Facilities Included:
• Electricity connection (1 power point)
• Water supply access
• Loading/unloading assistance
• Basic security arrangements
• Waste management support
• Customer parking facility

Important Instructions:
• Setup time: November 14, 2025 (6:00 PM onwards)
• Operating hours: 9:00 AM - 9:00 PM daily
• Mandatory insurance coverage required
• GST registration certificate needed (if applicable)
• Fire safety compliance mandatory
• All local permits and licenses must be valid

Setup Guidelines:
• Stall setup must be completed by November 15, 8:00 AM
• Display boards and decorations subject to approval
• Only approved products/services can be sold
• Maintain cleanliness and hygiene standards
• Follow event guidelines and safety protocols

📞 For setup queries, contact: setup@svsamiti.com
💼 For business queries, contact: vendors@svsamiti.com

Thank you for partnering with us for this community event!
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
Delegate Registration Confirmation:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎓 Welcome to SVS Delegate Program!
👤 Delegate Name: ${delegateDetails.name || 'Not specified'}
🏢 Registration Type: ${registrationType}
🏛️ Organization: ${organizationName}
📧 Email: ${delegateDetails.email || 'Not provided'}
📱 Mobile: ${delegateDetails.mobile || 'Not provided'}
💰 Registration Fee: ₹${baseData.amount}

📦 Package Details:
• Package Type: ${getDelegateTypeDisplay(delegateType)}
• Duration: ${eventDetails.duration || 'TBD'} days
• Number of Persons: ${eventDetails.numberOfPersons || 1}
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
📎 Photo Upload: ${delegateDetails.fileInfo?.fileUploaded ? 'Completed ✅' : 'Pending ❌'}

${registrationType === 'Temple' && eventDetails.briefProfile ? `
🛕 Temple Profile:
${eventDetails.briefProfile}
` : ''}

What's Next:
━━━━━━━━━━━━━
1. You will receive detailed event schedule via email
2. Access credentials will be shared 48 hours before event
3. Accommodation details (if applicable) will be communicated separately
4. Please ensure all documents are readily available
5. Report to registration desk on arrival

Event Benefits:
• Networking opportunities with like-minded individuals
• Access to exclusive sessions and workshops  
• Complimentary meals and refreshments
• Event kit with resources and materials
• Certificate of participation
• Community membership benefits

Important Notes:
• Please carry valid photo ID proof
• Dress code: Formal/Traditional attire
• Mobile devices to be kept on silent during sessions
• Photography permitted in designated areas only

📞 For queries: delegates@svsamiti.com
🌐 Event updates: www.svsamiti.com

🙏 Thank you for joining our mission of community development and spiritual growth!
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
 */
const formatEventDate = (dateValue) => {
  if (!dateValue) return 'To be announced';
  
  try {
    let date;
    if (typeof dateValue === 'object' && dateValue.seconds) {
      date = new Date(dateValue.seconds * 1000);
    } else if (typeof dateValue === 'object' && dateValue.toDate) {
      date = dateValue.toDate();
    } else {
      date = new Date(dateValue);
    }
    
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Date not available';
  }
};

/**
 * Helper function to format shift time
 */
const formatShiftTime = (shift) => {
  const shifts = {
    'morning': 'Morning Shift (6:00 AM - 12:00 PM)',
    'evening': 'Evening Shift (6:00 PM - 12:00 AM)',
    'full_day': 'Full Day (6:00 AM - 12:00 AM)'
  };
  return shifts[shift] || `${shift} Shift`;
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
