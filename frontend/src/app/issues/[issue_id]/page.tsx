"use client";

import React, { useEffect, useState, use } from "react";
import StancesSection from "@/components/StancesSection";
import { useRouter } from "next/navigation";
import { Issue } from "@/models/Issue";
import { useApi } from "@/app/hooks/useApi";
import { stancesApi, issuesApi, commentsApi } from "@/api";

interface IssuePageProps {
  params: Promise<{ issue_id: string }>;
}

export default function IssuePage({ params }: IssuePageProps) {
    const { issue_id } = use(params);
    const router = useRouter();
    const [issue, setIssue] = useState<Issue | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const API = useApi();

    useEffect(() => {
        const fetchIssue = async () => {
            setLoading(true);
            setError(null);
            try {
                const issueResponse = await issuesApi.getIssue(API, parseInt(issue_id));
                const stancesResponse = await stancesApi.getStancesByIssue(API, parseInt(issue_id));
                const stancesWithComments = await Promise.all(
                    (stancesResponse.stances ?? []).map(async (s) => {
                        const commentsResponse = await commentsApi.getCommentsByStance(API, s.id);
                        return {
                            ...s,
                            comments: (commentsResponse.comments ?? []).map(c => ({
                                ...c,
                                parent_id: c.parent_id === null ? undefined : c.parent_id,
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

        {issue && (
        <>
            {/* Title */}
            <h1 className="text-3xl font-extrabold text-gray-900 mb-4">
            {issue.title}
            </h1>

            {/* Description */}
            <div className="bg-white shadow rounded-xl p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Description
            </h2>
            <p className="text-gray-700 leading-relaxed">
                {issue.description || "No description provided."}
            </p>
            </div>

            {/* Stances */}
            <StancesSection stances={issue.stances} />
        </>
        )}
    </div>
    );

}
