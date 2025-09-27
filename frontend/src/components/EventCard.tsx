import { Event } from "../models/Issue";
import StanceCard from "./StanceCard";
import { useRouter } from "next/navigation";

export default function EventCard({ event }: { event: Event }) {
  const stances = event.stances || [];
  const router = useRouter();

  return (
    <div className="border border-blue-200 shadow-sm rounded-xl p-5 mb-5 bg-gradient-to-br from-blue-50 to-white">
      <div className="flex items-center mb-2">
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 mr-3">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3zm0 0V4m0 10v4m8-8h-4m-4 0H4" /></svg>
        </span>
        <h2 className="text-xl font-semibold text-blue-800 flex-1">{event.title}</h2>
        <button
          className="ml-2 p-1 rounded hover:bg-blue-100 transition"
          title="View details"
          onClick={() => router.push(`/events/${event.id}`)}
        >
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m0 0l3-3m-3 3l3 3" />
          </svg>
        </button>
      </div>
      <p className="mb-3 text-gray-700 leading-relaxed">{event.description}</p>

      <div className="text-sm text-gray-500 mt-2 flex flex-wrap gap-x-4 gap-y-1">
        <span>Start: <span className="font-medium text-blue-700">{event.start_time}</span></span>
        {event.end_time && <span>End: <span className="font-medium text-blue-700">{event.end_time}</span></span>}
        {event.location && <span>Location: <span className="font-medium text-blue-700">{event.location}</span></span>}
      </div>

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
