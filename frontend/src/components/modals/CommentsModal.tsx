"use client";

import React, { useState, useEffect, useRef } from "react";
import { Comment } from "@/models";
import CommentComponent from "@/components/Comment";
import { useAuthApi } from "@/app/hooks/useAuthApi";
import { CommentService } from "@/service/CommentService";
import { stancesApi } from "@/api";

interface CommentsModalProps {
  stanceId: number;
  isOpen: boolean;
  onClose: () => void;
  initialCommentCount: number;
}

const CommentsModal: React.FC<CommentsModalProps> = ({
  stanceId,
  isOpen,
  onClose,
  initialCommentCount,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [commentContent, setCommentContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [selectedCommentId, setSelectedCommentId] = useState<number | null>(null);
  
  const API = useAuthApi();
  const commentService = new CommentService();
  const modalRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fetch comments when modal opens
  useEffect(() => {
    if (isOpen && comments.length === 0) {
      fetchComments();
    }
  }, [isOpen]);

  // Handle click outside to close
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  // Handle escape key to close
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const fetchComments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await stancesApi.getCommentsByStance(API, stanceId);
      const fetchedComments: Comment[] = response.comments.map(c => ({
        id: c.id,
        user_id: c.user_id,
        parent_id: c.parent_id ?? undefined,
        content: c.content,
        likes: c.likes,
        dislikes: c.dislikes,
        count_nested_replies: c.count_nested,
        user_reaction: c.user_reaction as "like" | "dislike" | null,
      }));
      setComments(fetchedComments);
    } catch (err: any) {
      setError("Failed to load comments");
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentContent.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      const newComment = await commentService.createComment(
        API,
        stanceId,
        commentContent,
        selectedCommentId ?? undefined
      );
      
      // Add the new comment to the list
      setComments(prev => [newComment, ...prev]);
      setCommentContent("");
      setSelectedCommentId(null);
    } catch (err: any) {
      setError("Failed to add comment");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Top-level comments (no parent)
  const topLevelComments = comments.filter(c => !c.parent_id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end">
      <div
        ref={modalRef}
        className="bg-white shadow-2xl w-full max-w-md h-screen flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-800">
            Comments
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {loading && (
            <div className="text-center text-gray-500 py-8">Loading comments...</div>
          )}
          
          {!loading && comments.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
              </svg>
              <p>No comments yet</p>
              <p className="text-sm mt-1">Be the first to comment!</p>
            </div>
          )}

          {!loading && topLevelComments.map((comment, idx) => (
            <React.Fragment key={comment.id}>
              <div className="mb-2">
                <CommentComponent 
                  comment={comment} 
                  setSelectedCommentId={setSelectedCommentId}
                />
                {/* Show replies */}
                {comments
                  .filter(reply => reply.parent_id === comment.id)
                  .map(reply => (
                    <div key={reply.id} className="ml-8 mt-2">
                      <CommentComponent 
                        comment={reply} 
                        setSelectedCommentId={setSelectedCommentId}
                      />
                    </div>
                  ))}
              </div>
              {idx < topLevelComments.length - 1 && (
                <div className="border-t border-gray-100 my-3" />
              )}
            </React.Fragment>
          ))}

          {error && !submitting && (
            <div className="text-red-500 text-sm text-center py-2">{error}</div>
          )}
        </div>

        {/* Comment Input Form */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          {selectedCommentId !== null && (
            <div className="flex items-center gap-2 mb-2 text-xs text-purple-600">
              <span>Replying to comment #{selectedCommentId}</span>
              <button 
                type="button" 
                className="text-red-500 underline hover:text-red-700" 
                onClick={() => setSelectedCommentId(null)}
              >
                Cancel
              </button>
            </div>
          )}
          
          <form onSubmit={handleAddComment} className="relative">
            <textarea
              ref={textareaRef}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent resize-none bg-white"
              rows={1}
              placeholder={selectedCommentId ? "Write a reply..." : "Add a comment..."}
              value={commentContent}
              onChange={e => setCommentContent(e.target.value)}
              disabled={submitting}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = Math.min(target.scrollHeight, 120) + 'px';
              }}
            />
            <button
              type="submit"
              className="absolute bottom-3 right-3 p-1.5 rounded-full bg-purple-600 text-white hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
              disabled={submitting || !commentContent.trim()}
              aria-label="Send"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CommentsModal;
