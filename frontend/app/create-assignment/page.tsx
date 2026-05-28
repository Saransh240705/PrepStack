"use client";

import { 
  Plus, 
  ArrowLeft, 
  UploadCloud, 
  Calendar, 
  X, 
  Minus, 
  ArrowRight,
  ChevronDown
} from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

interface QuestionRow {
  id: string;
  type: string;
  count: number;
  marks: number;
}

const page = () => {
  const router = useRouter();

  // Form input states
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");
  const [className, setClassName] = useState("Class V");
  const [timeAllotted, setTimeAllotted] = useState("45 minutes");
  const [fileUrl, setFileUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [dueDate, setDueDate] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic Question Types Rows
  const [questionRows, setQuestionRows] = useState<QuestionRow[]>([
    { id: "1", type: "mcq", count: 4, marks: 1 },
    { id: "2", type: "short", count: 3, marks: 2 },
    { id: "3", type: "diagram", count: 5, marks: 5 },
    { id: "4", type: "numerical", count: 5, marks: 5 },
  ]);

  const questionTypeOptions = [
    { value: "mcq", label: "Multiple Choice Questions" },
    { value: "short", label: "Short Questions" },
    { value: "long", label: "Long Questions" },
    { value: "diagram", label: "Diagram/Graph-Based Questions" },
    { value: "numerical", label: "Numerical Problems" },
  ];

  // Helper: Increment/Decrement Count
  const updateRowQuantity = (
    id: string,
    field: "count" | "marks",
    type: "inc" | "dec",
  ) => {
    setQuestionRows((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;
        const currentVal = row[field];
        const newVal =
          type === "inc" ? currentVal + 1 : Math.max(1, currentVal - 1);
        return { ...row, [field]: newVal };
      }),
    );
  };

  // Helper: Remove dynamic row
  const removeRow = (id: string) => {
    setQuestionRows((prev) => prev.filter((row) => row.id !== id));
  };

  // Helper: Add dynamic row
  const addQuestionRow = () => {
    const nextId = Date.now().toString();
    setQuestionRows((prev) => [
      ...prev,
      { id: nextId, type: "long", count: 5, marks: 5 },
    ]);
  };

  // Live calculations
  const totalQuestions = questionRows.reduce((sum, row) => sum + row.count, 0);
  const totalMarks = questionRows.reduce((sum, row) => sum + row.count * row.marks, 0);

  // File upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    setIsUploading(true);
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("vedaai_auth_token") || "";
      const response = await fetch("http://localhost:5001/api/upload", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }
      setFileUrl(data.url);
    } catch (err: any) {
      console.error("Upload error:", err);
      alert(`Upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Form submission handler
  const handleSubmit = async () => {
    if (!subject.trim()) return alert("Please enter a subject.");
    if (!topic.trim()) return alert("Please enter an assignment topic.");
    if (!dueDate) return alert("Please select a due date.");
    if (questionRows.length === 0) return alert("Please add at least one question type row.");

    setIsSubmitting(true);

    try {
      // Map frontend custom types to supported backend types (mcq, short, long)
      const mappedTypes = questionRows.map(row => {
        if (row.type === "mcq") return "mcq";
        if (row.type === "short") return "short";
        return "long"; // map diagrams, numericals, etc. to long
      });
      
      const finalQuestionTypes = Array.from(new Set(mappedTypes));

      const userEmail = typeof window !== "undefined" ? localStorage.getItem("vedaai_user_email") || "" : "";

      const token = localStorage.getItem("vedaai_auth_token") || "";
      const response = await fetch("http://localhost:5001/api/assignments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          subject,
          topic,
          dueDate,
          questionTypes: finalQuestionTypes,
          numQuestions: totalQuestions,
          totalMarks,
          instructions: additionalInfo,
          fileUrl,
          className,
          timeAllotted,
          createdBy: userEmail
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create assignment");
      }

      const data = await response.json();
      // Redirect directly to dynamic assignment output page!
      router.push(`/assignment/${data.assignmentId}`);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "An error occurred while creating the assignment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="ml-84 w-[70rem] py-4 min-h-[85vh] font-bricolage text-black">
      <div className="flex flex-col gap-6">
        {/* Header row with status dot and title */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <span className="w-3.5 h-3.5 rounded-full bg-[#82C43C] border-2 border-white shadow-md animate-pulse"></span>
            <h2 className="text-2xl font-bold text-black tracking-tight">
              Create Assignment
            </h2>
          </div>
          <p className="text-[#5E5E5ECC] text-sm pl-6.5">
            Set up a new assignment for your students
          </p>
        </div>

        {/* Stepper horizontal line */}
        <div className="relative w-full h-[3px] bg-zinc-200/80 rounded-full mb-2">
          <div className="absolute left-0 top-0 h-full w-1/2 bg-[#5E5E5ECC] rounded-full"></div>
        </div>

        {/* Main Form details card */}
        <div className="bg-white rounded-3xl p-8 border border-zinc-200/50 shadow-[0_4px_40px_rgba(0,0,0,0.02)] flex flex-col gap-8">
          <div>
            <h3 className="text-xl font-bold text-black">Assignment Details</h3>
            <p className="text-[#5E5E5ECC] text-xs mt-0.5">
              Basic information about your assignment
            </p>
          </div>

          {/* 🆕 Subject and Topic Inputs */}
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-black">Subject</label>
              <input
                type="text"
                placeholder="e.g. Science, English..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-[#F5F5F5] hover:bg-[#EFEFEF] focus:bg-[#EAEAEA] outline-none text-zinc-800 font-semibold px-5 py-3.5 rounded-xl border border-transparent focus:border-zinc-300 transition-all text-sm"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-black">Topic</label>
              <input
                type="text"
                placeholder="e.g. Electroplating, CBSE Grade 8 NCERT..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full bg-[#F5F5F5] hover:bg-[#EFEFEF] focus:bg-[#EAEAEA] outline-none text-zinc-800 font-semibold px-5 py-3.5 rounded-xl border border-transparent focus:border-zinc-300 transition-all text-sm"
              />
            </div>
          </div>

          {/* 🆕 Class / Grade & Time Allotted Inputs */}
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-black">Class / Grade</label>
              <input
                type="text"
                placeholder="e.g. Class VIII, 5th, Grade 10..."
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="w-full bg-[#F5F5F5] hover:bg-[#EFEFEF] focus:bg-[#EAEAEA] outline-none text-zinc-800 font-semibold px-5 py-3.5 rounded-xl border border-transparent focus:border-zinc-300 transition-all text-sm"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-black">Time Allotted</label>
              <input
                type="text"
                placeholder="e.g. 45 minutes, 3 Hours..."
                value={timeAllotted}
                onChange={(e) => setTimeAllotted(e.target.value)}
                className="w-full bg-[#F5F5F5] hover:bg-[#EFEFEF] focus:bg-[#EAEAEA] outline-none text-zinc-800 font-semibold px-5 py-3.5 rounded-xl border border-transparent focus:border-zinc-300 transition-all text-sm"
              />
            </div>
          </div>

          {/* Drag & Drop File Upload Box */}
          <div className="w-full">
            <div
              className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-colors duration-200 cursor-pointer ${
                fileUrl
                  ? "border-emerald-500/50 bg-emerald-500/5"
                  : "border-zinc-200 hover:border-zinc-300 bg-white"
              }`}
              onClick={() => document.getElementById("file-picker")?.click()}
            >
              <input
                id="file-picker"
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
              />

              {isUploading ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-4 border-zinc-900 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm font-semibold text-zinc-500 animate-pulse">
                    Uploading file...
                  </p>
                </div>
              ) : fileUrl ? (
                <div className="flex flex-col items-center gap-2">
                  <span className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                    ✓
                  </span>
                  <p className="text-sm font-bold text-emerald-600">
                    Material Uploaded successfully!
                  </p>
                  <p className="text-xs text-zinc-400 truncate max-w-[400px]">
                    {fileUrl}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="bg-zinc-100 p-3 rounded-full text-zinc-800">
                    <UploadCloud className="w-6 h-6 stroke-[1.8]" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-black leading-tight">
                      Choose a file or drag & drop it here
                    </p>
                    <p className="text-xs text-[#5E5E5ECC] mt-1">
                      JPEG, PNG, PDF, DOC, DOCX upto 20MB
                    </p>
                  </div>
                  <button
                    type="button"
                    className="bg-[#F0F0F0] hover:bg-[#E5E5E5] text-black font-bold text-xs px-5 py-2.5 rounded-full transition-colors mt-1"
                  >
                    Browse Files
                  </button>
                </div>
              )}
            </div>
            <p className="text-[#5E5E5ECC] text-xs text-center mt-3">
              Upload images or your preferred document
            </p>
          </div>

          {/* Due Date Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-black">Due Date</label>
            <div className="relative w-full">
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-[#F5F5F5] hover:bg-[#EFEFEF] focus:bg-[#EAEAEA] outline-none text-zinc-800 font-semibold px-5 py-3.5 rounded-xl border border-transparent focus:border-zinc-300 transition-all text-sm appearance-none"
              />
              <Calendar className="absolute right-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-400 pointer-events-none" />
            </div>
          </div>

          {/* Dynamic Question Type Row Builders */}
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-[1fr_auto_130px_130px] gap-4 px-2">
              <span className="text-sm font-bold text-black">Question Type</span>
              <span className="w-5"></span>
              <span className="text-sm font-bold text-black text-center">
                No. of Questions
              </span>
              <span className="text-sm font-bold text-black text-center">
                Marks
              </span>
            </div>

            {/* Rows List */}
            <div className="flex flex-col gap-3">
              {questionRows.map((row) => (
                <div
                  key={row.id}
                  className="grid grid-cols-[1fr_auto_130px_130px] items-center gap-4"
                >
                  {/* 1. Dropdown select */}
                  <div className="relative">
                    <select
                      value={row.type}
                      onChange={(e) => {
                        const val = e.target.value;
                        setQuestionRows((prev) =>
                          prev.map((r) =>
                            r.id === row.id ? { ...r, type: val } : r,
                          ),
                        );
                      }}
                      className="w-full bg-[#F5F5F5] font-semibold text-sm text-zinc-800 px-4 py-3 rounded-xl border border-transparent outline-none appearance-none cursor-pointer pr-10"
                    >
                      {questionTypeOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                  </div>

                  {/* 2. Delete button */}
                  <button
                    onClick={() => removeRow(row.id)}
                    className="p-2 text-zinc-400 hover:text-rose-500 rounded-full hover:bg-rose-50 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {/* 3. Quantity counter */}
                  <div className="flex items-center justify-between bg-[#F5F5F5] p-1.5 rounded-full w-[130px]">
                    <button
                      onClick={() => updateRowQuantity(row.id, "count", "dec")}
                      className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-zinc-500 hover:bg-zinc-100 cursor-pointer shadow-sm"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-bold text-black text-sm">
                      {row.count}
                    </span>
                    <button
                      onClick={() => updateRowQuantity(row.id, "count", "inc")}
                      className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-zinc-500 hover:bg-zinc-100 cursor-pointer shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* 4. Marks counter */}
                  <div className="flex items-center justify-between bg-[#F5F5F5] p-1.5 rounded-full w-[130px]">
                    <button
                      onClick={() => updateRowQuantity(row.id, "marks", "dec")}
                      className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-zinc-500 hover:bg-zinc-100 cursor-pointer shadow-sm"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-bold text-black text-sm">
                      {row.marks}
                    </span>
                    <button
                      onClick={() => updateRowQuantity(row.id, "marks", "inc")}
                      className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-zinc-500 hover:bg-zinc-100 cursor-pointer shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add question type button */}
            <button
              onClick={addQuestionRow}
              className="flex items-center gap-2 font-bold text-black text-sm hover:underline w-fit mt-2 cursor-pointer"
            >
              <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center">
                <Plus className="w-4 h-4 stroke-[2.5]" />
              </div>
              Add Question Type
            </button>
          </div>

          {/* totals right-aligned */}
          <div className="flex flex-col items-end gap-1.5 text-sm font-semibold text-black pr-4 border-t border-zinc-100 pt-6">
            <div>
              Total Questions :{" "}
              <span className="text-zinc-600 font-bold">{totalQuestions}</span>
            </div>
            <div>
              Total Marks :{" "}
              <span className="text-zinc-600 font-bold">{totalMarks}</span>
            </div>
          </div>

          {/* Additional details text-area */}
          <div className="flex flex-col gap-2.5">
            <label className="text-sm font-bold text-black">
              Additional Information (For better output)
            </label>
            <div className="relative">
              <textarea
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                placeholder="e.g Generate a question paper for 3 hour exam duration..."
                rows={4}
                className="w-full bg-[#F5F5F5] hover:bg-[#EFEFEF] focus:bg-[#EAEAEA] outline-none text-zinc-800 font-semibold px-5 py-4 rounded-2xl border border-transparent focus:border-zinc-300 transition-all text-sm resize-none pr-12"
              />
            </div>
          </div>
        </div>

        {/* Stepper Buttons outside */}
        <div className="flex items-center justify-between mt-4">
          <Link href="/">
            <button className="flex items-center gap-2 bg-white hover:bg-zinc-50 border border-zinc-200 text-black font-bold px-6 py-3 rounded-full transition-colors cursor-pointer">
              <ArrowLeft className="w-4.5 h-4.5" />
              Previous
            </button>
          </Link>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-black hover:bg-zinc-900 text-white font-bold px-7 py-3 rounded-full transition-all cursor-pointer disabled:bg-zinc-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Generating..." : "Next"}
            <ArrowRight className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default page;
