// src/api/users.ts
import { AxiosInstance } from "axios";
import { components } from "@/api/models/models";

// OpenAPI schema types
export type UserReadResponse = components["schemas"]["UserReadResponse"];
export type PaginatedStancesByUserResponse = components["schemas"]["PaginatedStancesByUserResponse"];
export type PaginatedStancesByUserRequest = components["schemas"]["PaginatedStancesByUserRequest"];
export type DemographicCreateRequest = components["schemas"]["DemographicCreateRequest"];
export type DemographicReadResponse = components["schemas"]["DemographicReadResponse"];
export type DemographicUpdateRequest = components["schemas"]["DemographicUpdateRequest"];
export type DemographicUpdateResponse = components["schemas"]["DemographicUpdateResponse"];
export type ProfileCreateRequest = components["schemas"]["ProfileCreateRequest"];
export type ProfileReadResponse = components["schemas"]["ProfileReadResponse"];
export type ProfileUpdateRequest = components["schemas"]["ProfileUpdateRequest"];
export type ProfileUpdateResponse = components["schemas"]["ProfileUpdateResponse"];
export type ProfilePageResponse = components["schemas"]["ProfilePageResponse"];

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
): Promise<boolean> {
  const res = await api.delete(`/users/${userId}`);
  return res.status === 204;
}

/**
 * Create demographic for user
 * Backend: POST /users/{user_id}/demographics
 */
export async function createDemographic(
  api: AxiosInstance,
  userId: number,
  payload: DemographicCreateRequest
): Promise<DemographicReadResponse> {
  const res = await api.post<DemographicReadResponse>(
    `/users/${userId}/demographics`,
    payload
  );
  return res.data;
}

/**
 * Get demographic for user
 * Backend: GET /users/{user_id}/demographics
 */
export async function getDemographic(
  api: AxiosInstance,
  userId: number
): Promise<DemographicReadResponse> {
  const res = await api.get<DemographicReadResponse>(
    `/users/${userId}/demographics`
  );
  return res.data;
}

/**
 * Update demographic for user
 * Backend: PUT /users/{user_id}/demographics
 */
export async function updateDemographic(
  api: AxiosInstance,
  userId: number,
  payload: DemographicUpdateRequest
): Promise<DemographicUpdateResponse> {
  const res = await api.put<DemographicUpdateResponse>(
    `/users/${userId}/demographics`,
    payload
  );
  return res.data;
}

/**
 * Create profile for user
 * Backend: POST /users/{user_id}/profile
 */
export async function createProfile(
  api: AxiosInstance,
  userId: number,
  payload: ProfileCreateRequest
): Promise<ProfileReadResponse> {
  const res = await api.post<ProfileReadResponse>(
    `/users/${userId}/profile`,
    payload
  );
  return res.data;
}

/**
 * Get profile for user
 * Backend: GET /users/{user_id}/profile
 */
export async function getProfile(
  api: AxiosInstance,
  userId: number
): Promise<ProfileReadResponse> {
  const res = await api.get<ProfileReadResponse>(
    `/users/${userId}/profile`
  );
  return res.data;
}

/**
 * Update profile for user
 * Backend: PUT /users/{user_id}/profile
 */
export async function updateProfile(
  api: AxiosInstance,
  userId: number,
  payload: ProfileUpdateRequest
): Promise<ProfileUpdateResponse> {
  const res = await api.put<ProfileUpdateResponse>(
    `/users/${userId}/profile`,
    payload
  );
  return res.data;
}

/**
 * Get profile page for user (public)
 * Backend: GET /users/{user_id}/profile_page
 */
export async function getProfilePage(
  api: AxiosInstance,
  userId: number
): Promise<ProfilePageResponse> {
  const res = await api.get<ProfilePageResponse>(
    `/users/${userId}/profile_page`
  );
  return res.data;
}

/**
 * Follow user
 */
export async function followUser(
  api: AxiosInstance,
  userId: number
): Promise<boolean> {
  const res = await api.post(`/users/${userId}/follow`);
  return res.status === 201;
}

/**
 * Unfollow user
 */
export async function unfollowUser(
  api: AxiosInstance,
  userId: number
): Promise<boolean> {
  const res = await api.delete(`/users/${userId}/follow`);
  return res.status === 204;
}