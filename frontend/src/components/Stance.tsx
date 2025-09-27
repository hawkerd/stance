
import React, { useState } from "react";
import { Stance as StanceType, Comment as CommentType } from "../models/Issue";
import CommentComponent from "./Comment";

interface StanceProps {
  stance: StanceType;
  onAddComment?: (stanceId: number, content: string, parentId?: number) => Promise<void>;
}

const Stance: React.FC<StanceProps> = ({ stance, onAddComment }) => {
  const [commentContent, setCommentContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim() || !onAddComment) return;
    setSubmitting(true);
    setError(null);
    try {
      await onAddComment(stance.id, commentContent);
      setCommentContent("");
    } catch (err) {
      setError("Failed to add comment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col bg-white/80 border border-purple-100 rounded-2xl p-5 shadow-lg hover:shadow-xl transition mb-6">
      <span className="text-sm font-semibold text-purple-700 mb-1">
        User {stance.user_id}
      </span>
      <p className="text-gray-800 leading-relaxed mb-3">{stance.stance}</p>

      <div className="mb-2">
        <div className="font-semibold text-xs text-purple-500 mb-1">Comments</div>
        {stance.comments && stance.comments.length > 0 ? (
          stance.comments.map((comment: CommentType) => (
            <CommentComponent key={comment.id} comment={comment} />
          ))
        ) : (
          <div className="text-xs text-gray-400">No comments yet.</div>
        )}
      </div>

      {onAddComment && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 mt-2">
          <textarea
            className="border border-purple-200 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-purple-50"
            rows={2}
            placeholder="Add a comment..."
            value={commentContent}
            onChange={e => setCommentContent(e.target.value)}
            disabled={submitting}
          />
          <button
            type="submit"
            className="self-end bg-gradient-to-r from-purple-600 to-pink-500 text-white px-4 py-1.5 rounded-full text-xs font-semibold shadow-sm hover:bg-purple-700 hover:to-pink-600 disabled:opacity-50 transition"
            disabled={submitting || !commentContent.trim()}
          >
            {submitting ? "Posting..." : "Post Comment"}
          </button>
          {error && <div className="text-xs text-red-500">{error}</div>}
        </form>
      )}
    </div>
  );
};

export default Stance;
