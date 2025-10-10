"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { useAuthApi } from "@/app/hooks/useAuthApi";
import { useAuth } from "@/contexts/AuthContext";
import IssueCard from "../components/home-feed/IssueCard";
import EventCard from "../components/home-feed/EventCard";
import { HomeFeedEntity, EntityType, HomeFeedEvent, HomeFeedIssue } from "../models";
import { feedApi } from "@/api";
import { useApi } from "./hooks/useApi";

export default function Home() {
  const authApi = useAuthApi();
  const api = useApi();
  const { initialized } = useAuth();

  const [entities, setEntities] = useState<HomeFeedEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  
  const observerTarget = useRef<HTMLDivElement>(null);

  const fetchEntities = useCallback(async (append = false) => {
    if (!initialized) return;
    
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const entitiesResponse = await feedApi.getHomeFeed(api);
      const newEntities = entitiesResponse.entities ?? [];
      
      if (append) {
        setEntities(prev => [...prev, ...newEntities]);
      } else {
        setEntities(newEntities);
      }
      
      // If we got fewer entities than expected, we might be at the end
      // Adjust this logic based on your API's pagination
      if (newEntities.length === 0) {
        setHasMore(false);
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch entities");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [api, initialized]);

  // Initial fetch
  useEffect(() => {
    fetchEntities(false);
  }, [fetchEntities]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          fetchEntities(true);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loadingMore, loading, fetchEntities]);

  if (!initialized) {
    return <p>Initializing...</p>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-8 bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="w-full max-w-4xl space-y-8">
        {loading && entities.length === 0 && (
          <div className="text-purple-500 text-center">Loading events...</div>
        )}
        {error && <div className="text-red-500 text-center font-medium">{error}</div>}
        
        {entities.map((entity, idx) => (
          <div key={`entity-frag-${entity.id}-${Math.random()}`}>
            {entity.type === EntityType.EVENT ? (
              <EventCard event={entity as HomeFeedEvent} />
            ) : entity.type === EntityType.ISSUE ? (
              <IssueCard issue={entity as HomeFeedIssue} />
            ) : null}
            <div key={`entity-divider-${entity.id}`} className="border-t border-gray-200 w-[90%] mx-auto" />
          </div>
        ))}

        {/* Intersection observer target */}
        <div
          ref={observerTarget}
          className="h-20 flex items-center justify-center"
          style={{ overflowAnchor: 'none' }}
        >
          {loadingMore && (
            <div className="text-purple-500 text-center">Loading more...</div>
          )}
          {!hasMore && entities.length > 0 && (
            <div className="text-gray-400 text-center">No more content</div>
          )}
        </div>
      </div>
    </main>
  );
}