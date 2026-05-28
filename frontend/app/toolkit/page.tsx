"use client";

import React, { useState } from "react";
import { BookOpen, Sparkles, Plus, Clock, ArrowRight, BrainCircuit, Wand2, Award, ClipboardCheck, Sparkle } from "lucide-react";
import Image from "next/image";

interface ToolItem {
  id: string;
  name: string;
  category: string;
  description: string;
  difficulty: string;
  avgTime: string;
  icon: React.ReactNode;
  color: string;
}

export default function ToolkitPage() {
  const tools: ToolItem[] = [
    {
      id: "1",
      name: "AI Lesson Plan Architect",
      category: "Preparation",
      description: "Generate structured class lesson plans with session timelines, key objectives, and activities.",
      difficulty: "Advanced",
      avgTime: "20 secs",
      icon: <BrainCircuit className="w-6 h-6" />,
      color: "from-purple-500 to-indigo-600",
    },
    {
      id: "2",
      name: "Report Card Commenter",
      category: "Grading & Feedback",
      description: "Formulate empathetic, constructive, and highly professional student review comments.",
      difficulty: "Quick",
      avgTime: "5 secs",
      icon: <Wand2 className="w-6 h-6" />,
      color: "from-emerald-400 to-teal-600",
    },
    {
      id: "3",
      name: "Rubric Matrix Generator",
      category: "Assessment",
      description: "Construct rigorous grading rubrics for project assignments, laboratory reports, or viva sheets.",
      difficulty: "Medium",
      avgTime: "15 secs",
      icon: <Award className="w-6 h-6" />,
      color: "from-amber-400 to-orange-500",
    },
    {
      id: "4",
      name: "Syllabus Parser",
      category: "Curriculum mapping",
      description: "Extract textbook subjects, session topics, and reference chapters directly from curriculum lists.",
      difficulty: "Advanced",
      avgTime: "30 secs",
      icon: <ClipboardCheck className="w-6 h-6" />,
      color: "from-[#FF7950] to-[#FF5C35]",
    },
  ];

  const [activeCategory, setActiveCategory] = useState("All Tools");
  const categories = ["All Tools", "Preparation", "Assessment", "Grading & Feedback", "Curriculum mapping"];

  const filteredTools = activeCategory === "All Tools" 
    ? tools 
    : tools.filter((t) => t.category === activeCategory);

  return (
    <div className="lg:ml-84 lg:w-[70rem] w-full px-4 lg:px-0 py-4 lg:py-6 font-bricolage text-black min-h-[85vh] pb-24 relative flex flex-col gap-5 lg:gap-6">
      
      {/* Page Title & Action Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <span className="w-3.5 h-3.5 rounded-full bg-orange-500 border-2 border-white shadow-md animate-pulse"></span>
          <h2 className="text-2xl font-black text-black tracking-tight flex items-center gap-2">
            <span>AI Teacher's Toolkit</span>
            <Sparkle className="w-5 h-5 text-amber-500 fill-amber-500 animate-spin-slow" />
          </h2>
        </div>
        <p className="text-[#5E5E5ECC] text-sm pl-6.5">
          Leverage advanced AI engines to automate lesson prep, comment rubrics, and feedback generation.
        </p>
      </div>

      {/* Categories Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-zinc-100 mt-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs font-extrabold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
              activeCategory === cat 
                ? "bg-black text-white shadow-sm" 
                : "bg-zinc-50 border border-zinc-200/60 text-zinc-500 hover:bg-zinc-100"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Tools List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
        {filteredTools.map((tool) => (
          <div
            key={tool.id}
            className="bg-white rounded-3xl p-6 border border-zinc-200/50 shadow-[0_4px_30px_rgba(0,0,0,0.01)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.03)] hover:scale-[1.01] transition-all flex flex-col justify-between gap-6"
          >
            <div className="flex items-start gap-4">
              {/* Tool Icon Box */}
              <div className={`bg-gradient-to-br ${tool.color} text-white p-3.5 rounded-2xl shadow-md shrink-0`}>
                {tool.icon}
              </div>

              {/* Tool Metadata */}
              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400">
                  {tool.category}
                </span>
                <h3 className="text-lg font-black tracking-tight text-zinc-950 truncate">
                  {tool.name}
                </h3>
                <p className="text-zinc-500 text-xs mt-1.5 leading-relaxed font-semibold">
                  {tool.description}
                </p>
              </div>
            </div>

            {/* Tool Footer metrics & trigger */}
            <div className="flex items-center justify-between border-t border-zinc-100 pt-4 text-xs font-bold text-zinc-400">
              <div className="flex gap-4">
                <span>Speed: <strong className="text-zinc-800">{tool.avgTime}</strong></span>
                <span className="h-4 w-[1px] bg-zinc-200"></span>
                <span>Type: <strong className="text-zinc-800">{tool.difficulty}</strong></span>
              </div>

              <button className="flex items-center gap-1 bg-zinc-900 hover:bg-black text-white font-extrabold text-xs px-4 py-2 rounded-full transition-all active:scale-[0.97] cursor-pointer">
                <span>Open Tool</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
