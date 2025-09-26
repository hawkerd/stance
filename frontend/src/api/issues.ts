// src/api/issues.ts
import { AxiosInstance } from "axios";
import { components } from "@/api/models/models";

export type IssueCreateRequest = components["schemas"]["IssueCreateRequest"];
export type IssueReadResponse = components["schemas"]["IssueReadResponse"];
export type IssueUpdateRequest = components["schemas"]["IssueUpdateRequest"];
export type IssueUpdateResponse = components["schemas"]["IssueUpdateResponse"];
export type IssueDeleteResponse = components["schemas"]["IssueDeleteResponse"];
export type IssueListResponse = components["schemas"]["IssueListResponse"];

/**
 * Create a new issue (admin only).
 */
export async function createIssue(
  api: AxiosInstance,
  payload: IssueCreateRequest
): Promise<IssueReadResponse> {
  const res = await api.post<IssueReadResponse>("/issues", payload);
  return res.data;
}

/**
 * Fetch a single issue by ID.
 */
export async function getIssue(
  api: AxiosInstance,
  issueId: number
): Promise<IssueReadResponse> {
  const res = await api.get<IssueReadResponse>(`/issues/${issueId}`);
  return res.data;
}

/**
 * Update an issue (admin only).
 */
export async function updateIssue(
  api: AxiosInstance,
  issueId: number,
  payload: IssueUpdateRequest
): Promise<IssueUpdateResponse> {
  const res = await api.put<IssueUpdateResponse>(`/issues/${issueId}`, payload);
  return res.data;
}

/**
 * Delete an issue (admin only).
 */
export async function deleteIssue(
  api: AxiosInstance,
  issueId: number
): Promise<IssueDeleteResponse> {
  const res = await api.delete<IssueDeleteResponse>(`/issues/${issueId}`);
  return res.data;
}

/**
 * List all issues.
 */
export async function listIssues(api: AxiosInstance): Promise<IssueListResponse> {
  const res = await api.get<IssueListResponse>("/issues");
  return res.data;
}
