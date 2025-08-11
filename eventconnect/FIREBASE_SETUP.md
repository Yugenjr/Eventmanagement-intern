# Firebase Setup Guide for EventConnect

## 🔥 Firebase Configuration

EventConnect requires Firebase for authentication, database, and storage. Follow these steps to set up Firebase:

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name (e.g., "eventconnect-app")
4. Enable Google Analytics (optional)
5. Click "Create project"

### 2. Enable Authentication

1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Enable the following providers:
   - **Email/Password**: Click and enable
   - **Google**: Click, enable, and add your email as authorized domain

### 3. Create Firestore Database

1. Go to **Firestore Database**
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location close to your users
5. Click "Done"

### 4. Create Realtime Database

1. Go to **Realtime Database**
2. Click "Create Database"
3. Choose "Start in test mode"
4. Select a location
5. Click "Done"

### 5. Set up Storage

1. Go to **Storage**
2. Click "Get started"
3. Choose "Start in test mode"
4. Select a location
5. Click "Done"

### 6. Get Firebase Configuration

1. Go to **Project Settings** (gear icon)
2. Scroll down to "Your apps"
3. Click "Add app" > Web app icon (`</>`)
4. Enter app nickname (e.g., "EventConnect Web")
5. Click "Register app"
6. Copy the configuration object

### 7. Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Replace the values in `.env.local` with your Firebase config:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key-here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com/
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id
   ```

### 8. Security Rules (Production)

For production, update your Firestore rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Events are readable by all authenticated users
    match /events/{eventId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (resource == null || resource.data.createdBy == request.auth.uid);
      
      // Event registrations
      match /registrations/{userId} {
        allow read: if request.auth != null;
        allow write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

### 9. Test the Setup

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open [http://localhost:3000](http://localhost:3000)
3. Try creating an account or signing in
4. Check Firebase Console to see if data is being created

## 🚨 Troubleshooting

### Common Issues:

1. **"Firebase not properly configured"**
   - Check that all environment variables are set correctly
   - Ensure `.env.local` file exists and has correct values

2. **Authentication errors**
   - Verify Email/Password and Google auth are enabled
   - Check that your domain is authorized in Firebase

3. **Database permission errors**
   - Ensure Firestore and Realtime Database are in test mode
   - Update security rules for production

4. **Storage errors**
   - Verify Firebase Storage is enabled
   - Check storage rules allow authenticated users

### Getting Help:

- Check the browser console for detailed error messages
- Verify Firebase project settings match your `.env.local`
- Ensure all Firebase services are enabled in the console

## 🎉 Success!

Once configured, EventConnect will have:
- ✅ User authentication (email/password + Google)
- ✅ Event storage and management
- ✅ User registration tracking
- ✅ File uploads for event banners
- ✅ Real-time login activity tracking
