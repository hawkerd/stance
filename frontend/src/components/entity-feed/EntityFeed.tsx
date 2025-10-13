"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import IssueCard from "./EntityFeedIssue";
import EventCard from "./EntityFeedEvent";
import { EntityFeedEntity, EntityType, EntityFeedEvent, EntityFeedIssue } from "@/models";
import { useApi } from "@/app/hooks/useApi";
import { EntityService } from "@/service/EntityService";

export default function EntityFeed() {
  const entityFeedService = new EntityService();
  const api = useApi();
  const { initialized } = useAuth();

  const [entities, setEntities] = useState<EntityFeedEntity[]>([]);
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
      setHasMore(true);
    }

    try {
      const newEntities = await entityFeedService.getFeed(api, 5, 3);

      if (append) {
        setEntities(prev => [...prev, ...newEntities]);
      } else {
        setEntities(newEntities);
      }

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

  useEffect(() => {
    fetchEntities(false);
  }, [fetchEntities]);

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
    <div className="w-full max-w-4xl space-y-8">
      {loading && entities.length === 0 && (
        <div className="text-purple-500 text-center">Loading events...</div>
      )}
      {error && <div className="text-red-500 text-center font-medium">{error}</div>}

      {entities.map((entity) => (
        <div key={`entity-${entity.id}=${Math.random()}`} className="space-y-4">
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
        {loadingMore && (
          <div className="text-purple-500 text-center">Loading more...</div>
        )}
        {!hasMore && entities.length > 0 && (
          <div className="text-gray-400 text-center">No more content</div>
        )}
      </div>
    </div>
  );
}
