"use client";

import React, { useState } from "react";
import { useStore } from "@/context/StoreContext";
import { X, Send, User, MessageSquare, ShieldCheck } from "lucide-react";

export function JobChatModal() {
  const { chatModalJob, setChatModalJob, chatMessages, sendChatMessage, currentUser } = useStore();
  const [text, setText] = useState("");

  if (!chatModalJob) return null;

  const messages = chatMessages[chatModalJob.id] || [];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendChatMessage(chatModalJob.id, text);
    setText("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center p-0 sm:p-4">
      <div className="flex h-[88vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-teal-500/30 bg-white dark:bg-obsidian-950 text-slate-900 dark:text-white shadow-2xl animate-in fade-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-teal-500/20 bg-slate-50 dark:bg-teal-950/80 px-4 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-800 text-teal-700 dark:text-teal-200 border border-teal-300 dark:border-teal-400/40">
                <MessageSquare className="h-4 w-4" />
              </div>
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-black"></span>
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                {chatModalJob.title}
              </h3>
              <p className="text-[10px] text-teal-700 dark:text-teal-300 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" />
                Kanal Obrolan Resmi Job
              </p>
            </div>
          </div>

          <button
            onClick={() => setChatModalJob(null)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 dark:bg-teal-900/50 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50 dark:bg-transparent">
          {messages.length > 0 ? (
            messages.map((msg) => {
              const isMe = msg.senderId === currentUser.id;
              const dateFormatted = new Date(msg.createdAt).toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                >
                  <span className="text-[9px] text-slate-400 dark:text-zinc-400 mb-0.5 px-1">
                    {msg.senderName} • {msg.senderRole}
                  </span>
                  <div
                    className={`max-w-[82%] rounded-2xl p-3 text-xs leading-relaxed shadow-sm ${
                      isMe
                        ? "bg-teal-600 text-white rounded-br-none"
                        : "bg-white dark:bg-teal-950/80 text-slate-800 dark:text-zinc-100 border border-slate-200 dark:border-teal-500/20 rounded-bl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[8px] text-slate-400 dark:text-zinc-500 mt-0.5 px-1">
                    {dateFormatted}
                  </span>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-xs text-slate-400 dark:text-zinc-400 p-6">
              <MessageSquare className="h-8 w-8 text-teal-500 mb-2 opacity-60" />
              <p className="font-bold text-slate-700 dark:text-zinc-300">Belum ada percakapan</p>
              <p className="text-[11px] mt-0.5">Diskusikan kebutuhan pekerjaan dan revisi di sini.</p>
            </div>
          )}
        </div>

        {/* Chat Input */}
        <form onSubmit={handleSend} className="border-t border-slate-200 dark:border-teal-500/20 bg-white dark:bg-teal-950/90 p-3 flex items-center gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ketik pesan..."
            className="flex-1 rounded-xl border border-slate-300 dark:border-teal-500/30 bg-slate-50 dark:bg-black/60 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-400 focus:border-teal-500 focus:outline-none"
          />
          <button
            type="submit"
            className="flex h-9 w-9 items-center justify-center rounded-xl btn-teal-primary text-white shadow-sm shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
