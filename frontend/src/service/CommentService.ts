import { AxiosInstance } from "axios";
import {
    CommentCreateRequest,
    CommentReadResponse,
    CommentUpdateRequest,
    CommentUpdateResponse,
    CommentReactionCreateRequest,
    CommentListResponse
} from "@/api/comments";
import { commentsApi } from "@/api";
import { Comment } from "@/models/index";

export class CommentService {

    async reactToComment(
        api: AxiosInstance,
        entityId: number,
        stanceId: number,
        commentId: number,
        like: boolean
    ): Promise<boolean> {
        const request: CommentReactionCreateRequest = { is_like: like };
        return await commentsApi.reactToComment(api, entityId, stanceId, commentId, request);
    }


    async removeCommentReaction(
        api: AxiosInstance,
        entityId: number,
        stanceId: number,
        commentId: number
    ): Promise<boolean> {
        return await commentsApi.removeCommentReaction(api, entityId, stanceId, commentId);
    }


    async createComment(
        api: AxiosInstance,
        entityId: number,
        stanceId: number,
        content: string,
        parentCommentId?: number
    ): Promise<Comment> {
        const request: CommentCreateRequest = { content, parent_id: parentCommentId };
        const response: CommentReadResponse = await commentsApi.createComment(api, entityId, stanceId, request);
        return {
            id: response.id,
            user_id: response.user_id,
            parent_id: response.parent_id ?? undefined,
            content: response.content,
            likes: response.likes,
            dislikes: response.dislikes,
            count_nested_replies: response.count_nested,
            user_reaction: response.user_reaction as "like" | "dislike" | null
        };
    }

    async getComments(
        api: AxiosInstance,
        entityId: number,
        stanceId: number
    ): Promise<Comment[]> {
        const response: CommentListResponse = await commentsApi.getComments(api, entityId, stanceId);
        return response.comments.map(comment => ({
            id: comment.id,
            user_id: comment.user_id,
            parent_id: comment.parent_id ?? undefined,
            content: comment.content,
            likes: comment.likes,
            dislikes: comment.dislikes,
            count_nested_replies: comment.count_nested,
            user_reaction: comment.user_reaction as "like" | "dislike" | null
        }));
    }

    async getComment(
        api: AxiosInstance,
        entityId: number,
        stanceId: number,
        commentId: number
    ): Promise<Comment> {
        const response: CommentReadResponse = await commentsApi.getComment(api, entityId, stanceId, commentId);
        return {
            id: response.id,
            user_id: response.user_id,
            parent_id: response.parent_id ?? undefined,
            content: response.content,
            likes: response.likes,
            dislikes: response.dislikes,
            count_nested_replies: response.count_nested,
            user_reaction: response.user_reaction as "like" | "dislike" | null
        };
    }


    async updateComment(
        api: AxiosInstance,
        entityId: number,
        stanceId: number,
        commentId: number,
        content?: string,
        is_active?: boolean
    ): Promise<Comment> {
        const request: CommentUpdateRequest = { content, is_active };
        const response: CommentUpdateResponse = await commentsApi.updateComment(api, entityId, stanceId, commentId, request);
        return {
            id: response.id,
            user_id: response.user_id,
            parent_id: response.parent_id ?? undefined,
            content: response.content,
            likes: 0,
            dislikes: 0,
            count_nested_replies: 0,
            user_reaction: null
        };
    }


    async deleteComment(
        api: AxiosInstance,
        entityId: number,
        stanceId: number,
        commentId: number
    ): Promise<boolean> {
        return await commentsApi.deleteComment(api, entityId, stanceId, commentId);
    }


    async getCommentReplies(
        api: AxiosInstance,
        entityId: number,
        stanceId: number,
        commentId: number
    ): Promise<Comment[]> {
        const response: CommentListResponse = await commentsApi.getCommentReplies(api, entityId, stanceId, commentId);
        return response.comments.map(comment => ({
            id: comment.id,
            user_id: comment.user_id,
            parent_id: comment.parent_id ?? undefined,
            content: comment.content,
            likes: comment.likes,
            dislikes: comment.dislikes,
            count_nested_replies: comment.count_nested,
            user_reaction: comment.user_reaction as "like" | "dislike" | null
        }));
    }
}
