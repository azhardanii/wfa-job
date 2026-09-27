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
  ShieldCheck,
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
    const stored = getStoredAdminPin();
    if (stored && isAuthenticatedAdmin(stored)) {
      setAdminPinInput(stored);
      setIsUnlocked(true);
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
      setMessage({ text: "Berhasil masuk ke panel admin.", type: "success" });
      setLokers(lokerService.getCached());
      loadLokers();
    } else {
      setPinError(true);
      setMessage({
        text: "PIN yang Anda masukkan salah. Silakan coba lagi.",
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
      setMessage({ text: "Silakan masukkan PIN admin terlebih dahulu.", type: "error" });
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
          setMessage({ text: "Lowongan kerja berhasil diperbarui.", type: "success" });
          loadLokers();
          setTimeout(() => {
            setActiveTab("list");
            resetForm();
          }, 600);
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
          setMessage({ text: "Lowongan kerja baru berhasil ditambahkan.", type: "success" });
          loadLokers();
          setTimeout(() => {
            setActiveTab("list");
            resetForm();
          }, 600);
        } else {
          setMessage({ text: res.error || "Gagal menambahkan lowongan.", type: "error" });
        }
      }
    } catch (err: any) {
      setMessage({ text: err?.message || "Terjadi kendala saat menyimpan data.", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, jobTitle: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus lowongan "${jobTitle}"?`)) {
      const res = await lokerService.delete(id, adminPinInput);
      if (res.success) {
        loadLokers();
        setMessage({ text: `Lowongan "${jobTitle}" berhasil dihapus.`, type: "success" });
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
        text: `Status lowongan diubah menjadi ${loker.status === "ACTIVE" ? "TUTUP" : "AKTIF"}.`,
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
          text: `Berhasil sinkronisasi ${res.seededCount} data lowongan ke database cloud.`,
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
  // VIEW 1: GATE / LOGIN SCREEN (Light Mode, Non-technical)
  // -------------------------------------------------------------
  if (!isUnlocked) {
    return (
      <main className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 relative">
        <div className="w-full max-w-sm">
          <div className="rounded-3xl border border-slate-200/90 bg-white p-7 sm:p-9 shadow-xl shadow-slate-200/60">
            {/* Header Icon */}
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 border border-teal-100 text-teal-600 mb-4">
              <Lock className="h-7 w-7" />
            </div>

            <div className="text-center space-y-1 mb-6">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                Masuk sebagai Admin
              </h1>
              <p className="text-xs text-slate-500 leading-relaxed">
                Silakan masukkan PIN keamanan Anda untuk mengelola lowongan kerja.
              </p>
            </div>

            {/* Error / Feedback Message */}
            {message && (
              <div
                className={`mb-5 p-3 rounded-xl border text-xs flex items-center gap-2 ${
                  message.type === "success"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : "bg-rose-50 border-rose-200 text-rose-700"
                }`}
              >
                {message.type === "success" ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
                )}
                <span>{message.text}</span>
              </div>
            )}

            {/* PIN Form */}
            <form onSubmit={handleVerifyPin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  PIN Keamanan
                </label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type={showPinText ? "text" : "password"}
                    value={adminPinInput}
                    onChange={(e) => {
                      setAdminPinInput(e.target.value);
                      setPinError(false);
                    }}
                    placeholder="Masukkan PIN..."
                    autoFocus
                    className={`w-full rounded-xl border pl-10 pr-10 py-2.5 text-sm bg-slate-50/60 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 ${
                      pinError
                        ? "border-rose-400 focus:ring-rose-200"
                        : "border-slate-300 focus:border-teal-600 focus:ring-teal-500/20"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPinText(!showPinText)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label={showPinText ? "Sembunyikan PIN" : "Tampilkan PIN"}
                  >
                    {showPinText ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-teal-600/20 active:scale-[0.99] flex items-center justify-center gap-2"
              >
                <Unlock className="h-4 w-4" />
                <span>Masuk</span>
              </button>
            </form>

            {/* Back to public link */}
            <div className="mt-6 pt-4 border-t border-slate-100 text-center">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-teal-700 transition-colors"
              >
                <span>Kembali ke Halaman Utama</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: AUTHENTICATED ADMIN DASHBOARD (Clean Light Mode)
  // -------------------------------------------------------------
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo-horisontal.webp" alt="WFA Job" className="h-5 w-auto" />
            </Link>
            <span className="h-4 w-px bg-slate-300" />
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-[10px] font-bold text-teal-700 font-mono">
              <ShieldCheck className="h-3 w-3 text-teal-600" />
              ADMIN PANEL
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm"
            >
              <ExternalLink className="h-3 w-3 text-slate-500" />
              <span>Lihat Tampilan Publik</span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-all"
              title="Kunci Akses Admin"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 pt-6 space-y-6">
        {/* Banner Alert Feedback */}
        {message && (
          <div
            className={`p-3.5 rounded-2xl border text-xs sm:text-sm flex items-center justify-between gap-2 shadow-sm ${
              message.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-rose-50 border-rose-200 text-rose-700"
            }`}
          >
            <div className="flex items-center gap-2">
              {message.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
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
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500">Total Lowongan</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{lokers.length}</div>
            <span className="text-[10px] text-teal-600 font-semibold">Terdaftar di Sistem</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500">Status Aktif</span>
            <div className="text-2xl font-black text-emerald-600 mt-1">{totalActive}</div>
            <span className="text-[10px] text-slate-500">Dapat dilamar publik</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500">Remote / WFA</span>
            <div className="text-2xl font-black text-teal-700 mt-1">{totalRemote}</div>
            <span className="text-[10px] text-slate-500">Kerja darimana saja</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
            <span className="text-[11px] font-semibold text-slate-500">On-site (Kantor)</span>
            <div className="text-2xl font-black text-blue-600 mt-1">{totalOnsite}</div>
            <span className="text-[10px] text-slate-500">Dengan alamat fisik</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("list")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "list"
                  ? "bg-teal-600 text-white font-black shadow-sm"
                  : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              Kelola Lowongan ({lokers.length})
            </button>
            <button
              onClick={handleStartCreate}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "form"
                  ? "bg-teal-600 text-white font-black shadow-sm"
                  : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{editingLoker ? "Edit Lowongan" : "Tambah Lowongan"}</span>
            </button>
            <button
              onClick={() => setActiveTab("firebase")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "firebase"
                  ? "bg-teal-600 text-white font-black shadow-sm"
                  : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Database className="h-3.5 w-3.5" />
              <span>Status Database</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-medium px-3 py-1 rounded-full border ${
                source === "firestore"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-amber-50 text-amber-800 border-amber-200"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${source === "firestore" ? "bg-emerald-500" : "bg-amber-500"}`} />
              {source === "firestore" ? "Database Cloud Terhubung" : "Database Lokal Aktif"}
            </span>

            <button
              onClick={loadLokers}
              disabled={loading}
              className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition-all shadow-sm"
              title="Refresh Data"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-teal-600" : ""}`} />
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
                className="w-full max-w-md rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm"
              />
              <button
                onClick={handleStartCreate}
                className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-sm"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Posting Loker Baru</span>
              </button>
            </div>

            {/* Lowongan Cards Grid */}
            {filteredLokers.length === 0 ? (
              <div className="py-16 text-center rounded-3xl border border-dashed border-slate-300 bg-white">
                <Building className="h-10 w-10 text-slate-400 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-slate-700">Tidak ada lowongan ditemukan</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Klik tombol &quot;Posting Loker Baru&quot; untuk menambahkan lowongan kerja pertama Anda.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredLokers.map((loker) => (
                  <div
                    key={loker.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between gap-3 shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={loker.thumbnailUrl}
                        alt={loker.title}
                        className="h-16 w-16 rounded-xl object-cover border border-slate-100 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span
                            className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              loker.status === "ACTIVE"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-slate-100 text-slate-600 border border-slate-200"
                            }`}
                          >
                            {loker.status === "ACTIVE" ? "AKTIF" : "TUTUP"}
                          </span>
                          <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
                            {loker.mode}
                          </span>
                          <span className="text-[10px] font-medium text-slate-600 flex items-center gap-1">
                            {loker.locationType === "Remote" ? (
                              <Globe2 className="h-3 w-3 text-teal-600" />
                            ) : (
                              <MapPin className="h-3 w-3 text-blue-600" />
                            )}
                            {loker.locationType}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 truncate leading-snug">
                          {loker.title}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium truncate">
                          {loker.companyName}
                        </p>
                        <p className="text-xs font-bold text-teal-700 mt-1">
                          {loker.salaryEstimate}
                        </p>
                        {loker.locationType === "On-site" && loker.offlineAddress && (
                          <p className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg mt-1 inline-flex items-center gap-1 truncate max-w-full">
                            <MapPin className="h-3 w-3 shrink-0" />
                            <span className="truncate">{loker.offlineAddress}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleToggleStatus(loker)}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all ${
                          loker.status === "ACTIVE"
                            ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                        }`}
                      >
                        {loker.status === "ACTIVE" ? "Tutup Loker" : "Aktifkan"}
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleStartEdit(loker)}
                          className="flex items-center gap-1 px-3 py-1 rounded-lg bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold hover:bg-teal-100 transition-all"
                        >
                          <Edit2 className="h-3 w-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(loker.id, loker.title)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold hover:bg-rose-100 transition-all"
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
          <div className="max-w-2xl mx-auto rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-black text-slate-900">
                  {editingLoker ? "Edit Lowongan Kerja" : "Posting Lowongan Kerja Baru"}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Lengkapi data di bawah ini untuk memperbarui lowongan kerja.
                </p>
              </div>
              <button
                onClick={() => {
                  resetForm();
                  setActiveTab("list");
                }}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                Batal
              </button>
            </div>

            <form onSubmit={handleSaveLoker} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Judul Pekerjaan <span className="text-teal-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Senior Remote Frontend Engineer"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                />
              </div>

              {/* Company */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Perusahaan <span className="text-teal-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Contoh: TechCorp Indonesia"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                />
              </div>

              {/* Thumbnail URL & Presets */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Gambar Thumbnail (URL) <span className="text-teal-600">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 font-mono"
                />
                <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-slate-500 font-semibold">Pilihan Cepat Gambar:</span>
                  {PRESET_THUMBNAILS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => setThumbnailUrl(preset.url)}
                      className={`text-[10px] px-2.5 py-1 rounded-lg font-medium transition-all ${
                        thumbnailUrl === preset.url
                          ? "bg-teal-600 text-white font-bold"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Salary Estimate */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Estimasi Pendapatan / Gaji <span className="text-teal-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={salaryEstimate}
                  onChange={(e) => setSalaryEstimate(e.target.value)}
                  placeholder="Contoh: Rp 8.000.000 - Rp 14.000.000 / bln"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                />
              </div>

              {/* Mode & Location Type Dual Input */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mode Kerja
                  </label>
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value as JobWorkMode)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                  >
                    <option value="Full Time">Full Time</option>
                    <option value="Part Time">Part Time</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tipe Lokasi
                  </label>
                  <select
                    value={locationType}
                    onChange={(e) => setLocationType(e.target.value as JobLocationType)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-teal-600"
                  >
                    <option value="Remote">Remote (WFA)</option>
                    <option value="On-site">On-site (Offline)</option>
                  </select>
                </div>
              </div>

              {/* DYNAMIC FIELD: On-site Offline Address */}
              {locationType === "On-site" && (
                <div className="p-3.5 rounded-2xl border border-amber-200 bg-amber-50/70 space-y-1.5">
                  <label className="block text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-amber-700" />
                    <span>Alamat Lokasi Kerja Offline (Kantor Fisik) *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={offlineAddress}
                    onChange={(e) => setOfflineAddress(e.target.value)}
                    placeholder="Contoh: Gedung Bursa Efek Tower 2 Lt. 15, SCBD Jakarta Selatan"
                    className="w-full rounded-xl border border-amber-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-600"
                  />
                  <p className="text-[10px] text-amber-700">
                    Karena Anda memilih On-site, alamat kantor wajib diisi agar pelamar mengetahui lokasi kerja.
                  </p>
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Deskripsi Pekerjaan & Kualifikasi <span className="text-teal-600">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tuliskan tanggung jawab, kualifikasi kandidat, persyaratan teknis, dan benefit kerja..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                />
              </div>

              {/* Apply URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Link Pendaftaran / Apply URL <span className="text-teal-600">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={applyUrl}
                  onChange={(e) => setApplyUrl(e.target.value)}
                  placeholder="https://t.me/recruiter / https://linkedin.com/jobs/..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 font-mono"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setActiveTab("list");
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-teal-600/20 active:scale-[0.99] flex items-center gap-1.5"
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

        {/* TAB 3: STATUS DATABASE */}
        {activeTab === "firebase" && (
          <div className="max-w-2xl mx-auto rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 border border-teal-200 text-teal-700">
                <Database className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900">
                  Status Database Lowongan
                </h2>
                <p className="text-xs text-slate-500">
                  Status koneksi database cloud dan sinkronisasi data.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 block">Status Koneksi:</span>
                <span className="text-sm font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
                  {isFirebaseConfigured() ? (
                    <>
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      <span className="text-emerald-700">Terhubung & Aktif</span>
                    </>
                  ) : (
                    <>
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                      <span className="text-amber-700">Mode Penyimpanan Lokal</span>
                    </>
                  )}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-500">Total Lowongan:</span>
                <span className="block text-sm font-bold text-teal-700">
                  {lokers.length} Lowongan
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200 space-y-2.5">
              <h4 className="text-xs font-bold text-teal-800 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-teal-600" />
                <span>Sinkronkan Contoh Data Lowongan</span>
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Gunakan tombol di bawah ini jika ingin mengisi database cloud dengan data awal lowongan kerja secara otomatis.
              </p>
              <button
                type="button"
                onClick={handleSeedSamplesToCloud}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Menyinkronkan...</span>
                  </>
                ) : (
                  <>
                    <Database className="h-3.5 w-3.5" />
                    <span>Sinkronkan Data Lowongan</span>
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
