import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { useMemo } from "react";

export const useApi = (): AxiosInstance => {
  const { accessToken, refreshAccessToken, logout } = useAuth();

  return useMemo(() => {
    const instance = axios.create({
      baseURL: "http://localhost:8000",
      headers: { "Content-Type": "application/json" },
    });

    instance.interceptors.request.use((config) => {
      if (accessToken) {
        config.headers!["Authorization"] = `Bearer ${accessToken}`;
      }
      return config;
    });

    instance.interceptors.response.use(
      (res) => res,
      async (error: AxiosError & { config?: any }) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          const newToken = await refreshAccessToken();
          if (newToken) {
            originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
            return instance(originalRequest);
          } else {
            logout();
          }
        }
        return Promise.reject(error);
      }
    );

    return instance;
  }, [accessToken, refreshAccessToken, logout]);
};