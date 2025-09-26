// src/api/comments.ts
import { AxiosInstance } from "axios";
import { components } from "@/api/models/models";

export type CommentCreateRequest = components["schemas"]["CommentCreateRequest"];
export type CommentReadResponse = components["schemas"]["CommentReadResponse"];
export type CommentUpdateRequest = components["schemas"]["CommentUpdateRequest"];
export type CommentUpdateResponse = components["schemas"]["CommentUpdateResponse"];
export type CommentDeleteResponse = components["schemas"]["CommentDeleteResponse"];
export type CommentListResponse = components["schemas"]["CommentListResponse"];

/**
 * Create a new comment
 */
export async function createComment(
  api: AxiosInstance,
  payload: CommentCreateRequest
): Promise<CommentReadResponse> {
  const res = await api.post<CommentReadResponse>("/comments", payload);
  return res.data;
}

/**
 * Fetch a single comment by ID
 */
export async function getComment(
  api: AxiosInstance,
  commentId: number
): Promise<CommentReadResponse> {
  const res = await api.get<CommentReadResponse>(`/comments/${commentId}`);
  return res.data;
}

/**
 * Update a comment (only allowed by owner)
 */
export async function updateComment(
  api: AxiosInstance,
  commentId: number,
  payload: CommentUpdateRequest
): Promise<CommentUpdateResponse> {
  const res = await api.put<CommentUpdateResponse>(`/comments/${commentId}`, payload);
  return res.data;
}

/**
 * Delete a comment (only allowed by owner)
 */
export async function deleteComment(
  api: AxiosInstance,
  commentId: number
): Promise<CommentDeleteResponse> {
  const res = await api.delete<CommentDeleteResponse>(`/comments/${commentId}`);
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