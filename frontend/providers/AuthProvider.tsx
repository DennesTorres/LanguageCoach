"use client";

import { ReactNode, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { authApi } from "@/lib/api/auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const { setUser, setIsLoading } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("auth_token");
      if (token) {
        try {
          const user = await authApi.getCurrentUser();
          setUser(user);
        } catch {
          localStorage.removeItem("auth_token");
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, [setUser, setIsLoading]);

  return <>{children}</>;
}
