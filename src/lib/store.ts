"use client";

import { useState, useEffect } from "react";
import {
  User,
  Job,
  Offer,
  Wallet,
  Transaction,
  Dispute,
  Rating,
  ChatMessage,
  NotificationItem,
  Role,
  KycStatus,
  WorkerTier,
  JobMode,
  JobStatus,
  SpotClaim,
} from "@/types";
import {
  initialCurrentUser,
  initialJobs,
  initialOffers,
  initialWallet,
  initialNotifications,
  initialChatMessages,
} from "./mockData";

export const USD_TO_IDR = 17000;
const STORAGE_PREFIX = "wfa_job_storage_v2_";

// Tier Fee Rules: Starter 15%, Senior 10%, Expert 5%
export function calculateWorkerFee(tier: WorkerTier, amountUSD: number): { feePercent: number; feeAmount: number; netAmount: number } {
  const feePercent = tier === "STARTER" ? 15 : tier === "SENIOR" ? 10 : 5;
  const feeAmount = (amountUSD * feePercent) / 100;
  const netAmount = amountUSD - feeAmount;
  return { feePercent, feeAmount, netAmount };
}

// Currency Formatting Helpers ($1 = Rp. 17.000)
export function formatUSD(amount: number): string {
  return `$${amount.toLocaleString("en-US", {
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatIDR(amountUSD: number): string {
  const idr = amountUSD * USD_TO_IDR;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(idr).replace("Rp", "Rp. ");
}

export function formatDual(amountUSD: number): string {
  return formatUSD(amountUSD);
}

export function useWfaStore() {
  // Navigation & UI state
  const [activeTab, setActiveTab] = useState<"home" | "my-jobs" | "post-job" | "wallet" | "profile">("home");
  const [currentUser, setCurrentUser] = useState<User>(initialCurrentUser);
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [offers, setOffers] = useState<Offer[]>(initialOffers);
  const [wallet, setWallet] = useState<Wallet>(initialWallet);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>(initialChatMessages);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);

  // Modals & Drawers
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [offerModalJob, setOfferModalJob] = useState<Job | null>(null);
  const [chatModalJob, setChatModalJob] = useState<Job | null>(null);
  const [disputeModalJob, setDisputeModalJob] = useState<Job | null>(null);
  const [ratingModalJob, setRatingModalJob] = useState<Job | null>(null);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);
  const [showPostJobModal, setShowPostJobModal] = useState(false);
  const [celebration, setCelebration] = useState<{ show: boolean; title: string; message: string; amount?: number } | null>(null);
  const [showAdminLokerModal, setShowAdminLokerModal] = useState(false);
  const [comingSoonModal, setComingSoonModal] = useState<{
    isOpen: boolean;
    featureName?: string;
    description?: string;
  }>({ isOpen: false });

  const openComingSoon = (featureName: string, description?: string) => {
    setComingSoonModal({ isOpen: true, featureName, description });
  };

  const closeComingSoon = () => {
    setComingSoonModal({ isOpen: false });
  };

  // Theme State (Default: light)
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedMode, setSelectedMode] = useState<"ALL" | "OFFER" | "SPOT">("ALL");
  const [sortBy, setSortBy] = useState<"latest" | "highest_budget" | "deadline">("latest");

  // Load from LocalStorage
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(STORAGE_PREFIX + "theme") as "light" | "dark" | null;
      if (savedTheme) {
        setTheme(savedTheme);
        if (savedTheme === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      } else {
        document.documentElement.classList.remove("dark");
      }

      const savedUser = localStorage.getItem(STORAGE_PREFIX + "user");
      const savedJobs = localStorage.getItem(STORAGE_PREFIX + "jobs");
      const savedOffers = localStorage.getItem(STORAGE_PREFIX + "offers");
      const savedWallet = localStorage.getItem(STORAGE_PREFIX + "wallet");
      const savedNotifs = localStorage.getItem(STORAGE_PREFIX + "notifs");
      const savedChats = localStorage.getItem(STORAGE_PREFIX + "chats");

      if (savedUser) setCurrentUser(JSON.parse(savedUser));
      if (savedJobs) setJobs(JSON.parse(savedJobs));
      if (savedOffers) setOffers(JSON.parse(savedOffers));
      if (savedWallet) setWallet(JSON.parse(savedWallet));
      if (savedNotifs) setNotifications(JSON.parse(savedNotifs));
      if (savedChats) setChatMessages(JSON.parse(savedChats));
    } catch {
      // ignore
    }
  }, []);

  // Save to LocalStorage helper
  const saveState = (key: string, data: unknown) => {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
    } catch {
      // ignore
    }
  };

  // Theme Toggle
  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    try {
      localStorage.setItem(STORAGE_PREFIX + "theme", next);
    } catch {}
    if (next === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Role Switcher
  const switchRole = (role: Role) => {
    const updated = { ...currentUser, activeRole: role };
    setCurrentUser(updated);
    saveState("user", updated);
    addNotification({
      title: `Beralih ke Mode ${role === "WORKER" ? "Pekerja (Worker)" : "Pemberi Kerja (Boss)"}`,
      message: `Tampilan dan fitur navigasi kini disesuaikan untuk peran ${role}.`,
      type: "SYSTEM",
    });
  };

  // Notification helper
  const addNotification = (notif: Omit<NotificationItem, "id" | "userId" | "read" | "createdAt">) => {
    const newNotif: NotificationItem = {
      id: "notif-" + Date.now() + Math.random().toString(36).substring(2, 5),
      userId: currentUser.id,
      read: false,
      createdAt: new Date().toISOString(),
      ...notif,
    };
    const updated = [newNotif, ...notifications];
    setNotifications(updated);
    saveState("notifs", updated);
  };

  const markAllNotificationsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    saveState("notifs", updated);
  };

  // Trigger celebration
  const triggerCelebration = (title: string, message: string, amount?: number) => {
    setCelebration({ show: true, title, message, amount });
    if (typeof window !== "undefined") {
      import("canvas-confetti").then((confettiModule) => {
        const confetti = confettiModule.default;
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#2DD4BF", "#0D9488", "#5EEAD4", "#FFFFFF", "#0B3C40"],
        });
      }).catch(() => {});
    }
  };

  // 1. Post a new Job (Boss Flow)
  const createJob = (newJobData: {
    title: string;
    description: string;
    category: Job["category"];
    mode: JobMode;
    budget: number; // in USD
    deadlineDays: number;
    spotLimit?: number;
    milestones?: { title: string; amount: number }[];
  }) => {
    const deadlineDate = new Date();
    deadlineDate.setDate(deadlineDate.getDate() + newJobData.deadlineDays);

    const jobId = "job-" + Date.now();
    const contractNo = `WFA-${newJobData.mode}-${Date.now().toString().slice(-4)}`;

    const newJob: Job = {
      id: jobId,
      bossId: currentUser.id,
      bossName: currentUser.name,
      bossAvatar: currentUser.avatarUrl,
      bossRating: currentUser.ratingAverage || 5.0,
      bossJobsCompleted: currentUser.completedJobsCount,
      title: newJobData.title,
      description: newJobData.description,
      category: newJobData.category,
      mode: newJobData.mode,
      budget: newJobData.budget,
      deadline: deadlineDate.toISOString(),
      status: "OPEN",
      spotLimit: newJobData.spotLimit || (newJobData.mode === "SPOT" ? 5 : undefined),
      spotsClaimedCount: 0,
      offersCount: 0,
      createdAt: new Date().toISOString(),
      digitalContract: {
        contractNumber: contractNo,
        scope: newJobData.description.slice(0, 100) + "...",
        escrowRule:
          newJobData.mode === "OFFER"
            ? `Dana budget ${formatUSD(newJobData.budget)} terkunci di Escrow saat pemenang dipilih.`
            : `Direct Auto-Release Escrow per validasi microtask (${formatUSD(newJobData.budget)} per spot).`,
        autoReleaseHours: 72,
        platformFeePercent: 10,
      },
      milestones:
        newJobData.milestones && newJobData.milestones.length > 0
          ? newJobData.milestones.map((m, idx) => ({
              id: `m-${jobId}-${idx}`,
              jobId,
              title: m.title,
              amount: m.amount,
              status: "PENDING",
            }))
          : undefined,
    };

    const updatedJobs = [newJob, ...jobs];
    setJobs(updatedJobs);
    saveState("jobs", updatedJobs);

    addNotification({
      title: `Job Baru Dipublish: ${newJob.title}`,
      message: `Job mode ${newJob.mode} berhasil tayang di feed marketplace WFA.`,
      type: "JOB",
    });

    triggerCelebration("Job Berhasil Dibuat! 🚀", `Job "${newJob.title}" telah dipublish dan siap menerima offer tawaran.`, newJob.budget);
    return newJob;
  };

  // 2. Submit Offer (Worker Flow)
  const submitOffer = (jobId: string, message: string, priceUSD: number, deliveryDays: number) => {
    const targetJob = jobs.find((j) => j.id === jobId);
    if (!targetJob) return;

    const newOffer: Offer = {
      id: "offer-" + Date.now(),
      jobId,
      workerId: currentUser.id,
      workerName: currentUser.name,
      workerAvatar: currentUser.avatarUrl,
      workerTier: currentUser.tier,
      workerRating: currentUser.ratingAverage,
      message,
      price: priceUSD,
      deliveryDays,
      status: "PENDING",
      createdAt: new Date().toISOString(),
    };

    const updatedOffers = [newOffer, ...offers];
    setOffers(updatedOffers);
    saveState("offers", updatedOffers);

    const updatedJobs = jobs.map((j) => (j.id === jobId ? { ...j, offersCount: (j.offersCount || 0) + 1 } : j));
    setJobs(updatedJobs);
    saveState("jobs", updatedJobs);

    addNotification({
      title: `Offer Proposal Terkirim: ${targetJob.title}`,
      message: `Tawaran Anda sebesar ${formatUSD(priceUSD)} telah dikirim ke Boss ${targetJob.bossName}.`,
      type: "OFFER",
    });

    triggerCelebration("Offer Dikirim! ✉️", `Tawaran Anda sebesar ${formatUSD(priceUSD)} berhasil diajukan.`);
  };

  // 3. Accept Offer & Lock Escrow (Boss Flow)
  const acceptOfferAndLockEscrow = (jobId: string, offerId: string) => {
    const targetOffer = offers.find((o) => o.id === offerId);
    const targetJob = jobs.find((j) => j.id === jobId);
    if (!targetOffer || !targetJob) return;

    // Check boss balance in USD
    if (wallet.balanceUSD < targetOffer.price) {
      alert(`Saldo dompet Anda ($${wallet.balanceUSD}) tidak mencukupi untuk mengunci escrow (${formatUSD(targetOffer.price)}). Silakan Top-Up saldo terlebih dahulu.`);
      setShowTopUpModal(true);
      return;
    }

    // Deduct Boss Balance & Lock in Escrow
    const updatedWallet: Wallet = {
      ...wallet,
      balanceUSD: wallet.balanceUSD - targetOffer.price,
      lockedInEscrowUSD: wallet.lockedInEscrowUSD + targetOffer.price,
      transactions: [
        {
          id: "tx-" + Date.now(),
          walletId: wallet.id,
          type: "LOCK",
          amount: -targetOffer.price,
          status: "SUCCESS",
          refId: jobId,
          title: `Dana Terkunci di Escrow: ${targetJob.title}`,
          description: `Escrow terkunci untuk Worker ${targetOffer.workerName} (WFA Contract #${targetJob.digitalContract?.contractNumber || "ESCROW"})`,
          createdAt: new Date().toISOString(),
        },
        ...wallet.transactions,
      ],
    };
    setWallet(updatedWallet);
    saveState("wallet", updatedWallet);

    // Update Offers
    const updatedOffers = offers.map((o) => {
      if (o.jobId === jobId) {
        return { ...o, status: o.id === offerId ? ("ACCEPTED" as const) : ("REJECTED" as const) };
      }
      return o;
    });
    setOffers(updatedOffers);
    saveState("offers", updatedOffers);

    // Update Job Status & Escrow
    const autoRelease = new Date();
    autoRelease.setDate(autoRelease.getDate() + 3);

    const updatedJobs = jobs.map((j) => {
      if (j.id === jobId) {
        return {
          ...j,
          status: "IN_PROGRESS" as const,
          selectedWorkerId: targetOffer.workerId,
          selectedWorkerName: targetOffer.workerName,
          selectedOfferPrice: targetOffer.price,
          escrow: {
            id: "escrow-" + Date.now(),
            jobId,
            amountUSD: targetOffer.price,
            status: "LOCKED" as const,
            lockedAt: new Date().toISOString(),
            autoReleaseAt: autoRelease.toISOString(),
          },
        };
      }
      return j;
    });
    setJobs(updatedJobs);
    saveState("jobs", updatedJobs);

    addNotification({
      title: `Offer Diterima & Escrow Terkunci! 🔒`,
      message: `Dana ${formatUSD(targetOffer.price)} telah aman tersimpan di Escrow. Worker ${targetOffer.workerName} mulai mengerjakan project.`,
      type: "ESCROW",
    });

    triggerCelebration("Escrow Terkunci! 🔒", `Dana ${formatUSD(targetOffer.price)} aman di Rekening Bersama WFA. Project resmi dimulai!`, targetOffer.price);
  };

  // 4. Claim Spot Mode (Worker Flow)
  const claimSpot = (jobId: string) => {
    const targetJob = jobs.find((j) => j.id === jobId);
    if (!targetJob || targetJob.mode !== "SPOT") return;

    if (targetJob.spotsClaimedCount && targetJob.spotLimit && targetJob.spotsClaimedCount >= targetJob.spotLimit) {
      alert("Maaf, kuota spot untuk microtask ini sudah penuh.");
      return;
    }

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins timer
    const newSpotClaim: SpotClaim = {
      id: "spot-" + Date.now(),
      jobId,
      workerId: currentUser.id,
      workerName: currentUser.name,
      claimedAt: new Date().toISOString(),
      expiresAt,
      status: "CLAIMED",
    };

    const updatedJobs = jobs.map((j) => {
      if (j.id === jobId) {
        const currentSpots = j.spots || [];
        return {
          ...j,
          spotsClaimedCount: (j.spotsClaimedCount || 0) + 1,
          spots: [...currentSpots, newSpotClaim],
        };
      }
      return j;
    });
    setJobs(updatedJobs);
    saveState("jobs", updatedJobs);

    addNotification({
      title: `Spot Microtask Terklaim! ⚡`,
      message: `Anda memiliki waktu 15 menit untuk menyelesaikan dan submit hasil tugas "${targetJob.title}".`,
      type: "JOB",
    });

    triggerCelebration("Spot Terklaim! ⏱️", `Slot Anda terkunci selama 15 menit. Selesaikan tugas dan submit hasil.`);
  };

  // 5. Submit Spot Task Proof (Worker Flow)
  const submitSpotProof = (jobId: string, spotId: string, proofUrl: string, text: string) => {
    const targetJob = jobs.find((j) => j.id === jobId);
    if (!targetJob) return;

    const updatedJobs = jobs.map((j) => {
      if (j.id === jobId) {
        const currentSpots = (j.spots || []).map((s) => {
          if (s.id === spotId) {
            return {
              ...s,
              submissionProofUrl: proofUrl,
              submissionText: text,
              status: "SUBMITTED" as const,
            };
          }
          return s;
        });
        return { ...j, spots: currentSpots };
      }
      return j;
    });
    setJobs(updatedJobs);
    saveState("jobs", updatedJobs);

    addNotification({
      title: `Hasil Microtask Disubmit 📤`,
      message: `Bukti pengerjaan spot telah disubmit untuk verifikasi Boss.`,
      type: "JOB",
    });

    alert("Bukti pengerjaan microtask berhasil disubmit! Menunggu persetujuan Boss/Auto-Release.");
  };

  // 6. Release Milestone or Full Escrow (Boss Flow)
  const releaseMilestone = (jobId: string, milestoneId: string) => {
    const targetJob = jobs.find((j) => j.id === jobId);
    if (!targetJob || !targetJob.milestones) return;

    const targetMilestone = targetJob.milestones.find((m) => m.id === milestoneId);
    if (!targetMilestone || targetMilestone.status === "RELEASED") return;

    const amountUSD = targetMilestone.amount;
    const { feeAmount, netAmount, feePercent } = calculateWorkerFee(currentUser.tier, amountUSD);

    // Update milestones
    const updatedMilestones = targetJob.milestones.map((m) => {
      if (m.id === milestoneId) {
        return { ...m, status: "RELEASED" as const };
      }
      return m;
    });

    // Check if all milestones released
    const allReleased = updatedMilestones.every((m) => m.status === "RELEASED");

    const updatedJobs = jobs.map((j) => {
      if (j.id === jobId) {
        return {
          ...j,
          status: allReleased ? ("COMPLETED" as const) : j.status,
          milestones: updatedMilestones,
          escrow: j.escrow
            ? {
                ...j.escrow,
                status: allReleased ? ("RELEASED" as const) : ("PARTIALLY_RELEASED" as const),
                releasedAt: allReleased ? new Date().toISOString() : j.escrow.releasedAt,
              }
            : undefined,
        };
      }
      return j;
    });
    setJobs(updatedJobs);
    saveState("jobs", updatedJobs);

    // Credit Worker Wallet & Ledger
    const updatedWallet: Wallet = {
      ...wallet,
      balanceUSD: wallet.balanceUSD + netAmount,
      transactions: [
        {
          id: "tx-" + Date.now() + "1",
          walletId: wallet.id,
          type: "RELEASE",
          amount: amountUSD,
          status: "SUCCESS",
          refId: jobId,
          title: `Milestone Cair: ${targetMilestone.title}`,
          description: `Dana Escrow milestone telah dilepas oleh Boss (${formatUSD(amountUSD)})`,
          createdAt: new Date().toISOString(),
        },
        {
          id: "tx-" + Date.now() + "2",
          walletId: wallet.id,
          type: "FEE",
          amount: -feeAmount,
          status: "SUCCESS",
          refId: jobId,
          title: `Platform Fee (${feePercent}% ${currentUser.tier} Tier)`,
          description: `Fee komisi platform WFA JOB`,
          createdAt: new Date(Date.now() + 1000).toISOString(),
        },
        ...wallet.transactions,
      ],
    };
    setWallet(updatedWallet);
    saveState("wallet", updatedWallet);

    // Add realized GMV to current user
    const updatedUser: User = {
      ...currentUser,
      gmvRealized: currentUser.gmvRealized + amountUSD,
      completedJobsCount: allReleased ? currentUser.completedJobsCount + 1 : currentUser.completedJobsCount,
      tier: currentUser.gmvRealized + amountUSD > 1500 ? "EXPERT" : currentUser.gmvRealized + amountUSD > 300 ? "SENIOR" : "STARTER",
    };
    setCurrentUser(updatedUser);
    saveState("user", updatedUser);

    addNotification({
      title: `Dana Milestone Cair! 💰 +${formatUSD(netAmount)}`,
      message: `Milestone "${targetMilestone.title}" telah disetujui. Dana bersih masuk ke saldo Anda.`,
      type: "ESCROW",
    });

    triggerCelebration("Milestone Berhasil Cair! 🎉", `Dana bersih ${formatUSD(netAmount)} telah masuk ke dompet Anda!`, netAmount);

    if (allReleased) {
      setRatingModalJob(targetJob);
    }
  };

  // 7. Complete Full Job Escrow (for jobs without milestones or Spot jobs)
  const releaseFullJobEscrow = (jobId: string) => {
    const targetJob = jobs.find((j) => j.id === jobId);
    if (!targetJob) return;

    const amountUSD = targetJob.selectedOfferPrice || targetJob.budget;
    const { feeAmount, netAmount, feePercent } = calculateWorkerFee(currentUser.tier, amountUSD);

    const updatedJobs = jobs.map((j) => {
      if (j.id === jobId) {
        return {
          ...j,
          status: "COMPLETED" as const,
          escrow: j.escrow
            ? {
                ...j.escrow,
                status: "RELEASED" as const,
                releasedAt: new Date().toISOString(),
              }
            : undefined,
        };
      }
      return j;
    });
    setJobs(updatedJobs);
    saveState("jobs", updatedJobs);

    // Update Wallet
    const updatedWallet: Wallet = {
      ...wallet,
      balanceUSD: wallet.balanceUSD + netAmount,
      transactions: [
        {
          id: "tx-" + Date.now() + "1",
          walletId: wallet.id,
          type: "RELEASE",
          amount: amountUSD,
          status: "SUCCESS",
          refId: jobId,
          title: `Pencairan Penuh Escrow: ${targetJob.title}`,
          description: `Pekerjaan selesai 100% dan dana escrow telah cair.`,
          createdAt: new Date().toISOString(),
        },
        {
          id: "tx-" + Date.now() + "2",
          walletId: wallet.id,
          type: "FEE",
          amount: -feeAmount,
          status: "SUCCESS",
          refId: jobId,
          title: `Fee Komisi Platform (${feePercent}% ${currentUser.tier} Tier)`,
          description: `Fee platform WFA JOB`,
          createdAt: new Date(Date.now() + 1000).toISOString(),
        },
        ...wallet.transactions,
      ],
    };
    setWallet(updatedWallet);
    saveState("wallet", updatedWallet);

    // Add GMV
    const updatedUser: User = {
      ...currentUser,
      gmvRealized: currentUser.gmvRealized + amountUSD,
      completedJobsCount: currentUser.completedJobsCount + 1,
      tier: currentUser.gmvRealized + amountUSD > 1500 ? "EXPERT" : currentUser.gmvRealized + amountUSD > 300 ? "SENIOR" : "STARTER",
    };
    setCurrentUser(updatedUser);
    saveState("user", updatedUser);

    addNotification({
      title: `Job Selesai & Dana Cair! 🎉 +${formatUSD(netAmount)}`,
      message: `Escrow sebesar ${formatUSD(amountUSD)} telah dilepas ke saldo Anda.`,
      type: "ESCROW",
    });

    triggerCelebration("Job Selesai & Dana Cair! 🏆", `Dana bersih ${formatUSD(netAmount)} telah masuk ke dompet Anda!`, netAmount);
    setRatingModalJob(targetJob);
  };

  // 8. Top-up USD
  const topUpWallet = (amountUSD: number, method: string) => {
    const updatedWallet: Wallet = {
      ...wallet,
      balanceUSD: wallet.balanceUSD + amountUSD,
      transactions: [
        {
          id: "tx-" + Date.now(),
          walletId: wallet.id,
          type: "TOPUP",
          amount: amountUSD,
          status: "SUCCESS",
          refId: `PAY-${Date.now().toString().slice(-6)}`,
          title: `Top-Up Saldo ($) (${method})`,
          description: `Pembayaran ${formatUSD(amountUSD)} berhasil diverifikasi via payment partner`,
          createdAt: new Date().toISOString(),
        },
        ...wallet.transactions,
      ],
    };
    setWallet(updatedWallet);
    saveState("wallet", updatedWallet);

    addNotification({
      title: `Top-Up Berhasil! 💳 +${formatUSD(amountUSD)}`,
      message: `Saldo Anda kini menjadi ${formatUSD(updatedWallet.balanceUSD)}.`,
      type: "WALLET",
    });

    triggerCelebration("Top-Up Berhasil! 💳", `Saldo sebesar ${formatUSD(amountUSD)} telah ditambahkan ke dompet Anda!`, amountUSD);
  };

  // 9. Withdraw USD
  const withdrawWallet = (amountUSD: number, bankName: string, accountNumber: string) => {
    const flatFeeUSD = 0.5; // ~Rp 8.500
    const totalDeduction = amountUSD + flatFeeUSD;

    if (wallet.balanceUSD < totalDeduction) {
      alert(`Saldo tidak mencukupi. Penarikan ${formatUSD(amountUSD)} + Biaya Transaksi ${formatUSD(flatFeeUSD)} = ${formatUSD(totalDeduction)}`);
      return false;
    }

    const updatedWallet: Wallet = {
      ...wallet,
      balanceUSD: wallet.balanceUSD - totalDeduction,
      transactions: [
        {
          id: "tx-" + Date.now() + "w",
          walletId: wallet.id,
          type: "WITHDRAW",
          amount: -amountUSD,
          status: "SUCCESS",
          refId: `WD-${Date.now().toString().slice(-6)}`,
          title: `Penarikan Dana ke ${bankName}`,
          description: `Pencairan ${formatUSD(amountUSD)} ke Rek: ${accountNumber} (A.N ${currentUser.name})`,
          createdAt: new Date().toISOString(),
        },
        {
          id: "tx-" + Date.now() + "f",
          walletId: wallet.id,
          type: "FEE",
          amount: -flatFeeUSD,
          status: "SUCCESS",
          refId: `WD-${Date.now().toString().slice(-6)}`,
          title: `Biaya Penarikan Flat (${formatUSD(flatFeeUSD)})`,
          description: "Biaya transfer antar bank via payment partner",
          createdAt: new Date(Date.now() + 1000).toISOString(),
        },
        ...wallet.transactions,
      ],
    };
    setWallet(updatedWallet);
    saveState("wallet", updatedWallet);

    addNotification({
      title: `Penarikan Dana Diproses 🏦 ${formatUSD(amountUSD)}`,
      message: `Dana ${formatUSD(amountUSD)} sedang ditransfer ke ${bankName} ${accountNumber}. Estimasi tiba 5-15 menit.`,
      type: "WALLET",
    });

    triggerCelebration("Penarikan Berhasil! 🏦", `Penarikan ${formatUSD(amountUSD)} ke ${bankName} (${accountNumber}) sedang diproses.`);
    return true;
  };

  // 10. Chat Message
  const sendChatMessage = (jobId: string, text: string) => {
    const newMsg: ChatMessage = {
      id: "msg-" + Date.now(),
      jobId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.activeRole,
      text,
      createdAt: new Date().toISOString(),
    };

    const currentChats = chatMessages[jobId] || [];
    const updatedChats = { ...chatMessages, [jobId]: [...currentChats, newMsg] };
    setChatMessages(updatedChats);
    saveState("chats", updatedChats);
  };

  // 11. Dispute
  const createDispute = (jobId: string, reason: string, evidenceText: string, evidenceUrl?: string) => {
    const targetJob = jobs.find((j) => j.id === jobId);
    if (!targetJob) return;

    const newDispute: Dispute = {
      id: "disp-" + Date.now(),
      jobId,
      jobTitle: targetJob.title,
      raisedById: currentUser.id,
      raisedByName: currentUser.name,
      reason,
      evidenceText,
      evidenceUrl,
      status: targetJob.mode === "SPOT" ? "FAST_TRACK_RESOLVED" : "OPEN",
      resolution: targetJob.mode === "SPOT" ? "Fast-track biner resolved: Bukti microtask terverifikasi secara otomatis." : undefined,
      createdAt: new Date().toISOString(),
    };

    const updatedDisputes = [newDispute, ...disputes];
    setDisputes(updatedDisputes);

    const updatedJobs = jobs.map((j) => (j.id === jobId ? { ...j, status: "DISPUTED" as const, dispute: newDispute } : j));
    setJobs(updatedJobs);
    saveState("jobs", updatedJobs);

    addNotification({
      title: `Tiket Dispute Diajukan ⚠️`,
      message: `Dispute untuk job "${targetJob.title}" sedang ditinjau oleh sistem mediasi WFA.`,
      type: "DISPUTE",
    });

    alert("Tiket sengketa berhasil dibuat. Tim mediasi dan sistem fast-track akan memproses bukti.");
  };

  // 12. Submit Rating
  const submitRating = (jobId: string, toUserId: string, score: number, comment?: string) => {
    const targetJob = jobs.find((j) => j.id === jobId);
    const newRating: Rating = {
      id: "rate-" + Date.now(),
      jobId,
      jobTitle: targetJob?.title || "WFA Job",
      fromUserId: currentUser.id,
      fromUserName: currentUser.name,
      toUserId,
      score,
      comment,
      createdAt: new Date().toISOString(),
    };

    setRatings([newRating, ...ratings]);
    addNotification({
      title: `Ulasan Terkirim ⭐ (${score}/5)`,
      message: `Terima kasih telah memberikan ulasan dan rating untuk transaksi ini.`,
      type: "JOB",
    });
  };

  // 13. Update KYC
  const submitKyc = (ktpNumber: string, selfPhoto: string) => {
    const updatedUser: User = {
      ...currentUser,
      kycStatus: "VERIFIED",
    };
    setCurrentUser(updatedUser);
    saveState("user", updatedUser);

    addNotification({
      title: `KYC Identitas Berhasil Diverifikasi! 🛡️`,
      message: `Akun Anda kini terverifikasi resmi (Tier: ${updatedUser.tier}). Anda dapat melakukan withdraw tanpa batas.`,
      type: "SYSTEM",
    });

    triggerCelebration("KYC Terverifikasi! 🛡️", "Selamat! Identitas Anda telah tervalidasi di sistem WFA Trust.");
  };

  return {
    activeTab,
    setActiveTab,
    currentUser,
    setCurrentUser,
    switchRole,
    jobs,
    offers,
    wallet,
    notifications,
    chatMessages,
    disputes,
    ratings,
    // Modals
    selectedJob,
    setSelectedJob,
    offerModalJob,
    setOfferModalJob,
    chatModalJob,
    setChatModalJob,
    disputeModalJob,
    setDisputeModalJob,
    ratingModalJob,
    setRatingModalJob,
    showTopUpModal,
    setShowTopUpModal,
    showWithdrawModal,
    setShowWithdrawModal,
    showNotificationDrawer,
    setShowNotificationDrawer,
    showPostJobModal,
    setShowPostJobModal,
    celebration,
    setCelebration,
    showAdminLokerModal,
    setShowAdminLokerModal,
    comingSoonModal,
    openComingSoon,
    closeComingSoon,
    // Filters
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedMode,
    setSelectedMode,
    sortBy,
    setSortBy,
    // Theme
    theme,
    toggleTheme,
    // Actions
    createJob,
    submitOffer,
    acceptOfferAndLockEscrow,
    claimSpot,
    submitSpotProof,
    releaseMilestone,
    releaseFullJobEscrow,
    topUpWallet,
    withdrawWallet,
    sendChatMessage,
    createDispute,
    submitRating,
    submitKyc,
    markAllNotificationsRead,
    triggerCelebration,
  };
}
