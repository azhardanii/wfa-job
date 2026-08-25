"use client";

import React from "react";
import { useStore } from "@/context/StoreContext";
import { ShieldCheck, Bell, Wallet as WalletIcon, Sun, Moon, Briefcase, UserCheck } from "lucide-react";
import { formatUSD } from "@/lib/store";

export function Header() {
  const {
    wallet,
    notifications,
    setShowNotificationDrawer,
    setActiveTab,
    currentUser,
    switchRole,
    theme,
    toggleTheme,
  } = useStore();

  const unreadCount = notifications.filter((n) => !n.read).length;
  const isWorker = currentUser.activeRole === "WORKER";

  return (
    <header className="sticky top-0 z-40 w-full glass-header backdrop-blur-md transition-colors duration-200">
      <div className="mx-auto flex max-w-lg items-center justify-between px-3.5 py-2.5 sm:px-5">
        {/* Left: Horizontal Brand Logo */}
        <div
          className="flex items-center cursor-pointer select-none shrink-0 py-0.5"
          onClick={() => setActiveTab("home")}
        >
          <img
            src="/logo-horisontal.webp"
            alt="WFA JOB"
            className="h-5 w-auto object-contain transition-transform hover:scale-105"
          />
        </div>

        {/* Right: Role Switch, Theme Toggle, Wallet, Notification */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Quick Role Switcher Pill */}
          <button
            onClick={() => switchRole(isWorker ? "BOSS" : "WORKER")}
            className="flex items-center gap-1 rounded-full border border-teal-500/30 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-1 text-[11px] font-bold text-teal-700 dark:text-teal-200 hover:bg-teal-100 dark:hover:bg-teal-900/60 transition-all"
            title={`Mode saat ini: ${isWorker ? "Worker" : "Boss"}. Klik untuk ganti.`}
          >
            {isWorker ? (
              <>
                <Briefcase className="h-3 w-3 text-teal-600 dark:text-teal-400" />
                <span>Worker</span>
              </>
            ) : (
              <>
                <UserCheck className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                <span>Boss</span>
              </>
            )}
          </button>

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

          {/* Wallet Balance */}
          <button
            onClick={() => setActiveTab("wallet")}
            className="flex items-center gap-1 rounded-full border border-slate-200 dark:border-teal-500/30 bg-white dark:bg-teal-950/80 px-2.5 py-1 text-[11px] font-bold text-slate-800 dark:text-teal-200 shadow-sm hover:border-teal-400 transition-all"
          >
            <WalletIcon className="h-3 w-3 text-teal-600 dark:text-teal-400" />
            <span className="font-mono font-bold text-teal-700 dark:text-teal-300">
              {formatUSD(wallet.balanceUSD)}
            </span>
          </button>

          {/* Notification Bell */}
          <button
            onClick={() => setShowNotificationDrawer(true)}
            className="relative flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 dark:border-teal-500/25 bg-white dark:bg-teal-950/60 text-slate-700 dark:text-teal-300 hover:bg-slate-50 dark:hover:bg-teal-900 transition-all"
            aria-label="Notifikasi"
          >
            <Bell className="h-3.5 w-3.5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-teal-500 text-[8px] font-extrabold text-white dark:text-black shadow-sm animate-pulse">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
