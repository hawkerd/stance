"use client";

import React, { useEffect, useState, use } from "react";
import StancesSection from "@/components/StancesSection";
import StanceComponent from "@/components/Stance";
import { Stance as StanceType } from "@/models/Issue";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Issue } from "@/models/Issue";
import { useAuthApi } from "@/app/hooks/useAuthApi";
import { stancesApi, issuesApi, commentsApi } from "@/api";
import { StanceReadResponse } from "@/api/issues";
import StanceCreateModal from "@/components/stance-create/StanceCreateModal";

interface IssuePageProps {
  params: Promise<{ issue_id: string }>;
}

export default function IssuePage({ params }: IssuePageProps) {
    const { issue_id } = use(params);
    const router = useRouter();
    const [issue, setIssue] = useState<Issue | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userStance, setUserStance] = useState<StanceType | null | undefined>(undefined);
    const [showStanceModal, setShowStanceModal] = useState(false);
    const API = useAuthApi();
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        const fetchIssue = async () => {
            setLoading(true);
            setError(null);
            try {
                const issueResponse = await issuesApi.getIssue(API, parseInt(issue_id));
                const stancesResponse = await stancesApi.getStancesByIssue(API, parseInt(issue_id));
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
                const issueData: Issue = {
                    id: issueResponse.id,
                    title: issueResponse.title,
                    description: issueResponse.description ?? undefined,
                    stances: stances,
                };
                setIssue(issueData);
            } catch (err: any) {
                setError(err.message || "Unexpected error");
            } finally {
                setLoading(false);
            }
        };
        fetchIssue();
    }, [issue_id]);

    useEffect(() => {
        const fetchUserStance = async () => {
            if (!isAuthenticated) {
                setUserStance(undefined);
                return;
            }
            try {
                const stanceRes = await issuesApi.getMyStanceForIssue(API, parseInt(issue_id));
                if (!stanceRes) {
                    setUserStance(null);
                    return;
                }
                // Fetch comments for this stance
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
    }, [isAuthenticated, API, issue_id]);

    const handleAddComment = async (stanceId: number, content: string, parentId?: number) => {
        try {
            const newComment = await commentsApi.createComment(API, {
                stance_id: stanceId,
                content,
                parent_id: parentId,
            });
            setUserStance(prevStance => {
                if (!prevStance) return prevStance;
                return {
                    ...prevStance,
                    comments: [
                        ...(prevStance.comments || []),
                        {
                            ...newComment,
                            parent_id: newComment.parent_id ?? undefined,
                            user_reaction:
                                newComment.user_reaction === "like" ||
                                newComment.user_reaction === "dislike" ||
                                newComment.user_reaction === null
                                    ? newComment.user_reaction
                                    : null,
                            count_nested_replies:
                                typeof newComment.count_nested === "number"
                                    ? newComment.count_nested
                                    : 0,
                        },
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
                    {loading && <div className="text-purple-500 italic text-center">Loading issue...</div>}
                    {error && (
                        <div className="bg-red-100 border border-red-300 text-red-700 p-3 rounded-lg mb-6 text-center font-medium">
                            {error}
                        </div>
                    )}
                    {issue && (
                        <>
                            {/* Picture Placeholder */}
                            <div className="w-full aspect-[2/1] bg-gray-200 rounded-2xl mb-8 flex items-center justify-center border border-gray-300 shadow-inner">
                                <span className="text-gray-400 text-2xl font-bold">2x1 Picture Placeholder</span>
                            </div>
                            {/* Title */}
                            <h1 className="text-3xl text-purple-700 mb-6 drop-shadow-sm tracking-tight text-left">
                                {issue.title}
                            </h1>
                            {/* Description */}
                            <p className="text-gray-700 leading-relaxed mb-10">
                                {issue.description || "No description provided."}
                            </p>
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
                                    ? issue.stances.filter(s => s.id !== userStance.id)
                                    : issue.stances}
                            />
                        </>
                    )}
                    </div>
                    {/* Right whitespace */}
                    <div className="flex-1" />
                </div>
            </main>
            <StanceCreateModal open={showStanceModal} onClose={() => setShowStanceModal(false)} issueId={parseInt(issue_id)} />
        </>
    );

}
