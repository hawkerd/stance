"use client";

import React, { useEffect, useState, useCallback } from "react";
import UserStanceCard from "@/components/user-page/UserStanceCard";
import PinnedUserStanceCard from "@/components/user-page/PinnedUserStanceCard";
import { useAuthApi } from "@/app/hooks/useAuthApi";
import { PaginatedStancesByUserStance } from "@/models";
import { UserService } from "@/service/UserService";
import { useRouter } from "next/navigation";
import { useInfiniteScroll } from "@/app/hooks/useInfiniteScroll";

import { StanceFeedStance } from "@/models";
import { StanceService } from "@/service/StanceService";

interface UserStancesGridProps {
  userId: number;
  pinnedStanceDetails: {
    entityId?: number;
    stanceId?: number;
  }
}

export default function UserStancesGrid({ userId, pinnedStanceDetails }: UserStancesGridProps) {
  const [stances, setStances] = useState<PaginatedStancesByUserStance[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [pinnedStance, setPinnedStance] = useState<StanceFeedStance | null>(null);
  const [loadingPinned, setLoadingPinned] = useState(false);

  const API = useAuthApi();
  const userService = new UserService();
  const stanceService = new StanceService();
  const router = useRouter();

  // Fetch pinned stance if provided
  useEffect(() => {
    if (!pinnedStanceDetails.entityId || !pinnedStanceDetails.stanceId) {
      setPinnedStance(null);
      return;
    }
    setLoadingPinned(true);
    stanceService.getStancePage(API, pinnedStanceDetails.entityId, pinnedStanceDetails.stanceId)
      .then((stance) => setPinnedStance(stance))
      .catch(() => setPinnedStance(null))
      .finally(() => setLoadingPinned(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pinnedStanceDetails]);

  // Initial fetch
  useEffect(() => {
    async function initialFetch() {
      try {
        setLoading(true);
        const response = await stanceService.getStancesByUser(API, userId);
        setStances(response.stances);
        if (response.next_cursor) {
          setNextCursor(response.next_cursor);
        } else {
          setHasMore(false);
        }
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

      const stancesResponse = await stanceService.getStancesByUser(API, userId, nextCursor);
      
      setStances((prev) => [...prev, ...stancesResponse.stances]);
      
      if (stancesResponse.next_cursor) {
        setNextCursor(stancesResponse.next_cursor);
      } else {
        setHasMore(false);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch more stances");
    } finally {
      setLoadingMore(false);
    }
  }, [API, userId, nextCursor, loadingMore, loading, hasMore]);

  const { loadMoreRef } = useInfiniteScroll(fetchMoreStances, hasMore);

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
      {loadingPinned && (
        <div className="text-purple-500 text-center py-4">Loading pinned stance...</div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {pinnedStance && (
          <div className="col-span-2 md:col-span-3">
            <PinnedUserStanceCard stance={pinnedStance as any} />
          </div>
        )}
        {stances
          .filter((stance) => !pinnedStance || stance.id !== pinnedStance.id)
          .map((stance) => (
            <UserStanceCard
              key={stance.id}
              stance={stance}
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
