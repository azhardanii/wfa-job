"use client";

import React from "react";
import { Job } from "@/types";
import { useStore } from "@/context/StoreContext";
import { formatUSD, formatIDR } from "@/lib/store";
import {
  ShieldCheck,
  Zap,
  Users,
  Clock,
  Sparkles,
  ChevronRight,
} from "lucide-react";

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  const { setSelectedJob, currentUser, setOfferModalJob, claimSpot } = useStore();

  const isSpot = job.mode === "SPOT";
  const isWorker = currentUser.activeRole === "WORKER";
  const isOwner = job.bossId === currentUser.id;

  const deadlineFormatted = new Date(job.deadline).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });

  const spotsLeft = isSpot && job.spotLimit ? Math.max(0, job.spotLimit - (job.spotsClaimedCount || 0)) : 0;
  const isSpotFull = isSpot && job.spotLimit ? (job.spotsClaimedCount || 0) >= job.spotLimit : false;

  const handleAction = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSpot) {
      if (isWorker && !isSpotFull) {
        claimSpot(job.id);
      } else {
        setSelectedJob(job);
      }
    } else {
      if (isWorker) {
        setOfferModalJob(job);
      } else {
        setSelectedJob(job);
      }
    }
  };

  return (
    <div
      onClick={() => setSelectedJob(job)}
      className="group relative cursor-pointer overflow-hidden rounded-2xl glass-card p-4 transition-all duration-200 hover:border-teal-500/40 hover:shadow-md dark:hover:shadow-teal-glow"
    >
      {/* Top Meta Bar */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Category Tag */}
          <span className="rounded-lg bg-teal-50 dark:bg-teal-950/60 border border-teal-200/60 dark:border-teal-500/20 px-2 py-0.5 text-[10px] font-semibold text-teal-800 dark:text-teal-300">
            {job.category}
          </span>

          {/* Mode Badge */}
          {isSpot ? (
            <span className="inline-flex items-center gap-1 rounded-lg border border-amber-300 dark:border-amber-400/30 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:text-amber-300">
              <Zap className="h-3 w-3 text-amber-500 fill-amber-500" />
              SPOT
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-lg border border-teal-200 dark:border-teal-400/30 bg-teal-50 dark:bg-teal-900/50 px-2 py-0.5 text-[10px] font-bold text-teal-800 dark:text-teal-200">
              <Sparkles className="h-3 w-3 text-teal-600 dark:text-teal-300" />
              OFFER
            </span>
          )}
        </div>

        {/* Escrow badge */}
        <div className="flex items-center gap-1 rounded-full bg-teal-50 dark:bg-teal-500/10 px-2 py-0.5 text-[10px] font-bold text-teal-700 dark:text-teal-300 border border-teal-200/80 dark:border-teal-500/20 shrink-0">
          <ShieldCheck className="h-3 w-3 text-teal-600 dark:text-teal-400" />
          <span>Escrow</span>
        </div>
      </div>

      {/* Title */}
      <h3 className="mt-2.5 text-sm font-bold text-slate-900 dark:text-white leading-snug group-hover:text-teal-600 dark:group-hover:text-teal-200 transition-colors line-clamp-2">
        {job.title}
      </h3>

      {/* Description */}
      <p className="mt-1 text-xs text-slate-600 dark:text-zinc-300 line-clamp-2 leading-relaxed">
        {job.description}
      </p>

      {/* Spot progress if SPOT MODE */}
      {isSpot && job.spotLimit && (
        <div className="mt-2.5 rounded-xl border border-amber-200 dark:border-amber-500/20 bg-amber-50/60 dark:bg-amber-950/30 p-2 text-xs">
          <div className="flex items-center justify-between text-[11px] font-semibold text-amber-900 dark:text-amber-200">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3 text-amber-600 dark:text-amber-400" />
              Sisa Slot: {spotsLeft} dari {job.spotLimit}
            </span>
            <span className="text-[10px]">{isSpotFull ? "Penuh" : "15 Menit/Slot"}</span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-amber-200/60 dark:bg-obsidian-950">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-teal-500 transition-all"
              style={{ width: `${Math.min(100, ((job.spotsClaimedCount || 0) / job.spotLimit) * 100)}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Card Footer */}
      <div className="mt-3 flex items-center justify-between border-t border-slate-100 dark:border-teal-500/15 pt-2.5">
        <div>
          <span className="text-[10px] font-medium text-slate-500 dark:text-zinc-400 block">
            {isSpot ? "Reward Spot" : "Budget Escrow"}
          </span>
          <div className="flex items-baseline">
            <span className="font-mono text-base font-black text-teal-700 dark:text-teal-300">
              {formatUSD(job.budget)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right hidden xs:block">
            <span className="flex items-center justify-end gap-1 text-[10px] font-medium text-slate-500 dark:text-zinc-300">
              <Clock className="h-3 w-3 text-teal-600 dark:text-teal-400" />
              {deadlineFormatted}
            </span>
            <span className="text-[9px] text-slate-400 dark:text-zinc-400">
              {isSpot ? `${job.spotsClaimedCount || 0} klaim` : `${job.offersCount || 0} offer`}
            </span>
          </div>

          <button
            onClick={handleAction}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all shadow-sm ${
              isSpot
                ? isSpotFull
                  ? "bg-slate-200 dark:bg-zinc-800 text-slate-400 dark:text-zinc-400 cursor-not-allowed"
                  : "bg-amber-400 hover:bg-amber-500 text-slate-950 font-black shadow-md"
                : "btn-teal-primary"
            }`}
          >
            {isSpot ? (
              isSpotFull ? (
                "Penuh"
              ) : isWorker ? (
                <>
                  <Zap className="h-3.5 w-3.5 fill-slate-950 text-slate-950 stroke-[2.5]" />
                  <span>Klaim</span>
                </>
              ) : (
                "Detail"
              )
            ) : isWorker ? (
              "Ajukan Offer"
            ) : isOwner ? (
              "Kelola"
            ) : (
              "Detail"
            )}
            <ChevronRight className="h-3 w-3 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>
  );
}
