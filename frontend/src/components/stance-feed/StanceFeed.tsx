"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import StanceFeedStanceComponent from "./StanceFeedStance";
import StanceFeedLoadingFiller from "./StanceFeedLoadingFiller";
import { useAuthApi } from "@/app/hooks/useAuthApi";
import { StanceFeedStance } from "@/models";
import { StanceService } from "@/service/StanceService";

interface StanceFeedProps {
    num_stances: number;
    entities: number[];
}

export default function StanceFeed({ num_stances, entities }: StanceFeedProps) {
    const [stances, setStances] = useState<StanceFeedStance[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(0);

    const observerTarget = useRef<HTMLDivElement>(null);
    const API = useAuthApi();
    const stanceFeedService = new StanceService();

    const fetchStances = useCallback(async (append = false) => {
        if (append) {
            setLoadingMore(true);
        } else {
            setLoading(true);
        }
        try {
            const newStances = await stanceFeedService.fetchStanceFeed(API, num_stances, entities);
            if (append) {
                setStances(prev => [...prev, ...newStances]);
            } else {
                setStances(newStances);
            }
            if (newStances.length === 0) {
                setHasMore(false);
            }
        } catch (err: any) {
            setError(err.message || "Failed to fetch stances");
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [API, page]);

    useEffect(() => {
        fetchStances(page > 0);
    }, [page, fetchStances]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
                    setPage(prev => prev + 1);
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
    }, [hasMore, loadingMore, loading]);

    return (
        <div className="h-screen w-full overflow-y-scroll scrollbar-hidden snap-y snap-mandatory">
            {loading && stances.length === 0 && (
                <div className="text-purple-500 text-center">Loading stances...</div>
            )}
            {error && <div className="text-red-500 text-center font-medium">{error}</div>}

            {stances.map((stance) => (
                <section
                    key={`${stance.id}-${Math.random()}`}
                    className="h-screen w-full snap-start flex justify-center items-stretch"
                >
                    <div
                        className="max-w-4xl w-full px-4 py-6 overflow-y-auto scrollbar-hidden flex flex-col"
                        style={{ minHeight: '100vh', maxHeight: '100vh' }}
                    >
                        <StanceFeedStanceComponent stance={stance} />
                    </div>
                </section>
            ))}

            {/* Filler stance for loading, so we have something to snap to */}
            {loadingMore && (
                <section className="h-screen w-full snap-start flex justify-center items-stretch">
                    <div
                        className="max-w-4xl w-full px-4 py-6 overflow-y-auto scrollbar-hidden flex flex-col"
                        style={{ minHeight: '100vh', maxHeight: '100vh' }}
                    >
                        <StanceFeedLoadingFiller />
                    </div>
                </section>
            )}

            <div
                ref={observerTarget}
                className="h-20 flex items-center justify-center"
                style={{ overflowAnchor: 'none' }}
            >
                {loadingMore && (
                    <div className="text-purple-500 text-center">Loading more...</div>
                )}
                {!hasMore && stances.length > 0 && (
                    <div className="text-gray-400 text-center">No more content</div>
                )}
            </div>
        </div>
    );
}
