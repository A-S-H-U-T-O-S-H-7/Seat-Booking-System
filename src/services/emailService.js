"use client";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        const emailData = await req.json();

        // Validate required fields
        const requiredFields = ['name', 'email', 'order_id'];
        const missingFields = requiredFields.filter(field => !emailData[field]);
        
        if (missingFields.length > 0) {
            return NextResponse.json({
                status: false,
                errors: missingFields.map(field => `${field} is required`),
                message: 'Missing required fields'
            });
        }

        // Prepare form data for the external email API
        const formData = new FormData();
        
        // Add required fields - ensure none are empty strings
        const name = (emailData.name && emailData.name.trim()) || 'Delegate Member';
        const email = (emailData.email && emailData.email.trim()) || 'no-email@example.com';
        const order_id = (emailData.order_id && emailData.order_id.trim()) || 'UNKNOWN';
        const details = (emailData.details && emailData.details.trim()) || 'Delegate Registration Details';
        const event_date = (emailData.event_date && emailData.event_date.trim()) || 'November 15, 2025';
        const booking_type = (emailData.booking_type && emailData.booking_type.trim()) || 'Delegate Registration';
        
        // Ensure amount is always a valid string (never empty, null, or undefined)
        // External API requires non-zero amount, so we use '1' for free registrations
        let amount = emailData.amount !== undefined && emailData.amount !== null && emailData.amount !== '' 
            ? emailData.amount.toString() 
            : '0';
        
        // For free registrations (amount = '0'), use 'Free' string
        // but keep the actual amount for display purposes
        const displayAmount = amount;
        // Handle different delegate types
        if (amount === '0' && emailData.booking_type && emailData.booking_type.includes('Delegate')) {
            amount = 'Free'; // Use 'Free' for free delegate registrations
        } else if (amount === '0') {
            amount = '1'; // For other booking types that require non-zero amount
        }
        
        formData.append("name", name);
        formData.append("email", email);
        formData.append("order_id", order_id);
        formData.append("details", details);
        formData.append("event_date", event_date);
        formData.append("booking_type", booking_type);
        formData.append("amount", amount); // Uses 'Free' for free registrations
        
        // Validation check - make sure email is valid
        
        if (!email.includes('@') || email === 'no-email@example.com') {
            throw new Error('Valid email address is required for sending delegate confirmation');
        }
        
        // Add optional fields if they exist
        if (emailData.mobile) formData.append("mobile", emailData.mobile.toString().trim());
        if (emailData.address) formData.append("address", emailData.address.trim());
        if (emailData.pan) formData.append("pan", emailData.pan.trim());
        formData.append("valid_from", emailData.valid_from || new Date().toISOString().split('T')[0]);
        formData.append("valid_to", emailData.valid_to || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

        // Send to external API using the new general-email.php endpoint
        
        // Prepare form data for the new API format
        const newFormData = new FormData();
        newFormData.append("name", name);
        newFormData.append("email", email);
        newFormData.append("registrationId", order_id);
        newFormData.append("eventDate", "3-7 Dec, 2025");
        newFormData.append("purpose", "Delegate Registration");
        
        if (emailData.registration_type) newFormData.append("registrationType", emailData.registration_type);
        if (emailData.delegate_type) newFormData.append("delegateType", emailData.delegate_type);
        if (emailData.duration) newFormData.append("duration", emailData.duration);
        
        // Call the new external email API from server-side (no CORS issues)
        const response = await fetch('https://svsamiti.com/havan-booking/general-email.php', {
            method: 'POST',
            body: newFormData,
            headers: {
                'User-Agent': 'Havan-Booking-System/1.0'
            }
        });

        if (!response.ok) {
            throw new Error(`External API returned ${response.status}: ${response.statusText}`);
        }

        const responseText = await response.text();

        let result;
        try {
            result = JSON.parse(responseText);
        } catch (parseError) {
            return NextResponse.json({
                status: false,
                errors: ['Invalid response from email service'],
                message: 'Email service error',
                rawResponse: responseText
            });
        }

        if (result.status) {
            return NextResponse.json({
                status: true,
                message: result.message || 'Delegate confirmation email sent successfully'
            });
        } else {
            return NextResponse.json({
                status: false,
                errors: result.errors || [result.message || 'Email service error'],
                message: result.message || 'Failed to send email'
            });
        }

    } catch (error) {
        return NextResponse.json({
            status: false,
            errors: [error.message || 'Internal server error'],
            message: 'Failed to send delegate email'
        });
    }
}

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
    
    // Try the dedicated delegate API first for all delegate types (including normal)
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
    console.error('❌ Error in sendDelegateConfirmationEmail:', error);
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
    
    // Handle normal delegates (free) vs paid delegates
    const isNormalDelegate = delegateData.eventDetails?.delegateType === 'normal';
    if (isNormalDelegate) {
      // For normal delegates, keep the custom email handling that's working
      return { success: false, error: 'Use normal delegate service for normal delegates' };
    }
    
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
 * Send delegate email via general booking email API as fallback
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

    // Create FormData for the API request (RESTORED WORKING VERSION)
    const formData = new FormData();
    Object.keys(emailData).forEach(key => {
      if (emailData[key] !== null && emailData[key] !== undefined) {
        formData.append(key, emailData[key]);
      }
    });

    // Send request to the email API (RESTORED WORKING VERSION)
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
    details: `🕉️ Event: Sacred Havan Ceremony\r\n⏰ Shift: ${shiftTimeDisplay}\r\n🪑 Selected Seats: ${seats.length > 0 ? seats.join(', ') : 'Not specified'}\r\n👥 Number of Seats: ${seats.length || 1}`.trim()
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
    details: `🎭 Event: Cultural Show & Performance\r\n⏰ Time: 5:00 PM - 10:00 PM\r\n🎫 Selected Seats: ${selectedSeats.length > 0 ? selectedSeats.slice(0, 10).join(', ') : 'Not specified'}${selectedSeats.length > 10 ? ` +${selectedSeats.length - 10} more` : ''}\r\n👥 Number of Seats: ${selectedSeats.length || 1}`.trim()
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
    details: `📅 Event Duration: ${eventDuration}\r\n🏷️ Stall Numbers: ${stallIds.length > 0 ? stallIds.join(', ') : 'To be assigned'}\r\n🏢 Business Type: ${vendorDetails.businessType || 'Not specified'}\r\n👤 Contact Person: ${vendorDetails.ownerName || 'Not specified'}\r\n📱 Business Contact: ${vendorDetails.phone || 'Not provided'}`.trim()
  };
};

