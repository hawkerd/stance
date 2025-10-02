// src/api/stance_blocks.ts
import { AxiosInstance } from "axios";
import { components } from "@/api/models/models";

export type StanceBlockReadResponse = components["schemas"]["StanceBlockReadResponse"];
export type StanceBlockListResponse = components["schemas"]["StanceBlockListResponse"];
export type StanceBlockCreateRequest = components["schemas"]["StanceBlockCreateRequest"];
export type StanceBlockUpdateRequest = components["schemas"]["StanceBlockUpdateRequest"];
export type DeleteStanceBlockResponse = components["schemas"]["DeleteStanceBlockResponse"];

/**
 * Create a new stance block
 */
export async function createStanceBlock(
  api: AxiosInstance,
  stanceId: number,
  data: StanceBlockCreateRequest
): Promise<StanceBlockReadResponse> {
  const res = await api.post<StanceBlockReadResponse>(`/stances/${stanceId}/blocks`, data);
  return res.data;
}

/**
 * Get a single stance block by ID
 */
export async function getStanceBlock(
  api: AxiosInstance,
  stanceId: number,
  blockId: number
): Promise<StanceBlockReadResponse> {
  const res = await api.get<StanceBlockReadResponse>(`/stances/${stanceId}/blocks/${blockId}`);
  return res.data;
}

/**
 * Update a stance block by ID
 */
export async function updateStanceBlock(
  api: AxiosInstance,
  stanceId: number,
  blockId: number,
  data: StanceBlockUpdateRequest
): Promise<StanceBlockReadResponse> {
  const res = await api.put<StanceBlockReadResponse>(`/stances/${stanceId}/blocks/${blockId}`, data);
  return res.data;
}

/**
 * Delete a stance block by ID
 */
export async function deleteStanceBlock(
  api: AxiosInstance,
  stanceId: number,
  blockId: number
): Promise<DeleteStanceBlockResponse> {
  const res = await api.delete<DeleteStanceBlockResponse>(`/stances/${stanceId}/blocks/${blockId}`);
  return res.data;
}

/**
 * List all blocks for a given stance
 */
export async function listStanceBlocks(
  api: AxiosInstance,
  stanceId: number
): Promise<StanceBlockListResponse> {
  const res = await api.get<StanceBlockListResponse>(`/stances/${stanceId}/blocks`);
  return res.data;
}