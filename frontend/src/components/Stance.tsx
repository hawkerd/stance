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
  const [selectedCommentId, setSelectedCommentId] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim() || !onAddComment) return;
    setSubmitting(true);
    setError(null);
    try {
      await onAddComment(stance.id, commentContent, selectedCommentId ?? undefined);
      setCommentContent("");
      setSelectedCommentId(null);
    } catch (err) {
      setError("Failed to add comment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl p-3 mb-2">
      <div className="flex items-center gap-4 mb-1">
        <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-2xl font-bold">
          <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
          </svg>
        </div>
        <span className="text-sm font-semibold text-purple-700">User {stance.user_id}</span>
      </div>
      <p className="text-gray-800 leading-relaxed mb-3">{stance.stance}</p>

      <div className="mb-2">
        {stance.comments && stance.comments.length > 0 ? (
          stance.comments
            .filter(comment => !comment.parent_id)
            .map((comment, idx, arr) => (
              <React.Fragment key={comment.id}>
                <div className="mb-2">
                  <CommentComponent comment={comment} setSelectedCommentId={setSelectedCommentId} />
                  {stance.comments
                    .filter(reply => reply.parent_id === comment.id)
                    .map(reply => (
                      <div key={reply.id} className="ml-2 mt-0 text-xs">
                        <CommentComponent comment={reply} setSelectedCommentId={setSelectedCommentId} />
                      </div>
                    ))}
                </div>
                {idx < arr.length - 1 && (
                  <div className="border-t border-gray-200 mx-2 my-1" />
                )}
              </React.Fragment>
            ))
        ) : (
          <div className="text-xs text-gray-400">No comments yet.</div>
        )}
      </div>

      {onAddComment && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 mt-2">
          {selectedCommentId !== null && (
            <div className="flex items-center gap-2 text-xs text-purple-600">
              Replying to comment #{selectedCommentId}
              <button type="button" className="text-red-500 underline" onClick={() => setSelectedCommentId(null)}>
                Cancel reply
              </button>
            </div>
          )}
          <div className="relative transition-all duration-200 focus-within:shadow-lg">
                <textarea
                  className="border border-purple-200 rounded-lg p-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 bg-purple-50 resize-none w-full h-8 transition-all duration-200 focus:h-20 overflow-hidden placeholder:text-gray-500 text-gray-700"
              rows={2}
              style={{ minHeight: '2rem' }}
              placeholder={selectedCommentId !== null ? "Write a reply..." : "Add a comment..."}
              value={commentContent}
              onChange={e => setCommentContent(e.target.value)}
              disabled={submitting}
            />
            <button
              type="submit"
              className="absolute bottom-2 right-2 p-1 rounded-full text-gray-400 hover:text-purple-600 disabled:text-gray-300 transition"
              disabled={submitting || !commentContent.trim()}
              aria-label={selectedCommentId !== null ? 'Send reply' : 'Send comment'}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          {error && <div className="text-xs text-red-500">{error}</div>}
        </form>
      )}
    </div>
  );
};

export default Stance;
