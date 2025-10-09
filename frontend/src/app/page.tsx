

"use client";
import { useEffect, useState } from "react";
import { useAuthApi } from "@/app/hooks/useAuthApi";
import { useAuth } from "@/contexts/AuthContext";
import IssueCard from "../components/IssueCard";
import { components } from "@/api/models/models";
import EventCard from "../components/EventCard";
import { Entity, EntityType, Event, Issue } from "../models";
import { entitiesApi, stancesApi } from "@/api";
import { useApi } from "./hooks/useApi";

export default function Home() {
  const authApi = useAuthApi();
  const api = useApi();
  const { initialized } = useAuth();

  const [entities, setEntities] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!initialized) return;

    const fetchEvents = async () => {
      try {
        const eventsResponse = await entitiesApi.listEntities(api);

        const entitiesList: Entity[] = [];

        for (const entityData of eventsResponse.entities) {
          const entity: Entity = { ...entityData, description: entityData.description ?? "", stances: [], start_time: entityData.start_time ?? null, end_time: entityData.end_time ?? null };
          const stancesResponse = await stancesApi.getStancesByEntity(api, entity.id);
          entity.stances = stancesResponse.stances.map((stance: any) => ({
            ...stance,
            comments: [],
          }));
          entitiesList.push(entity);
        }

        setEntities(entitiesList);
      } catch (err: any) {
        setError(err.message || "Failed to fetch entities");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [api, initialized]);


  if (!initialized) {
    return <p>Initializing...</p>;
  }
  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-8 bg-gradient-to-br from-purple-50 via-white to-pink-50">
  <div className="w-full max-w-4xl space-y-8">
        {loading && <div className="text-purple-500 text-center">Loading events...</div>}
        {error && <div className="text-red-500 text-center font-medium">{error}</div>}
        {entities.map((entity, idx) => (
          <div key={`entity-frag-${entity.id}`}>
            {entity.type === EntityType.EVENT ? (
              <EventCard event={entity as Event} />
            ) : entity.type === EntityType.ISSUE ? (
              <IssueCard issue={entity as Issue} />
            ) : null}
            <div key={`entity-divider-${entity.id}`} className="border-t border-gray-200 w-[90%] mx-auto" />
          </div>
        ))}
      </div>
    </main>
  );
}
