"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { UserCircle2, Lock, Loader2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [isRegistering, setIsRegistering] = useState(false);
  const { login, register, isLoggingIn, isRegistering: isSubmitting, error, clearError } = useAuth();

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    clearError();
    if (isRegistering) {
      await register({
        ...data,
        name: data.email.split("@")[0],
        nativeLanguage: "en",
        targetLanguage: "es",
        proficiencyLevel: "Beginner",
      });
    } else {
      await login(data);
    }
  };

  return (
    <div className="card">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {isRegistering ? "Create Account" : "Welcome Back"}
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-error-50 text-error-600 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <div className="relative">
            <UserCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              {...registerField("email")}
              type="email"
              placeholder="you@example.com"
              className="pl-10"
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-error-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              {...registerField("password")}
              type="password"
              placeholder="Enter your password"
              className="pl-10"
            />
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-error-600">{errors.password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoggingIn || isSubmitting}
        >
          {isLoggingIn || isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {isRegistering ? "Creating account..." : "Signing in..."}
            </>
          ) : (
            isRegistering ? "Create Account" : "Sign In"
          )}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={() => setIsRegistering(!isRegistering)}
          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
        >
          {isRegistering
            ? "Already have an account? Sign in"
            : "Don't have an account? Create one"}
        </button>
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        Demo credentials: demo@example.com / password
      </div>
    </div>
  );
}
