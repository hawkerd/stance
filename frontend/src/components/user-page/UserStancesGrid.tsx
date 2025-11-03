"use client";

import React, { useEffect, useState, useCallback } from "react";
import UserStanceCard from "@/components/user-page/UserStanceCard";
import { useAuthApi } from "@/app/hooks/useAuthApi";
import { PaginatedStancesByUserStance } from "@/models";
import { UserService } from "@/service/UserService";
import { useRouter } from "next/navigation";
import { useInfiniteScroll } from "@/app/hooks/useInfiniteScroll";

interface UserStancesGridProps {
  userId: number;
}

export default function UserStancesGrid({ userId }: UserStancesGridProps) {
  const [stances, setStances] = useState<PaginatedStancesByUserStance[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const API = useAuthApi();
  const userService = new UserService();
  const router = useRouter();

  // Initial fetch
  useEffect(() => {
    async function initialFetch() {
      try {
        setLoading(true);
        const response = await userService.getStancesByUser(API, userId);
        setStances(response);
        // TODO: Set nextCursor when pagination is implemented
        setHasMore(false); // For now, assuming single page
      } catch (err: any) {
        setError(err.message || "Failed to fetch stances");
      } finally {
        setLoading(false);
      }
    }
    initialFetch();
  }, [userId]);

  // Fetch more stances
  const fetchMoreStances = useCallback(async () => {
    try {
      if (loadingMore || loading || !hasMore || !nextCursor) return;
      
      setLoadingMore(true);

      const newStances = await userService.getStancesByUser(API, userId, nextCursor);
      
      setStances((prev) => [...prev, ...newStances]);
      
      if (newStances.length === 0) {
        setHasMore(false);
      }
      // TODO: Update nextCursor from response when pagination is implemented
    } catch (err: any) {
      setError(err.message || "Failed to fetch more stances");
    } finally {
      setLoadingMore(false);
    }
  }, [API, userId, nextCursor, loadingMore, loading, hasMore]);

  const { loadMoreRef } = useInfiniteScroll(fetchMoreStances, hasMore);

  const handleStanceClick = (stanceId: number) => {
    // Navigate to the stance page
    router.push(`/stances/${stanceId}`);
  };

  if (loading && stances.length === 0) {
    return (
      <div className="text-purple-500 text-center py-8">
        Loading stances...
      </div>
    );
  }

  if (error && stances.length === 0) {
    return (
      <div className="text-red-500 text-center font-medium py-8">
        {error}
      </div>
    );
  }

  if (stances.length === 0) {
    return (
      <div className="text-gray-500 text-center py-8">
        No stances yet.
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Grid of stance cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stances.map((stance) => (
          <UserStanceCard
            key={stance.id}
            stance={stance}
            onClick={() => handleStanceClick(stance.id)}
          />
        ))}
      </div>

      {/* Loading more indicator */}
      {loadingMore && (
        <div className="text-purple-500 text-center py-8">
          Loading more stances...
        </div>
      )}

      {/* Infinite scroll trigger */}
      <div
        ref={loadMoreRef}
        className="h-20 flex items-center justify-center"
        style={{ overflowAnchor: "none" }}
      >
      </div>

      {/* Error during pagination */}
      {error && stances.length > 0 && (
        <div className="text-red-500 text-center text-sm py-4">
          {error}
        </div>
      )}
    </div>
  );
}
