"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import IssueCard from "./EntityFeedIssue";
import EventCard from "./EntityFeedEvent";
import {
  EntityFeedEntity,
  EntityType,
  EntityFeedEvent,
  EntityFeedIssue,
} from "@/models";
import { useApi } from "@/app/hooks/useApi";
import { EntityService } from "@/service/EntityService";

export default function EntityFeed() {
  const entityFeedService = new EntityService();
  const api = useApi();
  const { initialized } = useAuth();

  const [entities, setEntities] = useState<EntityFeedEntity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const cursorRef = useRef<string | null>(null);
  const observerTarget = useRef<HTMLDivElement>(null);
  const fetchingRef = useRef(false); // Prevent duplicate fetches

  const fetchEntities = useCallback(async () => {
    if (!initialized || fetchingRef.current || !hasMore) return;
    
    fetchingRef.current = true;
    setLoading(true);

    try {
      const response = await entityFeedService.getFeed(
        api,
        5,
        3,
        cursorRef.current || undefined
      );

      setEntities(prev => [...prev, ...response.entities]);
      setHasMore(response.hasMore);
      cursorRef.current = response.nextCursor ?? null;
    } catch (err: any) {
      setError(err.message || "Failed to fetch entities");
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [api, initialized, hasMore, entityFeedService]);

  // initial fetch
  useEffect(() => {
    if (initialized && entities.length === 0) {
      fetchEntities();
    }
  }, [initialized]);

  // infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchEntities();
        }
      },
      { threshold: 0.1 }
    );

    const current = observerTarget.current;
    if (current) observer.observe(current);

    return () => {
      if (current) observer.unobserve(current);
    };
  }, [hasMore, loading]);

  if (!initialized) {
    return <p>Initializing...</p>;
  }

  return (
    <div className="w-full max-w-4xl space-y-8">
      {error && <div className="text-red-500 text-center font-medium">{error}</div>}

      {entities.map(entity => (
        <div key={`entity-${entity.id}`} className="space-y-4">
          {entity.type === EntityType.EVENT ? (
            <EventCard event={entity as EntityFeedEvent} />
          ) : entity.type === EntityType.ISSUE ? (
            <IssueCard issue={entity as EntityFeedIssue} />
          ) : null}
          <div className="border-t border-gray-200 w-[90%] mx-auto" />
        </div>
      ))}

      <div
        ref={observerTarget}
        className="h-20 flex items-center justify-center"
        style={{ overflowAnchor: "none" }}
      >
        {loading && <div className="text-purple-500 text-center">Loading...</div>}
        {!hasMore && !loading && (
          <div className="text-gray-400 text-center">No more content</div>
        )}
      </div>
    </div>
  );
}