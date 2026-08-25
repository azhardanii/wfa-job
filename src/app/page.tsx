"use client";

import React, { useState, useEffect } from "react";
import { useStore } from "@/context/StoreContext";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { JobFeed } from "@/components/jobs/JobFeed";
import { MyJobsView } from "@/components/my-jobs/MyJobsView";
import { WalletView } from "@/components/wallet/WalletView";
import { ProfileView } from "@/components/profile/ProfileView";
import { JobDetailModal } from "@/components/jobs/JobDetailModal";
import { PostJobWizard } from "@/components/jobs/PostJobWizard";
import { OfferProposalModal } from "@/components/jobs/OfferProposalModal";
import { TopUpModal } from "@/components/wallet/TopUpModal";
import { WithdrawModal } from "@/components/wallet/WithdrawModal";
import { JobChatModal } from "@/components/chat/JobChatModal";
import { DisputeModal } from "@/components/dispute/DisputeModal";
import { RatingModal } from "@/components/rating/RatingModal";
import { NotificationDrawer } from "@/components/notifications/NotificationDrawer";
import { CelebrationModal } from "@/components/ui/CelebrationModal";
import { AppLoader } from "@/components/ui/AppLoader";
import { Smartphone, Monitor } from "lucide-react";

export default function Home() {
  const { activeTab } = useStore();
  const [deviceFrame, setDeviceFrame] = useState(false);
  const [appLoading, setAppLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAppLoading(false);
    }, 1100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {/* Aesthetic App Loader with logo-vertikal.png */}
      <AppLoader isLoading={appLoading} text="WFA JOB" subtext="Memuat Ekosistem Escrow..." />

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
            {activeTab === "home" && <JobFeed />}
            {activeTab === "my-jobs" && <MyJobsView />}
            {activeTab === "wallet" && <WalletView />}
            {activeTab === "profile" && <ProfileView />}
          </div>

          {/* Bottom Navigation */}
          <BottomNav />
        </div>

        {/* Modals & Dialogs */}
        <JobDetailModal />
        <PostJobWizard />
        <OfferProposalModal />
        <TopUpModal />
        <WithdrawModal />
        <JobChatModal />
        <DisputeModal />
        <RatingModal />
        <NotificationDrawer />
        <CelebrationModal />
      </main>
    </>
  );
}
