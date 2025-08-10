"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSwitchToSignup: () => void;
}

export function LoginForm({ onSwitchToSignup }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signInWithGoogle } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      await signIn(data.email, data.password);
    } catch (error) {
      // Error is handled in the auth context
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <Card className="w-full bg-white/95 dark:bg-gray-900/70 border border-white/10 shadow-2xl backdrop-blur-md">
      <CardHeader className="space-y-1 text-center pb-6">
        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white font-display">
          Welcome back
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-300">
          Sign in to your account to continue
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="w-full h-11 text-base border-2 border-white/20 hover:bg-white/40 dark:hover:bg-white/10"
            onClick={() => signInWithGoogle("user")}
            disabled={isLoading}
          >
            <FcGoogle className="mr-3 h-5 w-5" />
            Continue as User
          </Button>
          <Button
            variant="outline"
            className="w-full h-11 text-base border-2 border-white/20 hover:bg-white/40 dark:hover:bg-white/10"
            onClick={() => signInWithGoogle("admin")}
            disabled={isLoading}
          >
            <FcGoogle className="mr-3 h-5 w-5" />
            Continue as Admin
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-white/20" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-transparent px-2 text-white/70">Or sign in with email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-white/60" />
              <Input
                {...register("email")}
                type="email"
                placeholder="Enter your email"
                className="pl-10 bg-white/70 dark:bg-white/5 border-white/20 text-gray-900 dark:text-white placeholder:text-gray-500"
                error={errors.email?.message}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-white/60" />
              <Input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="pl-10 pr-10 bg-white/70 dark:bg-white/5 border-white/20 text-gray-900 dark:text-white placeholder:text-gray-500"
                error={errors.password?.message}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-white/60 hover:text-white"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full h-11" loading={isLoading}>
            Sign In
          </Button>
        </form>

        <div className="text-center text-sm text-white/80">
          <span className="">Don't have an account? </span>
          <button
            onClick={onSwitchToSignup}
            className="text-white hover:underline font-medium"
          >
            Sign up
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
