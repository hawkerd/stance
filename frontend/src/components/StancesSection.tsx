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
                    parent_id:
                      newComment.parent_id === null
                        ? undefined
                        : newComment.parent_id,
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
    <section className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <h2 className="text-xl font-semibold text-blue-800 mb-4 border-b border-gray-200 pb-2">
        {title}
      </h2>
      <ul className="space-y-4">
        {stances.map((stance) => (
          <li
            key={`stance-${stance.id}`} // Ensure unique key
            className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow transition"
          >
            <Stance stance={stance} onAddComment={handleAddComment} />
          </li>
        ))}
      </ul>
    </section>
  );
};

export default StancesSection;
