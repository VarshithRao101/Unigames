"use client";

import React from "react";
import { WifiOff, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OfflinePage() {
  const handleReload = () => {
    window.location.href = "/";
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(255,193,7,0.06),rgba(255,255,255,0))]" />
      
      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-900 p-8 rounded-3xl space-y-6 z-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-950 border border-slate-800 text-slate-500 animate-pulse">
          <WifiOff className="w-8 h-8 text-brand-amber" />
        </div>

        <div className="space-y-2">
          <h1 className="font-outfit font-black text-xl uppercase tracking-wide">Connection Lost</h1>
          <p className="text-xs text-slate-400 leading-relaxed px-4">
            You are currently disconnected. Verify your network connections and tap retry to enter the lounge.
          </p>
        </div>

        <Button
          onClick={handleReload}
          variant="primary"
          className="w-full py-3 h-11 uppercase font-bold text-xs tracking-wider flex items-center justify-center gap-1.5 shadow-tactile transition-all"
        >
          <RotateCcw className="w-4 h-4" /> Reconnect Now
        </Button>
      </div>
    </main>
  );
}
