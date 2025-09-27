"use client";

import { ReactNode } from "react";

export default function AuthCard({ children }: { children: ReactNode }) {
  return (
    <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-8">
      {children}
    </div>
  );
}
