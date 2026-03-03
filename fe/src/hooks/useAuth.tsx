import {
  createContext,
  useContext,
  useState,

  ReactNode,
} from "react";
import { authApi } from "@/api/auth.api";
import { AuthContextType, User } from "@/types/auth.types";

const AUTH_TOKEN_KEY = "auth_token";
const AUTH_USER_KEY = "auth_user";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem(AUTH_USER_KEY);
    return stored ? (JSON.parse(stored) as User) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  });

  const persistAuth = (accessToken: string, userData: User) => {
    localStorage.setItem(AUTH_TOKEN_KEY, accessToken);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userData));
    setToken(accessToken);
    setUser(userData);
  };

  const clearAuth = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    setToken(null);
    setUser(null);
  };

  const login = async (username: string, password: string) => {
    try {
      const response = await authApi.login({ username, password });
      const userData: User = {
        id: 0,
        username,
        display_name: username,
        created_at: new Date().toISOString(),
      };
      persistAuth(response.access_token, userData);
    } catch (error) {
      throw new Error("로그인에 실패했습니다");
    }
  };

  const register = async (username: string, display_name: string, password: string) => {
    try {
      await authApi.register({ username, display_name, password });
      // 회원가입 후 자동 로그인
      await login(username, password);
    } catch (error) {
      throw new Error("회원가입에 실패했습니다");
    }
  };

  const logout = () => {
    clearAuth();
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
