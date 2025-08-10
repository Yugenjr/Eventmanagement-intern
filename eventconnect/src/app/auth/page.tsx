"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/forms/login-form";
import { SignupForm } from "@/components/forms/signup-form";
import { useAuth } from "@/contexts/auth-context";
import { AuthTest } from "@/components/auth-test";
import { Calendar, Users } from "lucide-react";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/events");
    }
  }, [user, router]);

  if (user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25px 25px, rgba(255, 255, 255, 0.1) 2px, transparent 0)`,
          backgroundSize: '50px 50px'
        }} />

        <div className="relative z-10 flex flex-col justify-center items-center text-center text-white p-12">
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-sm">
            <Calendar className="w-10 h-10 text-white" />
          </div>

          <h1 className="text-5xl font-bold font-display mb-6">
            EventConnect
          </h1>

          <p className="text-xl text-white/90 max-w-md leading-relaxed mb-8">
            Create, discover, and manage amazing events with our modern platform
          </p>

          <div className="flex items-center space-x-6 text-white/80">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>10K+ Users</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>5K+ Events</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8 lg:hidden">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold font-display text-gray-900 dark:text-white">
              EventConnect
            </h1>
          </div>

          {/* Firebase Auth Test */}
          <AuthTest />

          <div className="max-w-md mx-auto mt-8">
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
