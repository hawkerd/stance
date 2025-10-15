"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import StanceFeedStanceComponent from "./StanceFeedStance";
import StanceFeedLoadingFiller from "./StanceFeedLoadingFiller";
import { useAuthApi } from "@/app/hooks/useAuthApi";
import { StanceFeedStance } from "@/models";
import { StanceService } from "@/service/StanceService";
import { useRouter } from "next/navigation";
import { useInfiniteScroll } from "@/app/hooks/useInfiniteScroll";

interface StanceFeedProps {
    num_stances: number;
    entities: number[];
}

export default function StanceFeed({ num_stances, entities }: StanceFeedProps) {
    const [stances, setStances] = useState<StanceFeedStance[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(0);

    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const stanceRefs = useRef<(HTMLElement | null)[]>([]);
    const [currentIndex, setCurrentIndex] = useState<number>(-1);

    const API = useAuthApi();
    const stanceFeedService = new StanceService();
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
                            window.history.replaceState(null, "", `/feed/${stances[idx].id}`);
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
            if (loadingMore || loading) return;
            if (stances.length > 0) {
                setLoadingMore(true);
            } else {
                setLoading(true);
            }

            const newStances = await stanceFeedService.fetchStanceFeed(API, num_stances, entities);
            setStances(prev => [...prev, ...newStances]);
            if (newStances.length === 0) {
                setHasMore(false);
            } else {
                setPage(prev => prev + 1);
            }
        } catch (err: any) {
            setError(err.message || "Failed to fetch stances");
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [API, num_stances, entities, page]);

    const { loadMoreRef } = useInfiniteScroll(fetchStances, hasMore);

    return (
        <div className="h-screen w-full overflow-y-scroll scrollbar-hidden snap-y snap-mandatory">
            {loading && stances.length === 0 && (
                <div className="text-purple-500 text-center">Loading stances...</div>
            )}
            {error && <div className="text-red-500 text-center font-medium">{error}</div>}

            {stances.map((stance, idx) => (
                <section
                    key={stance.id}
                    ref={el => { stanceRefs.current[idx] = el; }}
                    className="h-screen w-full snap-start flex justify-center items-stretch"
                >
                    <div
                        className="max-w-4xl w-full px-4 py-6 overflow-y-auto scrollbar-hidden flex flex-col"
                        style={{ minHeight: "100vh", maxHeight: "100vh" }}
                    >
                        <StanceFeedStanceComponent stance={stance} />
                    </div>
                </section>
            ))}

            {loadingMore && (
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
