"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    
    if (!user) {
      // No user signed in - redirect to auth
      router.push("/auth");
    } else {
      // User is signed in - redirect to appropriate dashboard
      if (user.role === "admin") {
        router.push("/admindashboard");
      } else {
        router.push("/userdashboard");
      }
    }
  }, [user, loading, router]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't show any content - will redirect
  return null;
}
