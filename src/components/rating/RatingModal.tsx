"use client";

import React, { useState } from "react";
import { useStore } from "@/context/StoreContext";
import { X, Star, Send } from "lucide-react";

export function RatingModal() {
  const { ratingModalJob, setRatingModalJob, submitRating, currentUser } = useStore();
  const [score, setScore] = useState<number>(5);
  const [comment, setComment] = useState("");

  if (!ratingModalJob) return null;

  const targetUserId =
    currentUser.activeRole === "BOSS"
      ? ratingModalJob.selectedWorkerId || "user-worker-2"
      : ratingModalJob.bossId;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitRating(ratingModalJob.id, targetUserId, score, comment);
    setRatingModalJob(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center p-0 sm:p-4">
      <div className="flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-teal-500/30 bg-white dark:bg-obsidian-950 text-slate-900 dark:text-white shadow-2xl animate-in fade-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-teal-500/20 bg-slate-50 dark:bg-teal-950/70 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-400/20 text-amber-600 dark:text-amber-300">
              <Star className="h-4 w-4 fill-amber-500" />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Beri Rating & Ulasan</h3>
              <p className="text-[10px] text-teal-700 dark:text-teal-300 font-medium">Reputasi Komunitas WFA</p>
            </div>
          </div>
          <button
            onClick={() => setRatingModalJob(null)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 dark:bg-teal-900/50 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 space-y-4 text-center">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">{ratingModalJob.title}</h4>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Bagaimana pengalaman kolaborasi pada project ini?</p>
          </div>

          {/* Star Rating */}
          <div className="flex items-center justify-center gap-2 py-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setScore(star)}
                className="p-1 transition-transform hover:scale-125 focus:outline-none"
              >
                <Star
                  className={`h-8 w-8 transition-colors ${
                    star <= score
                      ? "fill-amber-400 text-amber-400 drop-shadow-md"
                      : "text-slate-300 dark:text-zinc-700"
                  }`}
                />
              </button>
            ))}
          </div>

          <div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="Tulis ulasan pengalaman Anda (opsional)..."
              className="w-full rounded-2xl border border-slate-300 dark:border-teal-500/30 bg-slate-50 dark:bg-teal-950/60 p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-400 focus:outline-none leading-relaxed"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setRatingModalJob(null)}
              className="flex-1 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 py-2.5 text-xs font-semibold text-slate-700 dark:text-zinc-300"
            >
              Lewati
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl btn-teal-primary py-2.5 text-xs font-black shadow-teal-glow"
            >
              <Send className="h-3.5 w-3.5" />
              Kirim Ulasan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
