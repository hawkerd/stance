"use client";

import React, { useEffect, useState, use } from "react";
import StancesSection from "@/components/StancesSection";
import StanceComponent from "@/components/Stance";
import { Stance, Entity, EntityType, Event, Issue, TagType, Tag, Comment } from "@/models";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useAuthApi } from "@/app/hooks/useAuthApi";
import { entitiesApi, stancesApi, commentsApi } from "@/api";
import { EntityReadResponse } from "@/api/entities";
import { StanceListResponse } from "@/api/stances";
import { CommentListResponse, CommentReadResponse } from "@/api/comments";
import StanceCreateModal from "@/components/modals/StanceCreateModal";

interface EntityPageProps {
  params: Promise<{ entity_id: string }>;
}

export default function EntityPage({ params }: EntityPageProps) {
    const { entity_id } = use(params);
    const router = useRouter();
    const [entity, setEntity] = useState<Entity | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userStance, setUserStance] = useState<Stance | null | undefined>(undefined);
    const [showStanceModal, setShowStanceModal] = useState(false);
    const [currentImage, setCurrentImage] = useState(0);
    const [hovered, setHovered] = useState(false);
    const API = useAuthApi();
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        const fetchEntity = async () => {
            setLoading(true);
            setError(null);
            try {
                const entityResponse: EntityReadResponse = await entitiesApi.getEntity(API, parseInt(entity_id));
                // Use the new feed endpoint for stances
                const feedResponse = await stancesApi.getFeed(API, {
                    num_stances: 50,
                    entities: [parseInt(entity_id)]
                });
                // Map feed stances to your Stance model
                const stances: Stance[] = (feedResponse.stances ?? []).map(s => ({
                    id: s.id,
                    user_id: s.user.id,
                    entity_id: s.entity.id,
                    headline: s.headline,
                    content_json: s.content_json,
                    average_rating: s.average_rating ?? null,
                    comments: [], // can be filled if include_comments is true
                    num_ratings: s.num_ratings,
                }));
                setEntity({ ...entityResponse, stances });
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
                const stanceRes = await entitiesApi.getMyStanceForEntity(API, parseInt(entity_id));
                if (!stanceRes) {
                    setUserStance(null);
                    return;
                }
                const commentsResponse = await stancesApi.getCommentsByStance(API, stanceRes.id);
                const numRatingsResponse = await stancesApi.getNumRatings(API, stanceRes.id);
                const comments: Comment[] = (commentsResponse.comments ?? []).map((c) => ({
                    id: c.id,
                    user_id: c.user_id,
                    parent_id: c.parent_id === null ? undefined : c.parent_id,
                    content: c.content,
                    likes: c.likes,
                    dislikes: c.dislikes,
                    user_reaction:
                        c.user_reaction === "like" || c.user_reaction === "dislike" || c.user_reaction === null
                            ? (c.user_reaction as "like" | "dislike" | null)
                            : null,
                    count_nested_replies: c.count_nested,
                }));
                const stance: Stance = {
                    id: stanceRes.id,
                    user_id: stanceRes.user_id,
                    entity_id: stanceRes.entity_id,
                    headline: stanceRes.headline,
                    content_json: stanceRes.content_json,
                    average_rating: stanceRes.average_rating ?? null,
                    comments: comments,
                    num_ratings: numRatingsResponse.num_ratings,
                };
                setUserStance(stance);
            } catch (err) {
                setUserStance(null);
            }
        };
        fetchUserStance();
    }, [isAuthenticated, API, entity_id]);

    const handleAddComment = async (stanceId: number, content: string, parentId?: number) => {
        try {
            const newComment: CommentReadResponse = await commentsApi.createComment(API, {
                stance_id: stanceId,
                content,
                parent_id: parentId,
            });
            setUserStance(prevStance => {
                if (!prevStance) return prevStance;
                const comment: Comment = {
                    id: newComment.id,
                    user_id: newComment.user_id,
                    parent_id: newComment.parent_id === null ? undefined : newComment.parent_id,
                    content: newComment.content,
                    likes: newComment.likes,
                    dislikes: newComment.dislikes,
                    user_reaction:
                        newComment.user_reaction === "like" || newComment.user_reaction === "dislike" || newComment.user_reaction === null
                            ? (newComment.user_reaction as "like" | "dislike" | null)
                            : null,
                    count_nested_replies:
                        typeof newComment.count_nested === "number" ? newComment.count_nested : 0,
                };
                return {
                    ...prevStance,
                    comments: [
                        ...(prevStance.comments || []),
                        comment,
                    ],
                };
            });
        } catch (err: any) {
            console.error("Failed to add comment:", err.message);
        }
    };

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
                                            <StanceComponent stance={userStance} onAddComment={handleAddComment} />
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
                                    ? entity.stances.filter(s => s.id !== userStance.id)
                                    : entity.stances}
                            />
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
