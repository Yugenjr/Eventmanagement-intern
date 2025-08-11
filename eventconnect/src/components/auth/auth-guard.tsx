"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredRole?: "admin" | "user";
  redirectTo?: string;
}

export function AuthGuard({ 
  children, 
  requireAuth = true, 
  requiredRole,
  redirectTo = "/auth" 
}: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // Wait for auth to load

    // If authentication is required but user is not signed in
    if (requireAuth && !user) {
      router.push(redirectTo);
      return;
    }

    // If specific role is required but user doesn't have it
    if (requiredRole && user && user.role !== requiredRole) {
      // Redirect based on user's actual role
      if (user.role === "admin") {
        router.push("/admindashboard");
      } else {
        router.push("/userdashboard");
      }
      return;
    }

    // If user is signed in but trying to access auth page
    if (!requireAuth && user) {
      if (user.role === "admin") {
        router.push("/admindashboard");
      } else {
        router.push("/userdashboard");
      }
      return;
    }
  }, [user, loading, requireAuth, requiredRole, redirectTo, router]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't render children if auth requirements aren't met
  if (requireAuth && !user) {
    return null;
  }

  if (requiredRole && user && user.role !== requiredRole) {
    return null;
  }

  if (!requireAuth && user) {
    return null;
  }

  return <>{children}</>;
}
