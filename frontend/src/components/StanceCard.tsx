"use client";

import React from "react";
import { Stance } from "../models";

export default function StanceCard({ stance }: { stance: Stance }) {
  return (
  <div className="flex items-center px-2 py-1 rounded border border-gray-100 mb-1 text-xs">
      <span className="font-medium text-black flex-1 break-words">{stance.headline}</span>
      <span className="ml-2 flex flex-col items-start gap-1 text-gray-400 min-w-[32px]">
        {/* Upvote arrow */}
        <div className="flex items-center">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
          </svg>
          <span className="text-[10px] ml-1">0</span>
        </div>
        {/* Downvote arrow */}
        <div className="flex items-center">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
          <span className="text-[10px] ml-1">0</span>
        </div>
      </span>
    </div>
  );
}
