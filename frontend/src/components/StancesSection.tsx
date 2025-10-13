"use client";

import React, { useState } from "react";
import Stance from "@/components/Stance";
import { Stance as StanceType } from "../models";
import { useAuthApi } from "@/app/hooks/useAuthApi";
import { CommentService } from "@/service/CommentService";
import { Comment } from "@/models";

export interface StancesSectionProps {
  stances: StanceType[];
}

const StancesSection: React.FC<StancesSectionProps> = ({ stances: initialStances }) => {
  const API = useAuthApi();
  const [stances, setStances] = useState<StanceType[]>(initialStances);
  const commentService = new CommentService();

  const handleAddComment = async (stanceId: number, content: string, parentId?: number) => {
    try {
      const newComment: Comment = await commentService.createComment(API, stanceId, content, parentId);

      setStances(prevStances =>
        prevStances.map(stance =>
          stance.id === stanceId
        ? {
            ...stance,
            comments: [
          ...(stance.comments || []),
          {
            ...newComment,
            parent_id: newComment.parent_id ?? undefined,
            user_reaction: newComment.user_reaction,
            count_nested_replies: newComment.count_nested_replies,
          },
            ],
          }
        : stance
        )
      );
    } catch (err: any) {
      console.error("Failed to add comment:", err.message);
    }
  };

  if (!stances || stances.length === 0) return null;

  return (
    <section>
      <ul className="space-y-4">
        {stances.map((stance) => (
          <li
            key={`stance-${stance.id}`}
            className="border border-purple-100 rounded-xl"
          >
            <Stance stance={stance} onAddComment={handleAddComment} />
          </li>
        ))}
      </ul>
    </section>
  );
};

export default StancesSection;
