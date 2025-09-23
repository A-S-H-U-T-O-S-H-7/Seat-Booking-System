# Complete Booking Data Structures & Firebase Collections

This document provides a comprehensive overview of how each booking type (Havan, Stall, Delegate, Show, Donation) gets saved as JSON objects in Firebase collections.

## 🗂️ Firebase Collections Overview

### Main Collections:
1. **`bookings`** - Havan seat bookings
2. **`stallBookings`** - Stall bookings  
3. **`delegateBookings`** - Delegate registrations
4. **`showBookings`** - Show seat bookings
5. **`donations`** - Direct donations

### Supporting Collections:
6. **`seatAvailability`** - Havan seat availability tracking
7. **`stallAvailability`** - Stall availability tracking
8. **`showSeatAvailability`** - Show seat availability tracking

---

## 🎪 1. HAVAN SEAT BOOKINGS

### Collection: `bookings`
### Flow: BookingFlow.jsx → PaymentProcess.jsx

```json
{
  "id": "HAVAN-1672531200000-123",
  "bookingId": "HAVAN-1672531200000-123",
  "userId": "user_firebase_uid",
  "customerDetails": {
    "name": "John Doe",
    "email": "john@example.com", 
    "phone": "9876543210",
    "address": "123 Main Street, Delhi",
    "aadhar": "123456789012"
  },
  "eventDate": "2025-12-05T00:00:00.000Z",
  "shift": "morning",
  "seats": ["A1-K1-S1", "A1-K1-S2"],
  "seatCount": 2,
  "totalAmount": 2000,
  "status": "pending_payment|confirmed|cancelled",
  "payment": {
    "gateway": "ccavenue",
    "amount": 2000,
    "currency": "INR",
    "paymentId": "ccavenue_payment_id",
    "orderId": "HAVAN-1672531200000-123"
  },
  "type": "havan",
  "createdAt": "2025-01-01T10:00:00.000Z",
  "updatedAt": "2025-01-01T10:00:00.000Z",
  "expiryTime": "2025-01-01T10:05:00.000Z"
}
```

### Key Features:
- **Booking ID Format**: `HAVAN-{timestamp}-{random}`
- **Seat Format**: `{Block}{Column}-K{Kund}-S{Seat}` (e.g., "A1-K1-S1")
- **Shift Options**: "morning", "afternoon", "evening"
- **Payment Integration**: CCAvenue gateway
- **Email Service**: `sendBookingConfirmationEmail()`

---

## 🏪 2. STALL BOOKINGS

### Collection: `stallBookings`
### Flow: StallBookingFlow.jsx → StallPaymentProcess.jsx

```json
{
  "id": "STALL-1672531200000-456",
  "bookingId": "STALL-1672531200000-456", 
  "userId": "user_firebase_uid",
  "vendorDetails": {
    "ownerName": "Vendor Name",
    "email": "vendor@example.com",
    "phone": "9876543210",
    "businessType": "Food & Beverages",
    "aadhar": "123456789012",
    "address": "Business Address"
  },
  "stallIds": ["S001", "S002", "S003"],
  "numberOfStalls": 3,
  "duration": "5 days",
  "totalAmount": 15000,
  "payment": {
    "gateway": "ccavenue",
    "amount": 15000,
    "currency": "INR",
    "paymentId": "ccavenue_payment_id",
    "orderId": "STALL-1672531200000-456",
    "status": "pending_payment|confirmed|failed"
  },
  "status": "pending_payment|confirmed|cancelled",
  "type": "stall",
  "eventDetails": {
    "startDate": "2025-12-03T00:00:00.000Z",
    "endDate": "2025-12-07T00:00:00.000Z", 
    "duration": "5 days",
    "type": "vendor_stall"
  },
  "createdAt": "2025-01-01T10:00:00.000Z",
  "updatedAt": "2025-01-01T10:00:00.000Z",
  "expiryTime": "2025-01-01T10:05:00.000Z"
}
```

### Key Features:
- **Booking ID Format**: `STALL-{timestamp}-{random}`
- **Multiple Stalls**: Array of stall IDs in single booking
- **Vendor Focus**: Detailed business information required
- **Duration**: Fixed 5-day event period
- **Payment Integration**: CCAvenue gateway
- **Email Service**: Uses main email service API

---

## 👥 3. DELEGATE REGISTRATIONS

### Collection: `delegateBookings`  
### Flow: DelegateForm.jsx (single component)

