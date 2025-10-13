"use client";

import React, { useEffect, useState, use } from "react";
import StanceFeedStanceComponent from "@/components/stance-feed/StanceFeedStance";
import { StanceFeedStance, Entity, EntityType, TagType } from "@/models";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useAuthApi } from "@/app/hooks/useAuthApi";
import StanceCreateModal from "@/components/modals/StanceCreateModal";
import { StanceService as StanceService } from "@/service/StanceService";
import { EntityService } from "@/service/EntityService";
import StanceFeed from "@/components/stance-feed/StanceFeed";

interface EntityPageProps {
  params: Promise<{ entity_id: string }>;
}

export default function EntityPage({ params }: EntityPageProps) {
    const { entity_id } = use(params);
    const router = useRouter();
    const [entity, setEntity] = useState<Entity | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userStance, setUserStance] = useState<StanceFeedStance | null | undefined>(undefined);
    const [stances, setStances] = useState<StanceFeedStance[]>([]);
    const [showStanceModal, setShowStanceModal] = useState(false);
    const [currentImage, setCurrentImage] = useState(0);
    const [hovered, setHovered] = useState(false);
    const API = useAuthApi();
    const { isAuthenticated } = useAuth();
    const stanceService = new StanceService();
    const entityService = new EntityService();

    useEffect(() => {
        const fetchEntity = async () => {
            setLoading(true);
            setError(null);
            try {
                // fetch the entity
                const entityResponse: Entity = await entityService.getEntity(API, parseInt(entity_id));
                setEntity(entityResponse);

                // fetch stances for the entity
                const stancesResponse: StanceFeedStance[] = await stanceService.fetchStanceFeed(API, 50, [parseInt(entity_id)]);
                setStances(stancesResponse);
            } catch (err: any) {
                setError(err.message || "Unexpected error");
            } finally {
                setLoading(false);
            }
        };
        fetchEntity();
    }, [entity_id]);

    useEffect(() => {
        const fetchUserStance = async () => {
            if (!isAuthenticated) {
                setUserStance(undefined);
                return;
            }
            try {
                // fetch the users stance for this entity
                const userStanceResponse: StanceFeedStance | null = await entityService.getMyStanceForEntity(API, parseInt(entity_id));
                if (userStanceResponse === null) {
                    setUserStance(null);
                    return;
                } else {
                    setUserStance(userStanceResponse);
                    return;
                }
            } catch (err) {
                setUserStance(null);
            }
        };
        fetchUserStance();
    }, [isAuthenticated, API, entity_id]);

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
                    {loading && <div className="text-purple-500 italic text-center">Loading...</div>}
                    {error && (
                        <div className="bg-red-100 border border-red-300 text-red-700 p-3 rounded-lg mb-6 text-center font-medium">
                            {error}
                        </div>
                    )}
                    {entity && (
                        <>
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
                            <h1 className="text-3xl text-purple-700 mb-6 drop-shadow-sm tracking-tight text-left">
                                {entity.title}
                            </h1>
                            {/* Tags */}
                            {entity.tags && entity.tags.length > 0 && (
                              <div className="mb-6 flex flex-wrap gap-2">
                                {entity.tags.map((tag, idx) => (
                                  <span
                                    key={idx}
                                    className={`px-3 py-1 rounded-full text-xs font-semibold shadow border ${
                                      tag.tag_type === TagType.LOCATION
                                        ? "bg-blue-100 text-blue-700 border-blue-300"
                                        : "bg-green-100 text-green-700 border-green-300"
                                    }`}
                                    title={tag.tag_type === TagType.LOCATION ? "Location" : "Topic"}
                                  >
                                    {tag.name}
                                    <span className="ml-2 text-gray-400">{tag.tag_type === TagType.LOCATION ? "📍" : "🏷️"}</span>
                                  </span>
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
                            {/* User's stance or Take your stance button (only if signed in) */}
                            {isAuthenticated && (
                                <div className="flex justify-center mb-8">
                                    {userStance ? (
                                        <div className="w-full max-w-2xl rounded-lg shadow-lg border-t-4 border-purple-600">
                                            <StanceFeedStanceComponent stance={userStance} />
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
                            <StanceFeed num_stances={10} entities={[parseInt(entity_id)]} />
                        </>
                    )}
                    </div>
                    {/* Right whitespace */}
                    <div className="flex-1" />
                </div>
            </main>
            <StanceCreateModal open={showStanceModal} onClose={() => setShowStanceModal(false)} entityId={parseInt(entity_id)} />
        </>
    );
}
