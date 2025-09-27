"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

const TopBar: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();

  return (
    <header
      className="w-full bg-gradient-to-r from-purple-600 via-purple-500 to-pink-400 text-white shadow-md py-3 px-6 flex items-center justify-between border-b border-purple-200/40 rounded-b-2xl"
      style={{ minHeight: 64 }}
    >
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="font-extrabold text-xl tracking-tight text-white hover:text-purple-100 transition-colors"
        >
          Home
        </Link>
      </div>
      <div className="flex items-center gap-3">
        {isAuthenticated ? (
          <>
            <Link
              href="/profile"
              className="px-4 py-1.5 rounded-full bg-white/10 border border-purple-200/40 text-white font-semibold shadow-sm hover:bg-purple-100 hover:text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-300 transition"
            >
              Profile
            </Link>
            <button
              onClick={logout}
              className="px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-700 to-pink-500 border border-purple-200/40 text-white font-semibold shadow-sm hover:bg-purple-200 hover:text-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-300 transition"
            >
              Log out
            </button>
          </>
        ) : (
          <Link
            href="/login"
            className="px-4 py-1.5 rounded-full bg-white/10 border border-purple-200/40 text-white font-semibold shadow-sm hover:bg-purple-100 hover:text-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-300 transition"
          >
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
};

export default TopBar;
