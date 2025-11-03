"use client";

import React, { useEffect, useState, useCallback } from "react";
import StanceCard from "@/components/entity-page/EntityStanceCard";
import { useAuthApi } from "@/app/hooks/useAuthApi";
import { PaginatedStancesByEntityStance } from "@/models";
import { EntityService } from "@/service/EntityService";
import { useRouter } from "next/navigation";
import { useInfiniteScroll } from "@/app/hooks/useInfiniteScroll";
import { useAuth } from "@/contexts/AuthContext";

interface EntityStancesGridProps {
  entityId: number;
}

export default function EntityStancesGrid({ entityId }: EntityStancesGridProps) {
  const [stances, setStances] = useState<PaginatedStancesByEntityStance[]>([]);
  const [userStance, setUserStance] = useState<PaginatedStancesByEntityStance | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursorScore, setNextCursorScore] = useState<number | null>(null);
  const [nextCursorId, setNextCursorId] = useState<number | null>(null);

  const API = useAuthApi();
  const entityService = new EntityService();
  const router = useRouter();
  const { isAuthenticated, initialized } = useAuth();

  // Fetch user's stance only if authenticated
  useEffect(() => {
    if (!initialized || !isAuthenticated) return;

    async function fetchUserStance() {
      try {
        const response = await entityService.getMyStanceForEntity(API, entityId);
        if (response) {
          setUserStance(response);
        }
      } catch (err: any) {
        // User might not have a stance
        console.error("Failed to fetch user stance:", err);
      }
    }
    fetchUserStance();
  }, [entityId, isAuthenticated, initialized]);

  // Initial fetch
  useEffect(() => {
    async function initialFetch() {
      try {
        setLoading(true);
        const response = await entityService.getStancesByEntity(API, entityId);
        setStances(response.stances);
        setNextCursorScore(response.nextCursorScore);
        setNextCursorId(response.nextCursorId);
        if (!response.nextCursorId && !response.nextCursorScore) {
          setHasMore(false);
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch stances");
      } finally {
        setLoading(false);
      }
    }
    initialFetch();
  }, [entityId]);

  // Fetch more stances
  const fetchMoreStances = useCallback(async () => {
    try {
      if (loadingMore || loading || !hasMore) return;
      
      setLoadingMore(true);

      const newStances = await entityService.getStancesByEntity(
        API,
        entityId,
        {
          score: nextCursorScore!,
          id: nextCursorId!,
        }
      );
      
      setNextCursorScore(newStances.nextCursorScore);
      setNextCursorId(newStances.nextCursorId);
      setStances((prev) => [...prev, ...newStances.stances]);
      
      if (newStances.stances.length === 0 || (!newStances.nextCursorId && !newStances.nextCursorScore)) {
        setHasMore(false);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch more stances");
    } finally {
      setLoadingMore(false);
    }
  }, [API, entityId, nextCursorScore, nextCursorId, loadingMore, loading, hasMore]);

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
    return null;
  }

  return (
    <div className="w-full">
      {/* Grid of stance cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* User's stance first if available */}
        {userStance && (
          <StanceCard
            key={userStance.id}
            stance={userStance}
            onClick={() => handleStanceClick(userStance.id)}
            isUserStance={true}
          />
        )}
        
        {/* Rest of the stances, filtering out the user's stance if it's already shown */}
        {stances
          .filter((stance) => !userStance || stance.id !== userStance.id)
          .map((stance) => (
            <StanceCard
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
        {!hasMore && stances.length > 0 && (
          <div className="text-gray-400 text-center">You've reached the end...</div>
        )}
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
