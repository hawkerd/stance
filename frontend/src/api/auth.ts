// src/api/auth.ts
import { AxiosInstance } from "axios";
import { components } from "@/api/models/models";

export type SignupRequest = components["schemas"]["SignupRequest"];
export type SignupResponse = components["schemas"]["SignupResponse"];
export type LoginRequest = components["schemas"]["LoginRequest"];
export type TokenResponse = components["schemas"]["TokenResponse"];
export type RefreshRequest = components["schemas"]["RefreshRequest"];
export type RefreshResponse = components["schemas"]["RefreshResponse"];
export type LogoutRequest = components["schemas"]["LogoutRequest"];
export type LogoutResponse = components["schemas"]["LogoutResponse"];

/**
 * Signup a new user
 */
export async function signup(api: AxiosInstance, data: SignupRequest): Promise<SignupResponse> {
  const res = await api.post<SignupResponse>("/auth/signup", data);
  return res.data;
}

/**
 * Login with username/password
 */
export async function login(api: AxiosInstance, data: LoginRequest): Promise<TokenResponse> {
  const res = await api.post<TokenResponse>("/auth/login", data);
  return res.data;
}

/**
 * Refresh access token using refresh token
 */
export async function refreshToken(api: AxiosInstance, data: RefreshRequest): Promise<RefreshResponse> {
  const res = await api.post<RefreshResponse>("/auth/refresh", data);
  return res.data;
}

/**
 * Logout user by revoking refresh token
 */
export async function logout(api: AxiosInstance, data: LogoutRequest): Promise<LogoutResponse> {
  const res = await api.post<LogoutResponse>("/auth/logout", data);
  return res.data;
}
