"use client";

import React, { useState } from "react";
import { useStore } from "@/context/StoreContext";
import { Job, JobMode } from "@/types";
import { formatUSD, formatIDR, formatDual } from "@/lib/store";
import {
  X,
  Sparkles,
  Zap,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Plus,
  Trash2,
  FileText,
} from "lucide-react";

export function PostJobWizard() {
  const { showPostJobModal, setShowPostJobModal, createJob, setSelectedJob } = useStore();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [category, setCategory] = useState<Job["category"]>("Design & Creative");
  const [mode, setMode] = useState<JobMode>("OFFER");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadlineDays, setDeadlineDays] = useState<number>(5);
  const [budgetUSD, setBudgetUSD] = useState<number>(100);
  const [spotLimit, setSpotLimit] = useState<number>(5);
  const [milestones, setMilestones] = useState<{ title: string; amount: number }[]>([
    { title: "Milestone 1: Draft Awal & Konsep", amount: 50 },
    { title: "Milestone 2: Finalisasi & File Serah Terima", amount: 50 },
  ]);

  if (!showPostJobModal) return null;

  const handleAddMilestone = () => {
    const defaultAmount = Math.max(5, Math.floor(budgetUSD / (milestones.length + 1)));
    setMilestones([...milestones, { title: `Milestone ${milestones.length + 1}: Hasil Lanjutan`, amount: defaultAmount }]);
  };

  const handleRemoveMilestone = (index: number) => {
    if (milestones.length <= 1) return;
    setMilestones(milestones.filter((_, idx) => idx !== index));
  };

  const handleMilestoneChange = (index: number, field: "title" | "amount", val: any) => {
    const updated = [...milestones];
    updated[index] = { ...updated[index], [field]: val };
    setMilestones(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert("Mohon lengkapi judul dan deskripsi pekerjaan.");
      return;
    }

    const newJob = createJob({
      title,
      description,
      category,
      mode,
      budget: budgetUSD,
      deadlineDays,
      spotLimit: mode === "SPOT" ? spotLimit : undefined,
      milestones: mode === "OFFER" ? milestones : undefined,
    });

    setShowPostJobModal(false);
    setSelectedJob(newJob);
    // Reset form
    setStep(1);
    setTitle("");
    setDescription("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center p-0 sm:p-4">
      <div className="flex max-h-[94vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-teal-500/30 bg-white dark:bg-obsidian-950 text-slate-900 dark:text-white shadow-2xl animate-in fade-in slide-in-from-bottom duration-200">
        {/* Wizard Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-teal-500/20 bg-slate-50 dark:bg-teal-950/70 px-5 py-3.5">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-700 dark:text-teal-300">
              Wizard Post Job • Step {step} dari 4
            </span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {step === 1 && "1. Pilih Mode & Kategori"}
              {step === 2 && "2. Detail & Deadline"}
              {step === 3 && "3. Budget & Sistem Escrow"}
              {step === 4 && "4. Review & Kontrak Digital"}
            </h3>
          </div>

          <button
            onClick={() => setShowPostJobModal(false)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 dark:bg-teal-900/50 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="h-1 w-full bg-slate-200 dark:bg-obsidian-900">
          <div
            className="h-full bg-teal-600 dark:bg-gradient-to-r dark:from-teal-400 dark:to-emerald-400 transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          ></div>
        </div>

        {/* Wizard Content */}
        <div className="overflow-y-auto p-5 space-y-4">
          {/* STEP 1: MODE & CATEGORY */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-teal-200 block mb-2">
                  Pilih Mode Pengerjaan:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {/* OFFER MODE */}
                  <div
                    onClick={() => setMode("OFFER")}
                    className={`cursor-pointer rounded-2xl border p-3.5 transition-all ${
                      mode === "OFFER"
                        ? "border-teal-500 bg-teal-50 dark:bg-teal-900/40 shadow-sm dark:shadow-teal-glow"
                        : "border-slate-200 dark:border-teal-500/20 bg-white dark:bg-teal-950/20 hover:border-teal-400"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Sparkles className="h-5 w-5 text-teal-600 dark:text-teal-300" />
                      {mode === "OFFER" && <CheckCircle2 className="h-4 w-4 text-teal-600 dark:text-teal-400" />}
                    </div>
                    <h4 className="mt-2 text-xs font-bold text-slate-900 dark:text-white">Offer Mode</h4>
                    <p className="mt-1 text-[11px] text-slate-600 dark:text-zinc-300 leading-tight">
                      Job kustom/kompleks. Worker submit proposal offer, Anda pilih 1 pemenang terbaik.
                    </p>
                  </div>

                  {/* SPOT MODE */}
                  <div
                    onClick={() => setMode("SPOT")}
                    className={`cursor-pointer rounded-2xl border p-3.5 transition-all ${
                      mode === "SPOT"
                        ? "border-amber-500 bg-amber-50 dark:bg-amber-950/50 shadow-sm"
                        : "border-slate-200 dark:border-teal-500/20 bg-white dark:bg-teal-950/20 hover:border-amber-400"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Zap className="h-5 w-5 text-amber-500 fill-amber-500" />
                      {mode === "SPOT" && <CheckCircle2 className="h-4 w-4 text-amber-600 dark:text-amber-400" />}
                    </div>
                    <h4 className="mt-2 text-xs font-bold text-slate-900 dark:text-white">Spot Mode</h4>
                    <p className="mt-1 text-[11px] text-slate-600 dark:text-zinc-300 leading-tight">
                      Microtask volume banyak. Worker klaim spot instan dengan timer 15 menit.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-teal-200 block mb-2">
                  Kategori Pekerjaan:
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-300 dark:border-teal-500/30 bg-white dark:bg-teal-950/60 p-3 text-xs text-slate-900 dark:text-white focus:border-teal-500 focus:outline-none"
                >
                  <option value="Design & Creative">Design & Creative (Figma, Logo, UI/UX)</option>
                  <option value="Dev & IT">Dev & IT (Web, Next.js, API, Backend)</option>
                  <option value="Virtual Assisting">Virtual Assisting (Data Entry, Admin, CS)</option>
                  <option value="Video & Animation">Video & Animation (Reels, TikTok, Motion)</option>
                  <option value="Writing & Copy">Writing & Copy (SEO, Translate, Caption)</option>
                  <option value="Gaming & Microtask">Gaming & Microtask (Testing, Annotation)</option>
                  <option value="Other">Lainnya</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 2: DETAIL & SCOPE */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-teal-200 block mb-1.5">
                  Judul Pekerjaan:
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Redesign UI Mobile Banking Figma 5 Screens"
                  className="w-full rounded-xl border border-slate-300 dark:border-teal-500/30 bg-white dark:bg-teal-950/60 p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-400 focus:border-teal-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-teal-200 block mb-1.5">
                  Deskripsi & Scope Deliverable:
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  placeholder="Jelaskan kebutuhan spesifik, format file hasil, batasan revisi, dan detail teknis..."
                  className="w-full rounded-xl border border-slate-300 dark:border-teal-500/30 bg-white dark:bg-teal-950/60 p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-400 focus:border-teal-500 focus:outline-none leading-relaxed"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-teal-200 block mb-1.5">
                  Target Deadline (Hari):
                </label>
                <div className="flex items-center gap-2">
                  {[3, 5, 7, 14, 30].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setDeadlineDays(days)}
                      className={`flex-1 rounded-xl py-2 text-xs font-bold transition-all ${
                        deadlineDays === days
                          ? "bg-teal-600 dark:bg-teal-400 text-white dark:text-obsidian-950 font-black shadow-sm"
                          : "border border-slate-300 dark:border-teal-500/20 bg-slate-50 dark:bg-teal-950/40 text-slate-700 dark:text-zinc-300 hover:bg-slate-100"
                      }`}
                    >
                      {days} Hari
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: BUDGET & ESCROW (USD) */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-teal-200 block mb-1.5">
                  {mode === "SPOT" ? "Reward ($) per 1 Spot Selesai:" : "Total Budget Escrow ($ USD):"}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-teal-600 dark:text-teal-400">$</span>
                  <input
                    type="number"
                    value={budgetUSD}
                    onChange={(e) => setBudgetUSD(Number(e.target.value))}
                    min={1}
                    step={1}
                    className="w-full rounded-xl border border-slate-300 dark:border-teal-500/30 bg-white dark:bg-teal-950/60 py-2.5 pl-8 pr-3 font-mono text-sm font-bold text-slate-900 dark:text-white focus:border-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* If SPOT MODE: Spot Limit */}
              {mode === "SPOT" && (
                <div>
                  <label className="text-xs font-bold text-amber-800 dark:text-amber-300 block mb-1.5">
                    Jumlah Kuota Spot Worker:
                  </label>
                  <div className="flex items-center gap-2">
                    {[3, 5, 10, 20, 50].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setSpotLimit(num)}
                        className={`flex-1 rounded-xl py-2 text-xs font-bold ${
                          spotLimit === num
                            ? "bg-amber-500 text-white font-black"
                            : "border border-amber-300 dark:border-amber-500/20 bg-amber-50/50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200"
                        }`}
                      >
                        {num} Spot
                      </button>
                    ))}
                  </div>
                  <div className="mt-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 p-2.5 text-[11px] text-amber-900 dark:text-amber-200/90 border border-amber-200 dark:border-amber-500/20">
                    Total alokasi budget spot:{" "}
                    <span className="font-bold text-slate-900 dark:text-white">{formatUSD(budgetUSD * spotLimit)}</span>
                  </div>
                </div>
              )}

              {/* If OFFER MODE: Milestones */}
              {mode === "OFFER" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-800 dark:text-teal-200">
                      Rencana Milestone Pembayaran:
                    </label>
                    <button
                      type="button"
                      onClick={handleAddMilestone}
                      className="flex items-center gap-1 text-xs font-bold text-teal-700 dark:text-teal-300 hover:text-teal-600"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Tambah
                    </button>
                  </div>

                  <div className="space-y-2">
                    {milestones.map((m, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-teal-500/20 bg-slate-50 dark:bg-teal-950/40 p-2.5 text-xs"
                      >
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900 text-[10px] font-bold text-teal-800 dark:text-teal-300">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={m.title}
                          onChange={(e) => handleMilestoneChange(idx, "title", e.target.value)}
                          placeholder="Judul milestone"
                          className="flex-1 rounded bg-white dark:bg-black/40 px-2 py-1 text-xs text-slate-900 dark:text-white border border-slate-300 dark:border-teal-500/20"
                        />
                        <div className="relative">
                          <span className="absolute left-1.5 top-1 text-[10px] text-teal-600 dark:text-teal-400 font-bold">$</span>
                          <input
                            type="number"
                            value={m.amount}
                            onChange={(e) => handleMilestoneChange(idx, "amount", Number(e.target.value))}
                            placeholder="USD"
                            className="w-20 rounded bg-white dark:bg-black/40 py-1 pl-4 pr-1 font-mono text-xs text-teal-800 dark:text-teal-300 border border-slate-300 dark:border-teal-500/20 text-right"
                          />
                        </div>
                        {milestones.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMilestone(idx)}
                            className="text-slate-400 hover:text-rose-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: REVIEW & DIGITAL CONTRACT */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-teal-200 dark:border-teal-500/30 bg-teal-50 dark:bg-teal-950/40 p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-800 dark:text-teal-300">Ringkasan Pekerjaan:</span>
                  <span className="rounded-md bg-teal-200/60 dark:bg-teal-500/20 px-2 py-0.5 text-[10px] font-bold text-teal-900 dark:text-teal-200">
                    {mode === "SPOT" ? "⚡ SPOT MODE" : "OFFER MODE"}
                  </span>
                </div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">{title || "Untitled Job"}</h4>
                <p className="text-xs text-slate-700 dark:text-zinc-300 line-clamp-3 leading-relaxed">{description}</p>
                <div className="flex items-center justify-between border-t border-teal-200 dark:border-teal-500/20 pt-2 text-xs">
                  <span className="text-slate-600 dark:text-zinc-400">Total Escrow Budget:</span>
                  <span className="font-mono text-sm font-black text-teal-800 dark:text-teal-300">
                    {formatUSD(mode === "SPOT" ? budgetUSD * spotLimit : budgetUSD)}
                  </span>
                </div>
              </div>

              {/* Auto Contract Preview */}
              <div className="rounded-xl border border-slate-200 dark:border-teal-500/20 bg-slate-50 dark:bg-black/60 p-3 text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-teal-800 dark:text-teal-300">
                  <FileText className="h-4 w-4" />
                  Klausul Otomatis Kontrak Escrow WFA
                </div>
                <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-600 dark:text-zinc-300">
                  <li>Dana terkunci aman di escrow saat offer pemenang disetujui / spot diklaim.</li>
                  <li>Auto-release timer 72 jam aktif saat serah terima hasil kerja.</li>
                  <li>Pembayaran dilindungi penuh oleh sistem rekening bersama WFA.</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Navigation */}
        <div className="flex items-center justify-between border-t border-slate-200 dark:border-teal-500/20 bg-slate-50 dark:bg-obsidian-950/90 p-4 gap-3">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as any)}
              className="flex items-center gap-1 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-100"
            >
              <ChevronLeft className="h-4 w-4" />
              Kembali
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowPostJobModal(false)}
              className="rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-zinc-300"
            >
              Batal
            </button>
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => {
                if (step === 2 && (!title.trim() || !description.trim())) {
                  alert("Mohon isi judul dan deskripsi pekerjaan terlebih dahulu.");
                  return;
                }
                setStep((s) => (s + 1) as any);
              }}
              className="flex items-center gap-1 rounded-xl btn-teal-primary px-5 py-2.5 text-xs font-bold shadow-teal-glow"
            >
              Lanjut
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="flex items-center gap-1.5 rounded-xl btn-teal-primary px-5 py-2.5 text-xs font-black shadow-teal-glow"
            >
              <ShieldCheck className="h-4 w-4" />
              Publish Job & Siapkan Escrow
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
