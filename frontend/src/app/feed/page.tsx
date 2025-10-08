"use client";

import React, { useEffect, useState } from "react";
import { stancesApi } from "@/api"; 
import StanceComponent from "@/components/Stance";
import { useApi } from "@/app/hooks/useApi";
import { Stance } from "@/models/Issue";

export default function HomeFeed() {
  const [stances, setStances] = useState<Stance[]>([]);
  const API = useApi();

  useEffect(() => {
    const fetchData = async () => {
        const stancesResponse = await stancesApi.getAllStances(API);
        const stancesList = await Promise.all(
        (stancesResponse.stances ?? []).map(async (s) => {
            const commentsResponse = await stancesApi.getCommentsByStance(API, s.id);

            return {
            id: s.id,
            user_id: s.user_id,
            headline: s.headline,
            content_json: s.content_json,
            comments: (commentsResponse.comments ?? []).map(c => ({
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
            })),
            };
        })
        );
        setStances(stancesList);
    };
    fetchData();
  }, []);

    return (
    <div className="h-screen w-full overflow-y-scroll scrollbar-hidden snap-y snap-mandatory">
        {stances.map((stance) => (
        <section
            key={stance.id}
            className="h-screen w-full snap-start flex justify-center items-stretch"
        >
            <div
                className="max-w-4xl w-full px-4 py-6 overflow-y-auto scrollbar-hidden bg-gray-50 rounded-xl border border-gray-100 shadow-sm flex flex-col"
                style={{ minHeight: '100vh', maxHeight: '100vh' }}
            >
                <StanceComponent stance={stance} />
            </div>
        </section>
        ))}
    </div>
    );



}
