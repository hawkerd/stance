import { AxiosInstance } from "axios";
import {
    CommentReactionCreateRequest,
    CommentReactionReadResponse,
} from "@/api/comment_reactions";
import {
    CommentCreateRequest,
    CommentReadResponse,
    CommentUpdateRequest,
    CommentUpdateResponse,
    CommentDeleteResponse,
    CommentListResponse
} from "@/api/comments";
import { commentReactionsApi } from "@/api";
import { commentsApi } from "@/api";
import { Comment } from "@/models/index";

export class CommentService {
    async reactToComment(
        api: AxiosInstance,
        commentId: number,
        like: boolean
    ): Promise<boolean> {
        const request: CommentReactionCreateRequest = { is_like: like };
        const response: CommentReactionReadResponse = await commentReactionsApi.reactToComment(api, commentId, request);
        return true;
    }

    async removeCommentReaction(api: AxiosInstance, commentId: number): Promise<void> {
        await commentReactionsApi.removeCommentReaction(api, commentId);
    }

    async createComment(
        api: AxiosInstance,
        stanceId: number,
        content: string,
        parentCommentId?: number
    ): Promise<Comment> {
        const request: CommentCreateRequest = { stance_id: stanceId, content, parent_id: parentCommentId };
        const response: CommentReadResponse = await commentsApi.createComment(api, request);
        const comment: Comment = {
            id: response.id,
            user_id: response.user_id,
            parent_id: response.parent_id ?? undefined,
            content: response.content,
            likes: response.likes,
            dislikes: response.dislikes,
            count_nested_replies: response.count_nested,
            user_reaction: response.user_reaction as "like" | "dislike" | null
        };
        return comment;
    }

    async getComment(api: AxiosInstance, commentId: number): Promise<Comment> {
        const response: CommentReadResponse = await commentsApi.getComment(api, commentId);
        const comment: Comment = {
            id: response.id,
            user_id: response.user_id,
            parent_id: response.parent_id ?? undefined,
            content: response.content,
            likes: response.likes,
            dislikes: response.dislikes,
            count_nested_replies: response.count_nested,
            user_reaction: response.user_reaction as "like" | "dislike" | null
        };
        return comment;
    }

    async updateComment(
        api: AxiosInstance,
        commentId: number,
        content?: string,
        is_active?: boolean
    ): Promise<Comment> {
        const request: CommentUpdateRequest = { content, is_active };
        const response: CommentUpdateResponse = await commentsApi.updateComment(api, commentId, request);
        const comment: Comment = {
            id: response.id,
            user_id: response.user_id,
            parent_id: response.parent_id ?? undefined,
            content: response.content,
            likes: 0,
            dislikes: 0,
            count_nested_replies: 0,
            user_reaction: null
        };
        return comment;
    }

    async deleteComment(api: AxiosInstance, commentId: number): Promise<boolean> {
        const response: CommentDeleteResponse = await commentsApi.deleteComment(api, commentId);
        return response.success ?? true;
    }

    async getCommentReplies(api: AxiosInstance, commentId: number): Promise<Comment[]> {
        const response: CommentListResponse = await commentsApi.getCommentReplies(api, commentId);
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
