"use client";

import React, { useEffect, useState, use } from "react";
import StancesSection from "@/components/StancesSection";
import { useRouter } from "next/navigation";
import { Event } from "@/models/Issue";
import { useApi } from "@/app/hooks/useApi";
import { eventsApi, stancesApi, commentsApi } from "@/api";

interface EventPageProps {
  params: Promise<{ event_id: string }>;
}

export default function EventPage({ params }: EventPageProps) {
    const API = useApi();
    const { event_id } = use(params);
    const router = useRouter();
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEvent = async () => {
        setLoading(true);
        setError(null);
        try {
            const eventResponse = await eventsApi.getEvent(API, parseInt(event_id));
            const stancesResponse = await stancesApi.getStancesByEvent(API, parseInt(event_id));
            for (const stance of stancesResponse.stances || []) {
                const commentsResponse = await commentsApi.getCommentsByStance(API, stance.id);
                const eventData: Event = {
                    id: eventResponse.id,
                    title: eventResponse.title,
                    description: eventResponse.description ?? undefined,
                    stances: (stancesResponse.stances ?? []).map(s => ({
                        ...s,
                        comments: (commentsResponse.comments ?? []).map(c => ({
                            ...c,
                            parent_id: c.parent_id === null ? undefined : c.parent_id,
                        })),
                    })),
                };
            setEvent(eventData);
            }
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
      <button
        className="mb-6 px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
        onClick={() => router.push("/")}
      >
        ← Back
      </button>
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
            <StancesSection stances={event.stances} />
        </>
        )}
    </div>
    );

}
