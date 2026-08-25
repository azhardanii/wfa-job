"use client";

import React from "react";
import { useStore } from "@/context/StoreContext";
import { JobCard } from "./JobCard";
import {
  Search,
  Zap,
  Sparkles,
  ShieldCheck,
  SlidersHorizontal,
  Plus,
  Palette,
  Code2,
  ClipboardList,
  Video,
  PenTool,
  CheckCircle2,
} from "lucide-react";

const CATEGORY_ITEMS = [
  { id: "ALL", label: "Semua Kategori", icon: Sparkles, color: "from-teal-500 to-emerald-500" },
  { id: "Design & Creative", label: "Design & UI/UX", icon: Palette, color: "from-sky-500 to-teal-500" },
  { id: "Dev & IT", label: "Dev & IT", icon: Code2, color: "from-indigo-500 to-cyan-500" },
  { id: "Virtual Assisting", label: "Admin & VA", icon: ClipboardList, color: "from-emerald-500 to-teal-600" },
  { id: "Video & Animation", label: "Video & Motion", icon: Video, color: "from-violet-500 to-purple-600" },
  { id: "Writing & Copy", label: "Writing & SEO", icon: PenTool, color: "from-amber-500 to-orange-500" },
  { id: "Gaming & Microtask", label: "Microtask Spot", icon: Zap, color: "from-rose-500 to-pink-500" },
];

