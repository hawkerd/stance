// src/components/CommentReply.tsx
import React, { useState } from "react";
import { Comment } from "../models/Issue";
import { useAuthApi } from "../app/hooks/useAuthApi";
import { reactToComment, removeCommentReaction } from "../api/comment_reactions";
import { useAuth } from "../contexts/AuthContext";

interface CommentReplyProps {
    isDirectChild: boolean;
    reply: Comment;
    setSelectedCommentId?: (id: number) => void;
}

const CommentReply: React.FC<CommentReplyProps> = ({ reply, isDirectChild, setSelectedCommentId }) => {
  const api = useAuthApi();
  const { isAuthenticated } = useAuth();
  const [likes, setLikes] = useState(reply.likes);
  const [dislikes, setDislikes] = useState(reply.dislikes);
  const [userReaction, setUserReaction] = useState<Comment["user_reaction"]>(reply.user_reaction);
  const [loading, setLoading] = useState(false);

  const handleReaction = async (isLike: boolean) => {
    if (loading) return;
    setLoading(true);
    try {
      if (userReaction === (isLike ? "like" : "dislike")) {
        setUserReaction(null);
        await removeCommentReaction(api, reply.id);
        if (isLike) setLikes(likes - 1);
        else setDislikes(dislikes - 1);
      } else {
        await reactToComment(api, reply.id, { is_like: isLike });
        if (isLike) {
          setUserReaction("like");
          setLikes(likes + 1);
          if (userReaction === "dislike") setDislikes(dislikes - 1);
        } else {
          setUserReaction("dislike");
          setDislikes(dislikes + 1);
          if (userReaction === "like") setLikes(likes - 1);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl p-3 mb-2">
      <div className="flex items-start">
        <div className="flex-1 ml-4">
          <div className="mb-2">
            <span className="text-xs text-purple-700 font-bold">User {reply.user_id}</span>
            <span className="text-gray-800 ml-1 align-middle">{reply.content}</span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            {setSelectedCommentId && (
              <button
                className="text-xs text-blue-500 underline hover:text-blue-700"
                onClick={() => setSelectedCommentId(reply.id)}
                type="button"
              >
                Reply
              </button>
            )}
          </div>
        </div>
        <div className="flex flex-col items-center gap-1 text-gray-400 min-w-[32px]">
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
    </div>
  );
};

export default CommentReply;
