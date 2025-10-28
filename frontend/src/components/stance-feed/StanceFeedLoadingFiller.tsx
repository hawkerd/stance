import React from "react";

const StanceFeedLoadingFiller: React.FC = () => {
  return (
    <div className="stance-card flex flex-col items-center justify-center min-h-[300px] w-full bg-white rounded-lg shadow border border-purple-100 animate-pulse">
      <div className="flex flex-col items-center justify-center h-full">
        <svg className="animate-spin h-12 w-12 text-purple-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
        <span className="text-purple-500 font-semibold text-lg">Loading stances...</span>
      </div>
    </div>
  );
};

export default StanceFeedLoadingFiller;
