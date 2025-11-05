"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { StanceFeedEntity, StanceFeedTag, TagType } from "@/models";
import EntityFeedTag from "@/components/entity-feed/EntityFeedTag";

interface StanceFeedEntityPreviewProps {
  entity?: StanceFeedEntity;
}

export default function StanceFeedEntityPreview({ entity }: StanceFeedEntityPreviewProps) {
  if (!entity) {
    return null;
  }

  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  let imageUrls: string[] = [];
  try {
    imageUrls = entity.images_json ? JSON.parse(entity.images_json) : [];
  } catch {
    imageUrls = [];
  }
  const hasImages = imageUrls.length > 0;

  // Prevent click on title from toggling expand/collapse
  const handleTitleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/entities/${entity.id}`);
  };

  return (
    <div
      className="mb-4 bg-purple-50 border border-purple-200 rounded-lg shadow-sm p-4 relative"
      onClick={() => setExpanded((e) => !e)}
      style={{ cursor: "pointer" }}
    >
      {!expanded ? (
        <div className="grid grid-cols-4 gap-4">
          {hasImages && (
            <div className="col-span-1 aspect-video flex items-center justify-center bg-gray-100 rounded-lg border border-gray-200 overflow-hidden">
              <img
                src={imageUrls[0]}
                alt={entity.title}
                className="object-cover w-full h-full"
              />
            </div>
          )}
          <div className={hasImages ? "col-span-3" : "col-span-4"}>
            <div
              className="font-semibold text-base text-purple-900 mb-1 cursor-pointer"
              onClick={handleTitleClick}
            >
              {entity.title}
            </div>
            <div className="flex flex-wrap gap-1 mb-1">
              {entity.tags && entity.tags.map((tag) => (
                <EntityFeedTag key={tag.id} tag={tag} />
              ))}
            </div>
            {entity.description && (
              <div className="text-xs text-gray-600 line-clamp-2">
                {entity.description}
              </div>
            )}
          </div>
        </div>
      ) : (
  <div className="mt-0 p-0 text-base">
          {/* Image carousel */}
          {hasImages && (
            <div className="w-full flex flex-col items-center mb-4">
              <div className="relative w-full max-w-xl aspect-video flex items-center justify-center">
                <img
                  src={imageUrls[currentImage]}
                  alt={`Entity image ${currentImage + 1}`}
                  className="object-contain rounded-xl border border-gray-200 w-full h-full"
                  style={{ maxHeight: 320, background: '#f3f3fa' }}
                />
                {imageUrls.length > 1 && currentImage > 0 && (
                  <button
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 rounded-full px-2 py-1 text-lg shadow hover:bg-opacity-100"
                    onClick={e => { e.stopPropagation(); setCurrentImage(idx => Math.max(idx - 1, 0)); }}
                    aria-label="Previous image"
                  >
                    &#8592;
                  </button>
                )}
                {imageUrls.length > 1 && currentImage < imageUrls.length - 1 && (
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 rounded-full px-2 py-1 text-lg shadow hover:bg-opacity-100"
                    onClick={e => { e.stopPropagation(); setCurrentImage(idx => Math.min(idx + 1, imageUrls.length - 1)); }}
                    aria-label="Next image"
                  >
                    &#8594;
                  </button>
                )}
                {imageUrls.length > 1 && (
                  <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs bg-white bg-opacity-80 rounded px-2 py-1">
                    {currentImage + 1} / {imageUrls.length}
                  </span>
                )}
              </div>
            </div>
          )}
          <h2
            className="text-lg font-semibold text-black mb-3 tracking-tight cursor-pointer"
            onClick={e => { e.stopPropagation(); router.push(`/entities/${entity.id}`); }}
          >
            {entity.title}
          </h2>
          {entity.tags && entity.tags.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {entity.tags.map((tag) => (
                <EntityFeedTag key={tag.id} tag={tag} />
              ))}
            </div>
          )}
          <p className="text-gray-700 leading-relaxed mb-3 text-sm">
            {entity.description || "No description provided."}
          </p>
          {entity.type === 2 && (
            <div className="mb-2 text-gray-600 text-sm">
              <span>Start: {entity.start_time || "N/A"}</span>
              <span className="mx-2">|</span>
              <span>End: {entity.end_time || "N/A"}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
