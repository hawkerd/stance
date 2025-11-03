"use client";

import React from "react";
import { PaginatedStancesByEntityStance } from "@/models";
import { useRouter } from "next/navigation";

interface StanceCardProps {
  stance: PaginatedStancesByEntityStance;
  isUserStance?: boolean;
}

export default function StanceCard({ stance, isUserStance = false }: StanceCardProps) {
  const router = useRouter();

  // navigate to stance page
  const handleCardClick = (e: React.MouseEvent) => {
    router.push(`/stances/${stance.id}`);
  };

  // navigate to user page
  const handleUserClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/users/${stance.user.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`aspect-square bg-white rounded-2xl shadow-lg border border-purple-100 hover:shadow-xl hover:border-purple-300 transition-all cursor-pointer overflow-hidden group ${
        isUserStance ? 'ring-2 ring-purple-400' : ''
      }`}
    >
      <div className="h-full p-4 flex flex-col">
        {/* User info */}
        <div
          className="flex items-center gap-2 mb-3 cursor-pointer transition-colors rounded hover:bg-purple-50/80 hover:text-purple-700 group/user px-1 -mx-1"
          onClick={handleUserClick}
        >
          {stance.user.avatar_url ? (
            <img
              src={stance.user.avatar_url}
              alt={`${stance.user.username}'s avatar`}
              className="w-8 h-8 rounded-full object-cover border border-gray-200 flex-shrink-0 group-hover/user:ring-2 group-hover/user:ring-purple-300 transition"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 group-hover/user:ring-2 group-hover/user:ring-purple-300 transition">
              {stance.user.username.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="text-sm font-medium text-gray-700 truncate group-hover/user:text-purple-700 transition-colors">
            {stance.user.username}
          </span>
        </div>

        {/* Headline */}
        <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-3 group-hover:text-purple-600 transition-colors">
          {stance.headline}
        </h3>

        {/* Content preview - parse JSON and show first bit of text */}
        <div className="flex-1 overflow-hidden mb-3">
          <p className="text-sm text-gray-600 line-clamp-3">
            {(() => {
              try {
                const content = JSON.parse(stance.content_json);
                // Extract text from TipTap JSON structure
                const getText = (node: any): string => {
                  if (node.type === 'text') return node.text || '';
                  if (node.content) {
                    return node.content.map(getText).join('');
                  }
                  return '';
                };
                return getText(content) || 'No content';
              } catch {
                return 'No content';
              }
            })()}
          </p>
        </div>

        {/* Footer with stats */}
        <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-100 pt-2">
          {/* Rating */}
          <div className="flex items-center gap-2 flex-1">
            {stance.average_rating !== null && stance.average_rating !== undefined ? (
              <div className="flex items-center gap-1 flex-1">
                <div className="flex-1 max-w-[80px] h-2 bg-gray-200 rounded">
                  <div
                    className="h-2 bg-yellow-400 rounded"
                    style={{ width: `${(stance.average_rating / 5) * 100}%` }}
                  />
                </div>
                <span className="text-gray-400">({stance.num_ratings})</span>
              </div>
            ) : (
              <span className="text-gray-400 text-[10px]">No ratings</span>
            )}
          </div>

          {/* Comments */}
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>{stance.num_comments}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
