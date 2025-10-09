"use client";

import React, { useState } from "react";
import { Comment } from "../models";
import CommentReply from "./CommentReply";
import { useAuthApi } from "../app/hooks/useAuthApi";
import { reactToComment, removeCommentReaction } from "../api/comment_reactions";
import { getCommentReplies } from "../api/comments";
import { useAuth } from "../contexts/AuthContext";

interface CommentProps {
  comment: Comment;
  setSelectedCommentId?: (id: number) => void;
}

const CommentComponent: React.FC<CommentProps> = ({ comment, setSelectedCommentId }) => {
  const api = useAuthApi();
  const { isAuthenticated } = useAuth();
  const [likes, setLikes] = useState(comment.likes);
  const [dislikes, setDislikes] = useState(comment.dislikes);
  const [userReaction, setUserReaction] = useState<Comment["user_reaction"]>(comment.user_reaction);
  const [loading, setLoading] = useState(false);

  const [replies, setReplies] = useState<Comment[]>([]);
  const [showReplies, setShowReplies] = useState(false);
  const [loadingReplies, setLoadingReplies] = useState(false);

  const handleReaction = async (isLike: boolean) => {
    if (loading) return;
    setLoading(true);
    try {
      if (userReaction === (isLike ? "like" : "dislike")) {
        // remove reaction
        await removeCommentReaction(api, comment.id);
        setUserReaction(null);
        if (isLike) setLikes(likes - 1);
        else setDislikes(dislikes - 1);
      } else {
        // switch or add reaction
        await reactToComment(api, comment.id, { is_like: isLike });
        if (isLike) {
          setLikes(likes + 1);
          if (userReaction === "dislike") setDislikes(dislikes - 1);
          setUserReaction("like");
        } else {
          setDislikes(dislikes + 1);
          if (userReaction === "like") setLikes(likes - 1);
          setUserReaction("dislike");
        }
      }
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  const toggleReplies = async () => {
    if (!showReplies) {
      setLoadingReplies(true);
      try {
        const fetchedReplies = await getCommentReplies(api, comment.id);
        setReplies(
          fetchedReplies.comments.map((reply: any) => ({
            ...reply,
            parent_id: reply.parent_id === null ? undefined : reply.parent_id,
          }))
        );
      } catch (e) {
        console.error("Failed to load replies", e);
      } finally {
        setLoadingReplies(false);
      }
    }
    setShowReplies(!showReplies);
  };

  return (
    <div className="rounded-xl p-3 mb-2">
      <div className="flex items-start gap-3 group">
        <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-base font-bold mt-0.5">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
          </svg>
        </div>
        <div className="flex-1">
          <div className="text-xs text-purple-500 mb-1 font-semibold">User {comment.user_id}</div>
          <div className="text-gray-800 mb-2">{comment.content}</div>
        </div>
        <div className="ml-2 flex flex-col items-center gap-1 text-gray-400 min-w-[32px]">
          {setSelectedCommentId && (
            <button
              className="mb-1 hover:text-blue-500 transition opacity-0 group-hover:opacity-100 focus:opacity-100"
              onClick={() => setSelectedCommentId(comment.id)}
              type="button"
              aria-label="Reply"
              title="Reply"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7 7-7" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18" />
              </svg>
            </button>
          )}
        </div>
        <div className="ml-2 flex flex-col items-center gap-1 text-gray-400 min-w-[32px]">
          {/* Upvote arrow */}
          <button
            className={`flex items-center ${userReaction === 'like' ? 'text-green-600' : 'text-gray-400'} hover:text-green-700`}
            onClick={() => handleReaction(true)}
            disabled={loading || !isAuthenticated}
            aria-label="Upvote"
            title={userReaction === 'like' ? 'You upvoted this' : (!isAuthenticated ? 'Login to upvote' : 'Upvote')}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
            </svg>
            <span className="text-[10px] ml-1">{likes}</span>
          </button>
          {/* Downvote arrow */}
          <button
            className={`flex items-center ${userReaction === 'dislike' ? 'text-red-600' : 'text-gray-400'} hover:text-red-700`}
            onClick={() => handleReaction(false)}
            disabled={loading || !isAuthenticated}
            aria-label="Downvote"
            title={userReaction === 'dislike' ? 'You downvoted this' : (!isAuthenticated ? 'Login to downvote' : 'Downvote')}
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
            <span className="text-[10px] ml-1">{dislikes}</span>
          </button>
        </div>
      </div>
      {/* Show replies flipper arrow */}
      {comment.parent_id === undefined && comment.count_nested_replies > 0 && (
        <button
          className="flex items-center justify-center mb-2 mt-2 text-purple-500 hover:text-purple-700 transition"
          onClick={toggleReplies}
          aria-label={showReplies ? "Hide replies" : "Show replies"}
          title={showReplies ? "Hide replies" : "Show replies"}
        >
          <svg
            className={`w-5 h-5 transition-transform duration-200 ${showReplies ? "rotate-180" : "rotate-0"}`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 9l7 7 7-7" />
          </svg>
          <span className="ml-2 text-xs font-medium">
            {showReplies ? "Hide" : `Show ${comment.count_nested_replies}`}
          </span>
        </button>
      )}
      {/* Replies */}
      {showReplies && (
        <div className="w-full">
          {loadingReplies ? (
            <div className="text-xs text-gray-400">Loading replies...</div>
          ) : (
            replies.map(reply => (
              <CommentReply
                key={reply.id}
                reply={reply}
                isDirectChild={reply.parent_id === comment.id}
                setSelectedCommentId={setSelectedCommentId}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CommentComponent;
