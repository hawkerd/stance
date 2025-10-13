"use client";

import React, { useState } from "react";
import { useAuthApi } from "@/app/hooks/useAuthApi";
import StanceContentRenderer from "@/components/StanceContentRenderer";
import { StanceFeedStance } from "@/models";
import { StanceService } from "@/service/StanceService";

interface StanceProps {
  stance: StanceFeedStance;
}

const Stance: React.FC<StanceProps> = ({ stance }) => {
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [ratingError, setRatingError] = useState<string | null>(null);
  const [selectedRating, setSelectedRating] = useState<number | null>(stance.my_rating ?? null);
  const [localNumRatings, setLocalNumRatings] = useState<number>(stance.num_ratings ?? 0);
  const [localAverageRating, setLocalAverageRating] = useState<number | null>(stance.average_rating ?? null);
  const stanceService = new StanceService();

  const API = useAuthApi();

  const handleRateStance = async (rating: number) => {
    setRatingSubmitting(true);
    setRatingError(null);
    try {
      let isUnrate = selectedRating === rating;
      if (isUnrate) {
        await stanceService.rateStance(API, stance.id, null);
        // Update local state: remove rating
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
      } else {
        await stanceService.rateStance(API, stance.id, rating);
        // If user hasn't rated before, update num_ratings and average_rating locally
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
      }
    } catch {
      setRatingError("Failed to rate stance");
    } finally {
      setRatingSubmitting(false);
    }
  };

  return (
    <div className="stance-card relative">
      {/* Floating profile badge */}
      <div className="absolute top-4 right-4 flex flex-col items-center z-10">
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-xl font-bold shadow-md border border-gray-300">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
          </svg>
        </div>
        <span className="text-xs font-semibold text-purple-700 mt-1">{stance.user.username}</span>
      </div>

      {/* Headline */}
      <h2 className="text-2xl md:text-3xl font-extrabold text-purple-700 mb-4 tracking-tight drop-shadow-sm text-center">
        {stance.headline}
      </h2>

      <div className="flex flex-col items-center mb-2">
        {/* Show average only AFTER user rates */}
        {selectedRating !== null && localAverageRating !== null && (
          <div className="flex justify-center items-center mb-2 transition-opacity duration-500 opacity-100">
            <div className="w-28 h-3 bg-gray-200 rounded relative overflow-hidden">
              {/* Avg bar */}
              <div
                className="h-3 bg-yellow-400 rounded transition-all duration-700"
                style={{ width: `${(localAverageRating / 5) * 100}%` }}
              />
            </div>
            <span className="ml-2 text-xs text-gray-500">
              <span className="ml-2 text-gray-400">({localNumRatings} rating{localNumRatings === 1 ? "" : "s"})</span>
            </span>
          </div>
        )}

        {/* Rating Buttons */}
        <div className="flex gap-1 mt-1">
          {[1, 2, 3, 4, 5].map(val => (
            <button
              key={val}
              className={`px-2 py-1 rounded text-xs font-semibold border 
                ${selectedRating === val ? "bg-yellow-300 border-yellow-500" : "bg-gray-100 border-gray-300 hover:bg-yellow-200"} 
                transition`}
              disabled={ratingSubmitting}
              onClick={() => handleRateStance(val)}
              aria-label={selectedRating === val ? `Unrate ${val}` : `Rate ${val}`}
            >
              {val}
            </button>
          ))}
        </div>
        {ratingError && <div className="text-xs text-red-500 mt-1">{ratingError}</div>}
      </div>

      {/* Stance content */}
      {stance.content_json && (
        <div className="mb-4">
          <StanceContentRenderer content_json={stance.content_json} />
        </div>
      )}

      <div className="w-full border-t-2 border-purple-200 my-6 opacity-80" />
    </div>
  );
};

export default Stance;
