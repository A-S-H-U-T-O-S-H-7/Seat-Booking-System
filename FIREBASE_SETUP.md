# Firebase Setup Guide

## Fix for "Cloud Firestore API has not been used" Error

### Step 1: Enable Firestore API
1. Visit: https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=havan-seat-booking
2. Click "Enable API" if not already enabled
3. Wait for a few minutes for the changes to propagate

### Step 2: Firebase Console Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project called "havan-seat-booking" or use your existing one
3. Enable the following services:

#### Authentication
1. Go to Authentication → Sign-in method
2. Enable Email/Password provider
3. Save changes

#### Firestore Database
1. Go to Firestore Database → Create database
2. Choose "Start in test mode" (we'll set up security rules later)
3. Select a location closest to your users

#### Storage (Optional)
1. Go to Storage → Get started
2. Use default settings

### Step 3: Get Configuration Keys
1. Go to Project Settings (gear icon) → General tab
2. Scroll down to "Your apps" section
3. Add a web app if you haven't already
4. Copy the configuration object

### Step 4: Environment Variables
Create a `.env.local` file in your project root:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key-here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

### Step 5: Firestore Security Rules
1. Go to Firestore Database → Rules
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Settings - read for all authenticated users
    match /settings/{document} {
      allow read: if request.auth != null;
      allow write: if false; // Only allow writes via admin SDK
    }
    
    // Bookings - users can create and read their own bookings
    match /bookings/{bookingId} {
      allow read, write: if request.auth != null && 
                            request.auth.uid == resource.data.userId;
      allow create: if request.auth != null;
    }
    
    // Seat availability - read for all, write for authenticated users
    match /seatAvailability/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### Step 6: Initialize Default Data
Run the setup script to create initial settings:

```bash
# First, update the Firebase config in scripts/setup-firebase.js
# Then run:
node scripts/setup-firebase.js
```

### Step 7: Restart Development Server
```bash
npm run dev
```

## Common Issues & Solutions

### Issue 1: "Failed to get document because the client is offline"
**Solution:** 
- Check internet connection
- Ensure Firestore is enabled in Firebase Console
- Verify environment variables are correct

### Issue 2: "Permission denied" errors
**Solution:**
- Check Firestore security rules
- Ensure user is authenticated
- Verify the document path exists

### Issue 3: "Firebase project not found"
**Solution:**
- Verify PROJECT_ID in environment variables
- Check if the project exists in Firebase Console
- Ensure API keys are correct

### Issue 4: Authentication errors
**Solution:**
- Enable Email/Password auth in Firebase Console
- Check if users are being created successfully
- Verify auth domain in environment variables

## Testing the Setup

1. **Test Authentication:**
   - Register a new user
   - Login with existing credentials
   - Check Firebase Console → Authentication → Users

2. **Test Firestore:**
   - Try booking a seat
   - Check Firebase Console → Firestore Database → Data
   - Verify collections are being created

3. **Test Real-time Updates:**
   - Open multiple browser tabs
   - Select seats in one tab
   - Check if changes reflect in other tabs

## Production Considerations

1. **Security Rules:** Update rules for production use
2. **Billing:** Set up billing alerts in Google Cloud Console
3. **Performance:** Enable persistence for offline support
4. **Monitoring:** Set up Firebase Analytics and Crashlytics

Need help? Check the console for specific error messages and refer to [Firebase Documentation](https://firebase.google.com/docs).
