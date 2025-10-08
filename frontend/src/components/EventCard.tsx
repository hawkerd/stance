"use client";

import { Event } from "../models/Issue";
import StanceCard from "./StanceCard";
import { useRouter } from "next/navigation";

export default function EventCard({ event }: { event: Event }) {
  const stances = event.stances || [];
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
              onClick={() => router.push(`/events/${event.id}`)}
              title="View details"
            >
              <h2 className="text-xl font-semibold text-black flex-1">{event.title}</h2>
            </div>
            {/* Calendar and date/range under the title */}
            <div className="flex items-center mb-2 ml-1">
              <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <rect x="3" y="7" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" fill="#fff" />
                <path d="M16 3v4M8 3v4M3 11h18" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              <span className="text-sm text-gray-700">
                {event.start_time}
                {event.end_time && (
                  <>
                    <span className="mx-1">–</span>
                    {event.end_time}
                  </>
                )}
              </span>
            </div>
            <p className="mb-3 text-gray-700 leading-relaxed">{event.description}</p>
            <div className="text-sm text-gray-500 mt-2 flex flex-wrap gap-x-4 gap-y-1">
              {event.location && (
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21c-4.418 0-8-5.373-8-10a8 8 0 1116 0c0 4.627-3.582 10-8 10z" />
                    <circle cx="12" cy="11" r="3" />
                  </svg>
                  <span className="font-medium text-black">{event.location}</span>
                </span>
              )}
            </div>
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
