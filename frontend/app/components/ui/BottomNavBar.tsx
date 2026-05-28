"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { LayoutGrid, FileText, BookOpen, Sparkles } from "lucide-react";
import Link from "next/link";

const BottomNavBar = () => {
  const pathname = usePathname();
  const router = useRouter();

  // Hide bottom bar on login and onboarding pages
  const isAuthPage = pathname === "/login" || pathname === "/onboarding";
  if (isAuthPage) return null;

  const tabs = [
    {
      name: "Home",
      path: "/",
      icon: <LayoutGrid className="w-5 h-5" />,
    },
    {
      name: "Assignments",
      path: "/assignment",
      icon: <FileText className="w-5 h-5" />,
    },
    {
      name: "Library",
      path: "/library",
      icon: <BookOpen className="w-5 h-5" />,
    },
    {
      name: "AI Toolkit",
      path: "/ai-toolkit",
      icon: <Sparkles className="w-5 h-5" />,
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#121212] text-white p-3 px-6 rounded-t-3xl shadow-xl flex items-center justify-between lg:hidden print:hidden font-bricolage border-t border-white/5 mx-2 mb-2">
      {tabs.map((tab) => {
        // Assignments tab is active for /assignment, /create-assignment, /assignment/[id]
        const isActive =
          tab.path === "/assignment"
            ? pathname.startsWith("/assignment") || pathname === "/create-assignment"
            : pathname === tab.path;

        return (
          <Link
            key={tab.name}
            href={tab.path === "/library" || tab.path === "/ai-toolkit" ? "#" : tab.path}
            className={`flex flex-col items-center justify-center gap-1.5 transition-all duration-300 ${
              isActive ? "text-white opacity-100 scale-105" : "text-zinc-500 hover:text-zinc-300 opacity-60"
            }`}
          >
            <div className={`p-1 rounded-xl transition-all ${isActive ? "text-white" : ""}`}>
              {tab.icon}
            </div>
            <span className={`text-[10px] font-bold tracking-wide uppercase ${isActive ? "font-black" : ""}`}>
              {tab.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
};

export default BottomNavBar;
