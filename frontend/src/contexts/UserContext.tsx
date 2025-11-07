"use client";

import { createContext, useState, useEffect, ReactNode, useContext } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthApi } from "@/app/hooks/useAuthApi";
import { UserService } from "@/service/UserService";
import { User, Profile } from "@/models/index";

interface UserContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
  updateProfile: (profile: Profile) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { isAuthenticated, initialized } = useAuth();
  const api = useAuthApi();
  const userService = new UserService();

  const fetchUser = async () => {
    if (!isAuthenticated) {
      setUser(null);
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Fetch current user
      const currentUser = await userService.getCurrentUser(api);
      setUser(currentUser);

      // Fetch user profile
      try {
        const userProfile = await userService.getProfile(api, currentUser.id);
        setProfile(userProfile);
      } catch (err: any) {
        // Profile might not exist yet, that's okay
        setProfile(null);
      }
    } catch (err: any) {
      console.error("Failed to fetch user:", err);
      setError(err.message || "Failed to fetch user data");
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetch user when auth state changes
  useEffect(() => {
    if (initialized) {
      fetchUser();
    }
  }, [isAuthenticated, initialized]);

  const refreshUser = async () => {
    await fetchUser();
  };

  const updateProfile = (newProfile: Profile) => {
    setProfile(newProfile);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        profile,
        loading,
        error,
        refreshUser,
        updateProfile,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