```json
{
  "id": "DELEGATE-1672531200000-789",
  "bookingId": "DELEGATE-1672531200000-789",
  "userId": "user_firebase_uid", 
  "delegateDetails": {
    "name": "Delegate Name",
    "companyname": "Company Ltd",
    "email": "delegate@example.com",
    "mobile": "9876543210",
    "country": "India",
    "state": "Delhi",
    "city": "New Delhi", 
    "address": "Full Address",
    "pincode": "110001",
    "participation": "Delegate",
    "registrationType": "Company|Individual|Temple",
    "templename": "Temple Name (if applicable)",
    "designation": "Manager",
    "numberOfPersons": "2",
    "delegateType": "normal|withAssistance|withoutAssistance",
    "days": "5",
    "brief": "Brief description",
    "aadharno": "123456789012",
    "passportno": "A1234567 (for foreign)",
    "pan": "ABCDE1234F",
    "fileInfo": {
      "fileName": "delegate_image.jpg",
      "originalName": "selfie.jpg", 
      "fileSize": 1024000,
      "fileType": "image/jpeg",
      "fileUploaded": true,
      "imageUrl": "https://firebase.storage.url/image.jpg"
    }
  },
  "totalAmount": 5000,
  "payment": {
    "gateway": "ccavenue",
    "amount": 5000,
    "currency": "INR", 
    "paymentId": "ccavenue_payment_id|normal_delegate_free",
    "orderId": "DELEGATE-1672531200000-789",
    "status": "pending_payment|confirmed|failed"
  },
  "status": "pending_payment|confirmed|cancelled",
  "type": "delegate",
  "eventDetails": {
    "participationType": "Delegate",
    "delegateType": "withAssistance", 
    "duration": "5",
    "numberOfPersons": "2",
    "designation": "Manager",
    "registrationType": "Company",
    "companyName": "Company Ltd",
    "templeName": "",
    "briefProfile": "Brief description"
  },
  "createdAt": "2025-01-01T10:00:00.000Z",
  "updatedAt": "2025-01-01T10:00:00.000Z", 
  "expiryTime": "2025-01-01T10:05:00.000Z"
}
```

### Key Features:
- **Booking ID Format**: `DELEGATE-{timestamp}-{random}`
- **Three Types**: 
  - `normal` - Free registration
  - `withoutAssistance` - Fixed price, fixed days
  - `withAssistance` - Price per person per day
- **Image Upload**: Firebase Storage integration
- **Location Data**: Country/State/City dropdowns
- **Document Support**: Aadhar (India) / Passport (Foreign)
- **Payment**: 
  - Normal delegates: Always free/confirmed
  - Others: CCAvenue integration
- **Email Services**: 
  - Normal: `normalDelegateEmailService.js`
  - Others: `sendDelegateConfirmationEmail()`

---

## 🎭 4. SHOW SEAT BOOKINGS

### Collection: `showBookings`
### Flow: ShowBookingFlow.jsx → ShowPaymentProcess.jsx

```json
{
  "id": "SHOW-1672531200000-101", 
  "bookingId": "SHOW-1672531200000-101",
  "userId": "user_firebase_uid",
  "customerDetails": {
    "name": "Show Viewer", 
    "email": "viewer@example.com",
    "phone": "9876543210",
    "address": "Viewer Address",
    "aadhar": "123456789012"
  },
  "showDate": "2025-12-06T00:00:00.000Z",
  "showTime": "evening",
  "seats": ["P1-R1-S1", "P1-R1-S2"],
  "seatCount": 2,
  "totalAmount": 1000,
  "status": "pending_payment|confirmed|cancelled",
  "payment": {
    "gateway": "ccavenue",
    "amount": 1000, 
    "currency": "INR",
    "paymentId": "ccavenue_payment_id",
    "orderId": "SHOW-1672531200000-101"
  },
  "type": "show",
  "eventDetails": {
    "showName": "Cultural Performance",
    "venue": "Main Auditorium",
    "showTime": "evening",
    "duration": "2 hours"
  },
  "createdAt": "2025-01-01T10:00:00.000Z",
  "updatedAt": "2025-01-01T10:00:00.000Z",
  "expiryTime": "2025-01-01T10:05:00.000Z"
}
```

### Key Features:
- **Booking ID Format**: `SHOW-{timestamp}-{random}`
- **Seat Format**: `{Platform}{Number}-R{Row}-S{Seat}` (e.g., "P1-R1-S1")
- **Show Times**: Various time slots
- **Payment Integration**: CCAvenue gateway
- **Email Service**: Uses main email service API

---

## 💝 5. DONATIONS

### Collection: `donations`
### Flow: DonationForm.jsx (within DonationPage.jsx)

```json
{
  "id": "DN1672531200000",
  "donationId": "DN1672531200000",
  "userId": "user_firebase_uid|null",
  "donorDetails": {
    "name": "Donor Name", 
    "email": "donor@example.com",
    "mobile": "9876543210",
    "address": "Full Address",
    "city": "New Delhi",
    "state": "Delhi", 
    "country": "India",
    "pincode": "110001",
    "donorType": "indian|foreign"
  },
  "amount": 10000,
  "currency": "INR",
  "status": "pending_payment|confirmed|failed",
  "paymentGateway": "ccavenue",
  "purpose": "donation",
  "donorType": "indian",
  "taxExemption": {
    "eligible": true,
    "section": "80G", 
    "certificateRequired": true
  },
  "payment": {
    "gateway": "ccavenue",
    "paymentId": "ccavenue_payment_id",
    "orderId": "DN1672531200000",
    "amount": 10000
  },
  "createdAt": "2025-01-01T10:00:00.000Z",
  "updatedAt": "2025-01-01T10:00:00.000Z",
  "expiryTime": "2025-01-01T10:15:00.000Z"
}
```

