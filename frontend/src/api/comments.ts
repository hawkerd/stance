// src/api/comments.ts
import { AxiosInstance } from "axios";
import { components } from "@/api/models/models";

export type CommentCreateRequest = components["schemas"]["CommentCreateRequest"];
export type CommentReadResponse = components["schemas"]["CommentReadResponse"];
export type CommentUpdateRequest = components["schemas"]["CommentUpdateRequest"];
export type CommentUpdateResponse = components["schemas"]["CommentUpdateResponse"];
export type CommentListResponse = components["schemas"]["CommentListResponse"];
export type CommentReactionCreateRequest = components["schemas"]["CommentReactionCreateRequest"];

/**
 * Create a new comment
 */
export async function createComment(
  api: AxiosInstance,
  entityId: number,
  stanceId: number,
  payload: CommentCreateRequest
): Promise<CommentReadResponse> {
  const res = await api.post<CommentReadResponse>(
    `/entities/${entityId}/stances/${stanceId}/comments/`,
    payload
  );
  return res.data;
}

/**
 * Fetch comments
 */
export async function getComments(
  api: AxiosInstance,
  entityId: number,
  stanceId: number
): Promise<CommentListResponse> {
  const res = await api.get<CommentListResponse>(
    `/entities/${entityId}/stances/${stanceId}/comments/`
  );
  return res.data;
}

/**
 * Fetch a single comment by ID
 */
export async function getComment(
  api: AxiosInstance,
  entityId: number,
  stanceId: number,
  commentId: number
): Promise<CommentReadResponse> {
  const res = await api.get<CommentReadResponse>(
    `/entities/${entityId}/stances/${stanceId}/comments/${commentId}`
  );
  return res.data;
}



/**
 * Update a comment (only allowed by owner)
 */
export async function updateComment(
  api: AxiosInstance,
  entityId: number,
  stanceId: number,
  commentId: number,
  payload: CommentUpdateRequest
): Promise<CommentUpdateResponse> {
  const res = await api.put<CommentUpdateResponse>(
    `/entities/${entityId}/stances/${stanceId}/comments/${commentId}`,
    payload
  );
  return res.data;
}

/**
 * Delete a comment (only allowed by owner)
 */
export async function deleteComment(
  api: AxiosInstance,
  entityId: number,
  stanceId: number,
  commentId: number
): Promise<boolean> {
  const res = await api.delete(
    `/entities/${entityId}/stances/${stanceId}/comments/${commentId}`
  );
  return res.status === 204;
}

/**
 * Fetch replies for a comment
 */
export async function getCommentReplies(
  api: AxiosInstance,
  entityId: number,
  stanceId: number,
  commentId: number
): Promise<CommentListResponse> {
  const res = await api.get<CommentListResponse>(
    `/entities/${entityId}/stances/${stanceId}/comments/${commentId}/replies`
  );
  return res.data;
}

/**
 * Add or update a reaction (like/dislike) to a comment
 */
export async function reactToComment(
  api: AxiosInstance,
  entityId: number,
  stanceId: number,
  commentId: number,
  payload: CommentReactionCreateRequest
): Promise<boolean> {
  const res = await api.post(
    `/entities/${entityId}/stances/${stanceId}/comments/${commentId}/reaction`,
    payload
  );
  return res.status === 201;
}

/**
 * Remove a reaction from a comment
 */
export async function removeCommentReaction(
  api: AxiosInstance,
  entityId: number,
  stanceId: number,
  commentId: number
): Promise<boolean> {
  const res = await api.delete(
    `/entities/${entityId}/stances/${stanceId}/comments/${commentId}/reaction`
  );
  return res.status === 204;
}