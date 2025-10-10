"use client";

import { useState } from "react";
import { HomeFeedEvent, TagType, HomeFeedTag } from "../../models";
import StanceHeadline from "./StanceCard";
import { useRouter } from "next/navigation";

export default function EventCard({ event }: { event: HomeFeedEvent }) {
  const stances = event.stances || [];
  const router = useRouter();
  let imageUrls: string[] = [];
  try {
    imageUrls = event.images_json ? JSON.parse(event.images_json) : [];
  } catch {
    imageUrls = [];
  }
  const [currentImage, setCurrentImage] = useState(0);
  const [hovered, setHovered] = useState(false);
  const hasImages = imageUrls.length > 0;

  const handlePrev = () => {
    setCurrentImage((idx) => Math.max(idx - 1, 0));
  };
  const handleNext = () => {
    setCurrentImage((idx) => Math.min(idx + 1, imageUrls.length - 1));
  };

  return (
    <div className="w-[90%] mx-auto bg-white rounded-lg shadow p-4 mb-6">
      {/* Image Carousel */}
      <div
        className="aspect-video bg-gray-100 rounded mb-2 flex items-center justify-center relative overflow-hidden border-2 border-gray-200"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {hasImages ? (
          <>
            {imageUrls.length > 1 && hovered && currentImage > 0 && (
              <button
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 rounded-full px-2 py-1 text-lg shadow hover:bg-opacity-100"
                onClick={handlePrev}
                aria-label="Previous image"
              >
                &#8592;
              </button>
            )}
            <img
              src={imageUrls[currentImage]}
              alt={`Event image ${currentImage + 1}`}
              className="object-contain rounded w-full h-full mx-auto"
              style={{ maxHeight: "100%", maxWidth: "100%" }}
            />
            {imageUrls.length > 1 && hovered && currentImage < imageUrls.length - 1 && (
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 rounded-full px-2 py-1 text-lg shadow hover:bg-opacity-100"
                onClick={handleNext}
                aria-label="Next image"
              >
                &#8594;
              </button>
            )}
            {imageUrls.length > 1 && hovered && (
              <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs bg-white bg-opacity-70 rounded px-2 py-1">
                {currentImage + 1} / {imageUrls.length}
              </span>
            )}
          </>
        ) : (
          <span className="text-gray-400 text-sm select-none">Image(s) coming soon</span>
        )}
      </div>
      {/* Tags */}
      {event.tags && event.tags.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {event.tags.map((tag, idx) => (
            <span
              key={idx}
              className={`px-3 py-1 rounded-full text-xs font-semibold shadow border ${
                tag.tag_type === TagType.LOCATION
                  ? "bg-blue-100 text-blue-700 border-blue-300"
                  : "bg-green-100 text-green-700 border-green-300"
              }`}
              title={tag.tag_type === TagType.LOCATION ? "Location" : "Topic"}
            >
              {tag.name}
              <span className="ml-2 text-gray-400">{tag.tag_type === TagType.LOCATION ? "📍" : "🏷️"}</span>
            </span>
          ))}
        </div>
      )}
      {/* Title */}
      <div
        className="flex items-center mb-2 cursor-pointer hover:bg-gray-100 rounded transition"
        onClick={() => router.push(`/entities/${event.id}`)}
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
      {/* Description */}
      <p className="mb-3 text-gray-700 leading-relaxed">{event.description}</p>
      {/* Stances */}
      {stances.length > 0 && (
        <div className="mt-4">
          <div className="space-y-1">
            {stances.slice(0, 3).map((stance) => (
              <StanceHeadline key={stance.id} stance={stance} />
            ))}
            {stances.length > 3 && (
              <div className="text-xs text-gray-500 mt-2">+ {stances.length - 3} more stance{stances.length - 3 > 1 ? "s" : ""}...</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
