# Havan Seat Booking System

🕉️ A comprehensive web-based seat reservation platform for Havan events, built with Next.js and Firebase.

## Features

### Core Features
- **Visual Seat Selection**: Interactive seat map with 400 seats organized in 4 blocks (A, B, C, D)
- **Real-time Availability**: Live seat availability updates using Firestore listeners
- **Multi-day Event Support**: 5-day event with morning and afternoon shifts
- **User Authentication**: Secure Firebase Auth integration
- **Payment Processing**: Razorpay integration for secure online payments
- **Email Notifications**: Automated booking confirmations
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### Seat Organization
- **400 Total Seats** per shift
- **4 Blocks**: A, B, C, D
- **5 Columns** per block: Col-1 to Col-5
- **5 Kunds** per column: K1 to K5
- **4 Seats** per kund: S1 to S4
- **Seat ID Format**: Block-Column-Kund-Seat (e.g., A-2-K3-S4)

### Event Schedule
- **Duration**: 5 consecutive days
- **Morning Shift**: 9:00 AM - 12:00 PM
- **Afternoon Shift**: 2:00 PM - 5:00 PM

### Pricing & Discounts
- Fixed price per seat (configurable)
- 10% discount for booking 5 or more seats
- Full refund available if canceled 15+ days before event

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: Firebase (Auth, Firestore, Functions, Storage)
- **Payment**: Razorpay integration
- **Email**: SendGrid/SMTP via Firebase Functions
- **State Management**: React Context API
- **Styling**: Tailwind CSS with custom components
- **Icons**: Heroicons, Lucide React

## Installation

### Prerequisites
- Node.js 18+ and npm
- Firebase project with Firestore, Auth, and Functions enabled
- Razorpay account for payments
- SendGrid or SMTP for email notifications

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd havan-seat-booking
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your credentials:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   ```

4. **Firebase Setup**
   - Create a Firebase project
   - Enable Authentication (Email/Password)
   - Create Firestore database
   - Set up Firestore Security Rules (see below)

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Firestore Database Structure

### Collections

#### `settings`
```javascript
// Document ID: 'general'
{
  seatPrice: 500,
  updatedAt: timestamp
}
```

#### `bookings`
```javascript
// Document ID: booking ID (e.g., 'BK1647823456789')
{
  bookingId: "BK1647823456789",
  userId: "user-uid",
  customerDetails: {
    name: "John Doe",
    email: "john@example.com",
    phone: "9876543210",
    address: "123 Main St"
  },
  eventDetails: {
    date: timestamp,
    shift: "morning",
    seats: ["A-1-K1-S1", "A-1-K1-S2"],
    seatCount: 2
  },
  payment: {
    paymentId: "pay_xyz123",
    orderId: "order_abc456",
    amount: 1000,
    status: "success"
  },
  status: "confirmed",
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### `seatAvailability`
```javascript
// Document ID: '{date}_{shift}' (e.g., '2024-03-15_morning')
{
  seats: {
    "A-1-K1-S1": {
      booked: true,
      bookedBy: "user-uid",
      bookedAt: timestamp,
      bookingId: "BK1647823456789"
    },
    "A-1-K1-S2": {
      blocked: true,
      blockedBy: "admin-uid",
      blockedAt: timestamp,
      reason: "VIP section"
    }
  },
  updatedAt: timestamp
}
```

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Settings - read for all, write for admins only
    match /settings/{document} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
    
    // Bookings - users can read their own, admins can read all
    match /bookings/{bookingId} {
      allow read: if request.auth != null && 
                     (resource.data.userId == request.auth.uid || 
                      request.auth.token.admin == true);
      allow create: if request.auth != null;
      allow update: if request.auth != null && request.auth.token.admin == true;
    }
    
    // Seat availability - read for all, write via transactions only
    match /seatAvailability/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## User Flow

1. **Registration/Login**: Users create accounts or login
2. **Date Selection**: Choose from 5 available event dates
3. **Shift Selection**: Pick morning or afternoon shift
4. **Seat Selection**: Visual seat map with real-time availability
5. **Review Cart**: Summary of selected seats with pricing
6. **Customer Details**: Fill personal information
7. **Payment**: Secure Razorpay payment processing
8. **Confirmation**: Booking confirmation with email notification

## Admin Features (Future Enhancement)

- View all bookings with filters (date, shift, status)
- Update seat prices dynamically
- Block/unblock seats manually
- Export booking data to CSV/Excel
- Send bulk notifications
- Refund management

## API Integration

### Razorpay Payment
```javascript
// Example payment integration
const options = {
  key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  amount: totalAmount * 100, // Amount in paise
  currency: 'INR',
  name: 'Havan Seat Booking',
  description: 'Booking for Havan ceremony',
  order_id: orderId,
  handler: function(response) {
    // Handle successful payment
    verifyPayment(response);
  }
};
```

### Email Notifications
Email confirmations are sent using Firebase Functions with SendGrid or SMTP integration.

## Deployment

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on git push

### Firebase Hosting
```bash
npm run build
firebase deploy
```

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Project Structure
```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (web)/
│   │   ├── booking/
│   │   └── page.js
│   ├── globals.css
│   └── layout.js
├── components/
│   ├── BookingCart.jsx
│   ├── BookingFlow.jsx
│   ├── CustomerDetails.jsx
│   ├── PaymentProcess.jsx
│   ├── ProtectedRoute.jsx
│   ├── SeatMap.jsx
│   ├── SelectDate.jsx
│   └── SelectShift.jsx
├── context/
│   ├── AuthContext.jsx
│   └── BookingContext.jsx
├── hooks/
│   └── useAuth.js
└── lib/
    └── firebase.js
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@havanbooking.com or create an issue in the repository.

---

🕉️ **May your participation in the Havan ceremony bring peace, prosperity, and divine blessings!** 🕉️

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
