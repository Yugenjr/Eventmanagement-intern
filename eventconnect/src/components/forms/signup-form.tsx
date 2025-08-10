"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

const signupSchema = z.object({
  displayName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  role: z.enum(["user", "admin"]).default("user"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormData = z.infer<typeof signupSchema>;

interface SignupFormProps {
  onSwitchToLogin: () => void;
}

function RoleToggle({ registerRole }: { registerRole: any }) {
  const [role, setRole] = useState<"user" | "admin">("user");
  return (
    <>
      <input type="radio" value="user" {...registerRole} checked={role === 'user'} onChange={() => setRole('user')} className="hidden" />
      <input type="radio" value="admin" {...registerRole} checked={role === 'admin'} onChange={() => setRole('admin')} className="hidden" />
      <Button
        type="button"
        variant="outline"
        className={`h-10 border-2 ${role === 'user' ? 'bg-blue-600 text-white border-blue-600 ring-2 ring-blue-300/60 dark:ring-blue-400/50' : 'border-white/20 text-white/80 hover:bg-white/40 dark:hover:bg-white/10'}`}
        onClick={() => setRole('user')}
      >
        User
      </Button>
      <Button
        type="button"
        variant="outline"
        className={`h-10 border-2 ${role === 'admin' ? 'bg-purple-600 text-white border-purple-600 ring-2 ring-purple-300/60 dark:ring-purple-400/50' : 'border-white/20 text-white/80 hover:bg-white/40 dark:hover:bg-white/10'}`}
        onClick={() => setRole('admin')}
      >
        Admin
      </Button>
    </>
  );
}

export function SignupForm({ onSwitchToLogin }: SignupFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signUp, signInWithGoogle } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormData) => {
    try {
      setIsLoading(true);
      await signUp(data.email, data.password, data.displayName, data.role);
    } catch (error) {
      // Error is handled in the auth context
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignInAs = async (role: "user" | "admin") => {
    try {
      setIsLoading(true);
      await signInWithGoogle(role);
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
          Create account
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-300">
          Join our community and start creating amazing events
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="w-full h-11 text-base border-2 border-white/20 hover:bg-white/40 dark:hover:bg-white/10"
            onClick={() => handleGoogleSignInAs("user")}
            disabled={isLoading}
          >
            <FcGoogle className="mr-3 h-5 w-5" />
            Sign up as User
          </Button>
          <Button
            variant="outline"
            className="w-full h-11 text-base border-2 border-white/20 hover:bg-white/40 dark:hover:bg-white/10"
            onClick={() => handleGoogleSignInAs("admin")}
            disabled={isLoading}
          >
            <FcGoogle className="mr-3 h-5 w-5" />
            Sign up as Admin
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-white/20" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-transparent px-2 text-white/70">Or continue with email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-white/60" />
              <Input
                {...register("displayName")}
                type="text"
                placeholder="Enter your full name"
                className="pl-10 bg-white/70 dark:bg-white/5 border-white/20 text-gray-900 dark:text-white placeholder:text-gray-500"
                error={errors.displayName?.message}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Role</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <RoleToggle registerRole={register("role")} />
              </div>
            </div>
          </div>

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
                placeholder="Create a password"
                className="pl-10 pr-10 bg-white/70 dark:bg-white/5 border-white/20 text-gray-900 dark:text-white placeholder:text-gray-500"
                error={errors.password?.message}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-white/60" />
              <Input
                {...register("confirmPassword")}
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                className="pl-10 pr-10 bg-white/70 dark:bg-white/5 border-white/20 text-gray-900 dark:text-white placeholder:text-gray-500"
                error={errors.confirmPassword?.message}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full" loading={isLoading}>
            Create Account
          </Button>
        </form>

        <div className="text-center text-sm">
          <span className="text-muted-foreground">Already have an account? </span>
          <button
            onClick={onSwitchToLogin}
            className="text-primary hover:underline font-medium"
          >
            Sign in
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
