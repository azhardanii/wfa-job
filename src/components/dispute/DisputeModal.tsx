"use client";

import React, { useState } from "react";
import { useStore } from "@/context/StoreContext";
import { X, AlertTriangle, Send } from "lucide-react";

export function DisputeModal() {
  const { disputeModalJob, setDisputeModalJob, createDispute } = useStore();

  const [reason, setReason] = useState("Hasil pekerjaan tidak sesuai dengan spesifikasi brief");
  const [evidenceText, setEvidenceText] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");

  if (!disputeModalJob) return null;

  const isSpot = disputeModalJob.mode === "SPOT";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evidenceText.trim()) {
      alert("Mohon jelaskan rincian kendala yang terjadi.");
      return;
    }

    createDispute(disputeModalJob.id, reason, evidenceText, evidenceUrl);
    setDisputeModalJob(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center p-0 sm:p-4">
      <div className="flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl sm:rounded-3xl border border-rose-300 dark:border-rose-500/40 bg-white dark:bg-obsidian-950 text-slate-900 dark:text-white shadow-2xl animate-in fade-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-rose-200 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-950/70 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-400/40">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Ajukan Mediasi Sengketa (Dispute)</h3>
              <p className="text-[10px] text-rose-700 dark:text-rose-300 font-medium">
                {isSpot ? "⚡ Fast-Track Micro-Dispute" : "Tim Mediasi WFA Escrow"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setDisputeModalJob(null)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 dark:bg-rose-900/50 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 space-y-4">
          <div className="rounded-2xl border border-rose-200 dark:border-rose-500/30 bg-rose-50/70 dark:bg-rose-950/30 p-3 text-xs space-y-1">
            <span className="text-[10px] text-rose-800 dark:text-rose-300 font-bold uppercase tracking-wide">
              Pemberitahuan Pembekuan Escrow
            </span>
            <p className="text-[11px] text-slate-600 dark:text-zinc-300 leading-relaxed">
              Pengajuan dispute akan membekukan pelepasan dana escrow sementara hingga mediasi selesai.
            </p>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-800 dark:text-teal-200 block mb-1">
              Alasan Utama Sengketa:
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-teal-500/30 bg-white dark:bg-teal-950/60 p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="Hasil pekerjaan tidak sesuai dengan spesifikasi brief">
                Hasil pekerjaan tidak sesuai brief
              </option>
              <option value="Worker tidak merespon / melebihi tenggat deadline">
                Worker tidak merespon / telat deadline
              </option>
              <option value="Boss tidak melakukan review hasil dalam 72 jam">
                Boss tidak merespon pengajuan hasil
              </option>
              <option value="Lainnya">Masalah lain yang belum tercakup</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-800 dark:text-teal-200 block mb-1">
              Rincian Kronologi & Fakta Kendala:
            </label>
            <textarea
              value={evidenceText}
              onChange={(e) => setEvidenceText(e.target.value)}
              rows={4}
              placeholder="Ceritakan detail kendala, bagian yang belum tuntas, atau upaya komunikasi yang telah dilakukan..."
              className="w-full rounded-xl border border-slate-300 dark:border-teal-500/30 bg-white dark:bg-teal-950/60 p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-400 focus:outline-none leading-relaxed"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-800 dark:text-teal-200 block mb-1">
              Tautan Bukti Pendukung (Opsional):
            </label>
            <input
              type="url"
              value={evidenceUrl}
              onChange={(e) => setEvidenceUrl(e.target.value)}
              placeholder="Link screenshot / file bukti Google Drive..."
              className="w-full rounded-xl border border-slate-300 dark:border-teal-500/30 bg-white dark:bg-teal-950/60 p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={() => setDisputeModalJob(null)}
              className="flex-1 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 py-2.5 text-xs font-semibold text-slate-700 dark:text-zinc-300"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white py-2.5 text-xs font-bold shadow-md"
            >
              <Send className="h-3.5 w-3.5" />
              Kirimkan Dispute
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
