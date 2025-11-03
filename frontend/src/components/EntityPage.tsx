"use client";

import React, { useEffect, useState, use } from "react";
import { StanceFeedStance, Entity, EntityType } from "@/models";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useAuthApi } from "@/app/hooks/useAuthApi";
import StanceCreateModal from "@/components/modals/StanceCreateModal";
import { EntityService } from "@/service/EntityService";
import EntityStancesGrid from "@/components/entity-page/EntityStancesGrid";
import EntityFeedTagComponent from "@/components/entity-feed/EntityFeedTag";

interface EntityPageProps {
  params: Promise<{ entity_id: string }>;
}


export default function EntityPage({ params }: EntityPageProps) {
    const { entity_id } = use(params);
    const router = useRouter();
    const [entity, setEntity] = useState<Entity | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hasUserStance, setHasUserStance] = useState<boolean | null>(null);
    const [showStanceModal, setShowStanceModal] = useState(false);
    const [currentImage, setCurrentImage] = useState(0);
    const [hovered, setHovered] = useState(false);
    const API = useAuthApi();
    const { isAuthenticated } = useAuth();
    const entityService = new EntityService();

    // fetch entity details
    useEffect(() => {
        const fetchEntity = async () => {
            setLoading(true);
            setError(null);
            try {
                const entityResponse: Entity = await entityService.getEntity(API, parseInt(entity_id));
                setEntity(entityResponse);
            } catch (err: any) {
                setError(err.message || "Unexpected error");
            } finally {
                setLoading(false);
            }
        };
        fetchEntity();
    }, [entity_id]);

    // check if user has a stance for this entity
    useEffect(() => {
        const fetchHasUserStance = async () => {
            if (!isAuthenticated) {
                setHasUserStance(null);
                return;
            }
            try {
                const userStanceResponse: StanceFeedStance | null = await entityService.getMyStanceForEntity(API, parseInt(entity_id));
                if (userStanceResponse === null) {
                    setHasUserStance(false);
                    return;
                } else {
                    setHasUserStance(true);
                    return;
                }
            } catch (err) {
                setHasUserStance(null);
            }
        };
        fetchHasUserStance();
    }, [isAuthenticated, API, entity_id]);

    if (loading || !entity) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-gray-500">Loading...</p>
            </div>
        );
    }

    return (
        <>
            <main
                className={`min-h-screen flex flex-col items-center justify-start overflow-hidden p-0 bg-gradient-to-br from-purple-50 via-white to-pink-50`}
            >
                <div className="w-full flex flex-row">
                    {/* Left whitespace with back button */}
                    <div className="flex-1 flex justify-end pr-6">
                        <div className="sticky top-8 z-20 flex flex-col gap-0 h-fit">
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
                    <div className="w-full max-w-4xl mx-auto">
                    {loading && <div className="text-purple-500 italic text-center">Loading...</div>}
                    {error && (
                        <div className="bg-red-100 border border-red-300 text-red-700 p-3 rounded-lg mb-6 text-center font-medium">
                            {error}
                        </div>
                    )}
                    <div className="max-w-4xl w-full mx-auto px-4 py-8">
                        {/* Image Carousel */}
                        {(() => {
                            let imageUrls: string[] = [];
                            try {
                                imageUrls = entity.images_json ? JSON.parse(entity.images_json) : [];
                            } catch {
                                imageUrls = [];
                            }
                            const hasImages = imageUrls.length > 0;
                            const handlePrev = () => setCurrentImage(idx => Math.max(idx - 1, 0));
                            const handleNext = () => setCurrentImage(idx => Math.min(idx + 1, imageUrls.length - 1));
                            return (
                                <div
                                    className="w-full aspect-video bg-gray-200 rounded-2xl mb-8 flex items-center justify-center relative overflow-hidden border border-gray-300 shadow-inner"
                                    onMouseEnter={() => setHovered(true)}
                                    onMouseLeave={() => setHovered(false)}
                                >
                                    {hasImages ? (
                                        <>
                                            {imageUrls.length > 1 && hovered && currentImage > 0 && (
                                                <button
                                                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 rounded-full px-2 py-1 text-lg shadow hover:bg-opacity-100"
                                                    onClick={handlePrev}
                                                    aria-label="Previous image"
                                                >
                                                    &#8592;
                                                </button>
                                            )}
                                            <img
                                                src={imageUrls[currentImage]}
                                                alt={`Entity image ${currentImage + 1}`}
                                                className="object-contain rounded w-full h-full mx-auto"
                                                style={{ maxHeight: "100%", maxWidth: "100%" }}
                                            />
                                            {imageUrls.length > 1 && hovered && currentImage < imageUrls.length - 1 && (
                                                <button
                                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 rounded-full px-2 py-1 text-lg shadow hover:bg-opacity-100"
                                                    onClick={handleNext}
                                                    aria-label="Next image"
                                                >
                                                    &#8594;
                                                </button>
                                            )}
                                            {imageUrls.length > 1 && hovered && (
                                                <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs bg-white bg-opacity-70 rounded px-2 py-1">
                                                    {currentImage + 1} / {imageUrls.length}
                                                </span>
                                            )}
                                        </>
                                    ) : (
                                        <span className="text-gray-400 text-2xl font-bold">Image(s) coming soon</span>
                                    )}
                                </div>
                            );
                        })()}
                        {/* Title */}
                        <h1 className="text-xl font-semibold text-black mb-6 drop-shadow-sm tracking-tight text-left">
                            {entity.title}
                        </h1>
                        {/* Tags */}
                        {entity.tags && entity.tags.length > 0 && (
                            <div className="mb-6 flex flex-wrap gap-2">
                            {entity.tags.map((tag, idx) => (
                                <EntityFeedTagComponent key={idx} tag={tag} />
                            ))}
                            </div>
                        )}
                        {/* Description */}
                        <p className="text-gray-700 leading-relaxed mb-10">
                            {entity.description || "No description provided."}
                        </p>
                        {/* Type-specific fields */}
                        {entity.type === EntityType.EVENT && (
                            <div className="mb-6 text-gray-600 text-sm">
                                <span>Start: {entity.start_time || "N/A"}</span>
                                <span className="mx-2">|</span>
                                <span>End: {entity.end_time || "N/A"}</span>
                            </div>
                        )}
                        {/* Take your stance button (only if signed in and no stance) */}
                        {isAuthenticated && !hasUserStance && (
                            <div className="flex justify-center mb-8">
                                <button
                                    className="px-6 py-3 rounded-lg bg-purple-50 text-purple-700 font-semibold shadow border border-purple-200 hover:bg-purple-100 transition focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
                                    type="button"
                                    onClick={() => setShowStanceModal(true)}
                                >
                                    Take your stance
                                </button>
                            </div>
                        )}

                        {/* Stances Grid */}
                        <div className="mb-8">
                            <EntityStancesGrid entityId={parseInt(entity_id)} />
                        </div>
                    </div>
                </div>
                {/* Right whitespace */}
                <div className="flex-1" />
            </div>
        </main>
            <StanceCreateModal open={showStanceModal} onClose={() => setShowStanceModal(false)} entityId={parseInt(entity_id)} />
        </>
    );
}
