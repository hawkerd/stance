"use client";

import React, { useEffect, useState, use } from "react";
import { Issue } from "@/models/Issue";
import { components } from "@/models/api";

interface IssuePageProps {
  params: Promise<{ issue_id: string }>;
}

type StanceListResponse = components["schemas"]["StanceListResponse"];
type IssueReadResponse = components["schemas"]["IssueReadResponse"];

export default function IssuePage({ params }: IssuePageProps) {
  const { issue_id } = use(params);
  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIssue = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`http://localhost:8000/issues/${issue_id}`);
        if (!res.ok) {
          const errBody = await res.json();
          throw new Error(errBody.detail || "Failed to load issue.");
        }
        const data: IssueReadResponse = await res.json();
        const stancesRes = await fetch(`http://localhost:8000/stances/issue/${data.id}`);
        if (!stancesRes.ok) {
          throw new Error("Failed to fetch stances");
        }
        const stancesData: StanceListResponse = await stancesRes.json();
        const issueData: Issue = {
          id: data.id,
          title: data.title,
          description: data.description ?? undefined,
          stances: stancesData.stances ?? [],
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
            {issue.stances.length > 0 && (
            <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">
                Stances
                </h2>
                <ul className="space-y-3">
                {issue.stances.map((stance) => (
                    <li
                    key={stance.id}
                    className="flex items-start bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-sm"
                    >
                    <span className="mr-3 font-medium text-blue-600">
                        {stance.user_id}:
                    </span>
                    <span className="text-gray-700">{stance.stance}</span>
                    </li>
                ))}
                </ul>
            </div>
            )}
        </>
        )}
    </div>
    );

}
