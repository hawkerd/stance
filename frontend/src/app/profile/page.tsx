"use client";

import { useEffect, useState } from "react";
import { useAuthApi } from "@/app/hooks/useAuthApi";
import { useAuth } from "@/contexts/AuthContext";
import { UserService } from "@/service/UserService";
import ProfilePage from "@/components/user-page/ProfilePage";

export default function ProfileRoute() {
  const api = useAuthApi();
  const { initialized } = useAuth();
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const userService = new UserService();

  useEffect(() => {
    if (!initialized) return;

    const fetchCurrentUser = async () => {
      try {
        const currentUser = await userService.getCurrentUser(api);
        setUserId(currentUser.id);
      } catch (err: any) {
        console.error("Failed to fetch current user:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, [api, initialized, userService]);

  if (!initialized || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Not logged in</p>
      </div>
    );
  }

  return <ProfilePage userId={userId} isOwnProfile={true} />;
}
