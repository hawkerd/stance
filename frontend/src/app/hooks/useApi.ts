// src/hooks/useApi.ts
import axios, { AxiosInstance } from "axios";
import { useMemo } from "react";

export const useApi = (): AxiosInstance => {
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "";

  return useMemo(() => {
    return axios.create({
      baseURL: API_BASE,
      headers: { "Content-Type": "application/json" },
    });
  }, []);
};
