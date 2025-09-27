// src/api/comment_reactions.ts
import { AxiosInstance } from "axios";
import { components } from "@/api/models/models";

export type CommentReactionCreateRequest = components["schemas"]["CommentReactionCreateRequest"];
export type CommentReactionReadResponse = components["schemas"]["CommentReactionReadResponse"];

/**
 * Add or update a reaction (like/dislike) to a comment
 */
export async function reactToComment(
	api: AxiosInstance,
	commentId: number,
	payload: CommentReactionCreateRequest
): Promise<CommentReactionReadResponse> {
	const res = await api.post<CommentReactionReadResponse>(`/comment-reactions/${commentId}`, payload);
	return res.data;
}

/**
 * Remove a reaction from a comment
 */
export async function removeCommentReaction(
	api: AxiosInstance,
	commentId: number
): Promise<void> {
	await api.delete(`/comment-reactions/${commentId}`);
}


