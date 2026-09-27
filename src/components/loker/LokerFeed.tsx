"use client";

import React, { useState, useEffect } from "react";
import { WfaLoker, JobWorkMode, JobLocationType } from "@/types/loker";
import { lokerService } from "@/lib/lokerService";
import { initialWfaLokers } from "@/lib/mockLoker";
import { isFirebaseConfigured } from "@/lib/firebaseConfig";
import { LokerCard } from "./LokerCard";
import { LokerDetailModal } from "./LokerDetailModal";
import {
  Search,
  Globe2,
  MapPin,
  Clock,
  Sparkles,
  SlidersHorizontal,
  RefreshCw,
  Building,
  CheckCircle2,
} from "lucide-react";

export function LokerFeed() {
  const [lokers, setLokers] = useState<WfaLoker[]>(initialWfaLokers);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [source, setSource] = useState<"firestore" | "local">("local");
  const [selectedLoker, setSelectedLoker] = useState<WfaLoker | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState<"ALL" | JobLocationType>("ALL");
  const [modeFilter, setModeFilter] = useState<"ALL" | JobWorkMode>("ALL");

  const loadLokers = async () => {
    setIsRefreshing(true);
    try {
      const res = await lokerService.getAll();
      if (res.lokers && res.lokers.length > 0) {
        setLokers(res.lokers);
        setSource(res.source);
      }
    } catch (err) {
      console.error("Failed to load lokers", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // Populate immediately from cache if available
    const cached = lokerService.getCached();
    if (cached.length > 0) {
      setLokers(cached);
    }
    // Background silent revalidation
    loadLokers();
  }, []);

  // Filtered list
  const filteredLokers = lokers.filter((loker) => {
    // Location filter
    if (locationFilter !== "ALL" && loker.locationType !== locationFilter) return false;
    // Mode filter
    if (modeFilter !== "ALL" && loker.mode !== modeFilter) return false;
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = loker.title.toLowerCase().includes(q);
      const matchCompany = loker.companyName.toLowerCase().includes(q);
      const matchDesc = loker.description.toLowerCase().includes(q);
      const matchAddress = (loker.offlineAddress || "").toLowerCase().includes(q);
      if (!matchTitle && !matchCompany && !matchDesc && !matchAddress) return false;
    }
    return true;
  });

  const totalRemote = lokers.filter((l) => l.locationType === "Remote").length;
  const totalOnsite = lokers.filter((l) => l.locationType === "On-site").length;

  return (
    <div className="space-y-4 pb-24">
      {/* Hero Banner: Highlight Info Loker WFA */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-800 via-teal-900 to-slate-950 p-5 text-white shadow-xl dark:shadow-teal-glow/20">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 h-36 w-36 rounded-full bg-teal-500/20 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-8 h-28 w-28 rounded-full bg-emerald-500/15 blur-xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          {/* Top Status Tags */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-teal-100 border border-white/20">
              <Sparkles className="h-3.5 w-3.5 text-teal-300" />
              Info Loker WFA Terkurasi
            </span>

            {/* Action Segarkan */}
            <div className="flex items-center gap-2">
              <button
                onClick={loadLokers}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/20 px-2.5 py-1 text-[11px] font-semibold text-teal-200 transition-all border border-white/10 active:scale-95"
                title="Segarkan Lowongan"
              >
                <RefreshCw className={`h-3 w-3 ${isRefreshing ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Segarkan</span>
              </button>
            </div>
          </div>

          {/* Heading */}
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
              Peluang Karir Remote & WFA Terverifikasi
            </h1>
            <p className="text-xs text-teal-100/80 mt-1.5 leading-relaxed max-w-md">
              Update lowongan kerja fleksibel setiap hari tanpa hardcode. Temukan posisi Full Time & Part Time impianmu.
            </p>
          </div>

          {/* Stats Bar */}
          <div className="pt-2 flex items-center justify-between border-t border-white/15 gap-2 flex-wrap">
            <div className="flex items-center gap-2 text-[11px] font-semibold text-teal-200">
              <span>{lokers.length} Lowongan</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Globe2 className="h-3 w-3" />
                {totalRemote} Remote
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {totalOnsite} On-site
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] text-teal-200/90 bg-white/10 px-2.5 py-0.5 rounded-full font-semibold">
              <CheckCircle2 className="h-3 w-3 text-teal-300" />
              <span>Lowongan Aktif Terverifikasi</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-zinc-500" />
        <input
          type="text"
          id="job-search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari posisi kerja, skill, atau nama perusahaan..."
          className="w-full rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-600"
          >
            Clear
          </button>
        )}
      </div>

      {/* Filter Tabs (Location & Mode) */}
      <div className="flex flex-col gap-2">
        {/* Location Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider shrink-0 mr-1">
            Lokasi:
          </span>
          <button
            onClick={() => setLocationFilter("ALL")}
            className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 transition-all ${
              locationFilter === "ALL"
                ? "bg-teal-600 text-white shadow-sm"
                : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200"
            }`}
          >
            Semua ({lokers.length})
          </button>

          <button
            onClick={() => setLocationFilter("Remote")}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold shrink-0 transition-all ${
              locationFilter === "Remote"
                ? "bg-teal-600 text-white shadow-sm"
                : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200"
            }`}
          >
            <Globe2 className="h-3 w-3" />
            <span>Remote (WFA)</span>
          </button>

          <button
            onClick={() => setLocationFilter("On-site")}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold shrink-0 transition-all ${
              locationFilter === "On-site"
                ? "bg-teal-600 text-white shadow-sm"
                : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200"
            }`}
          >
            <MapPin className="h-3 w-3" />
            <span>On-site</span>
          </button>
        </div>

        {/* Mode Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider shrink-0 mr-1">
            Mode:
          </span>
          <button
            onClick={() => setModeFilter("ALL")}
            className={`px-3 py-0.5 rounded-lg text-xs font-semibold shrink-0 transition-all ${
              modeFilter === "ALL"
                ? "border border-teal-500/40 bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 font-bold"
                : "text-slate-500 dark:text-zinc-400 hover:text-slate-800"
            }`}
          >
            Semua Jam Kerja
          </button>
          <button
            onClick={() => setModeFilter("Full Time")}
            className={`px-3 py-0.5 rounded-lg text-xs font-semibold shrink-0 transition-all ${
              modeFilter === "Full Time"
                ? "border border-teal-500/40 bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 font-bold"
                : "text-slate-500 dark:text-zinc-400 hover:text-slate-800"
            }`}
          >
            Full Time
          </button>
          <button
            onClick={() => setModeFilter("Part Time")}
            className={`px-3 py-0.5 rounded-lg text-xs font-semibold shrink-0 transition-all ${
              modeFilter === "Part Time"
                ? "border border-teal-500/40 bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 font-bold"
                : "text-slate-500 dark:text-zinc-400 hover:text-slate-800"
            }`}
          >
            Part Time
          </button>
        </div>
      </div>

      {/* Loker List Feed */}
      {lokers.length === 0 && isRefreshing ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="h-6 w-6 text-teal-600 animate-spin" />
          <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
            Memuat lowongan kerja terbaru...
          </p>
        </div>
      ) : filteredLokers.length === 0 ? (
        <div className="py-12 px-4 text-center rounded-3xl border border-dashed border-slate-300 dark:border-zinc-800">
          <Building className="h-10 w-10 text-slate-400 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200">
            Tidak ada lowongan yang sesuai
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-xs mx-auto">
            Coba ubah kata kunci pencarian atau reset filter lokasi dan mode kerja.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setLocationFilter("ALL");
              setModeFilter("ALL");
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-bold shadow-sm"
          >
            Reset Semua Filter
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLokers.map((loker) => (
            <LokerCard
              key={loker.id}
              loker={loker}
              onSelect={(selected) => setSelectedLoker(selected)}
            />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      <LokerDetailModal
        loker={selectedLoker}
        onClose={() => setSelectedLoker(null)}
      />
    </div>
  );
}
