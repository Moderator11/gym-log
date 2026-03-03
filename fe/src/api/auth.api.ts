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
};
