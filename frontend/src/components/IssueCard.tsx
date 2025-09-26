import { Issue } from "../models/Issue";
import StanceCard from "./StanceCard";

export default function IssueCard({ issue }: { issue: Issue }) {
  const stances = issue.stances || [];

  return (
    <div className="border border-blue-200 shadow-sm rounded-xl p-5 mb-5 bg-gradient-to-br from-blue-50 to-white">
      <div className="flex items-center mb-2">
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 mr-3">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a5 5 0 00-10 0v2M5 9h14a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2v-7a2 2 0 012-2z" /></svg>
        </span>
        <h2 className="text-xl font-semibold text-blue-800">{issue.title}</h2>
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
