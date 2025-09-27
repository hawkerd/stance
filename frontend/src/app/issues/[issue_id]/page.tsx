"use client";

import React, { useEffect, useState, use } from "react";
import StancesSection from "@/components/StancesSection";
import { useRouter } from "next/navigation";
import { Issue } from "@/models/Issue";
import { useAuthApi } from "@/app/hooks/useAuthApi";
import { stancesApi, issuesApi } from "@/api";

interface IssuePageProps {
  params: Promise<{ issue_id: string }>;
}

export default function IssuePage({ params }: IssuePageProps) {
    const { issue_id } = use(params);
    const router = useRouter();
    const [issue, setIssue] = useState<Issue | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const API = useAuthApi();

    useEffect(() => {
        const fetchIssue = async () => {
            setLoading(true);
            setError(null);
            try {
                const issueResponse = await issuesApi.getIssue(API, parseInt(issue_id));
                const stancesResponse = await stancesApi.getStancesByIssue(API, parseInt(issue_id));
                const stancesWithComments = await Promise.all(
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
                            })),
                        };
                    })
                );
                const issueData: Issue = {
                    id: issueResponse.id,
                    title: issueResponse.title,
                    description: issueResponse.description ?? undefined,
                    stances: stancesWithComments,
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


        return (
            <main className="min-h-screen flex flex-col items-center justify-start p-8 bg-gradient-to-br from-purple-50 via-white to-pink-50">
                <div className="w-full max-w-2xl">
                    <button
                        className="mb-8 px-4 py-2 bg-purple-100 text-purple-700 font-semibold rounded-lg hover:bg-purple-200 transition border border-purple-200 shadow-sm"
                        onClick={() => router.push("/")}
                    >
                        Back
                    </button>
                    {loading && <div className="text-purple-500 italic text-center">Loading issue...</div>}
                    {error && (
                        <div className="bg-red-100 border border-red-300 text-red-700 p-3 rounded-lg mb-6 text-center font-medium">
                            {error}
                        </div>
                    )}
                    {issue && (
                        <>
                            {/* Title */}
                            <h1 className="text-3xl font-extrabold text-purple-700 mb-6 drop-shadow-sm tracking-tight text-center">
                                {issue.title}
                            </h1>
                            {/* Description */}
                            <div className="bg-white/80 shadow-lg rounded-2xl p-6 mb-10 border border-purple-100">
                                <h2 className="text-lg font-semibold text-purple-700 mb-2">Description</h2>
                                <p className="text-gray-700 leading-relaxed">
                                    {issue.description || "No description provided."}
                                </p>
                            </div>
                            {/* Stances */}
                            <StancesSection stances={issue.stances} />
                        </>
                    )}
                </div>
            </main>
        );

}
