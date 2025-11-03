"use client";

import { useState } from "react";
import { EntityFeedIssue, TagType, EntityFeedTag } from "../../models";
import StanceHeadline from "./EntityFeedStance";
import EntityFeedTagComponent from "./EntityFeedTag";
import { useRouter } from "next/navigation";

export default function IssueCard({ issue }: { issue: EntityFeedIssue }) {
  const stances = issue.stances || [];
  const router = useRouter();
  let imageUrls: string[] = [];
  try {
    imageUrls = issue.images_json ? JSON.parse(issue.images_json) : [];
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
      onClick={() => router.push(`/entities/${issue.id}`)}
      title="View details"
      tabIndex={0}
      role="button"
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') router.push(`/entities/${issue.id}`); }}
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
              alt={`Issue image ${currentImage + 1}`}
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
      {issue.tags && issue.tags.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {issue.tags.map((tag, idx) => (
            <EntityFeedTagComponent key={idx} tag={tag} />
          ))}
        </div>
      )}
      {/* Title */}
      <div className="flex items-center mb-2">
        <h2 className="text-2xl font-bold text-gray-900 flex-1 tracking-tight">{issue.title}</h2>
      </div>
      {/* Description */}
      <p className="mb-3 text-gray-700 leading-relaxed text-base">{issue.description}</p>
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
