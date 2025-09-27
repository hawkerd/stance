import { Issue } from "../models/Issue";
import StanceCard from "./StanceCard";
import { useRouter } from "next/navigation";

export default function IssueCard({ issue }: { issue: Issue }) {
  const stances = issue.stances || [];
  const router = useRouter();

  return (
    <div className="border border-blue-200 shadow-sm rounded-xl p-5 mb-5 bg-gradient-to-br from-blue-50 to-white">
      <div className="flex items-center mb-2">
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 mr-3">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a5 5 0 00-10 0v2M5 9h14a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2v-7a2 2 0 012-2z" /></svg>
        </span>
        <h2 className="text-xl font-semibold text-blue-800 flex-1">{issue.title}</h2>
        <button
          className="ml-2 p-1 rounded hover:bg-blue-100 transition"
          title="View details"
          onClick={() => router.push(`/issues/${issue.id}`)}
        >
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m0 0l3-3m-3 3l3 3" />
          </svg>
        </button>
      </div>
      <p className="mb-3 text-gray-700 leading-relaxed">{issue.description}</p>

      {stances.length > 0 && (
        <div className="mt-3">
          <div className="space-y-1">
            {stances.map((stance) => (
              <StanceCard key={stance.id} stance={stance} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
