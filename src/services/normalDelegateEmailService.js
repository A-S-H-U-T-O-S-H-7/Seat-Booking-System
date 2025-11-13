
import { sendDelegateConfirmationEmail } from './emailService';

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
 * Prepare email data specifically for normal delegate package
 * @param {Object} delegateData - Delegate registration data
 * @returns {Object} - Formatted email data
 */
const prepareNormalDelegateEmailData = (delegateData) => {
  const delegateDetails = delegateData.delegateDetails || {};
  const eventDetails = delegateData.eventDetails || {};
  const registrationType = eventDetails.registrationType || 'Individual';
  
  console.log('🔍 [prepareNormalDelegateEmailData] Extracting numberOfPersons:', {
    'eventDetails.numberOfPersons': eventDetails.numberOfPersons,
    'delegateDetails.numberOfPersons': delegateDetails.numberOfPersons,
    'Full eventDetails': eventDetails,
    'Full delegateDetails': delegateDetails
  });
  
  // Extract numberOfPersons with proper priority
  const numberOfPersons = (eventDetails.numberOfPersons && String(eventDetails.numberOfPersons).trim()) || 
                          (delegateDetails.numberOfPersons && String(delegateDetails.numberOfPersons).trim()) || 
                          '1';
  
  console.log('✅ [prepareNormalDelegateEmailData] Extracted numberOfPersons:', numberOfPersons);

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
        details: `Registration Successful`,
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
      return await sendDelegateConfirmationEmail(delegateBookingData);
    }

    // Send normal delegate email (with built-in fallback)
    return await sendNormalDelegateConfirmationEmail(delegateBookingData);

  } catch (error) {
    console.error('❌ Error in handleNormalDelegateEmail:', error);
    return {
      success: false,
      error: 'Normal delegate email handler error: ' + error.message
    };
  }
};

export default {
  sendNormalDelegateConfirmationEmail,
  handleNormalDelegateEmail
};