"use client";

import React, { useState, useEffect } from "react";
import { WfaLoker, JobWorkMode, JobLocationType } from "@/types/loker";
import { lokerService, getStoredAdminPin, saveAdminSessionPin, isAuthenticatedAdmin } from "@/lib/lokerService";
import { firebaseConfig, isFirebaseConfigured } from "@/lib/firebase";
import {
  X,
  Plus,
  Edit2,
  Trash2,
  Check,
  CheckCircle2,
  AlertTriangle,
  Database,
  Globe2,
  MapPin,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Key,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  Sliders,
  CheckCircle,
} from "lucide-react";

interface AdminLokerModalProps {
  isOpen: boolean;
  onClose: () => void;
  lokers: WfaLoker[];
  onRefresh: () => void;
}

const PRESET_THUMBNAILS = [
  {
    name: "Tech & Coding",
    url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Remote Desk",
    url: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "UI/UX Design",
    url: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Virtual Assistant",
    url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Media & Video",
    url: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Office & Operations",
    url: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80",
  },
];

export function AdminLokerModal({
  isOpen,
  onClose,
  lokers,
  onRefresh,
}: AdminLokerModalProps) {
  const [activeTab, setActiveTab] = useState<"list" | "form" | "firebase">("list");
  const [editingLoker, setEditingLoker] = useState<WfaLoker | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Security Auth State
  const [adminPinInput, setAdminPinInput] = useState(getStoredAdminPin());
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinError, setPinError] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState(PRESET_THUMBNAILS[0].url);
  const [salaryEstimate, setSalaryEstimate] = useState("");
  const [mode, setMode] = useState<JobWorkMode>("Full Time");
  const [locationType, setLocationType] = useState<JobLocationType>("Remote");
  const [offlineAddress, setOfflineAddress] = useState("");
  const [description, setDescription] = useState("");
  const [applyUrl, setApplyUrl] = useState("");

  useEffect(() => {
    if (isOpen) {
      const stored = getStoredAdminPin();
      if (isAuthenticatedAdmin(stored)) {
        setIsUnlocked(true);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const firebaseActive = isFirebaseConfigured();

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAuthenticatedAdmin(adminPinInput)) {
      saveAdminSessionPin(adminPinInput);
      setIsUnlocked(true);
      setPinError(false);
      setMessage({ text: "Otorisasi Admin Berhasil! Hak akses CRUD terbuka.", type: "success" });
    } else {
      setPinError(true);
      setMessage({ text: "PIN Keamanan Admin salah. Silakan periksa file .env.local!", type: "error" });
    }
  };

  const resetForm = () => {
    setTitle("");
    setCompanyName("");
    setThumbnailUrl(PRESET_THUMBNAILS[0].url);
    setSalaryEstimate("");
    setMode("Full Time");
    setLocationType("Remote");
    setOfflineAddress("");
    setDescription("");
    setApplyUrl("");
    setEditingLoker(null);
  };

  const handleStartCreate = () => {
    resetForm();
    setActiveTab("form");
    setMessage(null);
  };

  const handleStartEdit = (loker: WfaLoker) => {
    setEditingLoker(loker);
    setTitle(loker.title);
    setCompanyName(loker.companyName);
    setThumbnailUrl(loker.thumbnailUrl);
    setSalaryEstimate(loker.salaryEstimate);
    setMode(loker.mode);
    setLocationType(loker.locationType);
    setOfflineAddress(loker.offlineAddress || "");
    setDescription(loker.description);
    setApplyUrl(loker.applyUrl);
    setActiveTab("form");
    setMessage(null);
  };

  const handleSaveLoker = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isUnlocked) {
      setMessage({ text: "Otorisasi dibutuhkan: Masukkan PIN Admin terlebih dahulu.", type: "error" });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      if (editingLoker) {
        // Update via ORM
        const res = await lokerService.update(
          editingLoker.id,
          {
            title,
            companyName,
            thumbnailUrl,
            salaryEstimate,
            mode,
            locationType,
            offlineAddress: locationType === "On-site" ? offlineAddress : undefined,
            description,
            applyUrl: applyUrl.trim() || "#",
          },
          adminPinInput
        );

        if (res.success) {
          setMessage({ text: "Lowongan kerja berhasil diperbarui via LokerORM!", type: "success" });
          onRefresh();
          setTimeout(() => {
            setActiveTab("list");
            resetForm();
          }, 800);
        } else {
          setMessage({ text: res.error || "Gagal memperbarui loker.", type: "error" });
        }
      } else {
        // Create via ORM
        const res = await lokerService.create(
          {
            title,
            companyName,
            thumbnailUrl,
            salaryEstimate,
            mode,
            locationType,
            offlineAddress: locationType === "On-site" ? offlineAddress : undefined,
            description,
            applyUrl: applyUrl.trim() || "#",
          },
          adminPinInput
        );

        if (res.success) {
          setMessage({ text: "Lowongan kerja baru berhasil diterbitkan via LokerORM!", type: "success" });
          onRefresh();
          setTimeout(() => {
            setActiveTab("list");
            resetForm();
          }, 800);
        } else {
          setMessage({ text: res.error || "Gagal membuat loker.", type: "error" });
        }
      }
    } catch (err: any) {
      setMessage({ text: err?.message || "Terjadi kesalahan sistem.", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, jobTitle: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus loker "${jobTitle}"?`)) {
      const res = await lokerService.delete(id, adminPinInput);
      if (res.success) {
        onRefresh();
        setMessage({ text: `Loker "${jobTitle}" telah dihapus dengan aman.`, type: "success" });
      } else {
        setMessage({ text: res.error || "Gagal menghapus loker.", type: "error" });
      }
    }
  };

  const handleToggleStatus = async (loker: WfaLoker) => {
    const res = await lokerService.toggleStatus(loker.id, adminPinInput);
    if (res.success) {
      onRefresh();
      setMessage({
        text: `Status loker diubah menjadi ${loker.status === "ACTIVE" ? "DITUTUP" : "AKTIF"}.`,
        type: "success",
      });
    }
  };

  const handleSeedSamplesToCloud = async () => {
    setIsSubmitting(true);
    try {
      const res = await lokerService.seedToCloud(adminPinInput);
      setMessage({
        text: res.message,
        type: res.success ? "success" : "error",
      });
      onRefresh();
    } catch (err: any) {
      setMessage({ text: err?.message || "Gagal mengunggah data ke Cloud.", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col w-full max-w-xl max-h-[92vh] overflow-hidden rounded-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="shrink-0 border-b border-slate-200 dark:border-zinc-800 px-5 py-4 bg-slate-50/80 dark:bg-zinc-850/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-md">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                Admin Panel • Kelola Loker WFA
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                {firebaseActive ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    Firestore Connected ({firebaseConfig.projectId})
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    Mode Lokal (Database Dinamis)
                  </span>
                )}
                <span className="text-[10px] text-slate-400">• LokerORM v1.2</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-200 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Security PIN Authorization Banner if Not Unlocked */}
        {!isUnlocked && (
          <div className="p-5 border-b border-amber-200 dark:border-amber-900/60 bg-amber-50/70 dark:bg-amber-950/40">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100 shrink-0">
                <Lock className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-black text-amber-900 dark:text-amber-200">
                  Proteksi Keamanan Admin (PIN Guard)
                </h4>
                <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 mt-0.5 leading-relaxed">
                  Untuk mencegah modifikasi atau penghapusan data loker oleh pihak luar, masukkan PIN Admin yang telah ditentukan di file <code className="font-mono bg-white/70 dark:bg-black/40 px-1 py-0.5 rounded font-bold">.env.local</code>.
                </p>

                <form onSubmit={handleVerifyPin} className="mt-2.5 flex items-center gap-2">
                  <input
                    type="password"
                    placeholder="Masukkan PIN Admin..."
                    value={adminPinInput}
                    onChange={(e) => setAdminPinInput(e.target.value)}
                    className="flex-1 max-w-xs rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-zinc-800 px-3 py-1.5 text-xs text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <button
                    type="submit"
                    className="flex items-center gap-1 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold px-3 py-1.5 shadow-sm transition-all"
                  >
                    <Unlock className="h-3.5 w-3.5" />
                    <span>Verifikasi PIN</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Sub-nav Navigation Tabs */}
        <div className="flex items-center border-b border-slate-200 dark:border-zinc-800 px-5 py-2 bg-white dark:bg-zinc-900 gap-2">
          <button
            onClick={() => {
              setActiveTab("list");
              setMessage(null);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "list"
                ? "bg-teal-600 text-white shadow-sm"
                : "text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
            }`}
          >
            Daftar Loker ({lokers.length})
          </button>

          <button
            onClick={handleStartCreate}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === "form"
                ? "bg-teal-600 text-white shadow-sm"
                : "text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
            }`}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{editingLoker ? "Edit Loker" : "Tambah Loker Baru"}</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("firebase");
              setMessage(null);
            }}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ml-auto ${
              activeTab === "firebase"
                ? "bg-teal-600 text-white shadow-sm"
                : "text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5 text-teal-500" />
            <span>Security & Env</span>
          </button>
        </div>

        {/* Global Feedback Message */}
        {message && (
          <div
            className={`mx-5 mt-3 px-3.5 py-2.5 rounded-xl text-xs font-medium flex items-center gap-2 ${
              message.type === "success"
                ? "bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300"
                : "bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-300"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <AlertTriangle className="h-4 w-4 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {/* TAB 1: LIST LOKER */}
          {activeTab === "list" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  Data dikelola via <strong>LokerORM</strong> dengan validasi schema & anti-XSS sanitization.
                </p>
                <button
                  onClick={handleStartCreate}
                  className="flex items-center gap-1 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold px-3 py-1.5 shadow-sm transition-all"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Tambah Loker</span>
                </button>
              </div>

              {lokers.length === 0 ? (
                <div className="p-8 text-center rounded-2xl border border-dashed border-slate-300 dark:border-zinc-700">
                  <Database className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-600 dark:text-zinc-300">
                    Belum ada data lowongan kerja.
                  </p>
                  <button
                    onClick={handleStartCreate}
                    className="mt-3 inline-flex items-center gap-1 rounded-xl bg-teal-600 text-white px-3 py-1.5 text-xs font-bold"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Buat Loker Pertama</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {lokers.map((loker) => (
                    <div
                      key={loker.id}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-850/60 p-3 hover:border-teal-500/40 transition-all"
                    >
                      {/* Image Thumbnail */}
                      <img
                        src={loker.thumbnailUrl}
                        alt={loker.title}
                        className="h-12 w-12 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-zinc-700"
                        onError={(e: any) => {
                          e.target.src = PRESET_THUMBNAILS[0].url;
                        }}
                      />

                      {/* Info Text */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              loker.locationType === "Remote"
                                ? "bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300"
                                : "bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300"
                            }`}
                          >
                            {loker.locationType}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-300 text-[9px] font-semibold">
                            {loker.mode}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              loker.status === "ACTIVE"
                                ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                                : "bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300"
                            }`}
                          >
                            {loker.status === "ACTIVE" ? "Aktif" : "Ditutup"}
                          </span>
                        </div>

                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate mt-1">
                          {loker.title}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                          {loker.companyName} • {loker.salaryEstimate}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleToggleStatus(loker)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-teal-600 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors"
                          title={loker.status === "ACTIVE" ? "Tutup Lowongan" : "Aktifkan Lowongan"}
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleStartEdit(loker)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-teal-600 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors"
                          title="Edit Loker"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(loker.id, loker.title)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                          title="Hapus Loker"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: FORM TAMBAH / EDIT LOKER */}
          {activeTab === "form" && (
            <form onSubmit={handleSaveLoker} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800">
                <h4 className="text-xs font-black uppercase tracking-wider text-teal-700 dark:text-teal-300">
                  {editingLoker ? "Edit Data Lowongan Kerja" : "Form Input Lowongan Kerja Baru"}
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("list");
                    resetForm();
                  }}
                  className="text-xs text-slate-500 hover:underline"
                >
                  Kembali ke Daftar
                </button>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Judul Lowongan Kerja (Title) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Senior Full Stack Developer (React / Next.js)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Company Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Nama Perusahaan / Startup <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Digital Nusantara Tech"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Image Thumbnail with Presets */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Image Thumbnail (URL Gambar)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={thumbnailUrl}
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                    className="flex-1 rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <img
                    src={thumbnailUrl}
                    alt="Preview"
                    className="h-9 w-9 rounded-lg object-cover border border-slate-300 dark:border-zinc-700 shrink-0"
                    onError={(e: any) => {
                      e.target.src = PRESET_THUMBNAILS[0].url;
                    }}
                  />
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  <span className="text-[10px] text-slate-400 shrink-0">Preset Cepat:</span>
                  {PRESET_THUMBNAILS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => setThumbnailUrl(preset.url)}
                      className="shrink-0 rounded-lg border border-slate-200 dark:border-zinc-700 px-2 py-0.5 text-[10px] text-slate-600 dark:text-zinc-300 hover:border-teal-500 hover:text-teal-600"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Estimasi Pendapatan */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Estimasi Pendapatan / Gaji <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Rp 8.000.000 - Rp 14.000.000 / bln ATAU $1,000 - $1,500/bln"
                  value={salaryEstimate}
                  onChange={(e) => setSalaryEstimate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Mode & Lokasi Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Mode Kerja */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Mode Kerja
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setMode("Full Time")}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                        mode === "Full Time"
                          ? "border-teal-500 bg-teal-50 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 shadow-sm"
                          : "border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400"
                      }`}
                    >
                      Full Time
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode("Part Time")}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                        mode === "Part Time"
                          ? "border-teal-500 bg-teal-50 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 shadow-sm"
                          : "border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400"
                      }`}
                    >
                      Part Time
                    </button>
                  </div>
                </div>

                {/* Lokasi Kerja */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Lokasi Kerja
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setLocationType("Remote")}
                      className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                        locationType === "Remote"
                          ? "border-teal-500 bg-teal-50 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 shadow-sm"
                          : "border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400"
                      }`}
                    >
                      <Globe2 className="h-3.5 w-3.5" />
                      <span>Remote (WFA)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setLocationType("On-site")}
                      className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                        locationType === "On-site"
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 shadow-sm"
                          : "border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400"
                      }`}
                    >
                      <MapPin className="h-3.5 w-3.5" />
                      <span>On-site</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* CONDITIONAL INPUT: If On-site selected, show Offline Address input */}
              {locationType === "On-site" && (
                <div className="rounded-2xl border border-blue-300 dark:border-blue-500/40 bg-blue-50/60 dark:bg-blue-950/30 p-3.5 animate-in fade-in duration-150">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-blue-900 dark:text-blue-200 mb-1">
                    <MapPin className="h-3.5 w-3.5 text-rose-500" />
                    <span>Alamat Lokasi Kerja Offline (Dimana?) <span className="text-rose-500">*</span></span>
                  </label>
                  <p className="text-[11px] text-blue-800/80 dark:text-blue-300/80 mb-2">
                    Karena memilih mode On-site, masukkan alamat kantor fisik tempat karyawan harus hadir.
                  </p>
                  <textarea
                    rows={2}
                    required={locationType === "On-site"}
                    placeholder="Contoh: Gedung Bursa Efek Indonesia Tower 2 Lt. 14, SCBD, Senayan, Jakarta Selatan"
                    value={offlineAddress}
                    onChange={(e) => setOfflineAddress(e.target.value)}
                    className="w-full rounded-xl border border-blue-200 dark:border-blue-700/60 bg-white dark:bg-zinc-800 px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {/* Deskripsi Loker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Deskripsi & Kualifikasi Lowongan <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={5}
                  required
                  placeholder="Tuliskan gambaran pekerjaan, tanggung jawab utama, dan kualifikasi yang dicari..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 leading-relaxed"
                />
              </div>

              {/* Link Apply */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Link Pendaftaran / Apply (URL Eksternal)
                </label>
                <input
                  type="url"
                  placeholder="https://forms.gle/... atau https://perusahaan.com/karir"
                  value={applyUrl}
                  onChange={(e) => setApplyUrl(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Pelamar yang menekan tombol "Lamar Sekarang" akan langsung diarahkan ke tautan ini.
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("list");
                    resetForm();
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-md transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Memproses ORM...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>{editingLoker ? "Simpan Perubahan" : "Terbitkan Loker"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: SECURITY & ENV STATUS */}
          {activeTab === "firebase" && (
            <div className="space-y-4">
              {/* Security Shield Card */}
              <div className="rounded-2xl border border-emerald-300 dark:border-emerald-600/40 bg-emerald-50/70 dark:bg-emerald-950/40 p-4">
                <div className="flex items-center gap-2 text-xs font-black text-emerald-900 dark:text-emerald-200 mb-1">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Proteksi Keamanan Aktif (.env.local + LokerORM)</span>
                </div>
                <p className="text-xs text-emerald-800/90 dark:text-emerald-300/90 leading-relaxed">
                  Kredensial database <strong>TIDAK di-hardcode</strong> pada kode sumber. Semua API key, project ID, dan token terbaca aman dari file <code className="font-mono bg-black/10 dark:bg-black/40 px-1 py-0.5 rounded font-bold">.env.local</code> yang terisolasi dari repositori git.
                </p>
              </div>

              {/* Current Active Config Summary */}
              <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 p-4 space-y-2.5">
                <h5 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Database className="h-3.5 w-3.5 text-teal-600" />
                  <span>Kredensial Firebase Aktif (Environment Variables):</span>
                </h5>
                <div className="space-y-1.5 text-[11px] font-mono bg-slate-50 dark:bg-zinc-800/60 p-3 rounded-xl border border-slate-200/80 dark:border-zinc-700/60">
                  <div className="flex justify-between">
                    <span className="text-slate-500">PROJECT_ID:</span>
                    <span className="font-bold text-teal-700 dark:text-teal-300">{firebaseConfig.projectId || "Tidak terdeteksi"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">AUTH_DOMAIN:</span>
                    <span className="text-slate-700 dark:text-zinc-300">{firebaseConfig.authDomain || "Tidak terdeteksi"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">STORAGE_BUCKET:</span>
                    <span className="text-slate-700 dark:text-zinc-300">{firebaseConfig.storageBucket || "Tidak terdeteksi"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">API_KEY:</span>
                    <span className="text-slate-700 dark:text-zinc-300">
                      {firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 10)}... (Terproteksi)` : "Kosong"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Seed Button to Sync Samples */}
              <div className="rounded-2xl border border-teal-200 dark:border-teal-500/20 bg-teal-50/50 dark:bg-teal-950/30 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-teal-900 dark:text-teal-200">
                      Sinkronisasi Data Sample ke Cloud
                    </h5>
                    <p className="text-[11px] text-teal-800/80 dark:text-teal-300/80">
                      Unggah data lowongan contoh resmi ke Cloud Firestore <code className="font-mono">wfa-job</code>.
                    </p>
                  </div>
                  <button
                    onClick={handleSeedSamplesToCloud}
                    disabled={isSubmitting}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50 shrink-0"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Upload ke Cloud</span>
                  </button>
                </div>
              </div>

              {/* Production Firestore Security Rules Advice */}
              <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 p-4 space-y-2 text-xs text-slate-600 dark:text-zinc-400">
                <h5 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
                  <span>Rekomendasi Firestore Security Rules:</span>
                </h5>
                <p className="text-[11px] leading-relaxed">
                  Di Firebase Console &gt; Firestore Database &gt; Rules, pasang aturan berikut agar pembacaan publik aman dan hanya dokumen valid yang dapat disimpan:
                </p>
                <pre className="font-mono text-[10px] bg-slate-900 text-teal-300 p-3 rounded-xl overflow-x-auto leading-normal">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /lokers/{lokerId} {
      allow read: if true;
      allow write: if request.resource.data.title is string 
                   && request.resource.data.salaryEstimate is string;
    }
  }
}`}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
