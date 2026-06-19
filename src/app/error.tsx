"use client";

import React, { useEffect } from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Next.js Route Error occurred:", error);
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 px-4 text-white text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(201,42,42,0.08),rgba(255,255,255,0))]" />
      
      <div className="w-full max-w-md z-10 bg-slate-900/60 backdrop-blur-xl border border-slate-900 p-8 rounded-3xl space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-danger/10 border border-danger/30 text-red-500 animate-bounce">
          <AlertCircle className="w-8 h-8" />
        </div>
        
        <div className="space-y-2">
          <h1 className="font-outfit font-black text-xl uppercase tracking-wide">
            Module Error Encountered
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed px-4">
            An issue prevented this route folder from loading. Refresh the frame below to try again.
          </p>
        </div>

        <Button
          onClick={() => reset()}
          variant="primary"
          className="w-full py-3 h-11 uppercase font-bold text-xs tracking-wider flex items-center justify-center gap-1.5 shadow-tactile"
        >
          <RefreshCcw className="w-4 h-4" /> Re-sync Arena Lobbies
        </Button>
      </div>
    </main>
  );
}
