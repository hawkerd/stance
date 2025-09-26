// src/api/profiles.ts
import { AxiosInstance } from "axios";
import { components } from "@/api/models/models";

export type ProfileCreateRequest = components["schemas"]["ProfileCreateRequest"];
export type ProfileReadResponse = components["schemas"]["ProfileReadResponse"];
export type ProfileUpdateRequest = components["schemas"]["ProfileUpdateRequest"];
export type ProfileUpdateResponse = components["schemas"]["ProfileUpdateResponse"];

/**
 * Create a profile for a user
 */
export async function createProfile(
  api: AxiosInstance,
  userId: number,
  payload: ProfileCreateRequest
): Promise<ProfileReadResponse> {
  const res = await api.post<ProfileReadResponse>(`/users/${userId}/profile`, payload);
  return res.data;
}

/**
 * Fetch a profile for a user
 */
export async function getProfile(
  api: AxiosInstance,
  userId: number
): Promise<ProfileReadResponse> {
  const res = await api.get<ProfileReadResponse>(`/users/${userId}/profile`);
  return res.data;
}

/**
 * Update a profile for a user
 */
export async function updateProfile(
  api: AxiosInstance,
  userId: number,
  payload: ProfileUpdateRequest
): Promise<ProfileUpdateResponse> {
  const res = await api.put<ProfileUpdateResponse>(`/users/${userId}/profile`, payload);
  return res.data;
}
