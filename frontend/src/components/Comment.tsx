import React from "react";
import { Comment } from "../models/Issue";

interface CommentProps {
  comment: Comment;
}

const CommentComponent: React.FC<CommentProps> = ({ comment }) => (
  <div className="border border-purple-100 rounded-xl p-3 mb-2 bg-purple-50/60 shadow-sm">
    <div className="text-xs text-purple-500 mb-1 font-semibold">User {comment.user_id}</div>
    <div className="text-gray-800">{comment.content}</div>
  </div>
);

export default CommentComponent;
