"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, googleProvider, db, rtdb } from "@/lib/firebase";
import { User, AuthContextType, Role } from "@/types";
import toast from "react-hot-toast";
import { ref as dbRef, push as dbPush, set as dbSet } from "firebase/database";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    if (!auth || !db) {
      console.warn("Firebase not properly initialized. Auth will not work.");
      setUser(null);
      setLoading(false);
      return;
    }

    // Handle redirect results from Google sign-in
    const handleRedirectResult = async () => {
      if (!auth) return;
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          // Handle the redirect result similar to popup result
          const desiredRole = localStorage.getItem("lastDesiredRole") as Role || "user";
          localStorage.setItem('justSignedIn', 'true');

          // Create/update user document
          try {
            const userRef = doc(db, "users", result.user.uid);
            const userSnap = await getDoc(userRef);
            if (!userSnap.exists()) {
              const userData = {
                uid: result.user.uid,
                email: result.user.email,
                displayName: result.user.displayName,
                role: desiredRole,
                photoURL: result.user.photoURL,
                createdAt: serverTimestamp(),
              };
              await setDoc(userRef, userData);
            } else if (desiredRole && userSnap.data()?.role !== desiredRole) {
              await setDoc(userRef, { role: desiredRole }, { merge: true });
            }
          } catch (dbError) {
            console.log("Database operation failed after redirect:", dbError);
          }
        }
      } catch (error) {
        console.error("Redirect result error:", error);
      }
    };

    handleRedirectResult();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get additional user data from Firestore with retry for new users
          let userData = null;
          let retries = 0;
          const maxRetries = 3;

          while (retries < maxRetries) {
            const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
            userData = userDoc.data();

            if (userData) {
              break; // Found the user data
            }

            // If no data found, wait a bit and retry (for new users)
            retries++;
            if (retries < maxRetries) {
              console.log(`User data not found, retrying... (${retries}/${maxRetries})`);
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          }

          console.log("Firestore user data:", userData);
          console.log("User role from Firestore:", userData?.role);

          const user: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email!,
            displayName: firebaseUser.displayName || userData?.displayName || "",
            role: (userData?.role as Role) || "user",
            photoURL: firebaseUser.photoURL || userData?.photoURL,
            createdAt: userData?.createdAt || serverTimestamp(),
          };

          console.log("Final user object with role:", user.role);

          setUser(user);

          // Show appropriate welcome message
          if (localStorage.getItem('justSignedIn') === 'true') {
            localStorage.removeItem('justSignedIn');
            toast.success("Welcome back!");
          } else if (localStorage.getItem('justSignedUp') === 'true') {
            localStorage.removeItem('justSignedUp');
            toast.success("Account created successfully! Welcome to EventConnect!");
          }
        } catch (err) {
          // Offline or Firestore unavailable: fall back to auth user only
          let desiredRole: Role | undefined = undefined;
          try {
            if (typeof window !== "undefined") {
              const stored = window.localStorage.getItem("lastDesiredRole");
              if (stored === "admin" || stored === "user") desiredRole = stored as Role;
            }
          } catch {}
          setUser((prev) => {
            const fallbackUser: User = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              displayName: firebaseUser.displayName || prev?.displayName || "",
              role: desiredRole ?? prev?.role ?? "user",
              photoURL: firebaseUser.photoURL || prev?.photoURL || undefined,
              createdAt: serverTimestamp(),
            };
            return fallbackUser;
          });
        }
      } else {
        // No authenticated user - ensure user state is cleared
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logLoginActivity = async (firebaseUser: FirebaseUser) => {
    if (!rtdb) return; // Skip if Firebase not initialized
    try {
      const activityRef = dbRef(rtdb, "recentLogins");
      const itemRef = dbPush(activityRef);
      await dbSet(itemRef, {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || "",
        when: new Date().toISOString(),
      });
    } catch (e) {
      // Silent fail; do not bother user
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!auth) {
      toast.error("Authentication not available. Please check Firebase configuration.");
      return;
    }
    try {
      setIsSigningIn(true);
      setLoading(true);

      const cred = await signInWithEmailAndPassword(auth, email, password);
      localStorage.setItem('justSignedIn', 'true'); // Flag to show welcome message

      await logLoginActivity(cred.user);
      // Success message will be shown in onAuthStateChanged
    } catch (error: any) {
      console.error("Sign-in error:", error);
      if (error.code === 'auth/user-not-found') {
        toast.error("No account found with this email address");
      } else if (error.code === 'auth/wrong-password') {
        toast.error("Incorrect password");
      } else if (error.code === 'auth/invalid-credential') {
        toast.error("Invalid email or password. Please check your credentials and try again.");
      } else if (error.code === 'auth/invalid-email') {
        toast.error("Invalid email address");
      } else if (error.code === 'auth/too-many-requests') {
        toast.error("Too many failed attempts. Please try again later.");
      } else if (error.code === 'auth/user-disabled') {
        toast.error("This account has been disabled. Please contact support.");
      } else {
        toast.error("We couldn't sign you in. Please try again.");
      }
      throw error;
    } finally {
      setLoading(false);
      setIsSigningIn(false);
    }
  };

  const signUp = async (email: string, password: string, displayName: string, role: Role = "user") => {
    console.log("SignUp called with:", { email, displayName, role });

    if (!auth || !db) {
      console.error("Firebase not initialized:", { auth: !!auth, db: !!db });
      toast.error("Authentication not available. Please check Firebase configuration.");
      return;
    }
    try {
      setIsSigningIn(true);
      setLoading(true);
      console.log("Creating user with Firebase...");
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
      console.log("Firebase user created:", firebaseUser.uid);

      localStorage.setItem('justSignedUp', 'true'); // Flag to show welcome message for new users

      // Update the user's display name (best-effort)
      try { await updateProfile(firebaseUser, { displayName }); } catch {}

      // Create user document in Firestore - CRITICAL for role assignment
      console.log("Writing user data to Firestore with role:", role);
      const userData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName,
        role, // This is the critical field
        photoURL: firebaseUser.photoURL,
        createdAt: serverTimestamp(),
      };

      try {
        await setDoc(doc(db, "users", firebaseUser.uid), userData);
        console.log("User data written to Firestore successfully");

        // Verify the write by reading it back
        const verifyDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        const verifyData = verifyDoc.data();
        console.log("Verification read from Firestore:", verifyData);
        console.log("Verified role:", verifyData?.role);
      } catch (dbErr) {
        console.error("CRITICAL: Firestore write failed:", dbErr);
        // If Firestore write fails, we should probably delete the Firebase user
        throw new Error("Failed to save user data. Please try again.");
      }
      await logLoginActivity(firebaseUser);

      // Manually set the user with correct role to ensure immediate routing
      const newUser: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        displayName,
        role, // Use the role passed to this function
        photoURL: firebaseUser.photoURL,
        createdAt: new Date(),
      };

      console.log("Setting user manually with role:", role);
      setUser(newUser);

      // IMMEDIATE ROUTING BASED ON ROLE
      console.log("Routing user based on role:", role);
      if (typeof window !== "undefined") {
        if (role === "admin") {
          console.log("Redirecting admin to /admindashboard");
          window.location.href = "/admindashboard";
        } else {
          console.log("Redirecting user to /userdashboard");
          window.location.href = "/userdashboard";
        }
      }

      // Success message will be shown in onAuthStateChanged
    } catch (error: any) {
      toast.error("We couldn't create your account. Please try again.");
      throw error;
    } finally {
      setLoading(false);
      setIsSigningIn(false);
    }
  };

  const signInWithGoogle = async (desiredRole?: Role) => {
    if (!auth || !googleProvider) {
      toast.error("Google authentication not available. Please check Firebase configuration.");
      return;
    }
    try {
      setIsSigningIn(true);
      setLoading(true);

      // Configure Google provider with additional settings
      googleProvider.setCustomParameters({
        prompt: 'select_account'
      });

      try {
        if (typeof window !== "undefined" && desiredRole) {
          window.localStorage.setItem("lastDesiredRole", desiredRole);
        }
      } catch {}

      let firebaseUser;
      try {
        // Try popup first
        const result = await signInWithPopup(auth, googleProvider);
        firebaseUser = result.user;
      } catch (popupError: any) {
        if (popupError.code === 'auth/popup-blocked') {
          // Fallback to redirect if popup is blocked
          toast("Popup blocked. Redirecting to Google sign-in...");
          await signInWithRedirect(auth, googleProvider);
          return; // The redirect will handle the rest
        }
        throw popupError; // Re-throw other errors
      }

      localStorage.setItem('justSignedIn', 'true'); // Flag for Google sign-in

      // Ensure user document exists and immediately reflects the selected role
      try {
        const userRef = doc(db, "users", firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          const userData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            role: desiredRole ?? ("user" as Role),
            photoURL: firebaseUser.photoURL,
            createdAt: serverTimestamp(),
          };
          await setDoc(userRef, userData);
        } else if (desiredRole && userSnap.data()?.role !== desiredRole) {
          // Merge the chosen role so Admin/User selection takes effect immediately
          await setDoc(userRef, { role: desiredRole }, { merge: true });
        }
      } catch (dbError) {
        console.log("Database operation failed, but auth succeeded:", dbError);
        // Continue anyway since auth was successful
      }

      // Reflect the chosen role immediately in local state
      try {
        const userRef = doc(db, "users", firebaseUser.uid);
        const updatedSnap = await getDoc(userRef);
        const updatedRole = (updatedSnap.data()?.role as Role) || desiredRole || "user";
        setUser((prev) => {
          if (!prev) return prev;
          if (prev.uid !== firebaseUser.uid) return prev;
          return { ...prev, role: updatedRole } as User;
        });
      } catch {}

      // Success message will be shown in onAuthStateChanged
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      if (error.code === 'auth/popup-closed-by-user') {
        toast.error("Sign-in was cancelled");
      } else if (error.code === 'auth/popup-blocked') {
        toast.error("Popup was blocked. Please allow popups and try again.");
      } else {
        toast.error("Failed to sign in with Google. Please try again.");
      }
      throw error;
    } finally {
      setLoading(false);
      setIsSigningIn(false);
    }
  };

  const signOut = async () => {
    if (!auth) {
      toast.error("Authentication not available.");
      return;
    }
    try {
      await firebaseSignOut(auth);
      // Clear any cached data
      setUser(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("lastDesiredRole");
        localStorage.removeItem("justSignedIn");
        localStorage.removeItem("justSignedUp");
      }
      toast.success("Signed out successfully");
    } catch (error: any) {
      toast.error("We couldn't sign you out. Please try again.");
      throw error;
    }
  };

  // Force clear authentication state (for debugging)
  const clearAuthState = () => {
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("lastDesiredRole");
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
