import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { useMemo, useRef, useEffect } from "react";

export const useApi = (): AxiosInstance => {
  const { accessToken, refreshAccessToken, logout } = useAuth();
  const tokenRef = useRef(accessToken);

  useEffect(() => {
    tokenRef.current = accessToken;
  }, [accessToken]);

  return useMemo(() => {
    const instance = axios.create({
      baseURL: "http://localhost:8000",
      headers: { "Content-Type": "application/json" },
    });

    instance.interceptors.request.use((config) => {
      if (tokenRef.current) {
        config.headers!["Authorization"] = `Bearer ${tokenRef.current}`;
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
          console.log("Refreshed token:", newToken);
          if (newToken) {
            tokenRef.current = newToken;
            originalRequest.headers = {
              ...originalRequest.headers,
              Authorization: `Bearer ${newToken}`,
            };
            return instance.request(originalRequest);
          } else {
            logout();
          }
        }
        return Promise.reject(error);
      }
    );

    return instance;
  }, [refreshAccessToken, logout]);
};