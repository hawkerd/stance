"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import StanceFeedStanceComponent from "./StanceFeedStance";
import StanceFeedLoadingFiller from "./StanceFeedLoadingFiller";
import { useAuthApi } from "@/app/hooks/useAuthApi";
import { useAuth } from "@/contexts/AuthContext";
import { StanceFeedStance } from "@/models";
import { StanceService } from "@/service/StanceService";
import { useRouter } from "next/navigation";
import { useInfiniteScroll } from "@/app/hooks/useInfiniteScroll";

interface StanceFeedProps {
    feedType: 'digest' | 'following'; // type of feed to display
    num_stances: number; // number of stances to fetch per request
    initialStanceId?: number; // stance to "start" the feed at
}

export default function StanceFeed({ feedType, num_stances, initialStanceId }: StanceFeedProps) {
    const [stances, setStances] = useState<StanceFeedStance[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(0); // for digest feed pagination
    const [cursor, setCursor] = useState<string | null>(null); // for following feed pagination

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const stanceRefs = useRef<(HTMLElement | null)[]>([]);
    const [currentIndex, setCurrentIndex] = useState<number>(-1);
    const isFetchingRef = useRef(false);

    const API = useAuthApi();
    const { initialized } = useAuth();
    const stanceService = new StanceService();

    // initial fetch
    useEffect(() => {
        if (!initialized) return;
        
        async function initialFetch() {
            try {
                setLoading(true);
                if (feedType === 'following') {
                    const response = await stanceService.fetchUserStanceFeed(API, num_stances);
                    setStances(response.stances);
                    setCursor(response.next_cursor || null);
                    if (!response.next_cursor) {
                        setHasMore(false);
                    }
                } else {
                    const response = await stanceService.fetchStanceFeed(API, num_stances, undefined, initialStanceId);
                    setStances(response);
                    if (response.length === 0) {
                        setHasMore(false);
                    }
                    if (response.length > 0) {
                        setPage(1);
                    }
                }
            } catch (err: any) {
                setError(err.message || "Failed to fetch stances");
            } finally {
                setLoading(false);
            }
        }
        initialFetch();
    }, [initialized]);

    // Intersection Observer to track which stance is in view
    useEffect(() => {
        if (stances.length === 0) return;
        const observer = new window.IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const idx = stanceRefs.current.findIndex(ref => ref === entry.target);
                        if (idx !== -1 && idx !== currentIndex) {
                            setCurrentIndex(idx);
                            if (feedType === 'digest') {
                                window.history.replaceState(null, "", `/feed/${stances[idx].id}`);
                            } else {
                                window.history.replaceState(null, "", `/following-feed/${stances[idx].id}`);
                            }
                        }
                    }
                });
            },
            {
                root: null,
                rootMargin: "0px",
                threshold: 0.5,
            }
        );
        stanceRefs.current.forEach(ref => {
            if (ref) observer.observe(ref);
        });
        return () => {
            stanceRefs.current.forEach(ref => {
                if (ref) observer.unobserve(ref);
            });
            observer.disconnect();
        };
    }, [stances, router, loading]);

    const fetchStances = useCallback(async () => {
        try {
            if (isFetchingRef.current || !hasMore) return;
            isFetchingRef.current = true;
            setLoading(true);

            if (feedType === 'following') {
                const response = await stanceService.fetchUserStanceFeed(API, num_stances, cursor || undefined);
                setStances(prev => [...prev, ...response.stances]);
                setCursor(response.next_cursor || null);
                if (!response.next_cursor) {
                    setHasMore(false);
                }
            } else {
                const response = await stanceService.fetchStanceFeed(API, num_stances);
                setStances(prev => [...prev, ...response]);
                if (response.length === 0) {
                    setHasMore(false);
                }
                if (response.length > 0) {
                    setPage(prev => prev + 1);
                }
            }
        } catch (err: any) {
            setError(err.message || "Failed to fetch stances");
        } finally {
            setLoading(false);
            isFetchingRef.current = false;
        }
    }, [API, num_stances, page]);

    const { loadMoreRef } = useInfiniteScroll(fetchStances, hasMore);

    return (
        <div className="h-screen w-full overflow-y-scroll scrollbar-hidden snap-y snap-mandatory">
            {loading && stances.length === 0 && (
                <div className="text-purple-500 text-center">Loading stances...</div>
            )}
            {error && <div className="text-red-500 text-center font-medium">{error}</div>}

            {stances.map((stance, idx) => (
                <section
                    key={`${stance.id}-${Math.random()}`}
                    ref={el => { stanceRefs.current[idx] = el; }}
                    className="h-screen w-full snap-start flex justify-center items-stretch"
                    style={{ contain: 'layout' }}
                >
                    <div
                        className="max-w-4xl w-full px-4 py-6 overflow-y-auto scrollbar-hidden flex flex-col"
                        style={{ minHeight: "100vh", maxHeight: "100vh", overflowAnchor: "none" }}
                    >
                        <StanceFeedStanceComponent stance={stance} />
                    </div>
                </section>
            ))}

            {loading && stances.length === 0 && (
                <section className="h-screen w-full snap-start flex justify-center items-stretch">
                    <div
                        className="max-w-4xl w-full px-4 py-6 overflow-y-auto scrollbar-hidden flex flex-col"
                        style={{ minHeight: "100vh", maxHeight: "100vh" }}
                    >
                        <StanceFeedLoadingFiller />
                    </div>
                </section>
            )}

            <div
                ref={loadMoreRef}
                className="h-20 flex items-center justify-center"
                style={{ overflowAnchor: "none" }}
            >
                {!hasMore && stances.length > 0 && (
                    <div className="text-gray-400 text-center">No more content</div>
                )}
            </div>
        </div>
    );
}
