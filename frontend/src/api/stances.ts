// src/api/stances.ts
import { AxiosInstance } from "axios";
import { components } from "@/api/models/models";

export type StanceReadResponse = components["schemas"]["StanceReadResponse"];
export type StanceCreateResponse = components["schemas"]["StanceCreateResponse"];
export type StanceUpdateResponse = components["schemas"]["StanceUpdateResponse"];
export type StanceListResponse = components["schemas"]["StanceListResponse"];
export type CommentListResponse = components["schemas"]["CommentListResponse"];
export type StanceCreateRequest = components["schemas"]["StanceCreateRequest"];
export type StanceUpdateRequest = components["schemas"]["StanceUpdateRequest"];
export type StanceRateRequest = components["schemas"]["StanceRateRequest"];
export type StanceRateResponse = components["schemas"]["StanceRateResponse"];
export type ReadStanceRatingResponse = components["schemas"]["ReadStanceRatingResponse"];
export type NumRatingsResponse = components["schemas"]["NumRatingsResponse"];
export type StanceFeedRequest = components["schemas"]["StanceFeedRequest"];
export type StanceFeedResponse = components["schemas"]["StanceFeedResponse"];
export type StanceFeedStanceResponse = components["schemas"]["StanceFeedStanceResponse"];
export type PaginatedStanceByEntityRequest = components["schemas"]["PaginatedStanceByEntityRequest"];
export type PaginatedStancesByEntityResponse = components["schemas"]["PaginatedStancesByEntityResponse"];
export type PaginatedStancesByEntityStanceResponse = components["schemas"]["PaginatedStancesByEntityStanceResponse"];
export type PaginatedStancesByUserRequest = components["schemas"]["PaginatedStancesByUserRequest"];
export type PaginatedStancesByUserResponse = components["schemas"]["PaginatedStancesByUserResponse"];
export type StanceFollowingFeedRequest = components["schemas"]["StanceFollowingFeedRequest"];
export type StanceFollowingFeedResponse = components["schemas"]["StanceFollowingFeedResponse"];

/**
 * Get the current user's rating for a stance
 * Backend: GET /entities/{entity_id}/stances/{stance_id}/my-rating
 */
export async function getMyStanceRating(
  api: AxiosInstance,
  entityId: number,
  stanceId: number
): Promise<ReadStanceRatingResponse> {
  const res = await api.get<ReadStanceRatingResponse>(
    `/entities/${entityId}/stances/${stanceId}/my-rating`
  );
  return res.data;
}

/**
 * Create a new stance for an entity (requires entityId)
 * Backend: POST /entities/{entity_id}/stances/
 */
export async function createStance(
  api: AxiosInstance,
  entityId: number,
  data: StanceCreateRequest
): Promise<StanceCreateResponse> {
  const res = await api.post<StanceCreateResponse>(
    `/entities/${entityId}/stances/`,
    data
  );
  return res.data;
}

/**
 * Get a stance by ID (requires entityId and stanceId)
 * Backend: GET /entities/{entity_id}/stances/{stance_id}
 */
export async function getStance(
  api: AxiosInstance,
  entityId: number,
  stanceId: number
): Promise<StanceReadResponse> {
  const res = await api.get<StanceReadResponse>(
    `/entities/${entityId}/stances/${stanceId}`
  );
  return res.data;
}

/**
 * Get a stance page by ID (requires entityId and stanceId)
 * Backend: GET /entities/{entity_id}/stances/{stance_id}/page
 */
export async function getStancePage(
  api: AxiosInstance,
  entityId: number,
  stanceId: number
): Promise<StanceFeedStanceResponse> {
  const res = await api.get<StanceFeedStanceResponse>(
    `/entities/${entityId}/stances/${stanceId}/page`
  );
  return res.data;
}

/**
 * Update a stance by ID (requires entityId and stanceId)
 * Backend: PUT /entities/{entity_id}/stances/{stance_id}
 */
export async function updateStance(
  api: AxiosInstance,
  entityId: number,
  stanceId: number,
  data: StanceUpdateRequest
): Promise<StanceUpdateResponse> {
  const res = await api.put<StanceUpdateResponse>(
    `/entities/${entityId}/stances/${stanceId}`,
    data
  );
  return res.data;
}

/**
 * Delete a stance by ID (requires entityId and stanceId)
 * Backend: DELETE /entities/{entity_id}/stances/{stance_id}
 */
export async function deleteStance(
  api: AxiosInstance,
  entityId: number,
  stanceId: number
): Promise<boolean> {
  const res = await api.delete(
    `/entities/${entityId}/stances/${stanceId}`
  );
  return res.status === 204;
}

/**
 * Rate a stance (or remove rating)
 * Backend: POST /entities/{entity_id}/stances/{stance_id}/rate
 */
export async function rateStance(
  api: AxiosInstance,
  entityId: number,
  stanceId: number,
  data: StanceRateRequest
): Promise<StanceRateResponse> {
  const res = await api.post<StanceRateResponse>(
    `/entities/${entityId}/stances/${stanceId}/rate`,
    data
  );
  return res.data;
}

/**
 * Get the number of ratings for a stance
 * Backend: GET /entities/{entity_id}/stances/{stance_id}/num-ratings
 */
export async function getNumRatings(
  api: AxiosInstance,
  entityId: number,
  stanceId: number
): Promise<NumRatingsResponse> {
  const res = await api.get<NumRatingsResponse>(
    `/entities/${entityId}/stances/${stanceId}/num-ratings`
  );
  return res.data;
}

/**
 * Get stances for a specific entity, paginated
 */
export async function getStancesByEntity(
  api: AxiosInstance,
  entityId: number,
  payload: PaginatedStanceByEntityRequest
): Promise<PaginatedStancesByEntityResponse> {
  const res = await api.post<PaginatedStancesByEntityResponse>(`/entities/${entityId}/stances/feed`, payload);
  return res.data;
}

/**
 * Fetch the current user's stance for a specific entity.
 */
export async function getMyStanceForEntity(
  api: AxiosInstance,
  entityId: number
): Promise<PaginatedStancesByEntityStanceResponse | null> {
  const res = await api.get<PaginatedStancesByEntityStanceResponse | null>(`/entities/${entityId}/stances/me`);
  return res.data;
}

/**
 * Get paginated stances for a specific user
 * Backend: POST /users/{user_id}/stances/feed
 */
export async function getPaginatedStancesByUser(
  api: AxiosInstance,
  userId: number,
  data: PaginatedStancesByUserRequest
): Promise<PaginatedStancesByUserResponse> {
  const res = await api.post<PaginatedStancesByUserResponse>(
    `/users/${userId}/stances/feed`,
    data
  );
  return res.data;
}

/**
 * Get all stances
 */
export async function getAllStances(
  api: AxiosInstance
): Promise<StanceListResponse> {
  const res = await api.get<StanceListResponse>(`/stances`);
  return res.data;
}

/**
 * Get the global feed of stances (randomized, not entity/user specific)
 * Backend: POST /stances/feed
 */
export async function getFeed(
  api: AxiosInstance,
  data: StanceFeedRequest
): Promise<StanceFeedResponse> {
  const res = await api.post<StanceFeedResponse>(`/stances/feed`, data);
  return res.data;
}

/**
 * Get the following feed of stances (from followed users)
 * Backend: POST /stances/following-feed
 */
export async function getFollowingFeed(
  api: AxiosInstance,
  data: StanceFollowingFeedRequest
): Promise<StanceFollowingFeedResponse> {
  const res = await api.post<StanceFollowingFeedResponse>(`/stances/following-feed`, data);
  return res.data;
}
