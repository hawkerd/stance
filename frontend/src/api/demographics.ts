// src/api/demographics.ts
import { AxiosInstance } from "axios";
import { components } from "@/api/models/models";

export type DemographicReadResponse = components["schemas"]["DemographicReadResponse"];
export type DemographicUpdateResponse = components["schemas"]["DemographicUpdateResponse"];
export type DemographicCreateRequest = components["schemas"]["DemographicCreateRequest"];
export type DemographicUpdateRequest = components["schemas"]["DemographicUpdateRequest"];

/**
 * Create demographic for a user
 */
export async function createDemographic(
  api: AxiosInstance,
  userId: number,
  data: DemographicCreateRequest
): Promise<DemographicReadResponse> {
  const res = await api.post<DemographicReadResponse>(`/users/${userId}/demographics`, data);
  return res.data;
}

/**
 * Get demographic for a user
 */
export async function getDemographic(
  api: AxiosInstance,
  userId: number
): Promise<DemographicReadResponse> {
  const res = await api.get<DemographicReadResponse>(`/users/${userId}/demographics`);
  return res.data;
}

/**
 * Update demographic for a user
 */
export async function updateDemographic(
  api: AxiosInstance,
  userId: number,
  data: DemographicUpdateRequest
): Promise<DemographicUpdateResponse> {
  const res = await api.put<DemographicUpdateResponse>(`/users/${userId}/demographics`, data);
  return res.data;
}
