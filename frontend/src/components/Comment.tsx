import React, { useState } from "react";
import { Comment } from "../models/Issue";
import { useAuthApi } from "../app/hooks/useAuthApi";
import { reactToComment, removeCommentReaction } from "../api/comment_reactions";
import { useAuth } from "../contexts/AuthContext";

interface CommentProps {
  comment: Comment;
}

const CommentComponent: React.FC<CommentProps> = ({ comment }) => {
  const api = useAuthApi();
  const { isAuthenticated } = useAuth();
  const [likes, setLikes] = useState(comment.likes);
  const [dislikes, setDislikes] = useState(comment.dislikes);
  const [userReaction, setUserReaction] = useState<Comment["user_reaction"]>(comment.user_reaction);
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="border border-purple-100 rounded-xl p-3 mb-2 bg-purple-50/60 shadow-sm">
      <div className="text-xs text-purple-500 mb-1 font-semibold">User {comment.user_id}</div>
      <div className="text-gray-800 mb-2">{comment.content}</div>
      <div className="flex items-center gap-3 text-xs">
        <div className="flex items-center gap-1">
          <button
            className={`cursor-pointer px-1 py-0.5 rounded transition font-bold ${userReaction === 'like' ? 'text-white bg-green-600 shadow' : 'text-gray-500 bg-transparent'} hover:text-white hover:bg-green-600`}
            onClick={() => handleReaction(true)}
            disabled={loading || !isAuthenticated}
            aria-label="Like"
            title={userReaction === 'like' ? 'You liked this' : (!isAuthenticated ? 'Login to like' : 'Like')}
          >
            👍
          </button>
          <span className="text-gray-600">{likes}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            className={`cursor-pointer px-1 py-0.5 rounded transition font-bold ${userReaction === 'dislike' ? 'text-white bg-red-600 shadow' : 'text-gray-500 bg-transparent'} hover:text-white hover:bg-red-600`}
            onClick={() => handleReaction(false)}
            disabled={loading || !isAuthenticated}
            aria-label="Dislike"
            title={userReaction === 'dislike' ? 'You disliked this' : (!isAuthenticated ? 'Login to dislike' : 'Dislike')}
          >
            👎
          </button>
          <span className="text-gray-600">{dislikes}</span>
        </div>
      </div>
    </div>
  );
};

export default CommentComponent;
