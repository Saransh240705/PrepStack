"use client";

import { 
  ArrowLeft, 
  Bell, 
  ChevronDown, 
  LayoutGrid
} from "lucide-react";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

const NavBar = () => {
  const router = useRouter();
  const pathname = usePathname();

  // Dynamic Profile States
  const [userName, setUserName] = useState("John Doe");
  const [avatar, setAvatar] = useState("/Avatar.jpg");

  useEffect(() => {
    const fetchProfile = () => {
      try {
        const userEmail = localStorage.getItem("vedaai_user_email") || "";
        const stored = localStorage.getItem(`vedaai_profile_${userEmail}`);
        if (stored) {
          const profile = JSON.parse(stored);
          if (profile.userName) setUserName(profile.userName);
          if (profile.avatar) setAvatar(profile.avatar);
        }
      } catch (err) {
        console.error("Error reading profile in navbar:", err);
      }
    };

    fetchProfile();
    
    // Check periodically for instant updates
    const interval = setInterval(fetchProfile, 2000);
    return () => clearInterval(interval);
  }, []);

  // Dynamic breadcrumb text
  let breadcrumb = "Assignment";
  if (pathname === "/create-assignment") {
    breadcrumb = "Create Assignment";
  } else if (pathname.startsWith("/assignment/")) {
    breadcrumb = "Assignment Output";
  } else if (pathname === "/assignment") {
    breadcrumb = "Assignments List";
  } else if (pathname === "/profile") {
    breadcrumb = "Teacher Profile";
  }

  const handleBack = () => {
    if (pathname !== "/assignment" && pathname.startsWith("/assignment")) {
      router.push("/assignment");
    } else if (pathname === "/create-assignment" || pathname === "/profile") {
      router.push("/assignment");
    } else {
      router.back();
    }
  };

  return (
    <div className="text-black flex justify-between items-center lg:w-[70rem] w-full max-w-full bg-[#FFFFFF] lg:bg-[#fafafa] mt-2 lg:mt-5 rounded-2xl lg:ml-84 p-3 lg:p-2 print:hidden border border-zinc-200/20 shadow-sm font-bricolage">
      <div className="flex items-center">
        {/* Back button with click handler (Desktop only) */}
        <button
          onClick={handleBack}
          className="hidden lg:flex bg-[#FFFFFF] w-fit p-2 ml-2 rounded-full cursor-pointer hover:bg-zinc-50 active:scale-95 transition-all shadow-sm items-center justify-center text-zinc-700"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        {/* Dynamic Breadcrumb (Desktop only) */}
        <div className="hidden lg:flex ml-4 text-[#5E5E5ECC] gap-2 items-center">
          <LayoutGrid className="w-4 h-4 text-zinc-400" />
          <h3 className="text-sm font-bold text-zinc-500">{breadcrumb}</h3>
        </div>

        {/* Brand Logo (Mobile only) */}
        <div className="flex lg:hidden items-center gap-2 pl-2">
          <Image
            src="/Logo.png"
            alt="Logo"
            width={32}
            height={32}
            style={{ width: "32px", height: "auto" }}
            className="object-contain"
          />
          <span className="text-xl font-black text-black tracking-tight">VedaAI</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Notification Bell with Badge */}
        <div className="relative bg-[#f5f5f5] p-2 rounded-full flex justify-center items-center cursor-pointer hover:bg-zinc-200/50 transition-colors">
          <Bell className="w-5 h-5 text-zinc-700" />
          <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-[#FF5A1F] border border-white"></span>
        </div>
        
        {/* Profile Navigator */}
        <Link href="/profile" className="flex items-center">
          {/* Desktop User Info Pill */}
          <div className="hidden lg:flex bg-[#FFFFFF] rounded-full p-2 gap-2 shadow-sm border border-zinc-200/10 hover:bg-zinc-50 transition-colors cursor-pointer">
            <Image 
              src={avatar} 
              alt="avatar" 
              width={40} 
              height={40} 
              className="rounded-full object-cover h-10 w-10 border border-zinc-100" 
            />
            <h3 className="font-bricolage flex items-center font-bold text-[13px] text-zinc-800">
              {userName} 
              <ChevronDown className="w-3.5 h-3.5 ml-1 text-zinc-500" />
            </h3>
          </div>

          {/* Mobile User Avatar */}
          <div className="flex lg:hidden rounded-full overflow-hidden border border-zinc-200/40 shadow-sm cursor-pointer">
            <Image 
              src={avatar} 
              alt="avatar" 
              width={36} 
              height={36} 
              className="rounded-full object-cover h-9 w-9" 
            />
          </div>
        </Link>
      </div>
    </div>
  );
};

export default NavBar;