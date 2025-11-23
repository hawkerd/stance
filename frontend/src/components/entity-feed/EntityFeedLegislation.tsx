"use client";

import { useState } from "react";
import { EntityFeedLegislation, TagType, EntityFeedTag } from "../../models";
import StanceHeadline from "./EntityFeedStance";
import EntityFeedTagComponent from "./EntityFeedTag";
import { useRouter } from "next/navigation";

export default function LegislationCard({ legislation }: { legislation: EntityFeedLegislation }) {
  const stances = legislation.stances || [];
  const router = useRouter();
  let imageUrls: string[] = [];
  try {
    imageUrls = legislation.images_json ? JSON.parse(legislation.images_json) : [];
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
      onClick={() => router.push(`/entities/${legislation.id}`)}
      title="View details"
      tabIndex={0}
      role="button"
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') router.push(`/entities/${legislation.id}`); }}
    >
      {/* Image Carousel */}
      {hasImages && (
        <div
          className="aspect-video mb-3 flex items-center justify-center relative overflow-hidden"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
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
            alt={`Legislation image ${currentImage + 1}`}
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
        </div>
      )}
      {/* Tags */}
      {legislation.tags && legislation.tags.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {legislation.tags.map((tag, idx) => (
            <EntityFeedTagComponent key={idx} tag={tag} />
          ))}
        </div>
      )}
      {/* Title */}
      <div className="flex items-center mb-2">
        <h2 className="text-2xl font-bold text-gray-900 flex-1 tracking-tight line-clamp-2">{legislation.title}</h2>
      </div>
      {/* Document/gavel icon and date info under the title */}
      <div className="flex items-center mb-2 ml-1">
        <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
        <span className="text-sm text-gray-700">
          {legislation.location && (
            <>
              {legislation.location}
              {(legislation.start_time || legislation.end_time) && <span className="mx-1">•</span>}
            </>
          )}
          {legislation.start_time && `Introduced ${legislation.start_time.split('T')[0]}`}
          {legislation.end_time && (
            <>
              <span className="mx-1">•</span>
              {`Enacted ${legislation.end_time.split('T')[0]}`}
            </>
          )}
          {!legislation.location && !legislation.start_time && !legislation.end_time && "Pending"}
        </span>
      </div>
      {/* Latest Action */}
      {legislation.latest_action_text && (
        <div className="mb-3 ml-1 flex items-start gap-2">
          <svg className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <div className="text-sm">
            <span className="font-semibold text-purple-700">Latest: </span>
            <span className="text-gray-600">{legislation.latest_action_text}</span>
            {legislation.latest_action_date && (
              <span className="text-gray-400 ml-1">
                ({new Date(legislation.latest_action_date).toLocaleDateString()})
              </span>
            )}
          </div>
        </div>
      )}
      {/* Description */}
      <div className="mb-3 text-gray-700 leading-relaxed text-base" dangerouslySetInnerHTML={{ __html: legislation.description || "" }} />
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
