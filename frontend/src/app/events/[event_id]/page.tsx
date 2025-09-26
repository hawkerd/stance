"use client";

import React, { useEffect, useState, use } from "react";
import { Event } from "@/models/Issue";
import { components } from "@/models/api";

interface EventPageProps {
  params: Promise<{ event_id: string }>;
}

type StanceListResponse = components["schemas"]["StanceListResponse"];
type EventReadResponse = components["schemas"]["EventReadResponse"];

export default function EventPage({ params }: EventPageProps) {
  const { event_id } = use(params);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`http://localhost:8000/events/${event_id}`);
        if (!res.ok) {
          const errBody = await res.json();
          throw new Error(errBody.detail || "Failed to load event.");
        }
        const data: EventReadResponse = await res.json();
        const stancesRes = await fetch(`http://localhost:8000/stances/event/${data.id}`);
        if (!stancesRes.ok) {
          throw new Error("Failed to fetch stances");
        }
        const stancesData: StanceListResponse = await stancesRes.json();
        const eventData: Event = {
            id: data.id,
            title: data.title,
            description: data.description ?? undefined,
            stances: stancesData.stances ?? [],
        };
        setEvent(eventData);
      } catch (err: any) {
        setError(err.message || "Unexpected error");
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [event_id]);


    return (
    <div className="max-w-3xl mx-auto py-10 px-4">
        {loading && <div className="text-gray-500 italic">Loading issue...</div>}
        {error && (
        <div className="bg-red-100 border border-red-300 text-red-700 p-3 rounded-lg mb-6">
            {error}
        </div>
        )}

        {event && (
        <>
            {/* Title */}
            <h1 className="text-3xl font-extrabold text-gray-900 mb-4">
            {event.title}
            </h1>

            {/* Description */}
            <div className="bg-white shadow rounded-xl p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Description
            </h2>
            <p className="text-gray-700 leading-relaxed">
                {event.description || "No description provided."}
            </p>
            </div>

            {/* Stances */}
            {event.stances.length > 0 && (
            <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">
                Stances
                </h2>
                <ul className="space-y-3">
                {event.stances.map((stance) => (
                    <li
                    key={stance.id}
                    className="flex items-start bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-sm"
                    >
                    <span className="mr-3 font-medium text-blue-600">
                        {stance.user_id}:
                    </span>
                    <span className="text-gray-700">{stance.stance}</span>
                    </li>
                ))}
                </ul>
            </div>
            )}
        </>
        )}
    </div>
    );

}
