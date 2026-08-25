"use client";

import React from "react";
import { Job, DigitalContract } from "@/types";
import { formatUSD, formatDual } from "@/lib/store";
import { ShieldCheck, FileText, Lock, Clock, AlertCircle } from "lucide-react";

interface DigitalContractViewProps {
  job?: Job;
  contract?: DigitalContract;
  jobTitle?: string;
  budget?: number;
  mode?: "OFFER" | "SPOT";
}

export function DigitalContractView({ job, contract: propContract, budget: propBudget, mode: propMode }: DigitalContractViewProps) {
  const contract = propContract || job?.digitalContract || {
    contractNumber: `WFA-${job?.mode || propMode || "ESCROW"}-${(job?.id || "0000").slice(-4)}`,
    scope: job?.description || "Pengerjaan sesuai scope kesepakatan",
    escrowRule: "Dana tersimpan aman di Escrow. Dilepas bertahap atau saat finalisasi.",
    autoReleaseHours: 72,
    platformFeePercent: 10,
  };

  const jobAmountUSD = propBudget || (job ? (job.selectedOfferPrice || job.budget) : 100);
  const currentMode = propMode || job?.mode || "OFFER";

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-teal-500/30 bg-slate-50 dark:bg-gradient-to-b dark:from-teal-950/80 dark:to-obsidian-950/95 p-4 shadow-sm dark:shadow-teal-glow text-slate-800 dark:text-zinc-300">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-teal-500/20 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-100 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-300 dark:border-teal-400/40">
            <FileText className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300">
              Digital Smart Contract
            </h4>
            <p className="font-mono text-[10px] text-slate-500 dark:text-teal-400/70">{contract.contractNumber}</p>
          </div>
        </div>
        <span className="flex items-center gap-1 rounded-full border border-teal-300 dark:border-teal-400/30 bg-teal-100/70 dark:bg-teal-500/15 px-2.5 py-0.5 text-[10px] font-bold text-teal-800 dark:text-teal-200">
          <ShieldCheck className="h-3 w-3 text-teal-600 dark:text-teal-300" />
          WFA Escrow
        </span>
      </div>

      <div className="mt-3 space-y-2 text-xs">
        <div className="flex items-start gap-2">
          <Lock className="mt-0.5 h-3.5 w-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
          <div>
            <span className="font-bold text-slate-900 dark:text-white">Escrow Guarantee: </span>
            <span className="text-slate-600 dark:text-zinc-300">{formatUSD(jobAmountUSD)} terkunci di ledger rekening bersama WFA.</span>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Clock className="mt-0.5 h-3.5 w-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
          <div>
            <span className="font-bold text-slate-900 dark:text-white">Auto-Release: </span>
            <span className="text-slate-600 dark:text-zinc-300">
              Jika Boss tidak merespon dalam {contract.autoReleaseHours} jam setelah deliverable disubmit, dana otomatis cair ke Worker.
            </span>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
          <div>
            <span className="font-bold text-slate-900 dark:text-white">Dispute Protection: </span>
            <span className="text-slate-600 dark:text-zinc-300">
              {currentMode === "SPOT"
                ? "Fast-track micro-dispute biner berbasis bukti tangkapan layar."
                : "Mediasi sengketa berjenjang dengan pembekuan dana aman hingga selesai."}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
