import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { initializeFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "demo-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "demo-project.firebaseapp.com",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://demo-project-default-rtdb.firebaseio.com/",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "demo-project.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:123456789:web:abcdef",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-XXXXXXXXXX",
};

// Check if Firebase is properly configured
const isFirebaseConfigured = process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== "your-api-key-here" &&
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== "demo-api-key";

if (!isFirebaseConfigured) {
  console.warn("⚠️  Firebase is not properly configured. Please update your .env.local file with your Firebase credentials.");
  console.warn("📝 Copy .env.example to .env.local and add your Firebase project credentials.");
} else {
  console.log("✅ Firebase is properly configured and ready to use!");
}

// Initialize Firebase
let app;
try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
} catch (error) {
  console.error("Failed to initialize Firebase:", error);
  // Create a mock app for development
  app = null;
}

// Add global error handler for unhandled promise rejections
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    console.warn('Unhandled promise rejection:', event.reason);
    // Prevent the default behavior (logging to console)
    event.preventDefault();
  });
}

// Initialize Firebase services with error handling
export const auth = app ? getAuth(app) : null;

let db = null;
if (app) {
  try {
    db = initializeFirestore(app, {
      experimentalAutoDetectLongPolling: true,
      useFetchStreams: false,
    });
  } catch (error) {
    console.warn("Failed to initialize Firestore:", error);
    // Try to get existing Firestore instance
    try {
      const { getFirestore } = require("firebase/firestore");
      db = getFirestore(app);
    } catch (fallbackError) {
      console.warn("Failed to get Firestore instance:", fallbackError);
      db = null;
    }
  }
}
export { db };

export const storage = app ? getStorage(app) : null;
export const rtdb = app ? getDatabase(app) : null;

// Configure Google Auth Provider
export const googleProvider = auth ? new GoogleAuthProvider() : null;
if (googleProvider) {
  googleProvider.setCustomParameters({
    prompt: "select_account",
  });
}

// Connect to emulators in development
if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
  // Only connect to emulators if not already connected
  try {
    // Uncomment these lines if you want to use Firebase emulators
    // connectFirestoreEmulator(db, "localhost", 8080);
    // connectStorageEmulator(storage, "localhost", 9199);
  } catch (error) {
    console.log("Emulators already connected or not available");
  }
}

export default app;
