// src/api/entities.ts
import { AxiosInstance } from "axios";
import { components } from "@/api/models/models";

export type EntityCreateRequest = components["schemas"]["EntityCreateRequest"];
export type EntityReadResponse = components["schemas"]["EntityReadResponse"];
export type EntityUpdateRequest = components["schemas"]["EntityUpdateRequest"];
export type EntityUpdateResponse = components["schemas"]["EntityUpdateResponse"];
export type EntityDeleteResponse = components["schemas"]["EntityDeleteResponse"];
export type EntityListResponse = components["schemas"]["EntityListResponse"];
export type StanceReadResponse = components["schemas"]["StanceReadResponse"];
export type EntityFeedResponse = components["schemas"]["EntityFeedResponse"];
export type StanceFeedStanceResponse = components["schemas"]["StanceFeedStanceResponse"];
export type StanceFeedResponse = components["schemas"]["StanceFeedResponse"];

/**
 * Create a new entity (admin only)-
 */
export async function createEntity(
  api: AxiosInstance,
  payload: EntityCreateRequest
): Promise<EntityReadResponse> {
  const res = await api.post<EntityReadResponse>("/entities", payload);
  return res.data;
}

/**
 * Fetch a single entity by ID
 */
export async function getEntity(
  api: AxiosInstance,
  entityId: number
): Promise<EntityReadResponse> {
  const res = await api.get<EntityReadResponse>(`/entities/${entityId}`);
  return res.data;
}

/**
 * Update an entity (admin only)
 */
export async function updateEntity(
  api: AxiosInstance,
  entityId: number,
  payload: EntityUpdateRequest
): Promise<EntityUpdateResponse> {
  const res = await api.put<EntityUpdateResponse>(`/entities/${entityId}`, payload);
  return res.data;
}

/**
 * Delete an entity (admin only)
 */
export async function deleteEntity(
  api: AxiosInstance,
  entityId: number
): Promise<EntityDeleteResponse> {
  const res = await api.delete<EntityDeleteResponse>(`/entities/${entityId}`);
  return res.data;
}

/**
 * List all entities
 */
export async function listEntities(api: AxiosInstance): Promise<EntityListResponse> {
  const res = await api.get<EntityListResponse>("/entities");
  return res.data;
}

/**
 * Fetch the current user's stance for a specific entity.
 */
export async function getMyStanceForEntity(
  api: AxiosInstance,
  entityId: number
): Promise<StanceFeedStanceResponse | null> {
  const res = await api.get<StanceFeedStanceResponse | null>(`/entities/${entityId}/stances/me`);
  return res.data;
}

/**
 * Fetch the home feed data with cursor-based pagination
 */
export async function getFeed(
  api: AxiosInstance,
  num_entities: number,
  num_stances_per_entity: number,
  cursor?: string
): Promise<EntityFeedResponse> {
  const res = await api.get<EntityFeedResponse>("/entities/feed", {
    params: { num_entities, num_stances_per_entity, cursor }
  });
  return res.data;
}

/**
 * Get all stances for a specific entity, paginated
 */
export async function getStancesByEntity(
  api: AxiosInstance,
  entityId: number,
  numStances: number = 20,
  cursorEngagementScore?: number,
  cursorId?: number
): Promise<StanceFeedResponse> {
  const params: Record<string, any> = { num_stances: numStances };
  if (cursorEngagementScore !== undefined) params.cursor_engagement_score = cursorEngagementScore;
  if (cursorId !== undefined) params.cursor_id = cursorId;

  const res = await api.get<StanceFeedResponse>(`/entities/${entityId}/stances`, { params });
  return res.data;
}