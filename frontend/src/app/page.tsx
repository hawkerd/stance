"use client";
import EntityFeed from "@/components/entity-feed/EntityFeed";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-8 bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <EntityFeed />
    </main>
  );
}
