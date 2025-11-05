"use client";

import React from "react";
import SidebarItem from "./SidebarItem";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";

const TopBar: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();

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
        {isAuthenticated ? (
          <SidebarItem href="/profile" icon={
            <span className="w-6 h-6 flex items-center justify-center overflow-hidden rounded-full bg-gray-200">
              <Image src="/profile.png" alt="Profile" width={24} height={24} className="object-cover w-full h-full" />
            </span>
          }>
            Profile
          </SidebarItem>
        ) : (
          <SidebarItem href="/login" icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-3A2.25 2.25 0 008.25 5.25V9m7.5 0v10.5A2.25 2.25 0 0113.5 21h-3A2.25 2.25 0 018.25 19.5V9m7.5 0H8.25m7.5 0a2.25 2.25 0 012.25 2.25v7.5A2.25 2.25 0 0115.75 21h-7.5A2.25 2.25 0 016 19.5v-7.5A2.25 2.25 0 018.25 9h7.5z" />
            </svg>
          }>
            Sign in
          </SidebarItem>
        )}
      </div>
      <div className="flex-1" />
      {/* Options item at the bottom */}
      <div className="mb-2">
        <SidebarItem
          href="/options"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5m-16.5 5.25h16.5m-16.5 5.25h16.5" />
            </svg>
          }
          className="font-normal text-black"
        >
          Options
        </SidebarItem>
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
