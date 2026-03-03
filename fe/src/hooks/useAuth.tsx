import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authApi } from "@/api/auth.api";
import { AuthContextType, User } from "@/types/auth.types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await authApi.login({ username, password });
      const { access_token } = response;

      localStorage.setItem("token", access_token);
      setToken(access_token);

      // 실제로는 사용자 정보를 가져오는 API가 필요하지만, 여기서는 간단히 처리
      setUser({ id: 0, username, created_at: new Date().toISOString() });
    } catch (error) {
      throw new Error("로그인에 실패했습니다");
    }
  };

  const register = async (username: string, password: string) => {
    try {
      const user = await authApi.register({ username, password });
      console.log(user);
      // 회원가입 후 자동 로그인
      await login(username, password);
    } catch (error) {
      throw new Error("회원가입에 실패했습니다");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
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
