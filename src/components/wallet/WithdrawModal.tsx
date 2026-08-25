"use client";

import React, { useState } from "react";
import { useStore } from "@/context/StoreContext";
import { formatUSD, formatIDR, formatDual } from "@/lib/store";
import {
  X,
  ArrowUpRight,
  KeyRound,
  FileCheck,
} from "lucide-react";

export function WithdrawModal() {
  const { showWithdrawModal, setShowWithdrawModal, wallet, withdrawWallet, currentUser, submitKyc } = useStore();

  const [amountUSD, setAmountUSD] = useState<number>(Math.min(wallet.balanceUSD, 50) || 10);
  const [bankName, setBankName] = useState("Bank Central Asia (BCA)");
  const [accountNumber, setAccountNumber] = useState("8829102948");
  const [pin, setPin] = useState("");
  const [step, setStep] = useState<"FORM" | "KYC_GATE" | "2FA">("FORM");
  const [ktpInput, setKtpInput] = useState("3273019800010002");

  if (!showWithdrawModal) return null;

  const flatFeeUSD = 0.5; // ~$0.5 (Rp 8.500)
  const minThresholdUSD = 5; // $5 USD (~Rp 85.000)
  const isKycVerified = currentUser.kycStatus === "VERIFIED";

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amountUSD < minThresholdUSD) {
      alert(`Minimal penarikan dana adalah ${formatDual(minThresholdUSD)}.`);
      return;
    }

    if (amountUSD + flatFeeUSD > wallet.balanceUSD) {
      alert(`Saldo tidak mencukupi untuk penarikan + biaya flat ${formatDual(flatFeeUSD)}.`);
      return;
    }

    if (!isKycVerified) {
      setStep("KYC_GATE");
    } else {
      setStep("2FA");
    }
  };

  const handleKycPass = (e: React.FormEvent) => {
    e.preventDefault();
    submitKyc(ktpInput, "selfie_verified.jpg");
    setStep("2FA");
  };

  const handleFinalWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length < 4) {
      alert("Masukkan 4 digit PIN 2FA Anda (misal: 1234)");
      return;
    }

    const success = withdrawWallet(amountUSD, bankName, accountNumber);
    if (success) {
      setShowWithdrawModal(false);
      setStep("FORM");
      setPin("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center p-0 sm:p-4">
      <div className="flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-teal-500/30 bg-white dark:bg-obsidian-950 text-slate-900 dark:text-white shadow-2xl animate-in fade-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-teal-500/20 bg-slate-50 dark:bg-teal-950/70 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-100 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-300 dark:border-teal-400/40">
              <ArrowUpRight className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Tarik Saldo ke Rekening Bank</h3>
              <p className="text-[10px] text-teal-700 dark:text-teal-300 font-medium">Pencairan Rupiah ($1 = Rp. 17.000)</p>
            </div>
          </div>
          <button
            onClick={() => {
              setShowWithdrawModal(false);
              setStep("FORM");
            }}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 dark:bg-teal-900/50 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-5 space-y-4">
          {/* STEP 1: AMOUNT & BANK FORM */}
          {step === "FORM" && (
            <form onSubmit={handleInitialSubmit} className="space-y-4">
              {/* Saldo info */}
              <div className="flex items-center justify-between rounded-2xl bg-teal-50 dark:bg-teal-950/50 p-3 border border-teal-200 dark:border-teal-500/20 text-xs">
                <span className="text-slate-600 dark:text-zinc-300 font-medium">Saldo Tersedia:</span>
                <span className="font-mono font-bold text-teal-800 dark:text-teal-300">
                  {formatUSD(wallet.balanceUSD)}
                </span>
              </div>

              {/* Amount Input */}
              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-teal-200 block mb-1">
                  Nominal Penarikan ($ USD) - Min {formatUSD(minThresholdUSD)}:
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-teal-600 dark:text-teal-400">$</span>
                  <input
                    type="number"
                    value={amountUSD}
                    onChange={(e) => setAmountUSD(Number(e.target.value))}
                    min={minThresholdUSD}
                    max={wallet.balanceUSD}
                    step={1}
                    className="w-full rounded-xl border border-slate-300 dark:border-teal-500/30 bg-white dark:bg-teal-950/60 py-2.5 pl-8 pr-3 font-mono text-sm font-bold text-slate-900 dark:text-white focus:border-teal-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Bank Destination */}
              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-teal-200 block mb-1">
                  Bank Tujuan Payout:
                </label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-teal-500/30 bg-white dark:bg-teal-950/60 p-2.5 text-xs text-slate-900 dark:text-white focus:border-teal-500 focus:outline-none"
                >
                  <option value="Bank Central Asia (BCA)">Bank Central Asia (BCA)</option>
                  <option value="Bank Mandiri">Bank Mandiri</option>
                  <option value="Bank Rakyat Indonesia (BRI)">Bank Rakyat Indonesia (BRI)</option>
                  <option value="Bank Negara Indonesia (BNI)">Bank Negara Indonesia (BNI)</option>
                  <option value="Bank Jago / Seabank">Bank Jago / Seabank</option>
                </select>
              </div>

              {/* Account Number */}
              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-teal-200 block mb-1">
                  Nomor Rekening & A.N:
                </label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="Nomor rekening bank..."
                  className="w-full rounded-xl border border-slate-300 dark:border-teal-500/30 bg-white dark:bg-teal-950/60 p-2.5 text-xs text-slate-900 dark:text-white focus:border-teal-500 focus:outline-none font-mono"
                  required
                />
                <p className="mt-1 text-[11px] text-slate-500 dark:text-zinc-400">
                  Nama Penerima: <span className="font-bold text-slate-900 dark:text-white">{currentUser.name}</span>
                </p>
              </div>

              {/* Fee Breakdown */}
              <div className="rounded-2xl border border-slate-200 dark:border-teal-500/25 bg-slate-50 dark:bg-black/40 p-3.5 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-700 dark:text-zinc-300">
                  <span>Nominal Tarik:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{formatUSD(amountUSD)}</span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-zinc-400 text-[11px]">
                  <span>Biaya Transfer Bank Flat:</span>
                  <span className="font-mono text-slate-700 dark:text-zinc-300">{formatUSD(flatFeeUSD)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 dark:border-teal-500/20 pt-2 font-bold text-teal-800 dark:text-teal-300">
                  <span>Total Saldo Terpotong:</span>
                  <span className="font-mono text-sm font-black">{formatUSD(amountUSD + flatFeeUSD)}</span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl btn-teal-primary py-3 text-xs font-black shadow-teal-glow"
              >
                Lanjutkan Penarikan
              </button>
            </form>
          )}

          {/* STEP 2: KYC GATE */}
          {step === "KYC_GATE" && (
            <form onSubmit={handleKycPass} className="space-y-4">
              <div className="rounded-2xl border border-amber-300 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-950/30 p-4 space-y-2">
                <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-bold text-xs">
                  <FileCheck className="h-4 w-4" />
                  Verifikasi Identitas (KYC Ringan)
                </div>
                <p className="text-[11px] text-slate-700 dark:text-zinc-300 leading-relaxed">
                  Verifikasi identitas (KTP) diperlukan khusus pada penarikan dana pertama kali untuk memastikan keamanan saldo Anda.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-teal-200 block mb-1">
                  Nomor Induk Kependudukan (NIK/KTP):
                </label>
                <input
                  type="text"
                  value={ktpInput}
                  onChange={(e) => setKtpInput(e.target.value)}
                  maxLength={16}
                  className="w-full rounded-xl border border-slate-300 dark:border-teal-500/30 bg-white dark:bg-teal-950/60 p-2.5 text-xs text-slate-900 dark:text-white font-mono"
                  required
                />
              </div>

              <div className="rounded-xl border border-dashed border-teal-300 dark:border-teal-500/30 p-3 text-center text-xs text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/20">
                <span>✓ Foto KTP & Selfie Terlampir Otomatis (Demo)</span>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl btn-teal-primary py-3 text-xs font-black shadow-teal-glow"
              >
                Verifikasi & Lanjutkan ke 2FA
              </button>
            </form>
          )}

          {/* STEP 3: 2FA SECURITY PIN */}
          {step === "2FA" && (
            <form onSubmit={handleFinalWithdraw} className="space-y-4 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-300 dark:border-teal-400/40">
                <KeyRound className="h-6 w-6" />
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Masukkan 2FA Security PIN</h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                  Konfirmasi penarikan <span className="font-bold text-teal-700 dark:text-teal-300">{formatUSD(amountUSD)}</span> ke {bankName}
                </p>
              </div>

              <div className="flex justify-center">
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  maxLength={6}
                  placeholder="PIN 6 Digit"
                  autoFocus
                  className="w-48 text-center tracking-[0.5em] rounded-xl border border-teal-500 bg-slate-50 dark:bg-teal-950/80 py-2.5 font-mono text-base font-black text-slate-900 dark:text-white focus:outline-none"
                  required
                />
              </div>
              <p className="text-[10px] text-slate-400 dark:text-zinc-500">Ketik sembarang 4-6 angka (misal: 123456)</p>

              <button
                type="submit"
                className="w-full rounded-xl btn-teal-primary py-3 text-xs font-black shadow-teal-glow"
              >
                Konfirmasi Penarikan Dana
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
