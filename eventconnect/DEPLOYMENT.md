# EventConnect - Vercel Deployment Guide

## 🚀 Deploy to Vercel

### Prerequisites
1. GitHub account
2. Vercel account (sign up at vercel.com)
3. Firebase project with Realtime Database enabled

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Deploy to Vercel

#### Option A: Vercel CLI (Recommended)
1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

#### Option B: Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure environment variables (see below)
5. Click "Deploy"

### Step 3: Configure Environment Variables

In Vercel Dashboard → Project → Settings → Environment Variables, add:

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCV6sScyCND6Y1ZX9syYHHuiUagEEgeZP0
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=event-d540a.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://event-d540a-default-rtdb.asia-southeast1.firebasedatabase.app
NEXT_PUBLIC_FIREBASE_PROJECT_ID=event-d540a
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=event-d540a.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=617216950786
NEXT_PUBLIC_FIREBASE_APP_ID=1:617216950786:web:c4cf3adc1c95314cd69d1b
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-K5KBNZTF5Z
```

### Step 4: Configure Firebase Security Rules

#### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Events - public read, authenticated write
    match /events/{eventId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Registrations - users can manage their own
    match /registrations/{registrationId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

#### Realtime Database Rules
```json
{
  "rules": {
    "events": {
      ".read": true,
      ".write": "auth != null"
    },
    "feedback": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "registrations": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

### Step 5: Test Deployment

1. Visit your Vercel URL
2. Test user registration/login
3. Test event creation
4. Test feedback submission
5. Test admin dashboard

### 🔧 Troubleshooting

#### Build Errors
- Check Node.js version (use Node 18+)
- Clear `.next` folder and rebuild
- Check for TypeScript errors

#### Firebase Connection Issues
- Verify environment variables are set correctly
- Check Firebase project settings
- Ensure Realtime Database is enabled

#### Authentication Issues
- Add your Vercel domain to Firebase Auth authorized domains
- Check Firebase Auth configuration

### 🌐 Production URLs

After deployment, your app will be available at:
- Main URL: `https://your-project-name.vercel.app`
- Admin Dashboard: `https://your-project-name.vercel.app/admindashboard`
- User Dashboard: `https://your-project-name.vercel.app/userdashboard`

### 📊 Features Available in Production

✅ **User Features:**
- User registration/login
- Event browsing and registration
- Feedback submission
- Personal dashboard

✅ **Admin Features:**
- Admin dashboard with real-time data
- Event management (create, edit, delete)
- User feedback monitoring
- Registration analytics

✅ **Real-time Features:**
- Live event updates
- Real-time registration counts
- Instant feedback notifications
- Cross-user synchronization

### 🔐 Security Features

✅ **Authentication:**
- Firebase Auth integration
- Role-based access control
- Protected admin routes

✅ **Data Security:**
- Firestore security rules
- RTDB access controls
- Environment variable protection

### 📱 Responsive Design

✅ **Mobile Optimized:**
- Responsive layouts
- Touch-friendly interfaces
- Mobile navigation
- Optimized performance

---

## 🎉 Your EventConnect app is now live on Vercel!

Share your deployment URL and start managing events with real-time functionality!
