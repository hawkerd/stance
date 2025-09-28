import { Issue } from "../models/Issue";
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
              onClick={() => router.push(`/issues/${issue.id}`)}
              title="View details"
            >
              <h2 className="text-xl font-semibold text-black flex-1">{issue.title}</h2>
            </div>
            <p className="mb-3 text-gray-700 leading-relaxed">{issue.description}</p>
            {issue.location && (
              <div className="text-sm text-gray-500 mt-2 flex items-center">
                <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21c-4.418 0-8-5.373-8-10a8 8 0 1116 0c0 4.627-3.582 10-8 10z" />
                  <circle cx="12" cy="11" r="3" />
                </svg>
                <span className="font-medium text-black">{issue.location}</span>
              </div>
            )}
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
