// src/api/users.ts
import { AxiosInstance } from "axios";
import { components } from "@/api/models/models";

// OpenAPI schema types
export type UserReadResponse = components["schemas"]["UserReadResponse"];
export type UserDeleteResponse = components["schemas"]["UserDeleteResponse"];

/**
 * Fetch the current logged-in user's info
 */
export async function getCurrentUser(
  api: AxiosInstance
): Promise<UserReadResponse> {
  const res = await api.get<UserReadResponse>("/users/me");
  return res.data;
}

/**
 * Fetch a user by ID
 */
export async function getUser(
  api: AxiosInstance,
  userId: number
): Promise<UserReadResponse> {
  const res = await api.get<UserReadResponse>(`/users/${userId}`);
  return res.data;
}

/**
 * Delete the current user
 */
export async function deleteUser(
  api: AxiosInstance,
  userId: number
): Promise<UserDeleteResponse> {
  const res = await api.delete<UserDeleteResponse>(`/users/${userId}`);
  return res.data;
}
