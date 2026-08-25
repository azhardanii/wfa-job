"use client";

import React, { useState } from "react";
import { useStore } from "@/context/StoreContext";
import { formatUSD, formatDual } from "@/lib/store";
import {
  Briefcase,
  CheckCircle2,
  Lock,
  MessageSquare,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  Zap,
  Star,
} from "lucide-react";

export function MyJobsView() {
  const {
    jobs,
    offers,
    currentUser,
    setSelectedJob,
    setChatModalJob,
    setDisputeModalJob,
    releaseMilestone,
    releaseFullJobEscrow,
    setRatingModalJob,
  } = useStore();

  const [activeFilter, setActiveFilter] = useState<"ALL" | "IN_PROGRESS" | "PENDING" | "COMPLETED">("ALL");

  const isWorker = currentUser.activeRole === "WORKER";
  const isBoss = currentUser.activeRole === "BOSS";

  // Filter jobs based on role & active tab
  const myJobs = jobs.filter((job) => {
    if (isBoss) {
      // Boss sees jobs they posted
      if (job.bossId !== currentUser.id) return false;
      if (activeFilter === "IN_PROGRESS") return job.status === "IN_PROGRESS";
      if (activeFilter === "PENDING") return job.status === "OPEN";
      if (activeFilter === "COMPLETED") return job.status === "COMPLETED";
      return true;
    } else {
      // Worker sees jobs where they are selected OR where they placed an offer / claimed a spot
      const isAssigned = job.selectedWorkerId === currentUser.id;
      const hasOffer = offers.some((o) => o.jobId === job.id && o.workerId === currentUser.id);
      const hasSpot = job.spots?.some((s) => s.workerId === currentUser.id);

      if (!isAssigned && !hasOffer && !hasSpot) return false;

      if (activeFilter === "IN_PROGRESS") return job.status === "IN_PROGRESS" && isAssigned;
      if (activeFilter === "PENDING") return job.status === "OPEN" && hasOffer;
      if (activeFilter === "COMPLETED") return job.status === "COMPLETED";
      return true;
    }
  });

  return (
    <div className="space-y-4 pb-24 text-slate-900 dark:text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
            {isBoss ? "Kelola Pekerjaan & Escrow" : "Pekerjaan & Offer Saya"}
          </h2>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            {isBoss ? "Monitor progres worker dan release dana escrow" : "Track status offer, milestone, dan pencairan dana terproteksi"}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
        {[
          { id: "ALL", label: "Semua Job" },
          { id: "IN_PROGRESS", label: "Sedang Berjalan" },
          { id: "PENDING", label: isBoss ? "Menunggu Pemenang" : "Offer Diajukan" },
          { id: "COMPLETED", label: "Selesai" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id as any)}
            className={`rounded-xl px-3 py-1.5 font-bold transition-all shrink-0 ${
              activeFilter === tab.id
                ? "bg-teal-600 dark:bg-teal-500 text-white dark:text-obsidian-950 shadow-sm"
                : "border border-slate-200 dark:border-teal-500/20 bg-white dark:bg-teal-950/40 text-slate-700 dark:text-zinc-300 hover:bg-slate-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Jobs List */}
      <div className="space-y-3">
        {myJobs.length > 0 ? (
          myJobs.map((job) => {
            const isSpot = job.mode === "SPOT";

            return (
              <div
                key={job.id}
                className="rounded-2xl glass-card p-4 space-y-3 border border-slate-200 dark:border-teal-500/20 transition-all hover:border-teal-400/40"
              >
                {/* Header info */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="rounded bg-teal-50 dark:bg-teal-950 px-2 py-0.5 text-[10px] font-bold text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-500/30">
                        {job.category}
                      </span>
                      {isSpot ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-400">
                          <Zap className="h-3 w-3 fill-amber-500" />
                          SPOT
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-700 dark:text-teal-300">
                          <Sparkles className="h-3 w-3" />
                          OFFER
                        </span>
                      )}
                    </div>
                    <h3
                      onClick={() => setSelectedJob(job)}
                      className="text-sm font-bold text-slate-900 dark:text-white hover:text-teal-600 dark:hover:text-teal-300 cursor-pointer"
                    >
                      {job.title}
                    </h3>
                  </div>

                  <div className="text-right">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                        job.status === "IN_PROGRESS"
                          ? "bg-teal-100 dark:bg-teal-500/20 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-400/40"
                          : job.status === "COMPLETED"
                          ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-400/40"
                          : job.status === "DISPUTED"
                          ? "bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-400/40"
                          : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400"
                      }`}
                    >
                      {job.status === "IN_PROGRESS"
                        ? "Sedang Berjalan"
                        : job.status === "COMPLETED"
                        ? "Selesai & Cair"
                        : job.status === "DISPUTED"
                        ? "Dalam Sengketa"
                        : "Buka / Menunggu"}
                    </span>
                  </div>
                </div>

                {/* Escrow Status Bar */}
                <div className="rounded-xl border border-slate-200 dark:border-teal-500/20 bg-slate-50 dark:bg-teal-950/40 p-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300">
                      <Lock className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-semibold">Status Rekening Bersama:</span>
                      <span className="font-bold text-teal-800 dark:text-teal-200">
                        {job.escrow?.status === "LOCKED"
                          ? "🔒 Dana Terkunci di Escrow"
                          : job.escrow?.status === "PARTIALLY_RELEASED"
                          ? "⚡ Sebagian Dana Sudah Cair"
                          : job.escrow?.status === "RELEASED"
                          ? "✓ 100% Dana Telah Dilepas"
                          : "Siap Dikunci Saat Pemenang Dipilih"}
                      </span>
                    </div>
                  </div>

                  <div className="text-right font-mono font-bold text-sm text-teal-800 dark:text-teal-300">
                    {formatUSD(job.selectedOfferPrice || job.budget)}
                  </div>
                </div>

                {/* Milestone Release Actions for Boss / Worker */}
                {job.milestones && job.milestones.length > 0 && job.status === "IN_PROGRESS" && (
                  <div className="space-y-2 rounded-xl border border-slate-200 dark:border-teal-500/20 bg-white dark:bg-black/40 p-3">
                    <span className="text-[11px] font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wider block">
                      Tahapan Milestone Escrow:
                    </span>
                    {job.milestones.map((m, idx) => (
                      <div
                        key={m.id}
                        className="flex items-center justify-between rounded-lg bg-slate-50 dark:bg-teal-950/60 p-2 text-xs"
                      >
                        <div>
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {idx + 1}. {m.title}
                          </span>
                          <span className="block font-mono text-[11px] text-teal-700 dark:text-teal-300">
                            {formatUSD(m.amount)}
                          </span>
                        </div>

                        <div>
                          {m.status === "RELEASED" ? (
                            <span className="rounded-md bg-teal-100 dark:bg-teal-500/20 px-2 py-1 text-[10px] font-bold text-teal-800 dark:text-teal-300">
                              ✓ Sudah Cair
                            </span>
                          ) : isBoss ? (
                            <button
                              onClick={() => releaseMilestone(job.id, m.id)}
                              className="rounded-lg btn-teal-primary px-2.5 py-1 text-[11px] font-bold shadow-sm"
                            >
                              Approve & Cairkan
                            </button>
                          ) : (
                            <span className="rounded-md bg-amber-100 dark:bg-amber-950/60 px-2 py-1 text-[10px] font-bold text-amber-800 dark:text-amber-300">
                              Menunggu Review
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* If job in progress without milestones, allow full release */}
                {(!job.milestones || job.milestones.length === 0) &&
                  job.status === "IN_PROGRESS" &&
                  isBoss && (
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => releaseFullJobEscrow(job.id)}
                        className="flex items-center gap-1 rounded-xl btn-teal-primary px-4 py-2 text-xs font-bold shadow-teal-glow"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Selesaikan Job & Lepas Escrow
                      </button>
                    </div>
                  )}

                {/* Footer Action Buttons */}
                <div className="flex items-center justify-between border-t border-slate-100 dark:border-teal-500/15 pt-3 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setChatModalJob(job)}
                      className="flex items-center gap-1 rounded-lg border border-slate-200 dark:border-teal-500/20 bg-slate-50 dark:bg-teal-950/60 px-2.5 py-1.5 font-bold text-teal-800 dark:text-teal-300 hover:bg-slate-100"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      Chat Room
                    </button>

                    {job.status === "IN_PROGRESS" && (
                      <button
                        onClick={() => setDisputeModalJob(job)}
                        className="flex items-center gap-1 rounded-lg border border-rose-300 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1.5 font-bold text-rose-700 dark:text-rose-300 hover:bg-rose-100"
                      >
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Sengketa
                      </button>
                    )}

                    {job.status === "COMPLETED" && (
                      <button
                        onClick={() => setRatingModalJob(job)}
                        className="flex items-center gap-1 rounded-lg border border-amber-300 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1.5 font-bold text-amber-800 dark:text-amber-300 hover:bg-amber-100"
                      >
                        <Star className="h-3.5 w-3.5 fill-amber-500" />
                        Beri Ulasan
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => setSelectedJob(job)}
                    className="flex items-center gap-1 text-xs font-bold text-teal-700 dark:text-teal-300 hover:underline"
                  >
                    Detail
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 dark:border-teal-500/20 bg-slate-50 dark:bg-teal-950/20 p-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 mb-3">
              <Briefcase className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-white">Belum ada aktivitas pekerjaan</h4>
            <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400 max-w-xs">
              {isBoss
                ? "Anda belum memposting pekerjaan dengan filter ini. Buat job baru untuk mulai merekrut!"
                : "Anda belum mengajukan offer atau memiliki job aktif. Jelajahi feed marketplace!"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
