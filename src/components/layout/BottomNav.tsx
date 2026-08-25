"use client";

import React from "react";
import { useStore } from "@/context/StoreContext";
import { Home, Briefcase, PlusCircle, Search, Wallet as WalletIcon, User } from "lucide-react";

export function BottomNav() {
  const { activeTab, setActiveTab, currentUser, setShowPostJobModal } = useStore();

  const isWorker = currentUser.activeRole === "WORKER";

  const handleCenterClick = () => {
    if (isWorker) {
      setActiveTab("home");
      // Focus search
      const searchInput = document.getElementById("job-search-input");
      if (searchInput) searchInput.focus();
    } else {
      setShowPostJobModal(true);
    }
  };

  const navItems: Array<
    | { id: "home" | "my-jobs" | "wallet" | "profile"; label: string; icon: any; isCenter?: false }
    | { id: "center"; label: string; icon: any; isCenter: true }
  > = [
    {
      id: "home",
      label: "Feed Job",
      icon: Home,
    },
    {
      id: "my-jobs",
      label: "Job Saya",
      icon: Briefcase,
    },
    {
      id: "center",
      isCenter: true,
      label: isWorker ? "Cari Job" : "Post Job",
      icon: isWorker ? Search : PlusCircle,
    },
    {
      id: "wallet",
      label: "Wallet ($)",
      icon: WalletIcon,
    },
    {
      id: "profile",
      label: "Profil",
      icon: User,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-nav transition-colors duration-200">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-1.5">
        {navItems.map((item) => {
          if (item.isCenter) {
            return (
              <div key="center-cta" className="relative -top-4 flex flex-col items-center">
                <button
                  onClick={handleCenterClick}
                  className="relative flex h-13 w-13 p-3 items-center justify-center rounded-full bg-gradient-to-tr from-teal-600 to-teal-400 text-white shadow-lg dark:shadow-teal-glow transition-all duration-200 hover:scale-105 active:scale-95 border-2 border-white dark:border-teal-900"
                  aria-label={item.label}
                >
                  <item.icon className="h-6 w-6 stroke-[2.5]" />
                </button>
                <span className="mt-1 text-[10px] font-bold text-teal-700 dark:text-teal-300">
                  {item.label}
                </span>
              </div>
            );
          }

          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-1 flex-col items-center justify-center py-1 transition-all duration-150 ${
                isActive
                  ? "text-teal-700 dark:text-teal-300"
                  : "text-slate-500 dark:text-zinc-400 hover:text-teal-600 dark:hover:text-teal-200"
              }`}
            >
              <div
                className={`relative flex items-center justify-center rounded-xl p-1.5 transition-all ${
                  isActive ? "bg-teal-50 dark:bg-teal-500/15 text-teal-700 dark:text-teal-300" : ""
                }`}
              >
                <Icon
                  className={`h-5 w-5 ${
                    isActive ? "stroke-[2.5] text-teal-700 dark:text-teal-300" : "stroke-2"
                  }`}
                />
                {isActive && (
                  <span className="absolute -bottom-1 h-0.5 w-3 rounded-full bg-teal-600 dark:bg-teal-400"></span>
                )}
              </div>
              <span
                className={`mt-0.5 text-[10px] ${
                  isActive
                    ? "font-bold text-teal-800 dark:text-teal-200"
                    : "font-medium text-slate-500 dark:text-zinc-400"
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
