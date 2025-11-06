"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/models";
import { useAuthApi } from "@/app/hooks/useAuthApi";
import { UserService } from "@/service/UserService";

interface FollowersModalProps {
  userId: number;
  initialTab: "followers" | "following";
  isOpen: boolean;
  onClose: () => void;
}

const FollowersModal: React.FC<FollowersModalProps> = ({
  userId,
  initialTab,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<"followers" | "following">(initialTab);
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [followersCursor, setFollowersCursor] = useState<string | undefined>();
  const [followingCursor, setFollowingCursor] = useState<string | undefined>();
  const [hasMoreFollowers, setHasMoreFollowers] = useState(false);
  const [hasMoreFollowing, setHasMoreFollowing] = useState(false);
  const [hasFetchedFollowers, setHasFetchedFollowers] = useState(false);
  const [hasFetchedFollowing, setHasFetchedFollowing] = useState(false);
  
  const API = useAuthApi();
  const userService = new UserService();
  const router = useRouter();
  const modalRef = useRef<HTMLDivElement>(null);

  // Sync activeTab with initialTab when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Fetch data when modal opens or tab changes
  useEffect(() => {
    if (isOpen) {
      if (activeTab === "followers" && !hasFetchedFollowers) {
        fetchFollowers();
      } else if (activeTab === "following" && !hasFetchedFollowing) {
        fetchFollowing();
      }
    }
  }, [isOpen, activeTab]);

  // Handle click outside to close
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  // Handle escape key to close
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const fetchFollowers = async (cursor?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await userService.getFollowers(API, userId, cursor, 20);
      setFollowers(prev => cursor ? [...prev, ...response.users] : response.users);
      setFollowersCursor(response.next_cursor);
      setHasMoreFollowers(!!response.next_cursor);
      setHasFetchedFollowers(true);
    } catch (err: any) {
      setError("Failed to load followers");
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowing = async (cursor?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await userService.getFollowing(API, userId, cursor, 20);
      setFollowing(prev => cursor ? [...prev, ...response.users] : response.users);
      setFollowingCursor(response.next_cursor);
      setHasMoreFollowing(!!response.next_cursor);
      setHasFetchedFollowing(true);
    } catch (err: any) {
      setError("Failed to load following");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (activeTab === "followers" && hasMoreFollowers) {
      fetchFollowers(followersCursor);
    } else if (activeTab === "following" && hasMoreFollowing) {
      fetchFollowing(followingCursor);
    }
  };

  if (!isOpen) return null;

  const currentList = activeTab === "followers" ? followers : following;
  const hasMore = activeTab === "followers" ? hasMoreFollowers : hasMoreFollowing;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/10 backdrop-blur-md">
      <div
        ref={modalRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden"
      >
        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            className={`flex-1 py-3 text-sm font-semibold transition ${
              activeTab === "followers"
                ? "text-purple-600 border-b-2 border-purple-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("followers")}
          >
            Followers
          </button>
          <button
            className={`flex-1 py-3 text-sm font-semibold transition ${
              activeTab === "following"
                ? "text-purple-600 border-b-2 border-purple-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("following")}
          >
            Following
          </button>
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading && currentList.length === 0 && (
            <div className="text-center text-gray-500 py-8">Loading...</div>
          )}
          
          {!loading && currentList.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              <p>No {activeTab === "followers" ? "followers" : "following"} yet</p>
            </div>
          )}

          {currentList.map((user) => (
            <div
              key={user.id}
              onClick={() => router.push(`/users/${user.id}`)}
              className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-purple-50 transition rounded-lg px-2 -mx-2"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-800">{user.username}</p>
                {user.full_name && (
                  <p className="text-sm text-gray-500">{user.full_name}</p>
                )}
              </div>
            </div>
          ))}

          {error && (
            <div className="text-red-500 text-sm text-center py-4">{error}</div>
          )}

          {hasMore && !loading && (
            <div className="text-center py-4">
              <button
                onClick={handleLoadMore}
                className="px-6 py-2 rounded-full text-sm font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition"
              >
                Load More
              </button>
            </div>
          )}

          {loading && currentList.length > 0 && (
            <div className="text-center text-gray-500 py-4">Loading more...</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowersModal;
