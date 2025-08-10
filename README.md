# EventConnect 🎉

A modern, real-time event management application built with Next.js 15, Firebase, and Tailwind CSS. Create, discover, and manage events with seamless user experience and real-time updates.

![EventConnect](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## ✨ Features

### 🔐 Authentication
- **Firebase Authentication** with email/password and Google sign-in
- **Protected routes** and user session management
- **Beautiful auth forms** with form validation

### 📅 Event Management
- **Create events** with rich descriptions, images, and metadata
- **Edit and delete** your own events
- **Event categories** and tagging system
- **Image upload** for event banners
- **Public/private** event visibility

### 🔍 Discovery & Search
- **Browse events** with grid and list views
- **Advanced search** by title, description, and location
- **Filter by category** and date ranges
- **Sort by date**, popularity, or creation time
- **Responsive pagination**

### 👥 Registration System
- **One-click registration** for events
- **Registration limits** and capacity management
- **Real-time attendee counts**
- **Attendee lists** with user profiles

### 📊 Dashboard
- **Personal dashboard** for event creators
- **Event analytics** and registration statistics
- **Manage created events** and registrations
- **Quick actions** for editing and deleting

### 🎨 Modern UI/UX
- **Beautiful, responsive design** with Tailwind CSS
- **Dark/light mode** toggle
- **Smooth animations** and transitions
- **Mobile-first** responsive design
- **Accessible components** with Radix UI

### ⚡ Real-time Features
- **Live registration updates**
- **Real-time attendee counts**
- **Instant notifications** with toast messages

## 🚀 Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Backend**: Firebase (Auth, Firestore, Storage)
- **UI Components**: Radix UI, Headless UI, Lucide Icons
- **Forms**: React Hook Form with Zod validation
- **Styling**: Tailwind CSS with custom design system
- **Deployment**: Vercel (ready)

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/eventconnect.git
   cd eventconnect
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication (Email/Password and Google)
   - Create a Firestore database
   - Enable Storage
   - Copy your Firebase config

4. **Environment Variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 Key Features Implemented

- ✅ **Complete Authentication System**
- ✅ **Event CRUD Operations**
- ✅ **Advanced Search & Filtering**
- ✅ **Registration Management**
- ✅ **Real-time Updates**
- ✅ **Responsive Dashboard**
- ✅ **Modern UI Components**
- ✅ **Dark/Light Mode**
- ✅ **Image Upload**
- ✅ **Form Validation**

## 🔧 Firebase Setup Instructions

### 1. Firebase Project Setup
Your Firebase project is already configured with these settings:
- **Project ID**: `event-d540a`
- **Auth Domain**: `event-d540a.firebaseapp.com`
- **Storage Bucket**: `event-d540a.firebasestorage.app`

### 2. Enable Authentication
1. Go to [Firebase Console](https://console.firebase.google.com/project/event-d540a)
2. Navigate to **Authentication** > **Sign-in method**
3. Enable **Email/Password** authentication
4. Enable **Google** authentication
5. Add your domain to authorized domains

### 3. Set up Firestore Database
1. Go to **Firestore Database**
2. Create database in **production mode**
3. Choose your preferred location
4. Apply the security rules below

### 4. Enable Storage
1. Go to **Storage**
2. Get started with default rules
3. Apply the storage rules below

### 5. Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Events are readable by all, writable by authenticated users
    match /events/{eventId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null &&
        request.auth.uid == resource.data.createdBy;

      // Event registrations
      match /registrations/{userId} {
        allow read: if true;
        allow write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

### 6. Storage Security Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /events/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## 🚀 Deployment

### Deploy to Vercel
1. Push to GitHub
2. Connect repository to Vercel
3. Add environment variables (already configured in `.env.local`)
4. Deploy automatically

### Environment Variables for Production
```env
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCV6sScyCND6Y1ZX9syYHHuiUagEEgeZP0
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=event-d540a.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://event-d540a-default-rtdb.asia-southeast1.firebasedatabase.app
NEXT_PUBLIC_FIREBASE_PROJECT_ID=event-d540a
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=event-d540a.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=617216950786
NEXT_PUBLIC_FIREBASE_APP_ID=1:617216950786:web:c4cf3adc1c95314cd69d1b
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-K5KBNZTF5Z
```

## ✨ Enhanced UI Features

- **Glass Morphism Effects** - Modern translucent design elements
- **Gradient Animations** - Beautiful color transitions and effects
- **Hover Animations** - Interactive lift and glow effects
- **Particle Backgrounds** - Subtle animated background patterns
- **Enhanced Typography** - Gradient text and improved font hierarchy
- **Responsive Design** - Optimized for all screen sizes
- **Dark/Light Mode** - Seamless theme switching

---

Built with ❤️ using Next.js 15, Firebase, and Tailwind CSS
