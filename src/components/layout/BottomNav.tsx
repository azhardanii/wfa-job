"use client";

import React from "react";
import { useStore } from "@/context/StoreContext";
import {
  Briefcase,
  Layers,
  Search,
  Wallet as WalletIcon,
  User,
  Lock,
} from "lucide-react";

export function BottomNav() {
  const {
    activeTab,
    setActiveTab,
    openComingSoon,
  } = useStore();

  const handleCenterClick = () => {
    setActiveTab("home");
    const input = document.getElementById("job-search-input");
    if (input) {
      input.focus();
      input.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const navItems = [
    {
      id: "home" as const,
      label: "Info Loker",
      icon: Briefcase,
      isHighlight: true,
      isDisabled: false,
    },
    {
      id: "my-jobs" as const,
      label: "Job Saya",
      icon: Layers,
      isHighlight: false,
      isDisabled: true,
      featureName: "Fitur Job Saya & Kontrak Kerja",
      featureDesc:
        "Sistem pelacakan tugas, manajemen milestone, dan penyerahan hasil kerja akan segera hadir pada fase berikutnya. Saat ini nikmati informasi lowongan kerja WFA terkurasi.",
    },
    {
      id: "center" as const,
      isCenter: true,
      label: "Cari Loker",
      icon: Search,
      isHighlight: true,
      isDisabled: false,
    },
    {
      id: "wallet" as const,
      label: "Wallet ($)",
      icon: WalletIcon,
      isHighlight: false,
      isDisabled: true,
      featureName: "Fitur Dompet Escrow ($)",
      featureDesc:
        "Sistem transaksi escrow rekening bersama untuk pembayaran otomatis dan penarikan dana ke rekening lokal sedang dipersiapkan.",
    },
    {
      id: "profile" as const,
      label: "Profil",
      icon: User,
      isHighlight: false,
      isDisabled: true,
      featureName: "Fitur Profil & Verifikasi KYC",
      featureDesc:
        "Manajemen identitas profesional, portfolio kerja remote, dan verifikasi KYC sedang dalam tahap finalisasi.",
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass-nav transition-colors duration-200">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-1.5">
        {navItems.map((item) => {
          if (item.isCenter) {
            return (
              <div key="center-cta" className="relative -top-4 flex flex-col items-center">
                <button
                  onClick={handleCenterClick}
                  className="relative flex h-13 w-13 p-3 items-center justify-center rounded-full bg-gradient-to-tr from-teal-600 to-teal-400 text-white shadow-lg dark:shadow-teal-glow transition-all duration-200 hover:scale-105 active:scale-95 border-2 border-white dark:border-teal-900"
                  aria-label={item.label}
                  title="Cari Lowongan Kerja WFA"
                >
                  <item.icon className="h-6 w-6 stroke-[2.2]" />
                </button>
                <span className="mt-1 text-[10px] font-black text-teal-700 dark:text-teal-300">
                  {item.label}
                </span>
              </div>
            );
          }

          const isActive = activeTab === item.id;
          const Icon = item.icon;

          if (item.isDisabled) {
            return (
              <button
                key={item.id}
                onClick={() => openComingSoon(item.featureName!, item.featureDesc)}
                className="relative flex flex-1 flex-col items-center justify-center py-1 opacity-55 hover:opacity-90 transition-all duration-150 cursor-pointer"
                title={`${item.label} (Segera Hadir)`}
              >
                <div className="relative flex items-center justify-center rounded-xl p-1.5 text-slate-400 dark:text-zinc-500">
                  <Icon className="h-5 w-5 stroke-2" />
                  <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-400 text-black text-[8px] font-black">
                    <Lock className="h-2 w-2" />
                  </span>
                </div>
                <div className="flex items-center gap-0.5 mt-0.5">
                  <span className="text-[10px] font-medium text-slate-400 dark:text-zinc-500">
                    {item.label}
                  </span>
                  <span className="text-[8px] text-amber-500 font-extrabold uppercase tracking-tighter">
                    Soon
                  </span>
                </div>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className="flex flex-1 flex-col items-center justify-center py-1 text-teal-700 dark:text-teal-300 transition-all duration-150"
            >
              <div className="relative flex items-center justify-center rounded-xl p-1.5 bg-teal-100/70 dark:bg-teal-500/20 text-teal-800 dark:text-teal-200">
                <Icon className="h-5 w-5 stroke-[2.5]" />
                <span className="absolute -bottom-1 h-0.5 w-3 rounded-full bg-teal-600 dark:bg-teal-400"></span>
              </div>
              <span className="mt-0.5 text-[10px] font-black text-teal-800 dark:text-teal-200">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
