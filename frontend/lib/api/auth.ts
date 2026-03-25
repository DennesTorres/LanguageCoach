import { apiClient } from "./client";
import { User } from "@/types";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  nativeLanguage: string;
  targetLanguage: string;
  proficiencyLevel: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const authApi = {
  login: (data: LoginRequest): Promise<AuthResponse> =>
    apiClient.post<AuthResponse>("/auth/login", data),

  register: (data: RegisterRequest): Promise<AuthResponse> =>
    apiClient.post<AuthResponse>("/auth/register", data),

  getCurrentUser: (): Promise<User> =>
    apiClient.get<User>("/auth/me"),

  logout: (): void => {
    localStorage.removeItem("auth_token");
  },
};
