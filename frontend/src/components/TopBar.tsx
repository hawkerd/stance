"use client";

import React from "react";
import SidebarItem from "./SidebarItem";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";
import { useUser } from "@/contexts/UserContext";
import { useRouter } from "next/navigation";

const TopBar: React.FC = () => {
  const { isAuthenticated, logout, initialized } = useAuth();
  const { user, profile, loading: userLoading } = useUser();
  const router = useRouter();

  return (
    <aside
      className="h-screen w-56 bg-white text-purple-700 shadow-md flex flex-col items-stretch border-r border-purple-200/40 py-8 px-4 sticky top-0"
      style={{ minWidth: 200 }}
    >
  <div className="mb-6 text-2xl tracking-tight text-purple-700 select-none pl-4" style={{ fontWeight: 'normal' }}>Stance</div>
      <div className="flex flex-col gap-2">
        <SidebarItem href="/" icon={
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125h3.75c.621 0 1.125-.504 1.125-1.125V15.75c0-.621.504-1.125 1.125-1.125h1.5c.621 0 1.125.504 1.125 1.125v4.125c0 .621.504 1.125 1.125 1.125h3.75c.621 0 1.125-.504 1.125-1.125V9.75" />
          </svg>
        }>
          Home
        </SidebarItem>
        <SidebarItem href="/search" icon={
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
          </svg>
        }>
          Search
        </SidebarItem>
        <SidebarItem href="/feed" icon={
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8.25h7.5M3 12h7.5m-7.5 3.75h7.5m6.75-7.5v10.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.75A2.25 2.25 0 016.75 4.5h7.5A2.25 2.25 0 0116.5 6.75z" />
          </svg>
        }>
          Feed
        </SidebarItem>
        <SidebarItem href="/following-feed" icon={
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
        }>
          Following
        </SidebarItem>
          <SidebarItem href="/admin" icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          }>
            Admin
          </SidebarItem>
        {initialized && isAuthenticated ? (
          <SidebarItem href="/profile" icon={
            <span className="w-6 h-6 flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-purple-400 to-pink-400">
              {!userLoading && profile?.avatar_url ? (
                <Image 
                  src={profile.avatar_url} 
                  alt="Profile" 
                  width={24} 
                  height={24} 
                  className="object-cover w-full h-full" 
                />
              ) : !userLoading ? (
                <span className="text-white text-xs font-bold">
                  {user?.username?.charAt(0).toUpperCase() || "?"}
                </span>
              ) : null}
            </span>
          }>
            Profile
          </SidebarItem>
        ) : initialized ? (
          <SidebarItem href="/login" icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-3A2.25 2.25 0 008.25 5.25V9m7.5 0v10.5A2.25 2.25 0 0113.5 21h-3A2.25 2.25 0 018.25 19.5V9m7.5 0H8.25m7.5 0a2.25 2.25 0 012.25 2.25v7.5A2.25 2.25 0 0115.75 21h-7.5A2.25 2.25 0 016 19.5v-7.5A2.25 2.25 0 018.25 9h7.5z" />
            </svg>
          }>
            Sign in
          </SidebarItem>
        ) : null}
      </div>
      <div className="flex-1" />
      
      {/* Bottom options section */}
      <div className="flex flex-col gap-2 border-t border-purple-200/40 pt-4">
        {/* Dark Mode Toggle (placeholder) */}
        <button
          className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-gray-700 hover:bg-purple-50 transition font-normal opacity-50 cursor-not-allowed"
          disabled
        >
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
            </svg>
            <span className="text-sm">Dark Mode</span>
          </div>
          <div className="w-8 h-5 bg-gray-200 rounded-full"></div>
        </button>

        {/* Settings */}
        <button
          onClick={() => router.push('/settings')}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition font-normal"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.27 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.27-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>Settings</span>
        </button>

        {/* Report */}
        <button
          onClick={() => router.push('/report')}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition font-normal"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
          </svg>
          <span>Report</span>
        </button>

        {/* Logout (only if logged in) */}
        {isAuthenticated ? (
          <button
            onClick={() => {
              logout();
              router.push('/login');
            }}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition font-normal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            <span>Logout</span>
          </button>
        ) : (
          <div className="w-full h-11"></div>
        )}
      </div>

      {/*
        {isAuthenticated && (
          <button
            onClick={logout}
            className="mt-4 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-700 to-pink-500 text-white font-semibold shadow-sm hover:bg-purple-200 hover:text-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-300 transition flex items-center gap-3"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-3A2.25 2.25 0 008.25 5.25V9m7.5 0v10.5A2.25 2.25 0 0113.5 21h-3A2.25 2.25 0 018.25 19.5V9m7.5 0H8.25m7.5 0a2.25 2.25 0 012.25 2.25v7.5A2.25 2.25 0 0115.75 21h-7.5A2.25 2.25 0 016 19.5v-7.5A2.25 2.25 0 018.25 9h7.5z" />
            </svg>
            Log out
          </button>
        )}
        */}
    </aside>
  );
};

export default TopBar;
