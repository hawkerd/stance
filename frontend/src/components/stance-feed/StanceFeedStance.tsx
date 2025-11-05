"use client";

import React, { useState } from "react";
import { useAuthApi } from "@/app/hooks/useAuthApi";
import { useRouter } from "next/navigation";
import StanceContentRenderer from "@/components/StanceContentRenderer";
import { StanceFeedStance } from "@/models";
import { StanceService } from "@/service/StanceService";
import VerticalRating from "@/components/VerticalRating";
import CommentsModal from "@/components/modals/CommentsModal";
import StancePageEntityPreview from "@/components/EntityPreview";

interface StanceProps {
  stance: StanceFeedStance;
}

const Stance: React.FC<StanceProps> = ({ stance }) => {
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [ratingError, setRatingError] = useState<string | null>(null);
  const [selectedRating, setSelectedRating] = useState<number | null>(stance.my_rating ?? null);
  const [localNumRatings, setLocalNumRatings] = useState<number>(stance.num_ratings ?? 0);
  const [localAverageRating, setLocalAverageRating] = useState<number | null>(stance.average_rating ?? null);
  const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);
  const stanceService = new StanceService();
  const API = useAuthApi();
  const router = useRouter();

  const handleRateStance = async (rating: number | null) => {
    if (rating === null) return;
    if (ratingSubmitting) return;
    setRatingSubmitting(true);
    setRatingError(null);
    try {
      await stanceService.rateStance(API, stance.entity.id, stance.id, rating);
      if (selectedRating === null) {
        let newNumRatings = localNumRatings + 1;
        let newAverage = localAverageRating !== null
          ? ((localAverageRating * localNumRatings + rating) / newNumRatings)
          : rating;
        setLocalNumRatings(newNumRatings);
        setLocalAverageRating(newAverage);
      } else if (localAverageRating !== null && selectedRating !== null) {
        let total = localAverageRating * localNumRatings - selectedRating + rating;
        let newAverage = localNumRatings > 0 ? (total / localNumRatings) : rating;
        setLocalAverageRating(newAverage);
      }
      setSelectedRating(rating);
    } catch {
      setRatingError("Failed to rate stance");
    } finally {
      setRatingSubmitting(false);
    }
  };

  const handleResetRating = async () => {
    if (ratingSubmitting) return;
    setRatingSubmitting(true);
    setRatingError(null);
    try {
      await stanceService.rateStance(API, stance.entity.id, stance.id, null);
      if (localNumRatings > 1 && localAverageRating !== null && selectedRating !== null) {
        let newNumRatings = localNumRatings - 1;
        let newAverage = newNumRatings > 0 ? ((localAverageRating * localNumRatings - selectedRating) / newNumRatings) : null;
        setLocalNumRatings(newNumRatings);
        setLocalAverageRating(newAverage);
      } else {
        setLocalNumRatings(0);
        setLocalAverageRating(null);
      }
      setSelectedRating(null);
    } catch {
      setRatingError("Failed to reset rating");
    } finally {
      setRatingSubmitting(false);
    }
  }

  return (
    <div className="flex gap-6 relative h-full">
      {/* Main Content */}
      <div className="flex-1 relative rounded-lg border border-gray-200 shadow-sm bg-white p-8 transition-all hover:shadow-xl hover:shadow-purple-100 hover:border-purple-200 flex flex-col overflow-y-auto scrollbar-hidden">
        {/* Entity Preview */}
        <StancePageEntityPreview entity={stance.entity} />

        <h2 className="text-[2rem] font-extrabold text-[#171717] mb-6 tracking-[-0.02em] text-center" style={{ fontFamily: "'Inter', 'Geist', 'Segoe UI', 'Arial', 'Helvetica', sans-serif" }}>
          {stance.headline}
        </h2>

        {stance.content_json && (
          <div className="mb-4">
            <StanceContentRenderer content_json={stance.content_json} />
          </div>
        )}
      </div>

  {/* Sidebar sticky at bottom right of stance container */}
  <div className="w-12 flex flex-col items-center sticky bottom-4 self-end z-30 gap-3">
        {/* User Profile - TikTok style */}
        <div 
          className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => router.push(`/users/${stance.user.id}`)}
        >
          <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 overflow-hidden shadow-lg border-2 border-white">
            {stance.user.avatar_url ? (
              <img src={stance.user.avatar_url} alt={stance.user.username} className="w-full h-full object-cover" />
            ) : (
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
              </svg>
            )}
          </div>
        </div>

        {/* Rating + Reset Block */}
        <div className="relative flex flex-col items-center gap-1.5 group">
          <VerticalRating
            value={selectedRating}
            averageRating={localAverageRating}
            onChange={(value) => {
              if (ratingSubmitting) return;
              setSelectedRating(value);
              handleRateStance(value);
            }}
          />
          {selectedRating !== null && (
            <button
              className="absolute top-[-6px] right-[-6px] w-4 h-4 flex items-center justify-center bg-gray-400 hover:bg-red-500 text-white rounded-full transition-all opacity-0 group-hover:opacity-70 hover:opacity-100"
              onClick={() => {
                setSelectedRating(null);
                handleResetRating();
              }}
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
        entityId={stance.entity.id}
        stanceId={stance.id}
        isOpen={isCommentsModalOpen}
        onClose={() => setIsCommentsModalOpen(false)}
        initialCommentCount={stance.num_comments}
      />
    </div>


  );
};

export default Stance;
