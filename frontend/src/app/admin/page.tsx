"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

const AdminPage: React.FC = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  return (
    <div className="p-8 text-black">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
      <p className="mb-4">Welcome to the admin area. Here you can manage entities and perform administrative actions.</p>
      <button
        className="mb-6 px-4 py-2 bg-purple-700 text-white rounded hover:bg-purple-800 transition"
        onClick={() => router.push('/admin/new-entity')}
      >
        + Entity
      </button>
      {/* TODO: Add entity creation form, entity list, and other admin features here */}
    </div>
  );
};

export default AdminPage;