### Key Features:
- **Donation ID Format**: `DN{timestamp}`
- **Donor Types**: "indian" or "foreign" 
- **Tax Benefits**: 80G exemption eligible
- **Location Support**: Full address with country/state/city
- **Payment Integration**: CCAvenue gateway
- **Email Service**: Uses main email service API

---

## 🔧 SUPPORTING COLLECTIONS

### 6. Seat Availability Collections

#### `seatAvailability` (Havan Seats)
```json
{
  "date_shift": {
    "seats": {
      "A1-K1-S1": {
        "booked": false,
        "blocked": true,
        "userId": "user_id",
        "customerName": "Customer Name",
        "bookingId": "HAVAN-123",
        "blockedAt": "2025-01-01T10:00:00.000Z",
        "expiryTime": "2025-01-01T10:05:00.000Z"
      }
    },
    "updatedAt": "2025-01-01T10:00:00.000Z",
    "date": "2025-12-05",
    "shift": "morning"
  }
}
```

#### `stallAvailability` (Stall Availability)
```json
{
  "current": {
    "stalls": {
      "S001": {
        "booked": false,
        "blocked": true, 
        "userId": "user_id",
        "vendorName": "Vendor Name",
        "businessName": "Business Type",
        "bookingId": "STALL-123",
        "blockedAt": "2025-01-01T10:00:00.000Z",
        "expiryTime": "2025-01-01T10:05:00.000Z"
      }
    },
    "updatedAt": "2025-01-01T10:00:00.000Z"
  }
}
```

---

## 🔄 COMMON PATTERNS

### 1. Booking ID Generation
```javascript
// Havan Seats
const { generateSequentialBookingId } = await import('@/services/bookingIdService');
const bookingId = await generateSequentialBookingId('havan');

// Stalls  
const bookingId = await generateSequentialBookingId('stall');

// Delegates
const bookingId = 'DELEGATE-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

// Shows
const bookingId = await generateSequentialBookingId('show');

// Donations
const donationId = 'DN' + Date.now();
```

### 2. Payment Flow
All bookings follow this pattern:
1. **Create Pending Record** - Status: 'pending_payment'
2. **Block Resources** - Temporarily reserve seats/stalls
3. **Generate CCAvenue Request** - API call to `/api/payment/ccavenue-request`
4. **Redirect to Gateway** - Dynamic form submission
5. **Handle Response** - Update status based on payment result
6. **Send Confirmation Email** - Different services per booking type

### 3. Status Transitions
```
pending_payment → confirmed (success)
pending_payment → failed (payment failed)  
pending_payment → cancelled (manual/timeout)
confirmed → cancelled (admin action)
```

### 4. Expiry Mechanism
- **Havan/Show/Stall**: 5 minutes expiry for payment completion
- **Donations**: 15 minutes expiry  
- **Delegates**: 5 minutes expiry (except normal delegates - immediate confirmation)

### 5. Email Services
```javascript
// Havan, Stall, Show, Donation
await sendBookingConfirmationEmail(data);

// Delegate - With/Without Assistance  
await sendDelegateConfirmationEmail(data);

// Delegate - Normal (Free)
await handleNormalDelegateEmail(data);
```

---

## 📊 COLLECTION RELATIONSHIPS

```
User (Auth)
├── bookings (Havan) [userId]
├── stallBookings (Stall) [userId] 
├── delegateBookings (Delegate) [userId]
├── showBookings (Show) [userId]
└── donations (Donation) [userId - optional]

Availability Collections
├── seatAvailability [date_shift] → bookings
├── stallAvailability [current] → stallBookings  
└── showSeatAvailability [date_time] → showBookings
```

---

## 🎯 BOOKING TYPE SUMMARY

| Type | Collection | ID Format | Payment Required | Email Service | Special Features |
|------|------------|-----------|------------------|---------------|------------------|
| **Havan** | `bookings` | `HAVAN-{timestamp}-{random}` | ✅ Always | Main Email API | Seat blocking, Shifts |
| **Stall** | `stallBookings` | `STALL-{timestamp}-{random}` | ✅ Always | Main Email API | Multi-stall booking, Vendor details |
| **Delegate** | `delegateBookings` | `DELEGATE-{timestamp}-{random}` | ⚠️ Conditional | Specialized Services | 3 types, Image upload, Free option |
| **Show** | `showBookings` | `SHOW-{timestamp}-{random}` | ✅ Always | Main Email API | Show times, Platform seating |
| **Donation** | `donations` | `DN{timestamp}` | ✅ Always | Main Email API | Tax exemption, Donor types |

---

This comprehensive documentation covers all booking flows and their data structures. Each booking type has its own collection with specific schemas optimized for their use cases, while sharing common patterns for payment processing and status management.