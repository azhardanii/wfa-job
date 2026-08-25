"use client";

import React, { useState } from "react";
import { useStore } from "@/context/StoreContext";
import { formatUSD, formatIDR, formatDual } from "@/lib/store";
import {
  X,
  QrCode,
  Building2,
  Smartphone,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

export function TopUpModal() {
  const { showTopUpModal, setShowTopUpModal, topUpWallet } = useStore();

  const [amountUSD, setAmountUSD] = useState<number>(50);
  const [method, setMethod] = useState<"QRIS" | "VA_BCA" | "VA_MANDIRI" | "GOPAY">("QRIS");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showQR, setShowQR] = useState(false);

  if (!showTopUpModal) return null;

  const presets = [10, 25, 50, 100, 250, 500];

  const handleConfirmPay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      topUpWallet(amountUSD, method === "QRIS" ? "QRIS Instant" : method === "VA_BCA" ? "BCA Virtual Account" : "GoPay E-Wallet");
      setIsProcessing(false);
      setShowTopUpModal(false);
      setShowQR(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center p-0 sm:p-4">
      <div className="flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-teal-500/30 bg-white dark:bg-obsidian-950 text-slate-900 dark:text-white shadow-2xl animate-in fade-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-teal-500/20 bg-slate-50 dark:bg-teal-950/70 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-100 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-300 dark:border-teal-400/40">
              <QrCode className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Top-Up Saldo ($)</h3>
              <p className="text-[10px] text-teal-700 dark:text-teal-300 font-medium">Kurs Tetap: $1 = Rp. 17.000</p>
            </div>
          </div>
          <button
            onClick={() => {
              setShowTopUpModal(false);
              setShowQR(false);
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 dark:bg-teal-900/50 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-5 space-y-4">
          {!showQR ? (
            <>
              {/* Preset Amounts */}
              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-teal-200 block mb-2">
                  Pilih Nominal Top-Up ($ USD):
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {presets.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAmountUSD(preset)}
                      className={`rounded-2xl py-2.5 text-xs font-bold transition-all ${
                        amountUSD === preset
                          ? "bg-teal-600 dark:bg-teal-400 text-white dark:text-obsidian-950 font-black shadow-sm"
                          : "border border-slate-200 dark:border-teal-500/20 bg-slate-50 dark:bg-teal-950/40 text-slate-700 dark:text-zinc-300 hover:bg-slate-100"
                      }`}
                    >
                      <span className="block font-mono text-sm">{formatUSD(preset)}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Amount */}
              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-teal-200 block mb-1">
                  Atau Masukkan Nominal Kustom ($):
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-teal-600 dark:text-teal-400">$</span>
                  <input
                    type="number"
                    value={amountUSD}
                    onChange={(e) => setAmountUSD(Number(e.target.value))}
                    min={1}
                    step={1}
                    className="w-full rounded-xl border border-slate-300 dark:border-teal-500/30 bg-white dark:bg-teal-950/60 py-2.5 pl-8 pr-3 font-mono text-sm font-bold text-slate-900 dark:text-white focus:border-teal-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-teal-200 block mb-2">
                  Metode Pembayaran:
                </label>
                <div className="space-y-2">
                  {/* QRIS */}
                  <div
                    onClick={() => setMethod("QRIS")}
                    className={`flex items-center justify-between cursor-pointer rounded-2xl border p-3 transition-all ${
                      method === "QRIS"
                        ? "border-teal-500 bg-teal-50 dark:bg-teal-900/40 shadow-sm"
                        : "border-slate-200 dark:border-teal-500/20 bg-white dark:bg-teal-950/20 hover:border-teal-400"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-100 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300">
                        <QrCode className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">QRIS (Semua E-Wallet & M-Banking)</h4>
                        <p className="text-[10px] text-teal-700 dark:text-teal-300">Instan settlement bebas admin</p>
                      </div>
                    </div>
                    {method === "QRIS" && <CheckCircle2 className="h-4 w-4 text-teal-600 dark:text-teal-400" />}
                  </div>

                  {/* BCA VA */}
                  <div
                    onClick={() => setMethod("VA_BCA")}
                    className={`flex items-center justify-between cursor-pointer rounded-2xl border p-3 transition-all ${
                      method === "VA_BCA"
                        ? "border-teal-500 bg-teal-50 dark:bg-teal-900/40 shadow-sm"
                        : "border-slate-200 dark:border-teal-500/20 bg-white dark:bg-teal-950/20 hover:border-teal-400"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-500/20 text-sky-700 dark:text-sky-300">
                        <Building2 className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">BCA Virtual Account</h4>
                        <p className="text-[10px] text-slate-500 dark:text-zinc-400">Verifikasi otomatis 24 jam</p>
                      </div>
                    </div>
                    {method === "VA_BCA" && <CheckCircle2 className="h-4 w-4 text-teal-600 dark:text-teal-400" />}
                  </div>

                  {/* GOPAY */}
                  <div
                    onClick={() => setMethod("GOPAY")}
                    className={`flex items-center justify-between cursor-pointer rounded-2xl border p-3 transition-all ${
                      method === "GOPAY"
                        ? "border-teal-500 bg-teal-50 dark:bg-teal-900/40 shadow-sm"
                        : "border-slate-200 dark:border-teal-500/20 bg-white dark:bg-teal-950/20 hover:border-teal-400"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                        <Smartphone className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">GoPay / ShopeePay</h4>
                        <p className="text-[10px] text-slate-500 dark:text-zinc-400">Direct app redirection</p>
                      </div>
                    </div>
                    {method === "GOPAY" && <CheckCircle2 className="h-4 w-4 text-teal-600 dark:text-teal-400" />}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowQR(true)}
                className="w-full flex items-center justify-center gap-2 rounded-xl btn-teal-primary py-3 text-xs font-black shadow-teal-glow"
              >
                Lanjut ke Pembayaran ({formatUSD(amountUSD)})
                <ArrowRight className="h-4 w-4" />
              </button>
            </>
          ) : (
            /* QR & Payment Confirmation Screen */
            <div className="space-y-4 text-center">
              <div className="rounded-2xl border border-slate-200 dark:border-teal-500/30 bg-slate-50 dark:bg-teal-950/40 p-4">
                <span className="text-xs text-teal-700 dark:text-teal-300 font-bold">Scan QRIS untuk Menyelesaikan</span>
                <h4 className="font-mono text-2xl font-black text-slate-900 dark:text-white mt-1">
                  {formatUSD(amountUSD)}
                </h4>

                {/* Simulated QR Code */}
                <div className="my-4 mx-auto flex h-44 w-44 items-center justify-center rounded-2xl bg-white p-3 shadow-md border border-slate-200">
                  <div className="flex h-full w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-teal-900 bg-teal-50 p-2">
                    <QrCode className="h-24 w-24 text-teal-950" />
                    <span className="font-mono text-[9px] font-black text-teal-950 mt-1">
                      NMID: ID20268819283
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Buka GoPay, OVO, BCA Mobile, atau Livin Mandiri lalu scan kode QR di atas.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowQR(false)}
                  className="flex-1 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 py-2.5 text-xs font-semibold text-slate-700 dark:text-zinc-300"
                >
                  Ubah Nominal
                </button>
                <button
                  onClick={handleConfirmPay}
                  disabled={isProcessing}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl btn-teal-primary py-2.5 text-xs font-black shadow-teal-glow"
                >
                  {isProcessing ? "Memverifikasi..." : "Simulasi Bayar Sekarang"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
