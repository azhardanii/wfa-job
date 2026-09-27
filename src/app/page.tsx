"use client";

import React, { useState, useEffect } from "react";
import { useStore } from "@/context/StoreContext";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { LokerFeed } from "@/components/loker/LokerFeed";
import { ComingSoonModal } from "@/components/ui/ComingSoonModal";
import { Smartphone, Monitor, Sparkles, ArrowLeft, Rocket } from "lucide-react";

export function ComingSoonView({
  title,
  desc,
  onBack,
}: {
  title: string;
  desc: string;
  onBack: () => void;
}) {
  return (
    <div className="py-12 px-4 text-center space-y-4">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-600 dark:text-teal-400">
        <Rocket className="h-8 w-8 animate-bounce" />
      </div>
      <div>
        <span className="inline-block rounded-full bg-amber-100 dark:bg-amber-950 px-3 py-1 text-[10px] font-black text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700/50 mb-2">
          TAHAP BERIKUTNYA • COMING SOON
        </span>
        <h2 className="text-lg font-black text-slate-900 dark:text-white">
          {title}
        </h2>
        <p className="mt-1 text-xs text-slate-600 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
          {desc}
        </p>
      </div>

      <div className="pt-2">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 text-xs font-bold shadow-md transition-all"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Kembali ke Info Loker WFA</span>
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  const { activeTab, setActiveTab, comingSoonModal, closeComingSoon } = useStore();
  const [deviceFrame, setDeviceFrame] = useState(false);

  return (
    <>
      <main className="min-h-screen bg-background text-foreground flex flex-col items-center justify-start relative transition-colors duration-200">
        {/* Desktop Device Frame Toggle Helper */}
        <div className="hidden lg:flex fixed top-3 right-3 z-50 items-center gap-2 rounded-full border border-slate-200 dark:border-teal-500/30 bg-white/90 dark:bg-teal-950/80 px-3 py-1.5 text-xs text-slate-700 dark:text-teal-200 backdrop-blur-md shadow-sm dark:shadow-teal-glow">
          <span className="text-[11px] text-slate-500 dark:text-zinc-400 font-medium">Desktop Preview:</span>
          <button
            onClick={() => setDeviceFrame(!deviceFrame)}
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold transition-all ${
              deviceFrame
                ? "bg-teal-600 dark:bg-teal-400 text-white dark:text-obsidian-950 font-black"
                : "border border-slate-200 dark:border-teal-500/20 bg-slate-100 dark:bg-teal-900/40 text-slate-700 dark:text-teal-300"
            }`}
          >
            {deviceFrame ? <Smartphone className="h-3.5 w-3.5" /> : <Monitor className="h-3.5 w-3.5" />}
            {deviceFrame ? "Phone Frame" : "Full Screen"}
          </button>
        </div>

        {/* Main Container */}
        <div
          className={`w-full transition-all duration-300 ${
            deviceFrame
              ? "my-6 max-w-[430px] rounded-[42px] border-[6px] border-slate-300 dark:border-teal-900/60 shadow-2xl overflow-hidden bg-background relative min-h-[860px]"
              : "max-w-lg min-h-screen relative bg-background"
          }`}
        >
          {/* App Header */}
          <Header />

          {/* Dynamic Content Views */}
          <div className="px-3.5 py-4 sm:px-5">
            {activeTab === "home" && <LokerFeed />}

            {activeTab === "my-jobs" && (
              <ComingSoonView
                title="Fitur Job Saya & Kontrak Escrow"
                desc="Sistem penyerahan pekerjaan, milestone, dan auto-release kontrak akan dirilis pada pembaruan tahap berikutnya."
                onBack={() => setActiveTab("home")}
              />
            )}

            {activeTab === "wallet" && (
              <ComingSoonView
                title="Fitur Dompet Escrow ($)"
                desc="Penampungan saldo aman rekber dan transfer otomatis ke rekening bank lokal sedang disiapkan."
                onBack={() => setActiveTab("home")}
              />
            )}

            {activeTab === "profile" && (
              <ComingSoonView
                title="Fitur Profil & Verifikasi KYC"
                desc="Manajemen identitas talenta profesional terverifikasi dan portofolio proyek akan segera hadir."
                onBack={() => setActiveTab("home")}
              />
            )}
          </div>

          {/* Bottom Navigation */}
          <BottomNav />
        </div>

        {/* Global Coming Soon Modal Popup */}
        <ComingSoonModal
          isOpen={comingSoonModal.isOpen}
          onClose={closeComingSoon}
          featureName={comingSoonModal.featureName}
          description={comingSoonModal.description}
        />
      </main>
    </>
  );
}
