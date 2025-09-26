import React from "react";
import { Comment } from "../models/Issue";

interface CommentProps {
  comment: Comment;
}

const CommentComponent: React.FC<CommentProps> = ({ comment }) => (
  <div className="border border-gray-200 rounded p-2 mb-2 bg-white">
    <div className="text-xs text-gray-500 mb-1">User {comment.user_id}</div>
    <div className="text-gray-800">{comment.content}</div>
  </div>
);

export default CommentComponent;
