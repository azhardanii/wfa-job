"use client";

import React from "react";
import { useStore } from "@/context/StoreContext";
import { Briefcase, UserCheck, Sparkles } from "lucide-react";

export function RoleBadge() {
  const { currentUser, switchRole } = useStore();

  const isWorker = currentUser.activeRole === "WORKER";

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => switchRole(isWorker ? "BOSS" : "WORKER")}
        className="group relative flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-950/70 px-3 py-1.5 text-xs font-semibold text-teal-200 transition-all hover:border-teal-400 hover:bg-teal-900/60 hover:shadow-teal-glow active:scale-95"
        title="Klik untuk beralih mode peran"
      >
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-400"></span>
        </span>
        <div className="flex items-center gap-1.5">
          {isWorker ? (
            <>
              <Briefcase className="h-3.5 w-3.5 text-teal-400" />
              <span>Worker Mode</span>
            </>
          ) : (
            <>
              <UserCheck className="h-3.5 w-3.5 text-teal-300" />
              <span className="text-teal-300">Boss Mode</span>
            </>
          )}
        </div>
        <span className="rounded bg-teal-900/80 px-1.5 py-0.5 text-[10px] text-teal-300 group-hover:bg-teal-800">
          Switch
        </span>
      </button>

      {/* Tier Badge for Worker: Starter 15%, Senior 10%, Expert 5% */}
      {isWorker && (
        <span className="inline-flex items-center gap-1 rounded-full border border-teal-500/20 bg-teal-900/40 px-2.5 py-1 text-[11px] font-bold text-teal-300 shadow-sm">
          <Sparkles className="h-3 w-3 text-teal-400" />
          {currentUser.tier} Tier ({(currentUser.tier === "STARTER" ? 15 : currentUser.tier === "SENIOR" ? 10 : 5)}% fee)
        </span>
      )}
    </div>
  );
}
