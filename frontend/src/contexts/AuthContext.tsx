"use client";

import { createContext, useState, useEffect, ReactNode, useContext } from "react";
import { useApi } from "@/app/hooks/useApi";
import { AuthService } from "@/service/AuthService";
import { User } from "@/models/index";

interface AuthContextType {
  accessToken: string | null;
  refreshToken: string | null;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<string | null>;
  isAuthenticated: boolean;
  initialized: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const API = useApi();
  const authService = new AuthService();

  const setTokens = (access: string | null, refresh: string | null) => {
    setAccessToken(access);
    setRefreshToken(refresh);
    if (access) localStorage.setItem("accessToken", access);
    else localStorage.removeItem("accessToken");
    if (refresh) localStorage.setItem("refreshToken", refresh);
    else localStorage.removeItem("refreshToken");
  };

  useEffect(() => {
    const storedAccess = localStorage.getItem("accessToken");
    const storedRefresh = localStorage.getItem("refreshToken");
    setTokens(storedAccess, storedRefresh);
    setInitialized(true);
  }, []);

  const login = async (username: string, password: string) => {
    const res = await authService.login(API, username, password);

    setTokens(res.accessToken, res.refreshToken);
  };

  const signup = async (
    username: string,
    email: string,
    password: string,
    fullName: string
  ) => {
    const res: User = await authService.signup(API, username, password, email, fullName);

    // Auto-login after signup
    await login(username, password);
  };

  const logout = () => {
    setTokens(null, null);
  };

  const refreshAccessToken = async (): Promise<string | null> => {
    if (!refreshToken) return null;

    try {
      const res = await authService.refreshToken(API, refreshToken);

      setTokens(res.accessToken, res.refreshToken);
      return res.accessToken;
    } catch {
      logout();
      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        accessToken,
        refreshToken,
        login,
        signup,
        logout,
        refreshAccessToken,
        isAuthenticated: !!accessToken,
        initialized,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
