"use client";

import React from "react";
import Link from "next/link";

interface SidebarItemProps {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ href, icon, children, className }) => {
  return (
    <Link
      href={href}
  className={`flex items-center gap-4 px-4 py-2 rounded-lg transition-colors duration-200 no-underline hover:bg-gray-100 ${className || ""}`}
  style={{ color: 'black' }}
    >
  <span className="text-lg">{icon}</span>
      <span>{children}</span>
    </Link>
  );
};

export default SidebarItem;
