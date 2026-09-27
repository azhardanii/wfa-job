"use client";

import React from "react";
import { useStore } from "@/context/StoreContext";
import {
  Bell,
  Wallet as WalletIcon,
  Sun,
  Moon,
  Lock,
} from "lucide-react";
import { formatUSD } from "@/lib/store";

export function Header() {
  const {
    wallet,
    notifications,
    setActiveTab,
    theme,
    toggleTheme,
    openComingSoon,
  } = useStore();

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 w-full glass-header backdrop-blur-md transition-colors duration-200 border-b border-slate-200/80 dark:border-teal-900/40">
      <div className="mx-auto flex max-w-lg items-center justify-between px-3.5 py-2.5 sm:px-5">
        {/* Left: Brand Logo & Highlight Badge */}
        <div
          className="flex items-center gap-2 cursor-pointer select-none shrink-0 py-0.5"
          onClick={() => setActiveTab("home")}
        >
          <img
            src="/logo-horisontal.webp"
            alt="WFA JOB"
            className="h-5 w-auto object-contain transition-transform hover:scale-105"
          />
          <span className="hidden sm:inline-flex items-center rounded-full bg-teal-500/15 border border-teal-500/30 px-2 py-0.5 text-[9px] font-black text-teal-700 dark:text-teal-300">
            INFO LOKER
          </span>
        </div>

        {/* Right: Theme Toggle, Wallet (disabled/soon), Bell */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Theme Switcher Button */}
          <button
            onClick={toggleTheme}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 dark:border-teal-500/25 bg-slate-100 dark:bg-teal-950/60 text-slate-700 dark:text-teal-300 hover:bg-slate-200 dark:hover:bg-teal-900 transition-all"
            title={theme === "dark" ? "Ganti ke Light Mode" : "Ganti ke Dark Mode"}
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? (
              <Sun className="h-3.5 w-3.5 text-amber-300 fill-amber-300" />
            ) : (
              <Moon className="h-3.5 w-3.5 text-slate-700" />
            )}
          </button>

          {/* Wallet Balance (Disabled / Coming Soon) */}
          <button
            onClick={() =>
              openComingSoon(
                "Fitur Dompet Escrow ($)",
                "Sistem dompet escrow rekening bersama untuk penampungan dana aman dan pencairan instan ke bank lokal akan aktif pada pembaruan tahap berikutnya."
              )
            }
            className="relative flex items-center gap-1 rounded-full border border-slate-200 dark:border-teal-500/30 bg-white/70 dark:bg-teal-950/60 px-2.5 py-1 text-[11px] font-bold text-slate-600 dark:text-teal-300 shadow-sm opacity-70 hover:opacity-100 transition-all"
            title="Wallet Escrow (Segera Hadir)"
          >
            <WalletIcon className="h-3 w-3 text-slate-500 dark:text-teal-400" />
            <span className="font-mono text-[10px] text-slate-500 dark:text-teal-400">
              {formatUSD(wallet.balanceUSD)}
            </span>
            <Lock className="h-2.5 w-2.5 text-amber-500" />
          </button>

          {/* Notification Bell */}
          <button
            onClick={() =>
              openComingSoon(
                "Pusat Notifikasi Escrow",
                "Notifikasi update status lamaran dan pengingat lowongan tersimpan akan segera hadir."
              )
            }
            className="relative flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 dark:border-teal-500/25 bg-white/70 dark:bg-teal-950/60 text-slate-600 dark:text-teal-400 hover:bg-slate-50 dark:hover:bg-teal-900 transition-all"
            aria-label="Notifikasi"
          >
            <Bell className="h-3.5 w-3.5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-teal-500 text-[8px] font-extrabold text-white dark:text-black shadow-sm">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
