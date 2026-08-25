"use client";

import React from "react";
import { useStore } from "@/context/StoreContext";
import { X, Bell, ShieldCheck, Wallet, Sparkles, AlertTriangle, CheckCheck } from "lucide-react";

export function NotificationDrawer() {
  const {
    notifications,
    showNotificationDrawer,
    setShowNotificationDrawer,
    markAllNotificationsRead,
  } = useStore();

  if (!showNotificationDrawer) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center p-0 sm:p-4">
      <div className="flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-teal-500/30 bg-white dark:bg-obsidian-950 text-slate-900 dark:text-white shadow-2xl animate-in fade-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-teal-500/20 bg-slate-50 dark:bg-teal-950/70 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-100 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-200">
              <Bell className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Notifikasi Real-Time</h3>
              <p className="text-[10px] text-teal-700 dark:text-teal-300 font-medium">Pusat Aktivitas Akun</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={markAllNotificationsRead}
              className="flex items-center gap-1 rounded-lg bg-teal-50 dark:bg-teal-900/50 px-2 py-1 text-[11px] font-bold text-teal-800 dark:text-teal-300 hover:bg-teal-100"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Baca Semua
            </button>
            <button
              onClick={() => setShowNotificationDrawer(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 dark:bg-teal-900/50 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="overflow-y-auto p-4 space-y-2.5">
          {notifications.length > 0 ? (
            notifications.map((notif) => {
              const dateFormatted = new Date(notif.createdAt).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={notif.id}
                  className={`rounded-2xl p-3.5 border transition-all ${
                    notif.read
                      ? "border-slate-200 dark:border-teal-500/10 bg-slate-50 dark:bg-teal-950/20 text-slate-500 dark:text-zinc-400"
                      : "border-teal-300 dark:border-teal-400/30 bg-teal-50/60 dark:bg-teal-950/60 text-slate-900 dark:text-white shadow-sm"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-lg text-xs ${
                          notif.type === "ESCROW"
                            ? "bg-teal-100 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300"
                            : notif.type === "WALLET"
                            ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                            : notif.type === "DISPUTE"
                            ? "bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300"
                            : "bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-400"
                        }`}
                      >
                        {notif.type === "ESCROW" ? (
                          <ShieldCheck className="h-3.5 w-3.5" />
                        ) : notif.type === "WALLET" ? (
                          <Wallet className="h-3.5 w-3.5" />
                        ) : notif.type === "DISPUTE" ? (
                          <AlertTriangle className="h-3.5 w-3.5" />
                        ) : (
                          <Sparkles className="h-3.5 w-3.5" />
                        )}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{notif.title}</h4>
                    </div>
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 shrink-0">{dateFormatted}</span>
                  </div>
                  <p className="mt-1.5 text-xs text-slate-600 dark:text-zinc-300 leading-relaxed pl-8">
                    {notif.message}
                  </p>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-xs text-slate-400 dark:text-zinc-400">
              Belum ada notifikasi masuk.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
