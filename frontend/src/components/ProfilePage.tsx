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
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-6">
        <div className="flex items-center gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {profilePage.avatar_url ? (
              <img
                src={profilePage.avatar_url}
                alt={`${profilePage.username}'s avatar`}
                className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-3xl font-bold">
                {profilePage.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {profilePage.username}
            </h1>
            {profilePage.bio && (
              <p className="text-gray-600 leading-relaxed">{profilePage.bio}</p>
            )}
          </div>
        </div>

        {/* Pinned Stance */}
        {profilePage.pinned_stance_id && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
              <span>Pinned Stance</span>
            </div>
            <p className="text-gray-700">Stance ID: {profilePage.pinned_stance_id}</p>
          </div>
        )}
      </div>

      {/* Stances Grid */}
      <div className="mb-8">
        <UserStancesGrid userId={userId} />
      </div>
    </div>
  );
}
