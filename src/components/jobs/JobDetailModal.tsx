"use client";

import React, { useState, useEffect } from "react";
import { useStore } from "@/context/StoreContext";
import { formatUSD, formatDual } from "@/lib/store";
import { DigitalContractView } from "@/components/ui/DigitalContractView";
import {
  X,
  Zap,
  Sparkles,
  Star,
  CheckCircle,
  MessageSquare,
  AlertTriangle,
  Send,
  Lock,
} from "lucide-react";

export function JobDetailModal() {
  const {
    selectedJob,
    setSelectedJob,
    currentUser,
    offers,
    setOfferModalJob,
    setChatModalJob,
    setDisputeModalJob,
    acceptOfferAndLockEscrow,
    claimSpot,
    submitSpotProof,
  } = useStore();

  const [spotProofUrl, setSpotProofUrl] = useState("");
  const [spotProofText, setSpotProofText] = useState("");
  const [showSpotProofForm, setShowSpotProofForm] = useState(false);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(900); // 15 mins

  if (!selectedJob) return null;

  const isSpot = selectedJob.mode === "SPOT";
  const isWorker = currentUser.activeRole === "WORKER";
  const isJobOwner = selectedJob.bossId === currentUser.id;

  // Find user's offer if any
  const userOffer = offers.find((o) => o.jobId === selectedJob.id && o.workerId === currentUser.id);

  // Find job's offers for Boss
  const jobOffers = offers.filter((o) => o.jobId === selectedJob.id);

  // Find user's spot claim
  const userSpot = selectedJob.spots?.find((s) => s.workerId === currentUser.id);

  // Spot countdown timer
  useEffect(() => {
    if (userSpot && userSpot.status === "CLAIMED") {
      const expiresAt = new Date(userSpot.expiresAt).getTime();
      const interval = setInterval(() => {
        const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
        setTimeLeftSeconds(remaining);
        if (remaining <= 0) {
          clearInterval(interval);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [userSpot]);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleSpotProofSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userSpot) return;
    submitSpotProof(selectedJob.id, userSpot.id, spotProofUrl, spotProofText);
    setShowSpotProofForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center p-0 sm:p-4">
      <div className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-teal-500/30 bg-white dark:bg-obsidian-950 text-slate-900 dark:text-white shadow-2xl animate-in fade-in slide-in-from-bottom duration-200">
        {/* Modal Header */}
        <div className="relative flex items-center justify-between border-b border-slate-200 dark:border-teal-500/20 bg-slate-50 dark:bg-teal-950/70 px-5 py-3.5">
          <div className="flex items-center gap-2">
            {isSpot ? (
              <span className="inline-flex items-center gap-1 rounded-lg border border-amber-300 dark:border-amber-400/40 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 text-xs font-black text-amber-800 dark:text-amber-300">
                <Zap className="h-3.5 w-3.5 fill-amber-500" />
                SPOT MODE
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-lg border border-teal-200 dark:border-teal-400/40 bg-teal-50 dark:bg-teal-900/60 px-2 py-0.5 text-xs font-black text-teal-800 dark:text-teal-200">
                <Sparkles className="h-3.5 w-3.5 text-teal-600 dark:text-teal-300" />
                OFFER MODE
              </span>
            )}
            <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">• {selectedJob.category}</span>
          </div>

          <button
            onClick={() => setSelectedJob(null)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 dark:bg-teal-900/50 text-slate-700 dark:text-zinc-400 transition-colors hover:bg-slate-300 dark:hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-5 space-y-4">
          {/* Title & Budget Bar */}
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug">
              {selectedJob.title}
            </h2>
            <div className="mt-3 flex items-center justify-between rounded-2xl bg-teal-50 dark:bg-gradient-to-r dark:from-teal-900/40 dark:to-teal-950/80 p-3.5 border border-teal-200 dark:border-teal-500/25">
              <div>
                <span className="text-[10px] uppercase font-bold text-teal-800 dark:text-teal-300">
                  {isSpot ? "Reward per Spot Task" : "Budget Escrow Terkunci"}
                </span>
                <p className="font-mono text-lg font-black text-teal-900 dark:text-white">
                  {formatUSD(selectedJob.budget)}
                </p>
              </div>
              <div className="text-right text-xs">
                <span className="text-slate-500 dark:text-zinc-400">Status:</span>
                <span className="ml-1 font-bold text-teal-700 dark:text-teal-300">
                  {selectedJob.status === "OPEN" ? "Buka (Mencari Talent)" : selectedJob.status}
                </span>
              </div>
            </div>
          </div>

          {/* Boss Information & Chat Trigger */}
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-teal-500/15 bg-slate-50 dark:bg-teal-950/30 p-3">
            <div className="flex items-center gap-3">
              <img
                src={selectedJob.bossAvatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100"}
                alt={selectedJob.bossName}
                className="h-10 w-10 rounded-full border border-teal-400/40 object-cover"
              />
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">{selectedJob.bossName}</h4>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-zinc-400">
                  <span className="flex items-center gap-0.5 text-amber-500 font-semibold">
                    <Star className="h-3 w-3 fill-amber-400" />
                    {selectedJob.bossRating}
                  </span>
                  <span>•</span>
                  <span>{selectedJob.bossJobsCompleted} job selesai</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setChatModalJob(selectedJob)}
              className="flex items-center gap-1 rounded-xl border border-teal-500/30 bg-teal-50 dark:bg-teal-950/60 px-3 py-1.5 text-xs font-bold text-teal-700 dark:text-teal-300 hover:bg-teal-100"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Chat
            </button>
          </div>

          {/* Job Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300">
              Deskripsi Pekerjaan
            </h4>
            <p className="mt-1.5 whitespace-pre-line text-xs leading-relaxed text-slate-700 dark:text-zinc-300">
              {selectedJob.description}
            </p>
          </div>

          {/* Milestones if OFFER mode has milestones */}
          {selectedJob.milestones && selectedJob.milestones.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300">
                Milestone Bertahap ({selectedJob.milestones.length} Tahap)
              </h4>
              <div className="space-y-2">
                {selectedJob.milestones.map((m, idx) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-teal-500/20 bg-slate-50 dark:bg-teal-950/40 p-2.5 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900 text-[10px] font-bold text-teal-800 dark:text-teal-300">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-white">{m.title}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-teal-800 dark:text-teal-300">{formatUSD(m.amount)}</span>
                      <span className={`block text-[10px] font-semibold ${m.status === "RELEASED" ? "text-emerald-600 dark:text-teal-400" : "text-amber-600 dark:text-amber-400"}`}>
                        {m.status === "RELEASED" ? "✓ Selesai & Cair" : m.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SPOT MODE SPECIFIC: Claim countdown & Proof upload */}
          {isSpot && (
            <div className="rounded-2xl border border-amber-300 dark:border-amber-500/30 bg-amber-50/60 dark:bg-amber-950/40 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                  <Zap className="h-4 w-4 fill-amber-500" />
                  Status Spot Task
                </span>
                <span className="text-xs font-mono font-bold text-amber-800 dark:text-amber-200">
                  {selectedJob.spotsClaimedCount || 0} / {selectedJob.spotLimit || 5} Spot
                </span>
              </div>

              {/* If user claimed this spot and running */}
              {userSpot && userSpot.status === "CLAIMED" && (
                <div className="space-y-2 rounded-xl bg-white dark:bg-black/60 p-3 border border-amber-400">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-white">Timer Pengerjaan:</span>
                    <span className="font-mono text-sm font-black text-amber-600 dark:text-amber-400 animate-pulse">
                      ⏱️ {formatTimer(timeLeftSeconds)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-zinc-300">
                    Selesaikan tugas dan serahkan link bukti pengerjaan sebelum batas waktu berakhir.
                  </p>

                  {!showSpotProofForm ? (
                    <button
                      onClick={() => setShowSpotProofForm(true)}
                      className="w-full rounded-xl bg-amber-400 hover:bg-amber-500 py-2 text-xs font-black text-slate-950 shadow-sm"
                    >
                      Kirim Bukti Pengerjaan Microtask
                    </button>
                  ) : (
                    <form onSubmit={handleSpotProofSubmit} className="space-y-2 pt-2">
                      <input
                        type="url"
                        value={spotProofUrl}
                        onChange={(e) => setSpotProofUrl(e.target.value)}
                        placeholder="Link file hasil / Google Drive / Screenshot..."
                        className="w-full rounded-xl border border-slate-300 dark:border-teal-500/30 bg-white dark:bg-teal-950/60 p-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                        required
                      />
                      <textarea
                        value={spotProofText}
                        onChange={(e) => setSpotProofText(e.target.value)}
                        rows={2}
                        placeholder="Catatan pengerjaan singkat..."
                        className="w-full rounded-xl border border-slate-300 dark:border-teal-500/30 bg-white dark:bg-teal-950/60 p-2 text-xs text-slate-900 dark:text-white focus:outline-none"
                        required
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setShowSpotProofForm(false)}
                          className="flex-1 rounded-xl bg-slate-200 dark:bg-zinc-800 py-1.5 text-xs text-slate-700 dark:text-zinc-300"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          className="flex-1 rounded-xl bg-teal-600 dark:btn-teal-primary py-1.5 text-xs font-bold text-white shadow-sm"
                        >
                          Submit Bukti
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* If user already submitted proof */}
              {userSpot && userSpot.status === "SUBMITTED" && (
                <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 p-3 border border-emerald-300 dark:border-emerald-500/30 text-xs text-emerald-900 dark:text-emerald-300 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <CheckCircle className="h-4 w-4" />
                    Bukti Pengerjaan Telah Disubmit
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-zinc-300">
                    Menunggu verifikasi Boss atau Auto-Release dana escrow.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* OFFER MODE (Boss view: List of Received Offers) */}
          {!isSpot && isJobOwner && selectedJob.status === "OPEN" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300">
                  Daftar Tawaran Offer Masuk ({jobOffers.length})
                </h4>
                <span className="text-[11px] text-slate-500 dark:text-zinc-400">Pilih 1 pemenang untuk mengunci escrow</span>
              </div>

              {jobOffers.length > 0 ? (
                <div className="space-y-2">
                  {jobOffers.map((offer) => (
                    <div
                      key={offer.id}
                      className="rounded-2xl border border-slate-200 dark:border-teal-500/25 bg-slate-50 dark:bg-teal-950/40 p-3.5 space-y-2"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={offer.workerAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"}
                            alt={offer.workerName}
                            className="h-8 w-8 rounded-full border border-teal-400/40 object-cover"
                          />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h5 className="text-xs font-bold text-slate-900 dark:text-white">{offer.workerName}</h5>
                              <span className="rounded bg-teal-100 dark:bg-teal-900 px-1.5 py-0.2 text-[9px] font-bold text-teal-800 dark:text-teal-300">
                                {offer.workerTier}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-500 dark:text-zinc-400">{offer.deliveryDays} hari kerja</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-mono text-sm font-black text-teal-800 dark:text-teal-300">
                            {formatUSD(offer.price)}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-700 dark:text-zinc-300 bg-white dark:bg-black/40 p-2.5 rounded-xl border border-slate-200 dark:border-teal-500/10 leading-relaxed">
                        {offer.message}
                      </p>

                      <div className="flex justify-end pt-1">
                        <button
                          onClick={() => acceptOfferAndLockEscrow(selectedJob.id, offer.id)}
                          className="flex items-center gap-1 rounded-xl btn-teal-primary px-3.5 py-1.5 text-xs font-bold shadow-teal-glow"
                        >
                          <Lock className="h-3.5 w-3.5" />
                          Terima Offer & Kunci Escrow
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 dark:border-teal-500/20 p-4 text-center text-xs text-slate-500 dark:text-zinc-400">
                  Belum ada proposal offer masuk dari worker.
                </div>
              )}
            </div>
          )}

          {/* Digital Contract Summary Component */}
          {selectedJob.digitalContract && (
            <DigitalContractView
              contract={selectedJob.digitalContract}
              jobTitle={selectedJob.title}
              budget={selectedJob.budget}
              mode={selectedJob.mode}
            />
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="border-t border-slate-200 dark:border-teal-500/20 bg-slate-50 dark:bg-obsidian-950/90 p-4">
          <div className="flex items-center justify-between gap-3">
            {/* Dispute Trigger if In Progress */}
            {selectedJob.status === "IN_PROGRESS" && (
              <button
                onClick={() => setDisputeModalJob(selectedJob)}
                className="flex items-center gap-1 rounded-xl border border-rose-500/30 bg-rose-50 dark:bg-rose-950/40 px-3 py-2 text-xs font-bold text-rose-700 dark:text-rose-300 hover:bg-rose-100"
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                Mediasi Sengketa
              </button>
            )}

            {/* Primary Action Button */}
            <div className="flex-1 flex justify-end gap-2">
              {isWorker && selectedJob.status === "OPEN" && !userOffer && !isSpot && (
                <button
                  onClick={() => setOfferModalJob(selectedJob)}
                  className="flex items-center gap-1.5 rounded-xl btn-teal-primary px-5 py-2.5 text-xs font-bold shadow-teal-glow"
                >
                  <Send className="h-3.5 w-3.5" />
                  Ajukan Proposal Offer
                </button>
              )}

              {isWorker && selectedJob.status === "OPEN" && userOffer && !isSpot && (
                <span className="rounded-xl bg-teal-50 dark:bg-teal-900/60 border border-teal-300 dark:border-teal-500/30 px-3.5 py-2 text-xs font-bold text-teal-800 dark:text-teal-300">
                  ✓ Offer Anda Telah Diajukan ({formatUSD(userOffer.price)})
                </span>
              )}

              {isWorker && selectedJob.status === "OPEN" && isSpot && !userSpot && (
                <button
                  onClick={() => claimSpot(selectedJob.id)}
                  className="flex items-center gap-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 px-5 py-2.5 text-xs font-black text-slate-950 shadow-md"
                >
                  <Zap className="h-3.5 w-3.5 fill-slate-950 text-slate-950 stroke-[2.5]" />
                  Klaim Spot (15 Menit)
                </button>
              )}

              <button
                onClick={() => setSelectedJob(null)}
                className="rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-300"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
