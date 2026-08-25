"use client";

import React, { useEffect, useState } from "react";

interface AppLoaderProps {
  isLoading?: boolean;
  text?: string;
  subtext?: string;
}

export function AppLoader({
  isLoading = true,
  text = "WFA JOB",
  subtext = "Memuat Ekosistem Escrow & Job Marketplace...",
}: AppLoaderProps) {
  const [mounted, setMounted] = useState(true);
  const [fadeExit, setFadeExit] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setFadeExit(true);
      const timer = setTimeout(() => {
        setMounted(false);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setMounted(true);
      setFadeExit(false);
    }
  }, [isLoading]);

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background/95 backdrop-blur-xl transition-opacity duration-500 ${
        fadeExit ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute h-72 w-72 rounded-full bg-teal-500/15 dark:bg-teal-400/20 blur-[100px] animate-pulse-ring"></div>
      
      {/* Central Logo Container with Multi-Layered Halo */}
      <div className="relative flex items-center justify-center mb-6">
        {/* Outer Rotating Glowing Halo Ring */}
        <div className="absolute h-36 w-36 rounded-full border border-dashed border-teal-500/40 dark:border-teal-400/50 animate-halo-spin"></div>
        
        {/* Inner Pulsing Aura Ring */}
        <div className="absolute h-30 w-30 rounded-full bg-teal-500/10 dark:bg-teal-400/15 border border-teal-400/30 animate-pulse-ring"></div>

        {/* Logo Image */}
        <div className="relative z-10 flex h-24 w-24 items-center justify-center animate-logo-breathe select-none">
          <img
            src="/logo-vertikal.webp"
            alt="WFA JOB Logo"
            className="h-20 w-auto object-contain drop-shadow-[0_8px_24px_rgba(13,148,136,0.45)]"
          />
        </div>
      </div>

      {/* Progress & Brand Caption */}
      <div className="relative z-10 flex flex-col items-center text-center space-y-2 px-6 max-w-xs">
        <h2 className="text-base font-black tracking-widest text-slate-900 dark:text-white uppercase">
          {text}
        </h2>
        
        {/* Slim Shimmer Progress Bar */}
        <div className="h-1 w-36 overflow-hidden rounded-full bg-slate-200 dark:bg-teal-950/80">
          <div className="h-full w-full bg-gradient-to-r from-teal-500 via-teal-300 to-emerald-400 rounded-full animate-pulse"></div>
        </div>

        <p className="text-[11px] font-medium text-slate-500 dark:text-teal-200/80 animate-pulse">
          {subtext}
        </p>
      </div>
    </div>
  );
}
