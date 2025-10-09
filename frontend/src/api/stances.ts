// src/api/stances.ts
import { AxiosInstance } from "axios";
import { components } from "@/api/models/models";

export type StanceReadResponse = components["schemas"]["StanceReadResponse"];
export type StanceCreateResponse = components["schemas"]["StanceCreateResponse"];
export type StanceUpdateResponse = components["schemas"]["StanceUpdateResponse"];
export type StanceDeleteResponse = components["schemas"]["StanceDeleteResponse"];
export type StanceListResponse = components["schemas"]["StanceListResponse"];
export type CommentListResponse = components["schemas"]["CommentListResponse"];
export type StanceCreateRequest = components["schemas"]["StanceCreateRequest"];
export type StanceUpdateRequest = components["schemas"]["StanceUpdateRequest"];

/**
 * Create a new stance
 */
export async function createStance(
  api: AxiosInstance,
  data: StanceCreateRequest
): Promise<StanceCreateResponse> {
  const res = await api.post<StanceCreateResponse>("/stances", data);
  return res.data;
}

/**
 * Get a stance by ID
 */
export async function getStance(
  api: AxiosInstance,
  stanceId: number
): Promise<StanceReadResponse> {
  const res = await api.get<StanceReadResponse>(`/stances/${stanceId}`);
  return res.data;
}

/**
 * Get all stances
 */
export async function getAllStances(api: AxiosInstance): Promise<StanceListResponse> {
  const res = await api.get<StanceListResponse>("/stances");
  return res.data;
}

/**
 * Update a stance by ID
 */
export async function updateStance(
  api: AxiosInstance,
  stanceId: number,
  data: StanceUpdateRequest
): Promise<StanceUpdateResponse> {
  const res = await api.put<StanceUpdateResponse>(`/stances/${stanceId}`, data);
  return res.data;
}

/**
 * Delete a stance by ID
 */
export async function deleteStance(
  api: AxiosInstance,
  stanceId: number
): Promise<StanceDeleteResponse> {
  const res = await api.delete<StanceDeleteResponse>(`/stances/${stanceId}`);
  return res.data;
}

/**
 * Get all stances for a specific entity
 */
export async function getStancesByEntity(
  api: AxiosInstance,
  entityId: number
): Promise<StanceListResponse> {
  const res = await api.get<StanceListResponse>(`/stances/entity/${entityId}`);
  return res.data;
}

/**
 * Fetch comments by stance ID
 */
export async function getCommentsByStance(
  api: AxiosInstance,
  stanceId: number
): Promise<CommentListResponse> {
  const res = await api.get<CommentListResponse>(`/stances/${stanceId}/comments`);
  return res.data;
}