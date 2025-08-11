# 🚀 EventConnect - Vercel Deployment Guide

## Quick Deployment Steps

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Deploy from Project Directory
```bash
cd eventconnect
vercel
```

### 4. Follow the Prompts
- **Set up and deploy?** → Y
- **Which scope?** → Select your account
- **Link to existing project?** → N (for new deployment)
- **What's your project's name?** → eventconnect (or your preferred name)
- **In which directory is your code located?** → ./ (current directory)

### 5. Set Environment Variables in Vercel Dashboard

After deployment, go to your Vercel dashboard → Project → Settings → Environment Variables

Add these variables:

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

### 6. Redeploy with Environment Variables
```bash
vercel --prod
```

## 🔧 Firebase Configuration

### Update Firebase Auth Domains
1. Go to Firebase Console → Authentication → Settings → Authorized domains
2. Add your Vercel domain: `your-project-name.vercel.app`

### Firebase Security Rules

#### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /events/{eventId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
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

## ✅ Deployment Checklist

- [x] Build passes locally (`npm run build`)
- [x] Environment variables configured
- [x] Firebase project configured
- [x] Vercel CLI installed
- [x] Firebase Auth domains updated
- [x] Security rules configured

## 🌐 Post-Deployment

Your app will be available at: `https://your-project-name.vercel.app`

### Test These Features:
1. User authentication (sign up/login)
2. Admin dashboard access
3. Event creation (admin)
4. Event viewing (users)
5. Feedback submission

## 🎉 Success!

Your EventConnect app is now live on Vercel with:
- ✅ User authentication
- ✅ Admin dashboard
- ✅ Event management
- ✅ Feedback system
- ✅ Real-time database
- ✅ Beautiful UI
- ✅ Mobile responsive design

## 📞 Support

If you encounter any issues:
1. Check Vercel deployment logs
2. Verify environment variables
3. Check Firebase console for errors
4. Ensure all domains are authorized in Firebase
