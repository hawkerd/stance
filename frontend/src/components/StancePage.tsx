"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useAuthApi } from "@/app/hooks/useAuthApi";
import { StanceService } from "@/service/StanceService";
import { UserService } from "@/service/UserService";
import { Stance, Comment, User } from "@/models";
import StanceContentRenderer from "@/components/StanceContentRenderer";
import CommentComponent from "@/components/Comment";
import VerticalRating from "@/components/VerticalRating";

interface StancePageProps {
  params: Promise<{ stance_id: string }>;
}

export default function StancePage({ params }: StancePageProps) {
  const { stance_id } = use(params);
  const router = useRouter();
  const API = useAuthApi();
  const stanceService = new StanceService();
  const userService = new UserService();

  const [stance, setStance] = useState<Stance | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [myRating, setMyRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStanceData = async () => {
      try {
        setLoading(true);
        
        // Fetch stance
        const stanceResponse = await stanceService.getStance(API, parseInt(stance_id));
        setStance(stanceResponse);

        // Fetch user who created the stance
        const userResponse = await userService.getUser(API, stanceResponse.user_id);
        setUser(userResponse);

        // Fetch comments
        const commentsResponse = await stanceService.getCommentsByStance(API, parseInt(stance_id));
        setComments(commentsResponse);

        // Fetch user's rating if logged in
        try {
          const ratingResponse = await stanceService.getMyStanceRating(API, parseInt(stance_id));
          setMyRating(ratingResponse);
        } catch {
          // User might not be logged in or haven't rated
          setMyRating(null);
        }
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
      await stanceService.rateStance(API, parseInt(stance_id), rating);
      setMyRating(rating);
      
      // Refetch stance to update average rating
      const updatedStance = await stanceService.getStance(API, parseInt(stance_id));
      setStance(updatedStance);
    } catch (err: any) {
      console.error("Failed to rate stance:", err);
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
    <main className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="w-full flex flex-row">
        {/* Left sidebar with back button */}
        <div className="flex-1 flex justify-end pr-6">
          <div className="sticky top-8 z-20 flex flex-col gap-2 h-fit">
            <button
              className="p-2 rounded-full text-purple-400 hover:text-purple-700 transition"
              onClick={() => router.back()}
              aria-label="Back"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="w-full max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            {/* User info - clickable */}
            {user && (
              <div 
                className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition -m-4 p-4 rounded-t-lg"
                onClick={() => router.push(`/users/${user.id}`)}
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-lg font-bold">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{user.username}</div>
                  <div className="text-sm text-gray-500">{user.full_name}</div>
                </div>
              </div>
            )}

            {/* Headline */}
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              {stance.headline}
            </h1>

            {/* Content */}
            <div className="prose max-w-none mb-6">
              <StanceContentRenderer content_json={stance.content_json} />
            </div>

            {/* Rating section */}
            <div className="flex items-center gap-6 pt-6 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Rating:</span>
                {stance.average_rating !== null ? (
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-3 bg-gray-200 rounded">
                      <div
                        className="h-3 bg-yellow-400 rounded"
                        style={{ width: `${(stance.average_rating / 5) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600">
                      {stance.average_rating.toFixed(1)} ({stance.num_ratings})
                    </span>
                  </div>
                ) : (
                  <span className="text-sm text-gray-400">No ratings yet</span>
                )}
              </div>

              {/* User rating */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Your rating:</span>
                <VerticalRating
                  value={myRating}
                  averageRating={stance.average_rating}
                  onChange={handleRatingChange}
                />
              </div>
            </div>
          </div>

          {/* Comments section */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Comments ({comments.length})
            </h2>
            
            {comments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No comments yet. Be the first to comment!
              </p>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <CommentComponent key={comment.id} comment={comment} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right whitespace */}
        <div className="flex-1" />
      </div>
    </main>
  );
}
