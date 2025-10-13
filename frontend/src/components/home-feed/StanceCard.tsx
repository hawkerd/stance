"use client";

import React from "react";
import { EntityFeedStance } from "../../models";

export default function StanceHeadline({ stance }: { stance: EntityFeedStance }) {
  return (
    <div className="flex items-center px-2 py-1 rounded border border-gray-100 mb-1 text-xs">
      <span className="font-medium text-black flex-1 break-words">{stance.headline}</span>
      {stance.average_rating !== null ? (
        <span className="ml-2 flex items-center text-gray-400 min-w-[32px]">
          <div className="w-16 h-2 bg-gray-200 rounded">
            <div
              className="h-2 bg-yellow-400 rounded"
              style={{ width: `${(stance.average_rating / 5) * 100}%` }}
            />
          </div>
          <span className="text-[10px] ml-2">{stance.average_rating.toFixed(2)}/5</span>
        </span>
      ) : (
        <span className="ml-2 text-gray-400 text-[10px]">No ratings yet</span>
      )}
    </div>
  );
}
