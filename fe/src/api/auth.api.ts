import apiClient from "./client";
import {
  LoginRequest,
  RegisterRequest,
  TokenResponse,
  User,
} from "@/types/auth.types";

export interface UserSettings {
  username: string;
  display_name: string;
  sharing_enabled: boolean;
  health_sharing_enabled: boolean;
  created_at: string;
}

export const authApi = {
  register: async (data: RegisterRequest): Promise<User> => {
    const response = await apiClient.post<User>("/auth/register", data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<TokenResponse> => {
    const response = await apiClient.post<TokenResponse>("/auth/login", data);
    return response.data;
  },

  getMe: async (): Promise<UserSettings> => {
    const response = await apiClient.get<UserSettings>("/auth/users/me");
    return response.data;
  },

  updateSettings: async (sharing_enabled: boolean, health_sharing_enabled: boolean): Promise<UserSettings> => {
    const response = await apiClient.put<UserSettings>("/auth/users/me/settings", {
      sharing_enabled,
      health_sharing_enabled,
    });
    return response.data;
  },

  updateDisplayName: async (display_name: string): Promise<UserSettings> => {
    const response = await apiClient.put<UserSettings>("/auth/users/me/display_name", { display_name });
    return response.data;
  },

  changePassword: async (current_password: string, new_password: string): Promise<void> => {
    await apiClient.put("/auth/users/me/password", { current_password, new_password });
  },

  deleteAccount: async (password: string): Promise<void> => {
    await apiClient.delete("/auth/users/me", { data: { password } });
  },
};
