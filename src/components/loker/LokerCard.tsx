"use client";

import React, { useState } from "react";
import { WfaLoker } from "@/types/loker";
import {
  Globe2,
  MapPin,
  Clock,
  Building2,
  ArrowUpRight,
  Sparkles,
  Banknote,
  CheckCircle2,
} from "lucide-react";

interface LokerCardProps {
  loker: WfaLoker;
  onSelect: (loker: WfaLoker) => void;
}

export function LokerCard({ loker, onSelect }: LokerCardProps) {
  const [imageError, setImageError] = useState(false);

  const isRemote = loker.locationType === "Remote";
  const isFullTime = loker.mode === "Full Time";

  // Format date helper
  const formattedDate = new Date(loker.createdAt).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });

  const fallbackImage =
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80";

  return (
    <div
      onClick={() => onSelect(loker)}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-200/90 dark:border-teal-500/20 bg-white/95 dark:bg-zinc-900/90 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-teal-500/60 hover:shadow-lg dark:hover:shadow-teal-glow/30"
    >
      {/* Top Banner / Thumbnail & Info */}
      <div className="flex gap-3.5 items-start">
        {/* Thumbnail Image */}
        <div className="relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-800">
          <img
            src={imageError ? fallbackImage : loker.thumbnailUrl || fallbackImage}
            alt={loker.title}
            onError={() => setImageError(true)}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          {loker.featured && (
            <span className="absolute top-1 left-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-black shadow-sm" title="Lowongan Unggulan">
              <Sparkles className="h-2.5 w-2.5 fill-current" />
            </span>
          )}
        </div>

        {/* Header Meta & Title */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Location Badge */}
            {isRemote ? (
              <span className="inline-flex items-center gap-1 rounded-md border border-teal-300 dark:border-teal-500/40 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 text-[10px] font-bold text-teal-700 dark:text-teal-300">
                <Globe2 className="h-3 w-3" />
                Remote WFA
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-md border border-blue-300 dark:border-blue-500/40 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:text-blue-300">
                <MapPin className="h-3 w-3" />
                On-site
              </span>
            )}

            {/* Mode Badge */}
            <span
              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold border ${
                isFullTime
                  ? "border-emerald-300 dark:border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300"
                  : "border-purple-300 dark:border-purple-500/40 bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300"
              }`}
            >
              <Clock className="h-3 w-3" />
              {loker.mode}
            </span>

            {/* Status if Closed */}
            {loker.status === "CLOSED" && (
              <span className="inline-flex items-center rounded-md bg-rose-100 dark:bg-rose-950 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:text-rose-300">
                Ditutup
              </span>
            )}
          </div>

          {/* Job Title */}
          <h3 className="mt-1.5 text-sm sm:text-base font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-teal-600 dark:group-hover:text-teal-300 transition-colors">
            {loker.title}
          </h3>

          {/* Company Name */}
          <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-600 dark:text-zinc-400 font-medium">
            <Building2 className="h-3 w-3 text-slate-400 dark:text-zinc-500 shrink-0" />
            <span className="truncate">{loker.companyName}</span>
          </p>
        </div>
      </div>

      {/* Offline Address (if On-site) */}
      {!isRemote && loker.offlineAddress && (
        <div className="mt-2.5 flex items-start gap-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800/60 px-2.5 py-1.5 text-[11px] text-slate-700 dark:text-zinc-300">
          <MapPin className="h-3.5 w-3.5 text-rose-500 shrink-0 mt-0.5" />
          <span className="line-clamp-1">{loker.offlineAddress}</span>
        </div>
      )}

      {/* Description Snippet */}
      <p className="mt-2 text-xs text-slate-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
        {loker.description}
      </p>

      {/* Bottom Info Bar: Salary & CTA */}
      <div className="mt-3.5 flex items-center justify-between border-t border-slate-100 dark:border-zinc-800/80 pt-2.5">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">Estimasi Pendapatan:</span>
          <span className="inline-flex items-center gap-1 font-bold text-xs sm:text-sm text-teal-700 dark:text-teal-300">
            <Banknote className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
            {loker.salaryEstimate}
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(loker);
          }}
          className="flex items-center gap-1 rounded-xl bg-teal-50 dark:bg-teal-950/70 border border-teal-200 dark:border-teal-500/30 px-3 py-1.5 text-xs font-bold text-teal-700 dark:text-teal-300 group-hover:bg-teal-600 group-hover:text-white dark:group-hover:bg-teal-400 dark:group-hover:text-black transition-all shadow-sm"
        >
          <span>Detail & Lamar</span>
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </button>
      </div>
    </div>
  );
}
