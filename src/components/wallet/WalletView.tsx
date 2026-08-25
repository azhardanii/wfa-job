"use client";

import React, { useState } from "react";
import { useStore } from "@/context/StoreContext";
import { formatUSD, formatIDR, formatDual } from "@/lib/store";
import {
  Wallet as WalletIcon,
  ArrowUpRight,
  ArrowDownLeft,
  Lock,
  ShieldCheck,
  FileText,
} from "lucide-react";

export function WalletView() {
  const { wallet, setShowTopUpModal, setShowWithdrawModal } = useStore();
  const [filterType, setFilterType] = useState<string>("ALL");

  const filteredTx = wallet.transactions.filter((tx) => {
    if (filterType === "ALL") return true;
    return tx.type === filterType;
  });

  return (
    <div className="space-y-4 pb-24 text-slate-900 dark:text-white">
      {/* Balance Card with Teal Gradient */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-700 via-teal-850 to-teal-950 dark:from-teal-900 dark:via-teal-950 dark:to-obsidian-950 p-5 text-white shadow-md dark:shadow-teal-glow">
        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 text-white border border-white/30">
                <WalletIcon className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-teal-100">
                USD Balance & Ledger
              </span>
            </div>
            <span className="flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-[10px] font-extrabold text-teal-100 border border-white/20">
              <ShieldCheck className="h-3 w-3 text-teal-300" />
              $1 = Rp. 17.000
            </span>
          </div>

          <div>
            <span className="text-[11px] text-teal-100/80 font-medium">Saldo Tersedia:</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <div className="font-mono text-3xl font-black tracking-tight text-white">
                {formatUSD(wallet.balanceUSD)}
              </div>
              <div className="text-xs font-semibold text-teal-200">
                ~{formatIDR(wallet.balanceUSD)}
              </div>
            </div>
          </div>

          {/* Locked in Escrow info */}
          <div className="flex items-center justify-between rounded-2xl bg-black/30 backdrop-blur-sm p-3 border border-white/10 text-xs">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-amber-300" />
              <span className="text-teal-100 font-medium">Terkunci di Escrow:</span>
            </div>
            <span className="font-mono font-bold text-amber-200">
              {formatUSD(wallet.lockedInEscrowUSD)}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={() => setShowTopUpModal(true)}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-white text-teal-950 py-2.5 text-xs font-black shadow-md hover:bg-teal-50 transition-all active:scale-95"
            >
              <ArrowDownLeft className="h-4 w-4 stroke-[2.5]" />
              Top-Up Saldo ($)
            </button>
            <button
              onClick={() => setShowWithdrawModal(true)}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-white/30 bg-white/10 hover:bg-white/20 py-2.5 text-xs font-bold text-white transition-all active:scale-95"
            >
              <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
              Tarik Dana (IDR)
            </button>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-teal-400/20 blur-3xl"></div>
      </div>

      {/* Compliance & Security Note */}
      <div className="rounded-2xl border border-slate-200 dark:border-teal-500/20 bg-slate-50 dark:bg-teal-950/30 p-3.5 flex items-start gap-2.5 text-xs text-slate-700 dark:text-zinc-300">
        <ShieldCheck className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-semibold text-slate-900 dark:text-white">Standar Valuta & Escrow Terproteksi</p>
          <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
            Platform menggunakan standar simbol USD ($) dengan sistem rekening bersama aman. Seluruh transaksi penarikan dan top-up disalurkan melalui gerbang pembayaran berlisensi resmi.
          </p>
        </div>
      </div>

      {/* Transaction History Ledger */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Mutasi Rekening & Transaksi</h3>
          <span className="text-xs text-slate-500 dark:text-zinc-400">{filteredTx.length} Transaksi</span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          {[
            { id: "ALL", label: "Semua" },
            { id: "RELEASE", label: "Pencairan Escrow" },
            { id: "TOPUP", label: "Top-Up" },
            { id: "WITHDRAW", label: "Tarik Dana" },
            { id: "LOCK", label: "Escrow Lock" },
            { id: "FEE", label: "Fee Platform" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`rounded-xl px-2.5 py-1 text-xs font-semibold transition-all shrink-0 ${
                filterType === tab.id
                  ? "bg-teal-600 dark:bg-teal-500 text-white dark:text-black font-bold"
                  : "border border-slate-200 dark:border-teal-500/15 bg-white dark:bg-teal-950/30 text-slate-600 dark:text-zinc-400 hover:text-slate-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* List of Ledger items */}
        <div className="space-y-2">
          {filteredTx.length > 0 ? (
            filteredTx.map((tx) => {
              const isPositive = tx.amount > 0;
              const dateFormatted = new Date(tx.createdAt).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between rounded-2xl glass-card p-3.5 border border-slate-200 dark:border-teal-500/15"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                        tx.type === "RELEASE" || tx.type === "TOPUP"
                          ? "bg-teal-100 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-400/30"
                          : tx.type === "WITHDRAW"
                          ? "bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-400/30"
                          : tx.type === "LOCK"
                          ? "bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-400/30"
                          : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400"
                      }`}
                    >
                      {tx.type === "RELEASE" || tx.type === "TOPUP" ? (
                        <ArrowDownLeft className="h-4 w-4" />
                      ) : tx.type === "WITHDRAW" ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : tx.type === "LOCK" ? (
                        <Lock className="h-4 w-4" />
                      ) : (
                        <FileText className="h-4 w-4" />
                      )}
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{tx.title}</h4>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-1">{tx.description}</p>
                      <span className="text-[10px] text-slate-400 dark:text-zinc-500">{dateFormatted}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`font-mono text-sm font-black ${
                        isPositive ? "text-teal-700 dark:text-teal-300" : "text-slate-700 dark:text-zinc-300"
                      }`}
                    >
                      {isPositive ? `+${formatUSD(tx.amount)}` : formatUSD(tx.amount)}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 dark:border-teal-500/20 p-6 text-center text-xs text-slate-500 dark:text-zinc-400">
              Belum ada riwayat transaksi dengan filter ini.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
