"use client";

import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-red-50 p-4">
      {children}
    </main>
  );
}
