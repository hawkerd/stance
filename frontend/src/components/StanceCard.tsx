import React from "react";
import { Stance } from "../models/Issue";

export default function StanceCard({ stance }: { stance: Stance }) {
  return (
    <div className="flex items-center px-2 py-1 rounded bg-blue-50 border border-blue-100 mb-1">
      <span className="mr-2 text-blue-400">{stance.user_id}: </span>
      <span className="font-medium text-blue-800">{stance.stance}</span>
      {/* Optionally show user or other info here */}
    </div>
  );
}
