"use client";

import React, { useState } from "react";
import { WfaLoker } from "@/types/loker";
import {
  X,
  Globe2,
  MapPin,
  Clock,
  Building2,
  Banknote,
  ExternalLink,
  Share2,
  CheckCircle,
  Sparkles,
  Calendar,
  AlertCircle,
} from "lucide-react";

interface LokerDetailModalProps {
  loker: WfaLoker | null;
  onClose: () => void;
}

export function LokerDetailModal({ loker, onClose }: LokerDetailModalProps) {
  const [copied, setCopied] = useState(false);
  const [imageError, setImageError] = useState(false);

  if (!loker) return null;

  const isRemote = loker.locationType === "Remote";
  const isFullTime = loker.mode === "Full Time";
  const fallbackImage =
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80";

  const handleShare = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(
        `Lowongan Kerja: ${loker.title} di ${loker.companyName} - Mode: ${loker.locationType} (${loker.mode}). Estimasi: ${loker.salaryEstimate}. Lamar di: ${loker.applyUrl}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleApply = () => {
    if (!loker.applyUrl || loker.applyUrl === "#") {
      alert("Link pendaftaran belum ditambahkan untuk lowongan ini.");
      return;
    }
    window.open(loker.applyUrl, "_blank", "noopener,noreferrer");
  };

  const dateFormatted = new Date(loker.createdAt).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col w-full max-w-lg max-h-[90vh] overflow-hidden rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header / Thumbnail Banner */}
        <div className="relative h-44 sm:h-52 w-full bg-slate-100 dark:bg-zinc-800 shrink-0 overflow-hidden">
          <img
            src={imageError ? fallbackImage : loker.thumbnailUrl || fallbackImage}
            alt={loker.title}
            onError={() => setImageError(true)}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md transition-all shadow-md"
            aria-label="Tutup"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Badges on Top */}
          <div className="absolute top-3.5 left-3.5 flex items-center gap-2 flex-wrap">
            {isRemote ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-teal-500/90 backdrop-blur-md px-3 py-1 text-xs font-bold text-white shadow-sm">
                <Globe2 className="h-3.5 w-3.5" />
                Remote WFA
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-600/90 backdrop-blur-md px-3 py-1 text-xs font-bold text-white shadow-sm">
                <MapPin className="h-3.5 w-3.5" />
                On-site Offline
              </span>
            )}

            <span className="inline-flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white">
              <Clock className="h-3.5 w-3.5" />
              {loker.mode}
            </span>
          </div>

          {/* Title on Banner Bottom */}
          <div className="absolute bottom-3 left-4 right-4 text-white">
            <p className="flex items-center gap-1.5 text-xs text-teal-300 font-medium">
              <Building2 className="h-3.5 w-3.5" />
              <span>{loker.companyName}</span>
            </p>
            <h2 className="text-base sm:text-lg font-black leading-snug drop-shadow-sm mt-0.5">
              {loker.title}
            </h2>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Salary Highlight Card */}
          <div className="rounded-2xl border border-teal-200 dark:border-teal-500/20 bg-teal-50/70 dark:bg-teal-950/40 p-3.5 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-medium text-teal-800 dark:text-teal-300">
                Estimasi Pendapatan:
              </span>
              <div className="flex items-center gap-1.5 text-base sm:text-lg font-black text-teal-900 dark:text-teal-200 mt-0.5">
                <Banknote className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                <span>{loker.salaryEstimate}</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-500 dark:text-zinc-400 block">Diposting:</span>
              <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                {dateFormatted}
              </span>
            </div>
          </div>

          {/* Conditional Offline Location Card (Only when On-site) */}
          {!isRemote && (
            <div className="rounded-2xl border border-blue-200 dark:border-blue-500/30 bg-blue-50/70 dark:bg-blue-950/40 p-4 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900 dark:text-blue-200">
                <MapPin className="h-4 w-4 text-rose-500 shrink-0" />
                <span>Alamat Lokasi Kerja Offline (On-site)</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-zinc-300 leading-relaxed pl-5 font-medium">
                {loker.offlineAddress || "Alamat kantor akan diinfokan lebih lanjut oleh pihak perusahaan."}
              </p>
              {loker.offlineAddress && (
                <div className="pt-1 pl-5">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      loker.offlineAddress
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 dark:text-blue-400 hover:underline"
                  >
                    <span>Buka Lokasi di Google Maps</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Job Description */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              Deskripsi & Persyaratan Pekerjaan
            </h4>
            <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-850/50 p-4">
              <p className="text-xs sm:text-sm text-slate-800 dark:text-zinc-200 whitespace-pre-line leading-relaxed">
                {loker.description}
              </p>
            </div>
          </div>

          {/* Verified Notice */}
          <div className="flex items-center gap-2 rounded-xl bg-slate-100 dark:bg-zinc-800/80 px-3 py-2 text-[11px] text-slate-600 dark:text-zinc-400">
            <CheckCircle className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
            <span>
              Lowongan kerja ini terverifikasi dan dipublikasikan resmi di portal WFA Job.
            </span>
          </div>
        </div>

        {/* Modal Footer / Action CTA */}
        <div className="shrink-0 border-t border-slate-200 dark:border-zinc-800 px-5 py-3.5 bg-white dark:bg-zinc-900 flex items-center gap-2.5">
          <button
            onClick={handleShare}
            className="flex h-11 items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 px-3 text-xs font-bold text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            title="Bagikan Lowongan"
          >
            {copied ? (
              <>
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">Tersalin</span>
              </>
            ) : (
              <>
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">Bagikan</span>
              </>
            )}
          </button>

          <button
            onClick={handleApply}
            className="flex-1 flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 text-white font-bold text-xs sm:text-sm shadow-md dark:shadow-teal-glow transition-all active:scale-[0.98]"
          >
            <span>Lamar Pekerjaan Ini Sekarang</span>
            <ExternalLink className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
