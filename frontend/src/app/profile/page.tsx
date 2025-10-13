"use client";

import { useEffect, useState } from "react";
import { useAuthApi } from "@/app/hooks/useAuthApi";
import { useAuth } from "@/contexts/AuthContext";
import { UserService } from "@/service/UserService";
import { User } from "@/models/index";

export default function HomePage() {
  const api = useAuthApi();
  const { initialized } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const userService = new UserService();

  useEffect(() => {
    if (!initialized) return;

    const fetchUser = async () => {
      try {
        const userResponse: User = await userService.getCurrentUser(api);
        setUser(userResponse);
      } catch (err: any) {
        setError(err.response?.data?.detail || "Failed to fetch user");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [api, initialized]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  if (!initialized) {
    return <p>Initializing...</p>;
  }
  return (
    <div>
      <h1>Welcome, {user?.full_name || user?.username}!</h1>
      <p>Email: {user?.email}</p>
      <p>User ID: {user?.id}</p>
    </div>
  );
}
