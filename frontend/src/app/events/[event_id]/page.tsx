"use client";

import React, { useEffect, useState, use } from "react";
import StancesSection from "@/components/StancesSection";
import { useRouter } from "next/navigation";
import { Event } from "@/models/Issue";
import { useAuthApi } from "@/app/hooks/useAuthApi";
import { eventsApi, stancesApi } from "@/api";
import { useAuth } from "@/contexts/AuthContext";
import StanceComponent from "@/components/Stance";
import { Stance as StanceType } from "@/models/Issue";
import StanceCreateModal from "@/components/stance-create/StanceCreateModal";

interface EventPageProps {
  params: Promise<{ event_id: string }>;
}

export default function EventPage({ params }: EventPageProps) {
    const API = useAuthApi();
    const { event_id } = use(params);
    const router = useRouter();
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userStance, setUserStance] = useState<StanceType | null | undefined>(undefined);
    const [showStanceModal, setShowStanceModal] = useState(false);
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        const fetchEvent = async () => {
        setLoading(true);
        setError(null);
        try {
            const eventResponse = await eventsApi.getEvent(API, parseInt(event_id));
            const stancesResponse = await stancesApi.getStancesByEvent(API, parseInt(event_id));
            const stances = await Promise.all(
                (stancesResponse.stances ?? []).map(async (s) => {
                    const commentsResponse = await stancesApi.getCommentsByStance(API, s.id);

                    return {
                        ...s,
                        comments: (commentsResponse.comments ?? []).map(c => ({
                            ...c,
                            parent_id: c.parent_id === null ? undefined : c.parent_id,
                            user_reaction:
                                c.user_reaction === "like" || c.user_reaction === "dislike" || c.user_reaction === null
                                    ? (c.user_reaction as "like" | "dislike" | null)
                                    : null,
                            count_nested_replies: c.count_nested,
                        })),
                    };
                })
            );
            const eventData: Event = {
                id: eventResponse.id,
                title: eventResponse.title,
                description: eventResponse.description ?? undefined,
                start_time: eventResponse.start_time ?? undefined,
                end_time: eventResponse.end_time ?? undefined,
                stances: stances,
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

    useEffect(() => {
        const fetchUserStance = async () => {
            if (!isAuthenticated) {
                setUserStance(undefined);
                return;
            }
            try {
                const stanceRes = await eventsApi.getMyStanceForEvent(API, parseInt(event_id));
                if (!stanceRes) {
                    setUserStance(null);
                    return;
                }
                const commentsResponse = await stancesApi.getCommentsByStance(API, stanceRes.id);

                const stance: StanceType = {
                    ...stanceRes,
                    comments: (commentsResponse.comments ?? []).map(c => ({
                        ...c,
                        parent_id: c.parent_id === null ? undefined : c.parent_id,
                        user_reaction:
                            c.user_reaction === "like" || c.user_reaction === "dislike" || c.user_reaction === null
                                ? (c.user_reaction as "like" | "dislike" | null)
                                : null,
                        count_nested_replies: c.count_nested,
                    })),
                };
                setUserStance(stance);
            } catch (err) {
                setUserStance(null);
            }
        };
        fetchUserStance();
    }, [isAuthenticated, API, event_id]);

        return (
            <>
                <main className="min-h-screen flex flex-col items-center justify-start p-8 bg-gradient-to-br from-purple-50 via-white to-pink-50">
                    <div className="w-full flex flex-row">
                        {/* Left whitespace with back button */}
                        <div className="flex-1 flex justify-end pr-6">
                            <div className="sticky top-4 z-20">
                                <button
                                    className="p-2 rounded-full text-purple-400 hover:text-purple-700 transition"
                                    onClick={() => router.push("/")}
                                    aria-label="Back"
                                >
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        {/* Main content centered */}
                        <div className="w-full max-w-5xl mx-auto">
                        {loading && <div className="text-purple-500 italic text-center">Loading event...</div>}
                        {error && (
                            <div className="bg-red-100 border border-red-300 text-red-700 p-3 rounded-lg mb-6 text-center font-medium">
                                {error}
                            </div>
                        )}
                        {event && (
                            <>
                                {/* Picture Placeholder */}
                                <div className="w-full aspect-[2/1] bg-gray-200 rounded-2xl mb-8 flex items-center justify-center border border-gray-300 shadow-inner">
                                    <span className="text-gray-400 text-2xl font-bold">2x1 Picture Placeholder</span>
                                </div>
                                {/* Title */}
                                <h1 className="text-3xl text-purple-700 mb-6 drop-shadow-sm tracking-tight text-left">
                                    {event.title}
                                </h1>
                                {/* Description */}
                                <p className="text-gray-700 leading-relaxed mb-10">
                                    {event.description || "No description provided."}
                                </p>
                                {/* User's stance or Take your stance button (only if signed in) */}
                                {isAuthenticated && (
                                    <div className="flex justify-center mb-8">
                                        {userStance ? (
                                            <div className="w-full max-w-2xl">
                                                <h2 className="text-lg font-bold text-green-700 mb-2 text-center">My Stance</h2>
                                                <StanceComponent stance={userStance} />
                                            </div>
                                        ) : (
                                            <button
                                                className="px-6 py-3 rounded-lg bg-purple-600 text-white font-semibold shadow hover:bg-purple-700 transition focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
                                                type="button"
                                                onClick={() => setShowStanceModal(true)}
                                            >
                                                Take your stance
                                            </button>
                                        )}
                                    </div>
                                )}
                                {/* Stances (excluding user's own if present) */}
                                <StancesSection
                                    stances={userStance
                                        ? event.stances.filter(s => s.id !== userStance.id)
                                        : event.stances}
                                />
                            </>
                        )}
                        </div>
                        {/* Right whitespace */}
                        <div className="flex-1" />
                    </div>
                </main>
                <StanceCreateModal open={showStanceModal} onClose={() => setShowStanceModal(false)} eventId={parseInt(event_id)} />
            </>
        );

}
