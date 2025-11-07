"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useUser } from "@/contexts/UserContext";
import ProfilePage from "@/components/user-page/ProfilePage";

export default function ProfileRoute() {
  const { initialized, isAuthenticated } = useAuth();
  const { user, loading } = useUser();

  if (!initialized || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Not logged in</p>
      </div>
    );
  }

  return <ProfilePage userId={user.id} isOwnProfile={true} />;
}
