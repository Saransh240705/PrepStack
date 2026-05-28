"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  Sparkles, 
  Eye, 
  EyeOff, 
  Loader2, 
  AlertCircle,
  CheckCircle2
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic Validation
    if (!email || !password) {
      setError("Please fill in all required credentials.");
      return;
    }

    if (activeTab === "signup" && !fullName) {
      setError("Please provide your full name to sign up.");
      return;
    }

    if (activeTab === "signup" && !agreeTerms) {
      setError("You must agree to the terms and conditions.");
      return;
    }

    try {
      const endpoint = activeTab === "login" ? "login" : "signup";
      const payload = activeTab === "login" 
        ? { email, password } 
        : { email, password, fullName };

      const response = await fetch(`http://localhost:5001/api/auth/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Authentication failed. Please check your credentials.");
        setIsLoading(false);
        return;
      }

      // Successful Auth
      localStorage.setItem("vedaai_auth_token", data.token);
      localStorage.setItem("vedaai_user_email", data.user.email);
      localStorage.setItem("vedaai_user_name", data.user.fullName);
      
      // Save profile info to local storage for instant sync backward compatibility
      const profileInfo = {
        userName: data.user.fullName,
        schoolName: data.user.schoolName,
        schoolAddress: data.user.schoolAddress,
        avatar: data.user.avatar || "/Avatar.jpg",
        roleTitle: data.user.role || ""
      };
      localStorage.setItem(`vedaai_profile_${data.user.email}`, JSON.stringify(profileInfo));
      localStorage.setItem(`vedaai_onboarded_${data.user.email}`, data.user.onboarded ? "true" : "false");

      window.dispatchEvent(new Event("vedaai_auth_sync"));

      if (data.user.onboarded) {
        router.push("/assignment");
      } else {
        router.push("/onboarding");
      }
    } catch (err) {
      console.error("Auth submit error:", err);
      setError("Unable to connect to VedaAI server. Please ensure the backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-12 font-bricolage text-black bg-[#fafafa]">
      
      {/* 🎨 Left Column: Visual Showcase using Banner.png */}
      <div className="hidden lg:flex lg:col-span-7 relative h-screen overflow-hidden p-8 items-end">
        {/* Background Image */}
        <Image 
          src="/Banner.png" 
          alt="VedaAI Banner" 
          fill
          priority
          className="object-cover object-center"
        />
        
        {/* Sleek Radial Overlay for Depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10 z-10"></div>

        {/* Premium Glassmorphic Card Overlay */}
        <div className="relative z-20 w-full max-w-[620px] bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl mb-4 text-white">
          <div className="flex items-center gap-2 bg-white/15 w-fit px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase border border-white/10 mb-4 animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            <span>AI-Driven Education Toolkit</span>
          </div>

          <h2 className="text-3xl font-black tracking-tight leading-tight uppercase">
            Formulate Professional Question Papers in 30 Seconds
          </h2>
          
          <p className="text-white/80 text-sm mt-3 leading-relaxed font-semibold">
            VedaAI parses curriculum files, documents, and reference sheets to draft structured, multi-section A4 question sheets with solutions instantly.
          </p>

          {/* Micro-Features grid inside glass banner */}
          <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-6 mt-6 text-xs font-bold text-white/90">
            <div className="flex flex-col gap-1">
              <span className="text-emerald-400 text-sm font-black">100%</span>
              <span>Curriculum Aligned</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-amber-400 text-sm font-black">Multi-Format</span>
              <span>Docx, PDFs & Images</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-orange-400 text-sm font-black">Dynamic</span>
              <span>A4 PDF Printing</span>
            </div>
          </div>
        </div>
      </div>

      {/* 💼 Right Column: Minimalist Premium Form Portal */}
      <div className="lg:col-span-5 flex flex-col justify-center items-center p-6 md:p-12 relative overflow-hidden h-screen bg-white">
        
        {/* Decorative Background Radial Blur */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-zinc-50/50 blur-3xl -z-10"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-orange-50/20 blur-3xl -z-10"></div>

        <div className="w-full max-w-[420px] flex flex-col gap-8">
          
          {/* Logo & Branded Headers */}
          <div className="text-center md:text-left flex flex-col gap-2">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <Image 
                src="/Logo.png" 
                alt="Logo" 
                width={36} 
                height={36} 
                style={{ width: "36px", height: "auto" }} 
              />
              <span className="font-extrabold text-2xl tracking-tight">VedaAI</span>
            </div>
            
            <h1 className="text-3xl font-black tracking-tight mt-2 text-zinc-950 uppercase">
              {activeTab === "login" ? "Welcome Back" : "Start For Free"}
            </h1>
            <p className="text-zinc-500 text-sm">
              {activeTab === "login" 
                ? "Enter your credentials to manage your curriculum." 
                : "Create a teacher profile and start drafting sheets."}
            </p>
          </div>

          {/* Premium Tab Switcher */}
          <div className="grid grid-cols-2 p-1.5 bg-zinc-100 rounded-full border border-zinc-200/50 shadow-inner">
            <button
              onClick={() => { setActiveTab("login"); setError(null); }}
              className={`py-2 px-4 rounded-full text-sm font-bold transition-all duration-300 cursor-pointer ${
                activeTab === "login" 
                  ? "bg-black text-white shadow-md scale-102" 
                  : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => { setActiveTab("signup"); setError(null); }}
              className={`py-2 px-4 rounded-full text-sm font-bold transition-all duration-300 cursor-pointer ${
                activeTab === "signup" 
                  ? "bg-black text-white shadow-md scale-102" 
                  : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Alert messages */}
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-2xl flex items-start gap-2 animate-in fade-in slide-in-from-top-1">
              <AlertCircle className="w-4.5 h-4.5 text-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Interactive Form Card */}
          <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4">
            
            {/* Full Name input (Signup only) */}
            {activeTab === "signup" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-zinc-700 pl-1 uppercase tracking-wide">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-400" />
                  <input
                    type="text"
                    required
                    placeholder="Prof. John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200/80 rounded-2xl pl-11 pr-4 py-3.5 text-sm outline-none font-semibold text-zinc-800 focus:bg-white focus:border-zinc-950 focus:shadow-[0_0_0_3px_rgba(0,0,0,0.02)] transition-all"
                  />
                </div>
              </div>
            )}

            {/* Email Input */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-zinc-700 pl-1 uppercase tracking-wide">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-400" />
                <input
                  type="email"
                  required
                  placeholder="teacher@school.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200/80 rounded-2xl pl-11 pr-4 py-3.5 text-sm outline-none font-semibold text-zinc-800 focus:bg-white focus:border-zinc-950 focus:shadow-[0_0_0_3px_rgba(0,0,0,0.02)] transition-all"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-xs font-bold text-zinc-700 uppercase tracking-wide">Password</label>
                {activeTab === "login" && (
                  <span className="text-[11px] text-zinc-400 font-bold hover:underline cursor-pointer">
                    Forgot Password?
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200/80 rounded-2xl pl-11 pr-11 py-3.5 text-sm outline-none font-semibold text-zinc-800 focus:bg-white focus:border-zinc-950 focus:shadow-[0_0_0_3px_rgba(0,0,0,0.02)] transition-all"
                />
                
                {/* Micro-interaction toggle password */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-4.5 h-4.5" />
                  ) : (
                    <Eye className="w-4.5 h-4.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Terms and conditions checkbox (Signup only) */}
            {activeTab === "signup" && (
              <div className="flex items-start gap-2.5 mt-2 px-1">
                <input
                  type="checkbox"
                  id="agree-checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-1 accent-black h-4 w-4 rounded border-zinc-300"
                />
                <label htmlFor="agree-checkbox" className="text-xs text-zinc-500 font-semibold select-none cursor-pointer leading-normal">
                  I agree to VedaAI’s{" "}
                  <span className="text-black font-extrabold hover:underline">Terms of Service</span> and{" "}
                  <span className="text-black font-extrabold hover:underline">Privacy Policy</span>.
                </label>
              </div>
            )}

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 bg-black hover:bg-zinc-900 disabled:bg-zinc-800 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4.5 h-4.5 animate-spin" />
              ) : (
                <>
                  <span>{activeTab === "login" ? "Access Dashboard" : "Register Educator Account"}</span>
                  <ArrowRight className="w-4.5 h-4.5" />
                </>
              )}
            </button>
          </form>

          {/* Bottom Switch text for tiny screens */}
          <div className="text-center text-xs text-zinc-400 font-bold mt-2">
            {activeTab === "login" ? (
              <span>
                New to VedaAI?{" "}
                <button 
                  onClick={() => { setActiveTab("signup"); setError(null); }}
                  className="text-black font-extrabold hover:underline cursor-pointer bg-transparent border-none"
                >
                  Create an account
                </button>
              </span>
            ) : (
              <span>
                Already registered?{" "}
                <button 
                  onClick={() => { setActiveTab("login"); setError(null); }}
                  className="text-black font-extrabold hover:underline cursor-pointer bg-transparent border-none"
                >
                  Log In instead
                </button>
              </span>
            )}
          </div>

        </div>
      </div>

    </div>
  );
}
