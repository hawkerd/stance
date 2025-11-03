"use client";

import React from "react";
import { StanceFeedStance } from "@/models";
import { useRouter } from "next/navigation";

interface PinnedUserStanceCardProps {
  stance: StanceFeedStance;
}

export default function PinnedUserStanceCard({ stance }: PinnedUserStanceCardProps) {
  const router = useRouter();

  return (
    <div
      className="w-full h-full bg-white rounded-2xl shadow-lg border border-purple-100 hover:shadow-xl hover:border-purple-300 transition-all cursor-pointer flex flex-row overflow-hidden group min-h-[180px]"
      onClick={() => router.push(`/entities/${stance.entity.id}/stances/${stance.id}`)}
      tabIndex={0}
      role="button"
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') router.push(`/entities/${stance.entity.id}/stances/${stance.id}`); }}
    >
      {/* Entity info and badge */}
      <div className="flex flex-col items-center justify-center px-6 py-4 bg-purple-50 border-r border-purple-100 min-w-[120px] relative">
        <div className="absolute top-2 left-2 z-10">
          <span className="bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow">Pinned</span>
        </div>
        <div className="w-10 h-10 rounded bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-lg font-bold mb-2">
          {stance.entity?.title?.charAt(0).toUpperCase()}
        </div>
        <span className="text-xs font-medium text-gray-700 text-center line-clamp-2 max-w-[80px]">
          {stance.entity?.title}
        </span>
      </div>
      {/* Main content */}
      <div className="flex-1 flex flex-col justify-between p-4">
        <h3 className="text-base font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-purple-600 transition-colors">
          {stance.headline}
        </h3>
        <div className="flex-1 overflow-hidden mb-2">
          <p className="text-sm text-gray-600 line-clamp-2">
            {(() => {
              try {
                const content = JSON.parse(stance.content_json);
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
