"use client";

import { createContext, useState, useEffect, ReactNode, useContext, use } from "react";
import { components } from "@/api/models/models";
import { useApi } from "@/app/hooks/useApi";
import { authApi } from "@/api";

type TokenResponse = components["schemas"]["TokenResponse"];
type SignupResponse = components["schemas"]["SignupResponse"];
type LoginRequest = components["schemas"]["LoginRequest"];
type SignupRequest = components["schemas"]["SignupRequest"];
type RefreshRequest = components["schemas"]["RefreshRequest"];
type RefreshResponse = components["schemas"]["RefreshResponse"];

interface AuthContextType {
  accessToken: string | null;
  refreshToken: string | null;
  login: (username: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string, fullName?: string) => Promise<void>;
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
    const payload: LoginRequest = { username, password };
    const res = await authApi.login(API, payload);

    setTokens(res.access_token, res.refresh_token);
  };

  const signup = async (
    username: string,
    email: string,
    password: string,
    fullName?: string
  ) => {
    const payload: SignupRequest = { username, email, password, full_name: fullName };
    const res = await authApi.signup(API, payload);

    // Auto-login after signup
    await login(username, password);
  };

  const logout = () => {
    setTokens(null, null);
  };

  const refreshAccessToken = async (): Promise<string | null> => {
    if (!refreshToken) return null;

    try {
      const payload: RefreshRequest = { refresh_token: refreshToken };
      const res = await authApi.refreshToken(API, payload);

      setTokens(res.access_token, res.refresh_token);
      return res.access_token;
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
