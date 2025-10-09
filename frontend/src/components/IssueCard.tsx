"use client";

import { useState } from "react";
import { Issue } from "../models";
import StanceCard from "./StanceCard";
import { useRouter } from "next/navigation";

export default function IssueCard({ issue }: { issue: Issue }) {
  const stances = issue.stances || [];
  const router = useRouter();
  let imageUrls: string[] = [];
  try {
    imageUrls = issue.images_json ? JSON.parse(issue.images_json) : [];
  } catch {
    imageUrls = [];
  }
  const [currentImage, setCurrentImage] = useState(0);
  const hasImages = imageUrls.length > 0;

  const handlePrev = () => {
    setCurrentImage((idx) => Math.max(idx - 1, 0));
  };
  const handleNext = () => {
    setCurrentImage((idx) => Math.min(idx + 1, imageUrls.length - 1));
  };

  return (
    <>
      <div className="w-[90%] flex flex-row mx-auto">
        <div className="w-1/2 min-w-0">
          <div className="aspect-video bg-gray-200 rounded mb-2 flex items-center justify-center relative overflow-hidden">
            {hasImages ? (
              <>
                {currentImage > 0 && (
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
                  alt={`Issue image ${currentImage + 1}`}
                  className="object-contain rounded w-full h-full mx-auto"
                  style={{ maxHeight: "100%", maxWidth: "100%" }}
                />
                {currentImage < imageUrls.length - 1 && (
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white bg-opacity-70 rounded-full px-2 py-1 text-lg shadow hover:bg-opacity-100"
                    onClick={handleNext}
                    aria-label="Next image"
                  >
                    &#8594;
                  </button>
                )}
                <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs bg-white bg-opacity-70 rounded px-2 py-1">
                  {currentImage + 1} / {imageUrls.length}
                </span>
              </>
            ) : (
              <span className="text-gray-400 text-sm select-none">Image(s) coming soon</span>
            )}
          </div>
          <div>
            <div
              className="flex items-center mb-2 cursor-pointer hover:bg-gray-100 rounded transition"
              onClick={() => router.push(`/entities/${issue.id}`)}
              title="View details"
            >
              <h2 className="text-xl font-semibold text-black flex-1">{issue.title}</h2>
            </div>
            <p className="mb-3 text-gray-700 leading-relaxed">{issue.description}</p>
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
