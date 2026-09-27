"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { WfaLoker, JobWorkMode, JobLocationType } from "@/types/loker";
import {
  lokerService,
  getStoredAdminPin,
  saveAdminSessionPin,
  isAuthenticatedAdmin,
} from "@/lib/lokerService";
import { firebaseConfig, isFirebaseConfigured } from "@/lib/firebase";
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  Key,
  Database,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Globe2,
  MapPin,
  ExternalLink,
  RefreshCw,
  Eye,
  EyeOff,
  LogOut,
  Building,
  Check,
  Sparkles,
  ArrowRight,
  Sliders,
} from "lucide-react";

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

export default function AdminPage() {
  // Authentication & Gate
  const [adminPinInput, setAdminPinInput] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinError, setPinError] = useState(false);
  const [showPinText, setShowPinText] = useState(false);

  // Dashboard state
  const [lokers, setLokers] = useState<WfaLoker[]>([]);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<"firestore" | "local">("local");
  const [activeTab, setActiveTab] = useState<"list" | "form" | "firebase">("list");
  const [editingLoker, setEditingLoker] = useState<WfaLoker | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [filterSearch, setFilterSearch] = useState("");

  // Form Fields
  const [title, setTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState(PRESET_THUMBNAILS[0].url);
  const [salaryEstimate, setSalaryEstimate] = useState("");
  const [mode, setMode] = useState<JobWorkMode>("Full Time");
  const [locationType, setLocationType] = useState<JobLocationType>("Remote");
  const [offlineAddress, setOfflineAddress] = useState("");
  const [description, setDescription] = useState("");
  const [applyUrl, setApplyUrl] = useState("");

  const loadLokers = async () => {
    setLoading(true);
    try {
      const res = await lokerService.getAll();
      setLokers(res.lokers);
      setSource(res.source);
    } catch (err) {
      console.error("Gagal memuat lowongan", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if session PIN already authenticated
    const stored = getStoredAdminPin();
    if (stored && isAuthenticatedAdmin(stored)) {
      setAdminPinInput(stored);
      setIsUnlocked(true);
      // Immediately load cached lokers, then refresh
      setLokers(lokerService.getCached());
      loadLokers();
    }
  }, []);

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAuthenticatedAdmin(adminPinInput)) {
      saveAdminSessionPin(adminPinInput);
      setIsUnlocked(true);
      setPinError(false);
      setMessage({ text: "Otorisasi Admin Berhasil! Hak akses terbuka.", type: "success" });
      setLokers(lokerService.getCached());
      loadLokers();
    } else {
      setPinError(true);
      setMessage({
        text: "PIN Keamanan Admin salah. Silakan periksa kunci NEXT_PUBLIC_ADMIN_PIN di file .env.local!",
        type: "error",
      });
    }
  };

  const handleLogout = () => {
    saveAdminSessionPin("");
    setAdminPinInput("");
    setIsUnlocked(false);
    setMessage(null);
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
          loadLokers();
          setTimeout(() => {
            setActiveTab("list");
            resetForm();
          }, 800);
        } else {
          setMessage({ text: res.error || "Gagal memperbarui lowongan.", type: "error" });
        }
      } else {
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
          loadLokers();
          setTimeout(() => {
            setActiveTab("list");
            resetForm();
          }, 800);
        } else {
          setMessage({ text: res.error || "Gagal membuat lowongan.", type: "error" });
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
        loadLokers();
        setMessage({ text: `Loker "${jobTitle}" telah dihapus dengan aman.`, type: "success" });
      } else {
        setMessage({ text: res.error || "Gagal menghapus lowongan.", type: "error" });
      }
    }
  };

  const handleToggleStatus = async (loker: WfaLoker) => {
    const res = await lokerService.toggleStatus(loker.id, adminPinInput);
    if (res.success) {
      loadLokers();
      setMessage({
        text: `Status loker diubah menjadi ${loker.status === "ACTIVE" ? "DITUTUP" : "AKTIF"}.`,
        type: "success",
      });
    }
  };

  const handleSeedSamplesToCloud = async () => {
    setIsSubmitting(true);
    setMessage(null);
    try {
      const res = await lokerService.seedToFirestore(adminPinInput);
      if (res.success) {
        setMessage({
          text: `Berhasil sinkronisasi ${res.seededCount} data loker ke cloud Firestore!`,
          type: "success",
        });
        loadLokers();
      } else {
        setMessage({ text: res.error || res.message || "Gagal sinkronisasi.", type: "error" });
      }
    } catch (err: any) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered Lokers for Admin list
  const filteredLokers = lokers.filter((l) => {
    if (!filterSearch.trim()) return true;
    const q = filterSearch.toLowerCase();
    return (
      l.title.toLowerCase().includes(q) ||
      l.companyName.toLowerCase().includes(q) ||
      (l.offlineAddress || "").toLowerCase().includes(q)
    );
  });

  const totalRemote = lokers.filter((l) => l.locationType === "Remote").length;
  const totalOnsite = lokers.filter((l) => l.locationType === "On-site").length;
  const totalActive = lokers.filter((l) => l.status === "ACTIVE").length;

  // -------------------------------------------------------------
  // VIEW 1: GATE / LOCKED SCREEN (Only accessible with Admin PIN)
  // -------------------------------------------------------------
  if (!isUnlocked) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
          <div className="rounded-3xl border border-teal-500/20 bg-slate-900/90 backdrop-blur-xl p-6 sm:p-8 shadow-2xl">
            {/* Header Icon */}
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-500/15 border border-teal-500/30 text-teal-400 mb-5">
              <Lock className="h-7 w-7" />
            </div>

            <div className="text-center space-y-1.5 mb-6">
              <span className="inline-block px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-[10px] font-mono font-bold text-teal-300 uppercase tracking-widest">
                INTERNAL RESTRICTED AREA
              </span>
              <h1 className="text-xl font-black text-white tracking-tight">
                Portal Administrasi WFA Job
              </h1>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                Halaman ini khusus administrator untuk mengelola database lowongan kerja WFA & sinkronisasi Firestore.
              </p>
            </div>

            {/* Error Message */}
            {message && (
              <div
                className={`mb-5 p-3 rounded-xl border text-xs flex items-center gap-2 ${
                  message.type === "success"
                    ? "bg-emerald-950/80 border-emerald-500/40 text-emerald-300"
                    : "bg-rose-950/80 border-rose-500/40 text-rose-300"
                }`}
              >
                {message.type === "success" ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                ) : (
                  <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
                )}
                <span>{message.text}</span>
              </div>
            )}

            {/* PIN Form */}
            <form onSubmit={handleVerifyPin} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Master Security PIN:
                </label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-teal-400" />
                  <input
                    type={showPinText ? "text" : "password"}
                    value={adminPinInput}
                    onChange={(e) => {
                      setAdminPinInput(e.target.value);
                      setPinError(false);
                    }}
                    placeholder="Masukkan PIN Admin..."
                    autoFocus
                    className={`w-full rounded-xl border pl-10 pr-10 py-3 text-sm bg-slate-950 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 font-mono ${
                      pinError
                        ? "border-rose-500 focus:ring-rose-500"
                        : "border-slate-800 focus:border-teal-500 focus:ring-teal-500/40"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPinText(!showPinText)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPinText ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="mt-1.5 text-[10px] text-slate-500">
                  Default PIN diatur via <code className="text-teal-400 font-mono">NEXT_PUBLIC_ADMIN_PIN</code> di <code className="text-slate-300 font-mono">.env.local</code>.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-teal-500/20 active:scale-98 flex items-center justify-center gap-2"
              >
                <Unlock className="h-4 w-4" />
                <span>Buka Akses Admin</span>
              </button>
            </form>

            {/* Back to public link */}
            <div className="mt-6 pt-4 border-t border-slate-800 text-center">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-teal-400 transition-colors"
              >
                <span>Kembali ke Halaman Utama User</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: AUTHENTICATED ADMIN DASHBOARD
  // -------------------------------------------------------------
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo-horisontal.webp" alt="WFA Job" className="h-5 w-auto" />
            </Link>
            <span className="h-4 w-px bg-slate-700" />
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-500/15 border border-teal-500/30 text-[10px] font-bold text-teal-300 font-mono">
              <ShieldCheck className="h-3 w-3 text-teal-400" />
              ADMIN MASTER PANEL
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800/80 text-xs text-slate-300 hover:text-white hover:border-slate-600 transition-all"
            >
              <ExternalLink className="h-3 w-3" />
              <span>Lihat Tampilan Publik</span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-500/30 bg-rose-950/40 text-xs font-bold text-rose-300 hover:bg-rose-900/40 transition-all"
              title="Kunci Akses Admin"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Kunci & Keluar</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 pt-6 space-y-6">
        {/* Banner Alert Feedback */}
        {message && (
          <div
            className={`p-3.5 rounded-2xl border text-xs sm:text-sm flex items-center justify-between gap-2 shadow-lg ${
              message.type === "success"
                ? "bg-emerald-950/80 border-emerald-500/40 text-emerald-300"
                : "bg-rose-950/80 border-rose-500/40 text-rose-300"
            }`}
          >
            <div className="flex items-center gap-2">
              {message.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400" />
              )}
              <span>{message.text}</span>
            </div>
            <button
              onClick={() => setMessage(null)}
              className="text-xs opacity-70 hover:opacity-100 font-bold px-2 py-0.5"
            >
              Tutup
            </button>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400">Total Lowongan</span>
            <div className="text-2xl font-black text-white mt-1">{lokers.length}</div>
            <span className="text-[10px] text-teal-400 font-medium">Terdaftar di Sistem</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400">Status Aktif</span>
            <div className="text-2xl font-black text-emerald-400 mt-1">{totalActive}</div>
            <span className="text-[10px] text-slate-500">Dapat dilamar publik</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400">Remote / WFA</span>
            <div className="text-2xl font-black text-teal-300 mt-1">{totalRemote}</div>
            <span className="text-[10px] text-slate-500">Kerja darimana saja</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400">On-site (Kantor)</span>
            <div className="text-2xl font-black text-amber-300 mt-1">{totalOnsite}</div>
            <span className="text-[10px] text-slate-500">Dengan alamat fisik</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-3 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("list")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "list"
                  ? "bg-teal-500 text-slate-950 font-black shadow-md shadow-teal-500/20"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              Kelola Lowongan ({lokers.length})
            </button>
            <button
              onClick={handleStartCreate}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "form"
                  ? "bg-teal-500 text-slate-950 font-black shadow-md shadow-teal-500/20"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{editingLoker ? "Edit Lowongan" : "Tambah Lowongan"}</span>
            </button>
            <button
              onClick={() => setActiveTab("firebase")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "firebase"
                  ? "bg-teal-500 text-slate-950 font-black shadow-md shadow-teal-500/20"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              <Database className="h-3.5 w-3.5" />
              <span>Status Firebase</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-mono px-3 py-1 rounded-full border ${
                source === "firestore"
                  ? "bg-emerald-950/70 text-emerald-300 border-emerald-500/40"
                  : "bg-amber-950/70 text-amber-300 border-amber-500/40"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${source === "firestore" ? "bg-emerald-400" : "bg-amber-400"}`} />
              {source === "firestore" ? "Firestore Realtime" : "Database Lokal Aktif"}
            </span>

            <button
              onClick={loadLokers}
              disabled={loading}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 transition-all"
              title="Refresh Data"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-teal-400" : ""}`} />
            </button>
          </div>
        </div>

        {/* TAB 1: LIST LOWONGAN */}
        {activeTab === "list" && (
          <div className="space-y-4">
            {/* Quick Search */}
            <div className="flex items-center justify-between gap-3">
              <input
                type="text"
                value={filterSearch}
                onChange={(e) => setFilterSearch(e.target.value)}
                placeholder="Cari lowongan berdasarkan judul, perusahaan, atau alamat..."
                className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <button
                onClick={handleStartCreate}
                className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-black transition-all shadow-md"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Posting Loker Baru</span>
              </button>
            </div>

            {/* Lowongan Table/Cards */}
            {filteredLokers.length === 0 ? (
              <div className="py-16 text-center rounded-3xl border border-dashed border-slate-800 bg-slate-900/40">
                <Building className="h-10 w-10 text-slate-600 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-slate-300">Tidak ada lowongan ditemukan</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Klik tombol &quot;Posting Loker Baru&quot; untuk menambahkan lowongan pertama Anda.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredLokers.map((loker) => (
                  <div
                    key={loker.id}
                    className="p-4 rounded-2xl border border-slate-800 bg-slate-900 hover:border-slate-700 transition-all flex flex-col justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={loker.thumbnailUrl}
                        alt={loker.title}
                        className="h-16 w-16 rounded-xl object-cover border border-slate-800 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span
                            className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                              loker.status === "ACTIVE"
                                ? "bg-emerald-950 text-emerald-300 border border-emerald-500/40"
                                : "bg-slate-800 text-slate-400 border border-slate-700"
                            }`}
                          >
                            {loker.status === "ACTIVE" ? "AKTIF" : "DRAFT"}
                          </span>
                          <span className="text-[10px] font-bold text-teal-400 bg-teal-950/60 border border-teal-500/30 px-2 py-0.5 rounded-full">
                            {loker.mode}
                          </span>
                          <span className="text-[10px] font-medium text-slate-400 flex items-center gap-1">
                            {loker.locationType === "Remote" ? (
                              <Globe2 className="h-3 w-3 text-teal-400" />
                            ) : (
                              <MapPin className="h-3 w-3 text-amber-400" />
                            )}
                            {loker.locationType}
                          </span>
                        </div>
                        <h3 className="text-sm font-black text-white truncate leading-snug">
                          {loker.title}
                        </h3>
                        <p className="text-xs text-slate-400 font-medium truncate">
                          {loker.companyName}
                        </p>
                        <p className="text-xs font-bold text-emerald-400 mt-1">
                          {loker.salaryEstimate}
                        </p>
                        {loker.locationType === "On-site" && loker.offlineAddress && (
                          <p className="text-[10px] text-amber-300/90 mt-0.5 flex items-center gap-1 truncate">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span>{loker.offlineAddress}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleToggleStatus(loker)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all ${
                          loker.status === "ACTIVE"
                            ? "bg-slate-800 text-slate-300 hover:bg-slate-700"
                            : "bg-emerald-900/60 text-emerald-300 border border-emerald-500/40"
                        }`}
                      >
                        {loker.status === "ACTIVE" ? "Tutup Loker" : "Aktifkan"}
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleStartEdit(loker)}
                          className="flex items-center gap-1 px-3 py-1 rounded-lg bg-teal-950/80 border border-teal-500/40 text-teal-300 text-xs font-bold hover:bg-teal-900 transition-all"
                        >
                          <Edit2 className="h-3 w-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(loker.id, loker.title)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-950/80 border border-rose-500/40 text-rose-300 text-xs font-bold hover:bg-rose-900 transition-all"
                          title="Hapus Lowongan"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: FORM TAMBAH / EDIT LOWONGAN */}
        {activeTab === "form" && (
          <div className="max-w-2xl mx-auto rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h2 className="text-lg font-black text-white">
                  {editingLoker ? "Edit Lowongan Kerja" : "Posting Lowongan Kerja Baru"}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Data otomatis tervalidasi via LokerORM & tersinkronisasi ke Firebase.
                </p>
              </div>
              <button
                onClick={() => {
                  resetForm();
                  setActiveTab("list");
                }}
                className="text-xs text-slate-400 hover:text-white"
              >
                Batal
              </button>
            </div>

            <form onSubmit={handleSaveLoker} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Judul Pekerjaan / Job Title <span className="text-teal-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Senior Remote Frontend Engineer (Next.js)"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </div>

              {/* Company */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Nama Perusahaan / Startup <span className="text-teal-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Contoh: TechCorp Global Ltd"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </div>

              {/* Thumbnail URL & Presets */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Image Thumbnail URL <span className="text-teal-400">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 font-mono"
                />
                <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-400 font-semibold">Pilih Preset Gambar:</span>
                  {PRESET_THUMBNAILS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => setThumbnailUrl(preset.url)}
                      className={`text-[10px] px-2.5 py-1 rounded-lg font-medium transition-all ${
                        thumbnailUrl === preset.url
                          ? "bg-teal-500 text-slate-950 font-bold"
                          : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Salary Estimate */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Estimasi Pendapatan / Gaji <span className="text-teal-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={salaryEstimate}
                  onChange={(e) => setSalaryEstimate(e.target.value)}
                  placeholder="Contoh: Rp 12.000.000 - Rp 20.000.000 / bln"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </div>

              {/* Mode & Location Type Dual Input */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Mode Kerja
                  </label>
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value as JobWorkMode)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="Full Time">Full Time</option>
                    <option value="Part Time">Part Time</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Tipe Lokasi
                  </label>
                  <select
                    value={locationType}
                    onChange={(e) => setLocationType(e.target.value as JobLocationType)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
                  >
                    <option value="Remote">Remote (WFA)</option>
                    <option value="On-site">On-site (Offline)</option>
                  </select>
                </div>
              </div>

              {/* DYNAMIC FIELD: On-site Offline Address */}
              {locationType === "On-site" && (
                <div className="p-3.5 rounded-2xl border border-amber-500/40 bg-amber-950/20 space-y-1.5 animate-fadeIn">
                  <label className="block text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>Alamat Lokasi Kerja Offline (Kantor Fisik) *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={offlineAddress}
                    onChange={(e) => setOfflineAddress(e.target.value)}
                    placeholder="Contoh: Gedung Bursa Efek Tower 2 Lt. 15, SCBD Jakarta Selatan"
                    className="w-full rounded-xl border border-amber-500/30 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400"
                  />
                  <p className="text-[10px] text-amber-200/70">
                    Karena Anda memilih On-site, alamat kantor wajib diisi agar pelamar mengetahui lokasi kerja.
                  </p>
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Deskripsi Pekerjaan & Kualifikasi <span className="text-teal-400">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tuliskan tanggung jawab, kualifikasi kandidat, persyaratan teknis, dan benefit kerja..."
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </div>

              {/* Apply URL */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Link Pendaftaran / Apply URL <span className="text-teal-400">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={applyUrl}
                  onChange={(e) => setApplyUrl(e.target.value)}
                  placeholder="https://t.me/recruiter / https://linkedin.com/jobs/..."
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 font-mono"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setActiveTab("list");
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-xs font-bold text-slate-400 hover:text-white transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-teal-500/20 active:scale-98 flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>{editingLoker ? "Simpan Perubahan" : "Terbitkan Lowongan"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: STATUS FIREBASE */}
        {activeTab === "firebase" && (
          <div className="max-w-2xl mx-auto rounded-3xl border border-slate-800 bg-slate-900 p-6 sm:p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                <Database className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-base font-black text-white">
                  Integrasi Cloud Firestore
                </h2>
                <p className="text-xs text-slate-400">
                  Status koneksi database Firestore & kredensial lingkungan.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 block">Status Konfigurasi:</span>
                  <span className="text-sm font-black text-white flex items-center gap-1.5 mt-0.5">
                    {isFirebaseConfigured() ? (
                      <>
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-emerald-300">Terkonfigurasi Aktif</span>
                      </>
                    ) : (
                      <>
                        <span className="h-2 w-2 rounded-full bg-rose-400" />
                        <span className="text-rose-300">Belum Terhubung</span>
                      </>
                    )}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-mono text-slate-500">Project ID:</span>
                  <span className="block text-xs font-mono text-teal-400 font-bold">
                    {firebaseConfig.projectId || "Tidak terdefinisi"}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 block">Kredensial (.env.local):</span>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2 rounded-lg bg-slate-900 text-slate-300 border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">API Key:</span>
                    <span className="truncate block">
                      {firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 10)}...` : "KOSONG"}
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 text-slate-300 border border-slate-800">
                    <span className="text-slate-500 text-[10px] block">Auth Domain:</span>
                    <span className="truncate block">{firebaseConfig.authDomain || "KOSONG"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-teal-950/30 border border-teal-500/30 space-y-3">
              <h4 className="text-xs font-bold text-teal-300 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4" />
                <span>Upload Data Awal / Sampel ke Firestore</span>
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Jika database Firestore Anda masih kosong, Anda dapat menekan tombol di bawah untuk mengunggah kumpulan data lowongan awal ke Firestore cloud dalam 1 klik.
              </p>
              <button
                type="button"
                onClick={handleSeedSamplesToCloud}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-black transition-all flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Mengunggah...</span>
                  </>
                ) : (
                  <>
                    <Database className="h-3.5 w-3.5" />
                    <span>Sinkronkan Sampel Lowongan ke Firestore</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
