"use client";

import { useEffect, useState } from "react";
import { useAuthApi } from "@/app/hooks/useAuthApi";
import { useAuth } from "@/contexts/AuthContext";
import { UserService } from "@/service/UserService";
import UserStancesGrid from "@/components/user-page/UserStancesGrid";
import type { ProfilePage as ProfilePageType } from "@/models/index";

interface ProfilePageProps {
  userId: number;
  isOwnProfile: boolean;
}

export default function ProfilePage({ userId, isOwnProfile }: ProfilePageProps) {
  const api = useAuthApi();
  const { isAuthenticated } = useAuth();
  const [profilePage, setProfilePage] = useState<ProfilePageType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
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

  const handleFollowToggle = async () => {
    if (!profilePage || followLoading) return;

    setFollowLoading(true);
    try {
      if (profilePage.following) {
        await userService.unfollowUser(api, userId);
        setProfilePage({
          ...profilePage,
          following: false,
          follower_count: profilePage.follower_count - 1,
        });
      } else {
        await userService.followUser(api, userId);
        setProfilePage({
          ...profilePage,
          following: true,
          follower_count: profilePage.follower_count + 1,
        });
      }
    } catch (err: any) {
      console.error("Error toggling follow status:", err);
      // Optionally show error to user
    } finally {
      setFollowLoading(false);
    }
  };

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
        <div className="flex items-start justify-between gap-8">
          {/* Left Side: Avatar and Profile Info */}
          <div className="flex items-center gap-8 flex-1">
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
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                  {profilePage.username}
                </h1>
                {isAuthenticated && !isOwnProfile && profilePage.following !== null && (
                  <button
                    onClick={handleFollowToggle}
                    disabled={followLoading}
                    className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                      profilePage.following 
                        ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' 
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {followLoading ? '...' : (profilePage.following ? 'Following' : 'Follow')}
                  </button>
                )}
              </div>
              {profilePage.full_name && (
                <p className="text-gray-500 text-lg mb-3">{profilePage.full_name}</p>
              )}
              {profilePage.bio && (
                <p className="text-gray-600 leading-relaxed text-base">{profilePage.bio}</p>
              )}
            </div>
          </div>

          {/* Right Side: Follower/Following Stats */}
          <div className="flex gap-8 flex-shrink-0">
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">{profilePage.follower_count}</p>
              <p className="text-sm text-gray-500 font-medium">Followers</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">{profilePage.following_count}</p>
              <p className="text-sm text-gray-500 font-medium">Following</p>
            </div>
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
