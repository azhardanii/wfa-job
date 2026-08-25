"use client";

import React from "react";
import { useStore } from "@/context/StoreContext";
import { formatDual } from "@/lib/store";
import { Trophy, X } from "lucide-react";

export function CelebrationModal() {
  const { celebration, setCelebration } = useStore();

  if (!celebration || !celebration.show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-teal-400/40 bg-gradient-to-b from-teal-900 via-obsidian-950 to-obsidian-950 p-6 text-center shadow-teal-glow-lg animate-in zoom-in-95 duration-300">
        <button
          onClick={() => setCelebration(null)}
          className="absolute top-4 right-4 flex h-7 w-7 items-center justify-center rounded-full bg-teal-950/60 text-zinc-400 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-teal-400 to-emerald-300 text-black shadow-teal-glow mb-4">
          <Trophy className="h-8 w-8 stroke-[2.5]" />
        </div>

        <h3 className="text-lg font-black text-white">{celebration.title}</h3>
        <p className="mt-2 text-xs text-zinc-300 leading-relaxed">{celebration.message}</p>

        {celebration.amount && (
          <div className="mt-4 rounded-2xl border border-teal-400/30 bg-teal-950/70 p-3">
            <span className="text-[10px] text-teal-300 font-bold uppercase tracking-wider">
              Nominal Transaksi
            </span>
            <div className="font-mono text-base font-black text-teal-200 mt-0.5">
              {formatUSD(celebration.amount)}
            </div>
          </div>
        )}

        <button
          onClick={() => setCelebration(null)}
          className="mt-5 w-full rounded-xl btn-teal-primary py-3 text-xs font-black shadow-teal-glow"
        >
          Lanjutkan & Mantap! 🚀
        </button>
      </div>
    </div>
  );
}
