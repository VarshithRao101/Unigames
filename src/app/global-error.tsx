"use client";

import React from "react";
import { AlertOctagon, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 font-sans selection:bg-brand-amber selection:text-slate-950">
        <div className="bg-slate-900/60 border border-slate-900 p-8 rounded-3xl max-w-sm w-full text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-danger/10 border border-danger/30 text-red-500 animate-pulse">
            <AlertOctagon className="w-8 h-8" />
          </div>
          
          <div className="space-y-1.5">
            <h1 className="font-outfit font-black text-xl uppercase tracking-wide">Critical Failure</h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              A global runtime failure occurred. Click below to reload the entire application.
            </p>
          </div>

          <Button
            onClick={() => reset()}
            variant="primary"
            className="w-full py-2.5 h-11 uppercase font-bold text-xs tracking-wider flex items-center justify-center gap-1.5 shadow-tactile"
          >
            <RotateCw className="w-4 h-4" /> Restart Session
          </Button>
        </div>
      </body>
    </html>
  );
}
