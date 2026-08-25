"use client";

import React, { useState } from "react";
import { useStore } from "@/context/StoreContext";
import { formatUSD, formatDual } from "@/lib/store";
import {
  ShieldCheck,
  Star,
  Award,
} from "lucide-react";

export function ProfileView() {
  const { currentUser, switchRole, submitKyc } = useStore();

  const isWorker = currentUser.activeRole === "WORKER";
  const [showKycForm, setShowKycForm] = useState(false);
  const [ktpNumber, setKtpNumber] = useState("3273019800010002");

  // GMV Tier computation in USD
  const gmv = currentUser.gmvRealized;
  const seniorTarget = 300; // $300 USD
  const expertTarget = 1500; // $1500 USD

  const currentTier = currentUser.tier;
  let nextTier = "SENIOR";
  let targetGmv = seniorTarget;
  let progressPercent = (gmv / seniorTarget) * 100;

  if (currentTier === "SENIOR") {
    nextTier = "EXPERT";
    targetGmv = expertTarget;
    progressPercent = (gmv / expertTarget) * 100;
  } else if (currentTier === "EXPERT") {
    nextTier = "MAX TIER";
    targetGmv = expertTarget;
    progressPercent = 100;
  }

  const handleKycSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitKyc(ktpNumber, "ktp_photo.jpg");
    setShowKycForm(false);
  };

  return (
    <div className="space-y-4 pb-24 text-slate-900 dark:text-white">
      {/* Profile Card */}
      <div className="rounded-3xl glass-card p-5 border border-slate-200 dark:border-teal-500/25 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <img
                src={currentUser.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                alt={currentUser.name}
                className="h-16 w-16 rounded-2xl border-2 border-teal-500/50 object-cover shadow-sm dark:shadow-teal-glow"
              />
              <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-teal-500 text-[10px] font-black text-white dark:text-black">
                ✓
              </span>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{currentUser.name}</h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400">{currentUser.email}</p>
              <div className="mt-1 flex items-center gap-2 text-xs">
                <span className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star className="h-3.5 w-3.5 fill-amber-400" />
                  {currentUser.ratingAverage}
                </span>
                <span className="text-slate-400 dark:text-zinc-500">•</span>
                <span className="text-slate-600 dark:text-zinc-300">{currentUser.completedJobsCount} Job Selesai</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed bg-slate-50 dark:bg-black/30 p-3 rounded-2xl border border-slate-200 dark:border-teal-500/10">
          {currentUser.bio || "Freelancer profesional di ekosistem WFA Job."}
        </p>

        {/* Role Switch Box */}
        <div className="rounded-2xl border border-slate-200 dark:border-teal-500/25 bg-slate-50 dark:bg-teal-950/40 p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-teal-700 dark:text-teal-400 tracking-wider block">
              Mode Akun Saat Ini:
            </span>
            <span className="text-sm font-black text-slate-900 dark:text-white">
              {currentUser.activeRole === "WORKER" ? "Worker (Pekerja Lepas)" : "Boss (Pemberi Kerja)"}
            </span>
          </div>

          <button
            onClick={() => switchRole(currentUser.activeRole === "WORKER" ? "BOSS" : "WORKER")}
            className="rounded-xl btn-teal-primary px-3.5 py-1.5 text-xs font-bold shadow-teal-glow"
          >
            Ganti ke {currentUser.activeRole === "WORKER" ? "Boss" : "Worker"}
          </button>
        </div>
      </div>

      {/* Worker Tier Progress Card (Starter 15%, Senior 10%, Expert 5%) */}
      {isWorker && (
        <div className="rounded-3xl glass-card p-5 border border-slate-200 dark:border-teal-500/25 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-100 dark:bg-teal-400/20 text-teal-700 dark:text-teal-300">
                <Award className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Tier Worker: <span className="text-teal-700 dark:text-teal-300">{currentUser.tier}</span>
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                  Fee Komisi: {currentUser.tier === "STARTER" ? "15%" : currentUser.tier === "SENIOR" ? "10%" : "5%"} (Berdasarkan GMV Realisasi)
                </p>
              </div>
            </div>

            <span className="rounded-full bg-teal-100 dark:bg-teal-500/20 px-2.5 py-0.5 text-[10px] font-black text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-400/40">
              {currentUser.tier}
            </span>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-500 dark:text-zinc-400">Akumulasi GMV:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {formatUSD(gmv)} / {formatUSD(targetGmv)}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-black/60">
              <div
                className="h-full rounded-full bg-teal-600 dark:bg-gradient-to-r dark:from-teal-400 dark:via-teal-300 dark:to-emerald-400 transition-all duration-500"
                style={{ width: `${Math.min(100, progressPercent)}%` }}
              ></div>
            </div>
            {currentTier !== "EXPERT" && (
              <p className="mt-1.5 text-[11px] text-teal-700 dark:text-teal-400/80">
                Tingkatkan GMV sebesar <span className="font-bold text-slate-900 dark:text-white">{formatUSD(Math.max(0, targetGmv - gmv))}</span> lagi untuk membuka tier {nextTier}.
              </p>
            )}
          </div>
        </div>
      )}

      {/* KYC Status Card */}
      <div className="rounded-3xl glass-card p-5 border border-slate-200 dark:border-teal-500/25 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-100 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Status Verifikasi Identitas (KYC)</h4>
              <p className="text-[10px] text-slate-500 dark:text-zinc-400">Proteksi akun & syarat penarikan saldo</p>
            </div>
          </div>

          <span
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold ${
              currentUser.kycStatus === "VERIFIED"
                ? "bg-teal-100 dark:bg-teal-500/20 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-400/40"
                : "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40"
            }`}
          >
            {currentUser.kycStatus === "VERIFIED" ? "✓ Terverifikasi" : "Belum Lengkap"}
          </span>
        </div>

        {currentUser.kycStatus !== "VERIFIED" && !showKycForm && (
          <button
            onClick={() => setShowKycForm(true)}
            className="w-full rounded-xl btn-teal-primary py-2 text-xs font-bold shadow-teal-glow"
          >
            Verifikasi Identitas Sekarang
          </button>
        )}

        {showKycForm && (
          <form onSubmit={handleKycSubmit} className="space-y-3 pt-2">
            <input
              type="text"
              value={ktpNumber}
              onChange={(e) => setKtpNumber(e.target.value)}
              placeholder="Nomor NIK KTP (16 digit)"
              maxLength={16}
              className="w-full rounded-xl border border-slate-300 dark:border-teal-500/30 bg-white dark:bg-black/60 p-2.5 text-xs text-slate-900 dark:text-white font-mono"
              required
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowKycForm(false)}
                className="flex-1 rounded-xl bg-slate-200 dark:bg-zinc-800 py-1.5 text-xs text-slate-700 dark:text-zinc-300"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 rounded-xl btn-teal-primary py-1.5 text-xs font-bold"
              >
                Kirim KYC
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Skills & Portfolio */}
      {isWorker && (
        <div className="rounded-3xl glass-card p-5 border border-slate-200 dark:border-teal-500/25 space-y-4">
          <div>
            <h4 className="text-xs font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wider mb-2">
              Keahlian & Tag
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {(currentUser.skills || ["Figma", "UI/UX", "Next.js", "Motion"]).map((skill) => (
                <span
                  key={skill}
                  className="rounded-lg border border-slate-200 dark:border-teal-500/20 bg-slate-50 dark:bg-teal-950/60 px-2.5 py-1 text-xs font-medium text-teal-800 dark:text-teal-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wider mb-2">
              Galeri Portofolio
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {(currentUser.portfolio || []).map((port) => (
                <div
                  key={port.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 dark:border-teal-500/20 bg-slate-50 dark:bg-teal-950/40 transition-all hover:border-teal-400"
                >
                  <img src={port.image} alt={port.title} className="h-24 w-full object-cover" />
                  <div className="p-2.5">
                    <h5 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{port.title}</h5>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
