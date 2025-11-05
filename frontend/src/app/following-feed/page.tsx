"use client";
import StanceFeed from "@/components/stance-feed/StanceFeed";

export default function Page() {
  return <StanceFeed feedType="following" num_stances={10} />;
}
