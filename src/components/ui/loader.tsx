"use client";

import { useEffect, useState } from "react";

interface LoaderProps {
  label?: string;
  className?: string;
}

export function Loader({ label = "Loading", className = "" }: LoaderProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    // We target around 1.5 - 2 seconds to reach 98%
    const duration = 1800;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progressPercent = Math.min(98, Math.floor((elapsed / duration) * 98));

      setProgress((prev) => {
        if (prev >= 98) {
          clearInterval(interval);
          return 98;
        }
        return Math.max(prev, progressPercent);
      });
    }, 40);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`w-72 max-w-full flex flex-col items-center gap-3 text-center ${className}`}>
      {/* Label and Percentage */}
      <div className="w-full flex justify-between items-center px-1 font-space text-[10px] font-black uppercase tracking-[0.2em] text-slate-50">
        <span className="animate-pulse">{label}</span>
        <span className="font-mono text-brand-orange">{progress}%</span>
      </div>

      {/* Progress Track */}
      <div className="w-full h-6 bg-slate-950 border-[3px] border-black rounded-xl p-0.75 shadow-[3px_3px_0px_#000] relative overflow-hidden flex items-center">
        {/* Animated Bar */}
        <div 
          className="h-full bg-brand-orange border border-black rounded-lg transition-all duration-75 ease-out shadow-[inset_-4px_0px_0px_rgba(0,0,0,0.15)]"
          style={{ width: `${progress}%` }}
        />
        
        {/* Neobrutalist diagonal strips effect (optional but premium) */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,#000_8px,#000_16px)]" />
      </div>
    </div>
  );
}
