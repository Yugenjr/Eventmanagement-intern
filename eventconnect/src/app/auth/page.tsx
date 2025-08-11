"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/forms/login-form";
import { SignupForm } from "@/components/forms/signup-form";
import { useAuth } from "@/contexts/auth-context";
import { Calendar } from "lucide-react";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  // Handle already signed in users
  useEffect(() => {
    if (user) {
      if (user.role === "admin") {
        router.push("/admindashboard");
      } else {
        router.push("/userdashboard");
      }
    }
  }, [user, router]);

  // Don't render if user is already signed in
  if (user) {
    return null;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800">
      {/* subtle dotted pattern */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle at 25px 25px, rgba(255,255,255,0.15) 2px, transparent 0)",
          backgroundSize: "50px 50px",
        }}
      />
      {/* glow blobs */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-indigo-500/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-fuchsia-500/20 blur-3xl" />

      <div className="relative z-10 flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Brand */}
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
              <Calendar className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white">EventConnect</h1>
            <p className="mt-2 text-sm text-white/70">Create, discover and manage events effortlessly</p>
          </div>

          {/* Debug Info */}
          {process.env.NODE_ENV === 'development' && user && (
            <div className="mb-4 p-3 bg-yellow-500 text-black rounded">
              <strong>DEBUG:</strong> User role = {(user as any).role || 'No role'}
            </div>
          )}
          {/* Auth */}
          <div>
            {isLogin ? (
              <LoginForm onSwitchToSignup={() => setIsLogin(false)} />
            ) : (
              <SignupForm onSwitchToLogin={() => setIsLogin(true)} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