/**
 * Prepare email data for Delegate bookings - 
 */
const prepareDelegateEmailData = async (bookingData, baseData) => {
  const delegateDetails = bookingData.delegateDetails || {};
  const eventDetails = bookingData.eventDetails || {};
  const registrationType = eventDetails.registrationType || 'Individual';
  const delegateType = eventDetails.delegateType || 'Standard';
  
  // Extract numberOfPersons with proper priority
  const numberOfPersons = (eventDetails.numberOfPersons && String(eventDetails.numberOfPersons).trim()) || 
                          (delegateDetails.numberOfPersons && String(delegateDetails.numberOfPersons).trim()) || 
                          '1';
  
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
    event_date: '2025-11-15',
    booking_type: 'Delegate Registration',
    number_of_person: numberOfPersons,
    details: `

👤 Delegate Name: ${delegateDetails.name || 'Not specified'}
🏢 Registration Type: ${registrationType}
🏤 Organization: ${organizationName}
📧 Email: ${delegateDetails.email || 'Not provided'}
📱 Mobile: ${delegateDetails.mobile || 'Not provided'}
💰 Registration Fee: ₹${baseData.amount}

📦 Package Details:
• Package Type: ${getDelegateTypeDisplay(delegateType)}
• Duration: ${eventDetails.duration || 'TBD'} days

${eventDetails.designation ? `• Designation: ${eventDetails.designation}` : ''}

📏 Location Details:
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
    details: `Donation Receipt & Acknowledgment:\r\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\r\n\r\n🙏 Thank You for Your Generous Contribution!\r\n\r\n👤 Donor Name: ${donorDetails.name || 'Anonymous Donor'}\r\n🌍 Donor Type: ${donationType === 'indian' ? 'Indian Resident' : 'NRI/Foreign National'}\r\n📧 Email: ${donorDetails.email || 'Not provided'}\r\n📱 Mobile: ${donorDetails.mobile || 'Not provided'}\r\n💰 Donation Amount: ₹${baseData.amount}\r\n\r\n📍 Address:\r\n${donorDetails.address || 'Not provided'}\r\n${donorDetails.city || ''}, ${donorDetails.state || ''} - ${donorDetails.pincode || ''}\r\n\r\n🧾 Receipt Details:\r\n• Receipt Number: ${baseData.order_id}\r\n• Date of Donation: ${new Date().toLocaleDateString('en-IN')}\r\n• Payment Method: Online Transfer\r\n• Transaction Status: Completed ✅\r\n\r\n📜 Tax Benefits:\r\n• This donation is eligible for tax exemption under Section 80G\r\n• Tax exemption certificate will be issued within 15 working days\r\n• Please retain this receipt for your tax filing records\r\n• 50% of donation amount is eligible for tax deduction\r\n\r\nHow Your Donation Helps:\r\n━━━━━━━━━━━━━━━━━━━━━━\r\n✨ Community Development Programs\r\n✨ Educational Initiatives & Scholarships\r\n✨ Healthcare Support for Underprivileged\r\n✨ Spiritual & Cultural Event Organization\r\n✨ Infrastructure Development Projects\r\n✨ Emergency Relief & Support Programs\r\n\r\nOrganization Details:\r\n━━━━━━━━━━━━━━━━━━━━\r\n🏛️ Samudayik Vikas Samiti (SVS)\r\n📍 Registered Office: [Address]\r\n📞 Contact: +91-XXXXXXXXXX\r\n📧 Email: donations@svsamiti.com\r\n🌐 Website: www.svsamiti.com\r\n🆔 Registration Number: [Reg. No.]\r\n📜 80G Certificate Number: [80G No.]\r\n\r\n📞 For donation queries: accounts@svsamiti.com\r\n📄 For 80G certificate: tax@svsamiti.com\r\n\r\nYour generosity makes a real difference in countless lives. Thank you for being a part of our mission to create positive change in society.\r\n\r\nMay your kindness be blessed manifold! 🙏✨\r\n\r\nWith heartfelt gratitude,\r\nTeam Samudayik Vikas Samiti`.trim()
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
  
  // RESTORED WORKING VALIDATION - Allow zero amounts
  if (emailData.amount === undefined || emailData.amount === null || parseFloat(emailData.amount) < 0) {
    errors.push('Amount is required and must be 0 or greater');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Send confirmation email for normal delegate package registration
 * @param {Object} delegateData - Complete delegate registration data
 * @returns {Promise<Object>} - Email sending result
 */
export const sendNormalDelegateConfirmationEmail = async (delegateData) => {
  try {

    // Prepare email data specifically for normal delegate package
    const emailData = prepareNormalDelegateEmailData(delegateData);
    
    // Validate email data
    const validation = validateNormalDelegateEmail(emailData);
    if (!validation.isValid) {
      return {
        success: false,
        error: 'Email validation failed: ' + validation.errors.join(', '),
        validationErrors: validation.errors
      };
    }

    // Try the dedicated delegate email API first
    try {
      const result = await sendViaDedicatedAPI(emailData);
      if (result.success) {
        return {
          success: true,
          message: 'Normal delegate confirmation email sent successfully',
          data: result.data,
          method: result.method || 'dedicated'
        };
      }
      throw new Error(result.error || 'Dedicated API failed');
    } catch (dedicatedError) {
      // Only try fallback if dedicated fails
      try {
        const fallbackResult = await sendViaGeneralAPI(emailData);
        if (fallbackResult.success) {
          return {
            success: true,
            message: 'Normal delegate email sent via fallback method',
            data: fallbackResult.data,
            method: 'fallback'
          };
        }
        throw new Error(fallbackResult.error || 'Fallback API failed');
      } catch (fallbackError) {
        return {
          success: false,
          error: `Both email methods failed. Dedicated: ${dedicatedError.message}. Fallback: ${fallbackError.message}`
        };
      }
    }

  } catch (error) {
    console.error('❌ Error in sendNormalDelegateConfirmationEmail:', error);
    return {
      success: false,
      error: 'Normal delegate email service error: ' + error.message
    };
  }
};

/**
 * Prepare email data specifically for normal delegate package - FIXED 
 */
const prepareNormalDelegateEmailData = (delegateData) => {
  const delegateDetails = delegateData.delegateDetails || {};
  const eventDetails = delegateData.eventDetails || {};
  const registrationType = eventDetails.registrationType || 'Individual';
  
  // Extract numberOfPersons with proper priority
  const numberOfPersons = (eventDetails.numberOfPersons && String(eventDetails.numberOfPersons).trim()) || 
                          (delegateDetails.numberOfPersons && String(delegateDetails.numberOfPersons).trim()) || 
                          '1';
  
  // Determine organization name
  let organizationName = 'Individual Registration';
  if (registrationType === 'Company') {
    organizationName = eventDetails.companyName || delegateDetails.companyname || 'Company Registration';
  } else if (registrationType === 'Temple') {
    organizationName = eventDetails.templeName || 'Temple Registration';
  }

  // Format address properly
  const formattedAddress = [
    delegateDetails.address,
    delegateDetails.city,
    delegateDetails.state,
    delegateDetails.country,
    delegateDetails.pincode
  ].filter(Boolean).join(', ');

  return {
    // Basic information
    name: delegateDetails.name || 'Valued Delegate',
    email: delegateDetails.email || '',
    mobile: delegateDetails.mobile || '',
    address: formattedAddress || 'Not provided',
    pan: delegateDetails.pan || 'Not provided',
    
    // Registration details
    order_id: delegateData.bookingId || delegateData.id || '',
    participation_type: 'Delegate',
    registration_type: registrationType,
    delegate_type: 'normal',
    duration: eventDetails.duration || eventDetails.days || '5',
    number_of_person: numberOfPersons,
    
    // Amount - can be 0 or any value for normal delegates
    amount: (delegateData.totalAmount || 0).toString(),
    
    // Payment details
    payment_id: delegateData.payment?.paymentId || 'normal_delegate_confirmed',
    transaction_date: new Date().toISOString().split('T')[0],
    
    // Additional details
    organization_name: organizationName,
    designation: eventDetails.designation || delegateDetails.designation || '',
    
    // Special flags for normal delegate
    is_normal_delegate: 'true',
    package_type: 'normal',
    status: 'confirmed'
  };
};



/**
 * Send email via dedicated delegate email API
 * @param {Object} emailData - Prepared email data
 * @returns {Promise<Object>} - API result
 */
const sendViaDedicatedAPI = async (emailData) => {
  try {
    const response = await fetch('/api/emails/delegate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: emailData.name,
        email: emailData.email,
        order_id: emailData.order_id,
        event_date: '3-7 Dec, 2025',
        booking_type: 'Delegate Registration',
        amount: emailData.amount === '0' ? 'Free' : emailData.amount,
        mobile: emailData.mobile,
        address: `${emailData.address || 'Not provided'}`,
        pan: emailData.pan || 'Not provided',
        valid_from: new Date().toISOString().split('T')[0],
        valid_to: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        registration_type: emailData.registration_type,
        delegate_type: emailData.delegate_type,
        duration: emailData.duration,
        number_of_person: emailData.number_of_person,
        details: `Registration Successful`
      })
    });

    const responseText = await response.text();
    
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      throw new Error('Invalid JSON response from dedicated delegate API');
    }

    if (result.status) {
      return {
        success: true,
        message: 'Email sent via dedicated delegate API for normal package',
        data: result,
        method: 'dedicated'
      };
    } else {
      throw new Error('Dedicated API error: ' + (result.errors ? result.errors.join(', ') : result.message || 'Unknown error'));
    }

  } catch (error) {
    throw error;
  }
};

/**
 * Send email via general booking API as fallback
 * @param {Object} emailData - Prepared email data
 * @returns {Promise<Object>} - API result
 */
const sendViaGeneralAPI = async (emailData) => {
  try {
    // Create delegate data structure for the general API
    const generalDelegateData = {
      bookingId: emailData.order_id,
      delegateDetails: {
        name: emailData.name,
        email: emailData.email,
        mobile: emailData.mobile
      },
      eventDetails: {
        participationType: emailData.participation_type,
        registrationType: emailData.registration_type,
        duration: emailData.duration,
        numberOfPersons: emailData.number_of_person,
        delegateType: emailData.delegate_type
      },
      totalAmount: parseFloat(emailData.amount) || 0,
      payment: {
        paymentId: emailData.payment_id
      }
    };

    const result = await sendDelegateConfirmationEmail(generalDelegateData);
    
    if (result.success) {
      return {
        success: true,
        message: 'Email sent via general API for normal delegate',
        data: result.data,
        method: 'general_fallback'
      };
    } else {
      throw new Error('General API error: ' + result.error);
    }

  } catch (error) {
    throw error;
  }
};

/**
 * Validate email data for normal delegate registration
 * @param {Object} emailData - Email data to validate
 * @returns {Object} - Validation result
 */
const validateNormalDelegateEmail = (emailData) => {
  const errors = [];

  // Required fields validation
  if (!emailData.name || emailData.name.trim().length < 2) {
    errors.push('Delegate name is required and must be at least 2 characters');
  }

  if (!emailData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailData.email)) {
    errors.push('Valid email address is required');
  }

  if (!emailData.order_id || emailData.order_id.trim().length === 0) {
    errors.push('Registration ID (order_id) is required');
  }

  if (!emailData.registration_type) {
    errors.push('Registration type is required');
  }

  // Delegate-specific validations
  if (!emailData.duration || isNaN(parseInt(emailData.duration))) {
    errors.push('Valid duration is required');
  }

  // Normal delegate should be confirmed
  if (emailData.delegate_type !== 'normal') {
    errors.push('This service is only for normal delegate type');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Enhanced function to handle normal delegate emails specifically
 * This can be called directly when we know it's a normal delegate registration
 */
export const handleNormalDelegateEmail = async (delegateBookingData) => {
  try {
    // Ensure this is actually a normal delegate
    if (delegateBookingData.eventDetails?.delegateType !== 'normal') {
      // Fall back to regular delegate email
      return await sendDelegateConfirmationEmail(delegateBookingData);
    }

    // Send normal delegate email (with built-in fallback)
    const result = await sendNormalDelegateConfirmationEmail(delegateBookingData);
    
    return result;

  } catch (error) {
    console.error('❌ Error in handleNormalDelegateEmail:', error);
    return {
      success: false,
      error: 'Normal delegate email handler error: ' + error.message
    };
  }
}