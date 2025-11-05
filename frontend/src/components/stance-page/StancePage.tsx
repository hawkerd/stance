"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthApi } from "@/app/hooks/useAuthApi";
import { StanceService } from "@/service/StanceService";
import { StanceFeedStance } from "@/models";
import StanceContentRenderer from "@/components/StanceContentRenderer";
import VerticalRating from "@/components/VerticalRating";
import CommentsModal from "@/components/modals/CommentsModal";
import StancePageEntityPreview from "@/components/EntityPreview";


interface StancePageProps {
  entity_id: string;
  stance_id: string;
}

export default function StancePage({ entity_id, stance_id }: StancePageProps) {
  const API = useAuthApi();
  const stanceService = new StanceService();
  const router = useRouter();

  const [stance, setStance] = useState<StanceFeedStance | null>(null);
  const [myRating, setMyRating] = useState<number | null>(null);
  const [localNumRatings, setLocalNumRatings] = useState<number>(0);
  const [localAverageRating, setLocalAverageRating] = useState<number | null>(null);
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStanceData = async () => {
      try {
        setLoading(true);
        // Fetch stance page (richer info)
        const stanceResponse = await stanceService.getStancePage(API, parseInt(entity_id), parseInt(stance_id));
        setStance(stanceResponse);
        setLocalNumRatings(stanceResponse.num_ratings);
        setLocalAverageRating(stanceResponse.average_rating ?? null);
        setMyRating(stanceResponse.my_rating ?? null);
      } catch (err: any) {
        setError(err.message || "Failed to fetch stance");
      } finally {
        setLoading(false);
      }
    };
    fetchStanceData();
  }, [stance_id]);

  const handleRatingChange = async (rating: number | null) => {
    try {
      await stanceService.rateStance(API, parseInt(entity_id), parseInt(stance_id), rating);
      setMyRating(rating);
      // Optimistically update local rating state
      if (stance) {
        if (myRating === null && rating !== null) {
          // New rating
          const newNumRatings = localNumRatings + 1;
          const newAverage = localAverageRating !== null
            ? ((localAverageRating * localNumRatings + rating) / newNumRatings)
            : rating;
          setLocalNumRatings(newNumRatings);
          setLocalAverageRating(newAverage);
        } else if (localAverageRating !== null && myRating !== null && rating !== null) {
          // Update rating
          const total = localAverageRating * localNumRatings - myRating + rating;
          const newAverage = localNumRatings > 0 ? (total / localNumRatings) : rating;
          setLocalAverageRating(newAverage);
        }
      }
    } catch (err: any) {
      console.error("Failed to rate stance:", err);
    }
  };

  const handleResetRating = async () => {
    try {
      await stanceService.rateStance(API, parseInt(entity_id), parseInt(stance_id), null);
      if (localNumRatings > 1 && localAverageRating !== null && myRating !== null) {
        const newNumRatings = localNumRatings - 1;
        const newAverage = newNumRatings > 0 ? ((localAverageRating * localNumRatings - myRating) / newNumRatings) : null;
        setLocalNumRatings(newNumRatings);
        setLocalAverageRating(newAverage);
      } else {
        setLocalNumRatings(0);
        setLocalAverageRating(null);
      }
      setMyRating(null);
    } catch (err: any) {
      console.error("Failed to reset rating:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <p className="text-purple-500 text-lg">Loading stance...</p>
      </div>
    );
  }

  if (error || !stance) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <div className="text-center">
          <p className="text-red-500 text-lg font-semibold">Error</p>
          <p className="text-gray-600 mt-2">{error || "Stance not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-start overflow-hidden p-0 bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="w-full max-w-3xl px-4 py-12 flex flex-col gap-8">
        {/* Entity Preview (expandable) */}
        {stance.entity && (
          <StancePageEntityPreview entity={stance.entity} />
        )}
        {/* User avatar and name at top */}
        {stance.user && (
          <div className="flex items-center gap-3 mb-2">
            {stance.user.avatar_url ? (
              <img
                src={stance.user.avatar_url}
                alt={stance.user.username}
                className="w-14 h-14 rounded-full object-cover border-4 border-purple-100 shadow cursor-pointer"
                onClick={() => router.push(`/users/${stance.user.id}`)}
              />
            ) : (
              <div
                className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-3xl font-bold shadow border-4 border-purple-100 cursor-pointer"
                onClick={() => router.push(`/users/${stance.user.id}`)}
              >
                {stance.user.username.charAt(0).toUpperCase()}
              </div>
            )}
            <span
              className="font-bold text-gray-900 cursor-pointer text-lg tracking-tight"
              onClick={() => router.push(`/users/${stance.user.id}`)}
            >
              {stance.user.username}
            </span>
          </div>
        )}
        {/* Main Content */}
        <div className="flex gap-6 relative">
          <div className="flex-1 relative rounded-2xl border border-purple-100 shadow-lg bg-white p-10 transition-all">
            <h2 className="text-2xl font-extrabold text-[#171717] mb-6 tracking-[-0.02em] text-center" style={{ fontFamily: "'Inter', 'Geist', 'Segoe UI', 'Arial', 'Helvetica', sans-serif" }}>
              {stance.headline}
            </h2>
            {stance.content_json && (
              <div className="tiptap text-base">
                <StanceContentRenderer content_json={stance.content_json} />
              </div>
            )}
            <div className="w-full border-t-2 border-purple-200 my-6 opacity-80" />
          </div>
          {/* Sidebar sticky at bottom right of stance container */}
          <div className="w-12 flex flex-col items-center sticky bottom-4 self-end z-30">
            {/* Rating + Reset Block */}
            <div className="relative flex flex-col items-center gap-1.5 group">
              <VerticalRating
                value={myRating}
                averageRating={localAverageRating}
                onChange={handleRatingChange}
              />
              {myRating !== null && (
                <button
                  className="absolute top-[-6px] right-[-6px] w-4 h-4 flex items-center justify-center bg-gray-400 hover:bg-red-500 text-white rounded-full transition-all opacity-0 group-hover:opacity-70 hover:opacity-100"
                  onClick={handleResetRating}
                  title="Reset rating"
                >
                  <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            {/* Comments Button */}
            <button
              className="flex flex-col items-center gap-0.5 text-gray-600 hover:text-purple-600 transition-colors mt-2"
              onClick={() => setIsCommentsModalOpen(true)}
              aria-label="View comments"
            >
              <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
              </svg>
              <span className="text-sm font-medium">{stance.num_comments}</span>
            </button>
          </div>
          {/* Comments Modal */}
          <CommentsModal
            entityId={parseInt(entity_id)}
            stanceId={parseInt(stance_id)}
            isOpen={isCommentsModalOpen}
            onClose={() => setIsCommentsModalOpen(false)}
            initialCommentCount={stance.num_comments}
          />
        </div>
      </div>
    </main>
  );
}
