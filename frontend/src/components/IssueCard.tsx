"use client";

import { Issue } from "../models";
import StanceCard from "./StanceCard";
import { useRouter } from "next/navigation";

export default function IssueCard({ issue }: { issue: Issue }) {
  const stances = issue.stances || [];
  const router = useRouter();

  return (
    <>
      {/* Placeholder for future image(s) */}
      <div className="w-[90%] flex flex-row mx-auto">
        <div className="w-1/2 min-w-0">
          <div className="aspect-[2/1] bg-gray-200 rounded mb-2 flex items-center justify-center text-gray-400 text-sm select-none">
            Image(s) coming soon
          </div>
          <div>
            <div
              className="flex items-center mb-2 cursor-pointer hover:bg-gray-100 rounded transition"
              onClick={() => router.push(`/entities/${issue.id}`)}
              title="View details"
            >
              <h2 className="text-xl font-semibold text-black flex-1">{issue.title}</h2>
            </div>
            <p className="mb-3 text-gray-700 leading-relaxed">{issue.description}</p>
          </div>
        </div>
        {stances.length > 0 && (
          <div className="flex flex-col justify-start items-stretch w-1/2 ml-8">
            <div className="space-y-1">
              {stances.map((stance) => (
                <StanceCard key={stance.id} stance={stance} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
