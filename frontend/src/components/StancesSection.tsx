"use client";

import React, { useState } from "react";
import Stance from "@/components/Stance";
import { Stance as StanceType } from "../models/Issue";
import { useAuthApi } from "@/app/hooks/useAuthApi";
import { commentsApi } from "@/api";

export interface StancesSectionProps {
  stances: StanceType[];
  title?: string;
}

const StancesSection: React.FC<StancesSectionProps> = ({ stances: initialStances, title = "Stances" }) => {
  const API = useAuthApi();
  const [stances, setStances] = useState<StanceType[]>(initialStances);

  const handleAddComment = async (stanceId: number, content: string, parentId?: number) => {
    try {
      // Use the API instance when calling the comment creation function
      const newComment = await commentsApi.createComment(API, {
        stance_id: stanceId,
        content,
        parent_id: parentId,
      });

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
            user_reaction:
              newComment.user_reaction === "like" ||
              newComment.user_reaction === "dislike" ||
              newComment.user_reaction === null
            ? newComment.user_reaction
            : null,
            count_nested_replies:
              typeof newComment.count_nested === "number"
            ? newComment.count_nested
            : 0,
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
