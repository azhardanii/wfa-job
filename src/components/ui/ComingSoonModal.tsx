"use client";

import React from "react";
import { Sparkles, Clock, ArrowRight, X, ShieldAlert, Rocket } from "lucide-react";

interface ComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName?: string;
  description?: string;
}

export function ComingSoonModal({
  isOpen,
  onClose,
  featureName = "Fitur ini",
  description = "Kami sedang memfokuskan rilis saat ini pada Fitur Informasi Loker WFA Dinamis. Fitur ini akan segera tersedia pada pembaruan tahap berikutnya!",
}: ComingSoonModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-sm rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          aria-label="Tutup"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Badge & Graphic */}
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-teal-500/20 to-teal-500/5 dark:from-teal-500/30 dark:to-transparent border border-teal-500/30 text-teal-600 dark:text-teal-400 shadow-inner">
            <Rocket className="h-8 w-8 stroke-[2.2] animate-bounce" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-teal-500"></span>
            </span>
          </div>

          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-950/80 px-2.5 py-0.5 text-[11px] font-bold text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/50 mb-2">
            <Clock className="h-3 w-3" />
            Segera Hadir • Coming Soon
          </span>

          <h3 className="text-lg font-black text-slate-900 dark:text-white">
            {featureName}
          </h3>

          <p className="mt-2 text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
            {description}
          </p>

          {/* Highlight Info Loker */}
          <div className="mt-4 w-full rounded-2xl border border-teal-200 dark:border-teal-500/20 bg-teal-50/70 dark:bg-teal-950/40 p-3 text-left">
            <div className="flex items-center gap-2 text-xs font-bold text-teal-900 dark:text-teal-200">
              <Sparkles className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
              <span>Menu Aktif: Info Loker WFA</span>
            </div>
            <p className="mt-1 text-[11px] text-teal-800/80 dark:text-teal-300/80 leading-normal">
              Saat ini Anda dapat menjelajahi lowongan kerja remote & on-site harian dengan data dinamis langsung dari database.
            </p>
          </div>

          <button
            onClick={onClose}
            className="mt-5 w-full flex items-center justify-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold py-2.5 px-4 text-xs shadow-md transition-all active:scale-[0.98]"
          >
            <span>Kembali ke Info Loker</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
