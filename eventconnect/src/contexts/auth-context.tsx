"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get additional user data from Firestore
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          const userData = userDoc.data();

          const user: User = {
            uid: firebaseUser.uid,
            email: firebaseUser.email!,
            displayName: firebaseUser.displayName || userData?.displayName || "",
            role: (userData?.role as Role) || "user",
            photoURL: firebaseUser.photoURL || userData?.photoURL,
            createdAt: userData?.createdAt || serverTimestamp(),
          };

          setUser(user);
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
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logLoginActivity = async (firebaseUser: FirebaseUser) => {
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
    try {
      setLoading(true);
      const cred = await signInWithEmailAndPassword(auth, email, password);
      await logLoginActivity(cred.user);
      toast.success("Welcome back!");
    } catch (error: any) {
      console.error("Sign-in error:", error);
      if (error.code === 'auth/user-not-found') {
        toast.error("No account found with this email address");
      } else if (error.code === 'auth/wrong-password') {
        toast.error("Incorrect password");
      } else if (error.code === 'auth/invalid-email') {
        toast.error("Invalid email address");
      } else if (error.code === 'auth/too-many-requests') {
        toast.error("Too many failed attempts. Please try again later.");
      } else {
        toast.error("We couldn't sign you in. Please try again.");
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, displayName: string, role: Role = "user") => {
    try {
      setLoading(true);
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);

      // Update the user's display name (best-effort)
      try { await updateProfile(firebaseUser, { displayName }); } catch {}

      // Create user document in Firestore
      try {
        const userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName,
          role,
          photoURL: firebaseUser.photoURL,
          createdAt: serverTimestamp(),
        };
        await setDoc(doc(db, "users", firebaseUser.uid), userData);
      } catch (dbErr) {
        console.warn("User created but Firestore write failed (offline?):", dbErr);
      }
      await logLoginActivity(firebaseUser);
      toast.success("Account created successfully!");
    } catch (error: any) {
      toast.error("We couldn't create your account. Please try again.");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async (desiredRole?: Role) => {
    try {
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

      const { user: firebaseUser } = await signInWithPopup(auth, googleProvider);

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

      toast.success("Welcome to EventConnect!");
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
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      toast.success("Signed out successfully");
    } catch (error: any) {
      toast.error("We couldn't sign you out. Please try again.");
      throw error;
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
