"use client";

import React, { useState } from "react";
import { useStore } from "@/context/StoreContext";
import { formatUSD, formatIDR, formatDual, calculateWorkerFee } from "@/lib/store";
import { X, Send, Sparkles, Calculator } from "lucide-react";

export function OfferProposalModal() {
  const { offerModalJob, setOfferModalJob, submitOffer, currentUser } = useStore();

  const [priceUSD, setPriceUSD] = useState<number>(offerModalJob?.budget || 100);
  const [deliveryDays, setDeliveryDays] = useState<number>(4);
  const [message, setMessage] = useState("");

  if (!offerModalJob) return null;

  const { feePercent, feeAmount, netAmount } = calculateWorkerFee(currentUser.tier, priceUSD);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      alert("Mohon tuliskan pesan proposal offer singkat.");
      return;
    }

    submitOffer(offerModalJob.id, message, priceUSD, deliveryDays);
    setOfferModalJob(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center p-0 sm:p-4">
      <div className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-teal-500/30 bg-white dark:bg-obsidian-950 text-slate-900 dark:text-white shadow-2xl animate-in fade-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-teal-500/20 bg-slate-50 dark:bg-teal-950/70 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Ajukan Proposal Offer</h3>
              <p className="text-[10px] text-teal-700 dark:text-teal-400 font-medium">Mode Offer • Escrow Terproteksi</p>
            </div>
          </div>
          <button
            onClick={() => setOfferModalJob(null)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 dark:bg-teal-900/50 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 space-y-4">
          {/* Target Job Snippet */}
          <div className="rounded-2xl border border-slate-200 dark:border-teal-500/20 bg-slate-50 dark:bg-teal-950/30 p-3 text-xs">
            <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-semibold">Tawaran untuk Job:</span>
            <h4 className="font-bold text-slate-900 dark:text-white mt-0.5">{offerModalJob.title}</h4>
            <div className="mt-1 flex items-center justify-between text-[11px] text-teal-700 dark:text-teal-300">
              <span>Budget Boss: {formatUSD(offerModalJob.budget)}</span>
              <span>Kategori: {offerModalJob.category}</span>
            </div>
          </div>

          {/* Proposed Price in USD */}
          <div>
            <label className="text-xs font-bold text-slate-800 dark:text-teal-200 block mb-1">
              Harga Offer Tawaran Anda ($ USD):
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs font-bold text-teal-600 dark:text-teal-400">$</span>
              <input
                type="number"
                value={priceUSD}
                onChange={(e) => setPriceUSD(Number(e.target.value))}
                min={1}
                step={5}
                className="w-full rounded-xl border border-slate-300 dark:border-teal-500/30 bg-white dark:bg-teal-950/60 py-2.5 pl-8 pr-3 font-mono text-sm font-bold text-slate-900 dark:text-white focus:border-teal-500 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Delivery Days */}
          <div>
            <label className="text-xs font-bold text-slate-800 dark:text-teal-200 block mb-1">
              Estimasi Waktu Selesai (Hari):
            </label>
            <div className="flex items-center gap-2">
              {[2, 3, 4, 7, 14].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDeliveryDays(d)}
                  className={`flex-1 rounded-xl py-2 text-xs font-bold ${
                    deliveryDays === d
                      ? "bg-teal-600 dark:bg-teal-400 text-white dark:text-obsidian-950 font-black shadow-sm"
                      : "border border-slate-300 dark:border-teal-500/20 bg-slate-50 dark:bg-teal-950/30 text-slate-700 dark:text-zinc-300"
                  }`}
                >
                  {d} Hari
                </button>
              ))}
            </div>
          </div>

          {/* Cover Message */}
          <div>
            <label className="text-xs font-bold text-slate-800 dark:text-teal-200 block mb-1">
              Pesan Proposal & Pendekatan Kerja:
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="Ceritakan pengalaman relevan, portofolio singkat, dan rencana pengerjaan project ini..."
              className="w-full rounded-xl border border-slate-300 dark:border-teal-500/30 bg-white dark:bg-teal-950/60 p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-400 focus:border-teal-500 focus:outline-none leading-relaxed"
              required
            />
          </div>

          {/* Realtime Fee Calculation (Starter 15%, Senior 10%, Expert 5%) */}
          <div className="rounded-2xl border border-slate-200 dark:border-teal-500/30 bg-slate-50 dark:bg-gradient-to-br dark:from-teal-950/70 dark:to-obsidian-950 p-3.5 space-y-2 text-xs">
            <div className="flex items-center justify-between font-bold text-teal-800 dark:text-teal-300">
              <div className="flex items-center gap-1.5">
                <Calculator className="h-4 w-4" />
                <span>Kalkulasi Penghasilan Bersih</span>
              </div>
              <span className="rounded bg-teal-100 dark:bg-teal-900/80 px-2 py-0.5 text-[10px] text-teal-800 dark:text-teal-200 font-bold">
                {currentUser.tier} Tier ({feePercent}% fee)
              </span>
            </div>
            <div className="flex justify-between text-slate-700 dark:text-zinc-300">
              <span>Nilai Tawaran Kotor:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">{formatUSD(priceUSD)}</span>
            </div>
            <div className="flex justify-between text-slate-500 dark:text-zinc-400 text-[11px]">
              <span>Komisi Platform ({feePercent}%):</span>
              <span className="font-mono text-rose-600 dark:text-rose-400">-{formatUSD(feeAmount)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 dark:border-teal-500/20 pt-2 text-xs font-bold text-slate-900 dark:text-white">
              <span>Dana Bersih Diterima Worker:</span>
              <span className="font-mono text-sm font-black text-teal-700 dark:text-teal-300">{formatUSD(netAmount)}</span>
            </div>
          </div>

          {/* Footer Action */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setOfferModalJob(null)}
              className="flex-1 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 py-2.5 text-xs font-semibold text-slate-700 dark:text-zinc-300"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl btn-teal-primary py-2.5 text-xs font-black shadow-teal-glow"
            >
              <Send className="h-3.5 w-3.5" />
              Kirim Offer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
