"use client";

import { useState } from "react";
import { EntityFeedEvent, TagType, EntityFeedTag } from "../../models";
import StanceHeadline from "./EntityFeedStance";
import EntityFeedTagComponent from "./EntityFeedTag";
import { useRouter } from "next/navigation";

export default function EventCard({ event }: { event: EntityFeedEvent }) {
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

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentImage((idx) => Math.max(idx - 1, 0));
  };
  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentImage((idx) => Math.min(idx + 1, imageUrls.length - 1));
  };

  return (
    <div
      className="w-full mx-auto bg-white rounded-2xl shadow-lg border border-purple-100 hover:shadow-xl hover:border-purple-300 transition-all p-6 mb-8 cursor-pointer"
      onClick={() => router.push(`/entities/${event.id}`)}
      title="View details"
      tabIndex={0}
      role="button"
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') router.push(`/entities/${event.id}`); }}
    >
      {/* Image Carousel */}
      <div
        className="aspect-video mb-3 flex items-center justify-center relative overflow-hidden"
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
                tabIndex={-1}
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
                tabIndex={-1}
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
        <div className="mb-3 flex flex-wrap gap-2">
          {event.tags.map((tag, idx) => (
            <EntityFeedTagComponent key={idx} tag={tag} />
          ))}
        </div>
      )}
      {/* Title */}
      <div className="flex items-center mb-2">
        <h2 className="text-2xl font-bold text-gray-900 flex-1 tracking-tight">{event.title}</h2>
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
      <p className="mb-3 text-gray-700 leading-relaxed text-base">{event.description}</p>
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