export function JobFeed() {
  const {
    jobs,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedMode,
    setSelectedMode,
    sortBy,
    setSortBy,
    currentUser,
    setShowPostJobModal,
  } = useStore();

  const isBoss = currentUser.activeRole === "BOSS";

  // Filtering
  const filteredJobs = jobs
    .filter((job) => {
      // Category filter
      if (selectedCategory !== "ALL" && job.category !== selectedCategory) return false;
      // Mode filter
      if (selectedMode !== "ALL" && job.mode !== selectedMode) return false;
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = job.title.toLowerCase().includes(q);
        const matchDesc = job.description.toLowerCase().includes(q);
        const matchBoss = job.bossName.toLowerCase().includes(q);
        const matchCat = job.category.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchBoss && !matchCat) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "highest_budget") return b.budget - a.budget;
      if (sortBy === "deadline") return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <div className="space-y-5 pb-24">
      {/* Clean Modern Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-700 via-teal-850 to-teal-950 dark:from-teal-900/80 dark:via-teal-950 dark:to-obsidian-950 p-5 text-white shadow-md dark:shadow-teal-glow">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 dark:bg-teal-500/20 backdrop-blur-md px-2.5 py-0.5 text-[11px] font-bold text-teal-100 border border-white/20 dark:border-teal-400/30">
              <ShieldCheck className="h-3.5 w-3.5 text-teal-300" />
              100% Escrow Rekening Bersama
            </div>
            <span className="text-[10px] font-semibold text-teal-200/80">
              Terverifikasi & Aman
            </span>
          </div>

          <div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight leading-snug">
              {isBoss
                ? "Rekrut Talenta & Kelola Escrow Terpercaya"
                : "Kerja Lepas Aman dengan Pembayaran Terproteksi"}
            </h2>
            <p className="text-xs text-teal-100/80 mt-1 max-w-sm leading-relaxed">
              {isBoss
                ? "Posting proyek kustom atau tugas microtask massal dengan auto-contract terjamin."
                : "Pilih proyek Offer atau tugas Spot instan. Dana terkunci sebelum Anda mulai bekerja."}
            </p>
          </div>

          {isBoss && (
            <div className="pt-1">
              <button
                onClick={() => setShowPostJobModal(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white text-teal-950 px-4 py-2 text-xs font-black shadow-md hover:bg-teal-50 transition-all active:scale-95"
              >
                <Plus className="h-4 w-4 stroke-[3]" />
                Posting Pekerjaan Baru
              </button>
            </div>
          )}
        </div>

        {/* Ambient background blur */}
        <div className="pointer-events-none absolute -right-8 -bottom-8 h-32 w-32 rounded-full bg-teal-400/20 blur-2xl"></div>
      </div>

      {/* Visual Category Menu Grid (Clean Visual Representation) */}
      <div>
        <div className="flex items-center justify-between mb-2.5 px-0.5">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-teal-300">
            Kategori Pekerjaan
          </h3>
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
            {CATEGORY_ITEMS.length - 1} Bidang
          </span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {CATEGORY_ITEMS.filter((c) => c.id !== "ALL").map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const Icon = cat.icon;
            const jobCount = jobs.filter((j) => j.category === cat.id).length;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(isSelected ? "ALL" : cat.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all duration-200 ${
                  isSelected
                    ? "bg-teal-50 dark:bg-teal-900/50 border-teal-500 shadow-sm dark:shadow-teal-glow scale-[1.02]"
                    : "bg-white dark:bg-teal-950/30 border-slate-200/80 dark:border-teal-500/15 hover:border-teal-400/50 hover:bg-slate-50 dark:hover:bg-teal-900/20"
                }`}
              >
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${cat.color} text-white shadow-sm mb-1.5`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-[11px] font-bold text-slate-800 dark:text-white line-clamp-1 leading-tight">
                  {cat.label.split(" ")[0]}
                </span>
                <span className="text-[9px] font-medium text-slate-500 dark:text-teal-400/70 mt-0.5">
                  {jobCount} Job
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Visual Mode Choices: Offer Mode vs Spot Mode */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Offer Mode Card */}
        <div
          onClick={() => setSelectedMode(selectedMode === "OFFER" ? "ALL" : "OFFER")}
          className={`cursor-pointer rounded-2xl border p-3.5 transition-all duration-200 ${
            selectedMode === "OFFER"
              ? "bg-teal-50 dark:bg-teal-950/60 border-teal-500 shadow-sm dark:shadow-teal-glow"
              : "bg-white dark:bg-teal-950/20 border-slate-200/80 dark:border-teal-500/15 hover:border-teal-400"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-500/15 text-teal-600 dark:text-teal-300">
              <Sparkles className="h-4 w-4" />
            </div>
            {selectedMode === "OFFER" && <CheckCircle2 className="h-4 w-4 text-teal-600 dark:text-teal-400" />}
          </div>
          <h4 className="mt-2 text-xs font-bold text-slate-900 dark:text-white">Offer Mode</h4>
          <p className="mt-0.5 text-[11px] text-slate-600 dark:text-zinc-300 leading-snug">
            Proyek kustom & proposal milestone bertahap.
          </p>
        </div>

        {/* Spot Mode Card */}
        <div
          onClick={() => setSelectedMode(selectedMode === "SPOT" ? "ALL" : "SPOT")}
          className={`cursor-pointer rounded-2xl border p-3.5 transition-all duration-200 ${
            selectedMode === "SPOT"
              ? "bg-amber-50 dark:bg-amber-950/40 border-amber-500 shadow-sm"
              : "bg-white dark:bg-teal-950/20 border-slate-200/80 dark:border-teal-500/15 hover:border-amber-400"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <Zap className="h-4 w-4 fill-current" />
            </div>
            {selectedMode === "SPOT" && <CheckCircle2 className="h-4 w-4 text-amber-600 dark:text-amber-400" />}
          </div>
          <h4 className="mt-2 text-xs font-bold text-slate-900 dark:text-white">Spot Mode</h4>
          <p className="mt-0.5 text-[11px] text-slate-600 dark:text-zinc-300 leading-snug">
            Microtask instan klaim slot timer 15 menit.
          </p>
        </div>
      </div>

      {/* Search & Sort Bar */}
      <div className="space-y-2.5">
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 h-4 w-4 text-slate-400 dark:text-teal-400" />
          <input
            id="job-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama pekerjaan, skill, atau kata kunci..."
            className="w-full rounded-2xl border border-slate-200 dark:border-teal-500/25 bg-white dark:bg-teal-950/40 py-2.5 pl-10 pr-10 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-400 focus:border-teal-500 focus:outline-none shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 text-xs text-slate-400 hover:text-slate-700 dark:hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        {/* Results count & Sort */}
        <div className="flex items-center justify-between px-1 text-xs text-slate-500 dark:text-zinc-400">
          <span className="font-medium">
            {filteredJobs.length} Pekerjaan Tersedia
            {selectedCategory !== "ALL" && ` • ${selectedCategory}`}
            {selectedMode !== "ALL" && ` • ${selectedMode === "SPOT" ? "Spot Mode" : "Offer Mode"}`}
          </span>
          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-xl border border-slate-200 dark:border-teal-500/20 bg-white dark:bg-teal-950/70 px-2.5 py-1 text-xs text-slate-700 dark:text-teal-200 focus:outline-none"
            >
              <option value="latest">Terbaru</option>
              <option value="highest_budget">Budget Tertinggi</option>
              <option value="deadline">Deadline Terdekat</option>
            </select>
          </div>
        </div>
      </div>

      {/* Job Cards Feed */}
      <div className="space-y-3">
        {filteredJobs.length > 0 ? (
          filteredJobs.map((job) => <JobCard key={job.id} job={job} />)
        ) : (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 dark:border-teal-500/20 bg-slate-50 dark:bg-teal-950/20 p-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 mb-3">
              <Search className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-white">Tidak ada pekerjaan yang cocok</h4>
            <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400 max-w-xs leading-relaxed">
              Coba reset filter atau gunakan kata kunci pencarian yang lebih umum.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("ALL");
                setSelectedMode("ALL");
              }}
              className="mt-3.5 rounded-xl border border-teal-500/30 bg-teal-50 dark:bg-teal-950/60 px-4 py-2 text-xs font-bold text-teal-700 dark:text-teal-300 hover:bg-teal-100"
            >
              Reset Semua Filter
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
