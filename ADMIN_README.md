# Havan Seat Booking - Admin Panel

A comprehensive admin panel for managing the Havan Seat Booking System with beautiful, responsive UI and complete operational control.

## 🌟 Features

### 📊 Dashboard Overview
- **Real-time Statistics**: Revenue, bookings, user metrics, occupancy rates
- **Recent Activity**: Latest bookings and system alerts
- **Time-based Filtering**: Today, week, month views
- **Visual Analytics**: Clean charts and metrics display

### 📅 Event Schedule Management
- **Create & Edit Events**: Full event lifecycle management
- **Shift Configuration**: Morning/evening shifts with custom times
- **Capacity Management**: Set maximum capacity per event
- **Seasonal Pricing**: Advanced pricing rules and multipliers

### 🪑 Seat Management
- **Visual Seat Map**: Interactive seat layout with 400 seats (4 blocks × 5 columns × 5 kunds × 4 seats)
- **Real-time Status**: Available, booked, blocked seat indicators
- **Bulk Operations**: Block/unblock multiple seats at once
- **Grid & List Views**: Flexible viewing modes
- **Detailed Information**: Customer info, booking details for each seat

### 📋 Booking Management
- **Complete Booking Control**: View, confirm, cancel bookings
- **Cancellation Handling**: Approve/reject cancellation requests
- **Price Adjustments**: Apply discounts and modify pricing on-demand
- **Advanced Filtering**: Search by customer, date, status
- **Pagination**: Efficient handling of large booking lists

### 👥 User Management
- **User Database**: View all registered users
- **Profile Management**: Edit user information
- **Booking History**: Track user booking patterns
- **Search & Filter**: Find users quickly

### 💰 Price Settings
- **Dynamic Pricing**: Flexible seat pricing configuration
- **Bulk Discounts**: Automatic discounts for multiple seats
- **Early Bird Discounts**: Time-based discount system
- **Seasonal Pricing**: Special pricing for festival seasons
- **Cancellation Policy**: Configurable refund rules

### 👨‍💼 Admin Management
- **Role-based Access**: Super Admin and regular Admin roles
- **Permission System**: Granular permission control
- **Admin Creation**: Promote users to admin status
- **Activity Logging**: Track admin actions

## 🎨 Design Features

### Responsive Design
- **Mobile-first**: Optimized for all screen sizes
- **Collapsible Sidebar**: Space-efficient navigation
- **Touch-friendly**: Mobile gesture support
- **Adaptive Layouts**: Content adjusts to screen size

### Beautiful UI
- **Modern Aesthetic**: Clean, professional design
- **Color-coded Status**: Intuitive visual indicators
- **Smooth Animations**: Polished user experience
- **Consistent Theming**: Purple/pink gradient theme

### User Experience
- **Toast Notifications**: Instant feedback for all actions
- **Loading States**: Clear progress indicators
- **Confirmation Dialogs**: Prevent accidental actions
- **Keyboard Navigation**: Accessible interface

## 🚀 Getting Started

### Prerequisites
- Next.js 15.4.6+
- Firebase project with Firestore and Authentication
- React 19+
- Tailwind CSS

### Setup Instructions

1. **Install Dependencies**
```bash
npm install
```

2. **Firebase Configuration**
Ensure your Firebase configuration is set up in `src/lib/firebase.js`

3. **Admin User Setup**
```bash
# Option 1: Use the setup script (recommended)
node scripts/setup-admin.js

# Option 2: Manual setup via Firebase Console
# Create user in Firebase Auth
# Add admin document to 'admins' collection
```

4. **Admin Collections Structure**

```javascript
// admins/{userId}
{
  name: "Super Admin",
  email: "admin@example.com",
  role: "super_admin", // or "admin"
  permissions: [], // Array of permission strings
  isActive: true,
  createdAt: Timestamp,
  updatedAt: Timestamp
}

// settings/pricing
{
  defaultSeatPrice: 500,
  currency: "INR",
  taxRate: 0,
  bulkDiscounts: [...],
  earlyBirdDiscount: {...},
  cancellationPolicy: {...}
}
```

### Access Admin Panel

1. **Navigate to**: `/admin/login`
2. **Default Credentials** (if using setup script):
   - Email: `admin@havanseats.com`
   - Password: `admin123456`
3. **⚠️ Important**: Change default password after first login

## 🔒 Security Features

### Authentication
- **Firebase Auth Integration**: Secure authentication system
- **Session Management**: Automatic session handling
- **Route Protection**: Protected admin routes
- **Role Verification**: Real-time permission checking

### Authorization
- **Role-based Access Control**: Two-tier admin system
- **Permission System**: Granular feature access
- **Super Admin Privileges**: Full system access
- **Regular Admin Limits**: Configurable permissions

### Data Security
- **Firestore Rules**: Secure database access
- **Input Validation**: Form data validation
- **XSS Prevention**: Secure data handling
- **CSRF Protection**: Request validation

## 📱 Responsive Breakpoints

- **Mobile**: 0-768px
- **Tablet**: 768-1024px
- **Desktop**: 1024px+

## 🎯 Admin Permissions

### Available Permissions
- `view_events` - View event schedules
- `manage_seats` - Block/unblock seats
- `view_bookings` - Access booking data
- `manage_bookings` - Modify booking status
- `view_users` - Access user information
- `manage_users` - Edit user profiles
- `manage_pricing` - Modify pricing settings
- `manage_admins` - Admin user management
- `view_reports` - Access system reports

### Role Definitions
- **Super Admin**: All permissions automatically
- **Admin**: Configurable permission subset

## 🔧 Customization

### Theming
- Primary colors defined in Tailwind config
- Consistent color scheme throughout
- Easy theme modification

### Layout
- Modular component architecture
- Customizable dashboard sections
- Flexible grid systems

### Features
- Toggle-able features via permissions
- Configurable pricing rules
- Customizable seat layouts

## 📊 Analytics & Reporting

### Dashboard Metrics
- Total revenue tracking
- Booking count analytics
- User registration trends
- Occupancy rate calculation

### Real-time Updates
- Live booking notifications
- Seat availability updates
- Revenue tracking
- System alerts

## 🛠️ Technical Stack

- **Framework**: Next.js 15.4.6
- **Styling**: Tailwind CSS 4
- **Icons**: Heroicons
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **State Management**: React Context
- **Notifications**: React Hot Toast
- **Date Handling**: date-fns
- **Payments**: Razorpay integration

## 📝 Contributing

1. Follow component structure in `/src/components/admin/`
2. Use TypeScript-style prop validation
3. Maintain responsive design principles
4. Follow existing naming conventions
5. Add proper error handling

## 🐛 Troubleshooting

### Common Issues

**Admin Login Failed**
- Verify admin document exists in Firestore
- Check user exists in Firebase Auth
- Confirm role and permissions are set

**Permission Denied**
- Verify user role in admin document
- Check permission array includes required permission
- Ensure user is active (`isActive: true`)

**Seat Map Not Loading**
- Check seatAvailability collection structure
- Verify date/shift combination format
- Confirm proper document naming convention

### Development Tips
- Use browser dev tools for responsive testing
- Check Firebase console for data structure
- Use toast notifications for debugging
- Monitor network tab for API calls

## 📄 License

This admin panel is part of the Havan Seat Booking System project.

---

**Built with ❤️ for efficient event management**
