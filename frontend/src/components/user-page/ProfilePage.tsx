"use client";

import { useEffect, useState } from "react";
import { useAuthApi } from "@/app/hooks/useAuthApi";
import { UserService } from "@/service/UserService";
import UserStancesGrid from "@/components/user-page/UserStancesGrid";
import type { ProfilePage as ProfilePageType } from "@/models/index";

interface ProfilePageProps {
  userId: number;
}

export default function ProfilePage({ userId }: ProfilePageProps) {
  const api = useAuthApi();
  const [profilePage, setProfilePage] = useState<ProfilePageType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const userService = new UserService();

  useEffect(() => {
    const fetchProfilePage = async () => {
      try {
        const response = await userService.getProfilePage(api, userId);
        setProfilePage(response);
      } catch (err: any) {
        setError(err.response?.data?.detail || "Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfilePage();
  }, [api, userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 font-semibold">Error loading profile</p>
          <p className="text-gray-600 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  if (!profilePage) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Profile not found</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-start overflow-hidden p-0 bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="w-full max-w-4xl mx-auto px-4 py-10">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-10 mb-10">
        <div className="flex items-center gap-8">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {profilePage.avatar_url ? (
              <img
                src={profilePage.avatar_url}
                alt={`${profilePage.username}'s avatar`}
                className="w-28 h-28 rounded-full object-cover border-4 border-purple-100 shadow"
              />
            ) : (
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-4xl font-bold shadow border-4 border-purple-100">
                {profilePage.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
              {profilePage.username}
            </h1>
            {profilePage.bio && (
              <p className="text-gray-600 leading-relaxed text-base">{profilePage.bio}</p>
            )}
          </div>
        </div>
      </div>

      {/* Stances Grid */}
      <div className="mb-8">
        <UserStancesGrid userId={userId} pinnedStanceDetails={{ entityId: profilePage.pinned_stance_entity_id || undefined, stanceId: profilePage.pinned_stance_id || undefined }} />
      </div>
    </div>
  </main>
  );
}
