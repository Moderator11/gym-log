import apiClient from "./client";
import {
  LoginRequest,
  RegisterRequest,
  TokenResponse,
  User,
} from "@/types/auth.types";

export const authApi = {
  register: async (data: RegisterRequest): Promise<User> => {
    const response = await apiClient.post<User>("/auth/register", data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<TokenResponse> => {
    const response = await apiClient.post<TokenResponse>("/auth/login", data);
    return response.data;
  },
};
