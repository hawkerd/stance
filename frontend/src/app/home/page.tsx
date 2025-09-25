"use client";

import { useEffect, useState } from "react";
import { useApi } from "@/app/hooks/useApi";
import { components } from "@/models/api";
import { useAuth } from "@/contexts/AuthContext";

type UserReadResponse = components["schemas"]["UserReadResponse"];

export default function HomePage() {
  const api = useApi();
  const { initialized } = useAuth();
  const [userResponse, setUserResponse] = useState<UserReadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!initialized) return;

    const fetchUser = async () => {
      try {
        const res = await api.get<UserReadResponse>("/users/me");
        setUserResponse(res.data);
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
      <h1>Welcome, {userResponse?.full_name || userResponse?.username}!</h1>
      <p>Email: {userResponse?.email}</p>
      <p>User ID: {userResponse?.id}</p>
    </div>
  );
}
