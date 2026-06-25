"use client";

import { useEffect, useState, useRef } from "react";
import {
  GUYBRUSH_WIDTH,
  GUYBRUSH_HEIGHT,
  GUYBRUSH_COLORS,
  GUYBRUSH_FRAMES,
} from "./guybrush-frames";

interface LoaderProps {
  label?: string; // Kept for interface compatibility, but we use "Loading" for the 7-char custom CSS animation
  className?: string;
}

export function Loader({ label = "Loading", className = "" }: LoaderProps) {
  const [progress, setProgress] = useState(0);
  const [frameIdx, setFrameIdx] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Loading progress interval
  useEffect(() => {
    const startTime = Date.now();
    const duration = 1800; // ~1.8 seconds to reach 98%

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

  // Guybrush sprite animation frame cycle
  useEffect(() => {
    const timer = setInterval(() => {
      setFrameIdx((prev) => (prev + 1) % GUYBRUSH_FRAMES.length);
    }, 100); // 100ms per frame
    return () => clearInterval(timer);
  }, []);

  // Render Guybrush to Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const frameStr = GUYBRUSH_FRAMES[frameIdx];
    ctx.clearRect(0, 0, GUYBRUSH_WIDTH, GUYBRUSH_HEIGHT);

    for (let y = 0; y < GUYBRUSH_HEIGHT; y++) {
      for (let x = 0; x < GUYBRUSH_WIDTH; x++) {
        const char = frameStr[y * GUYBRUSH_WIDTH + x];
        if (char !== "0") {
          const color = GUYBRUSH_COLORS[char];
          if (color) {
            ctx.fillStyle = color;
            ctx.fillRect(x, y, 1, 1);
          }
        }
      }
    }
  }, [frameIdx]);
  return (
    <div className={`w-72 max-w-full flex flex-col items-center pt-28 text-slate-950 dark:text-slate-50 ${className}`}>
      {/* Dynamic wrapper containing Guybrush and the Progress Track */}
      <div className="w-full relative flex flex-col items-center">
        {/* Animated Guybrush riding on top of the bar */}
        <div
          className="absolute -top-[92px] transition-all duration-75 ease-out pointer-events-none"
          style={{
            left: `calc(${progress}% - 36px)`, // Centered over the growing bar edge
            width: `${GUYBRUSH_WIDTH * 2}px`,
            height: `${GUYBRUSH_HEIGHT * 2}px`,
          }}
        >
          <canvas
            ref={canvasRef}
            width={GUYBRUSH_WIDTH}
            height={GUYBRUSH_HEIGHT}
            style={{
              width: "100%",
              height: "100%",
              imageRendering: "pixelated",
              display: "block",
            }}
          />
        </div>

        {/* Progress Track */}
        <div className="w-full h-6 bg-slate-950 border-[3px] border-black rounded-xl p-0.75 shadow-[3px_3px_0px_#000] relative overflow-hidden flex items-center">
          {/* Animated Bar */}
          <div
            className="h-full bg-brand-orange border border-black rounded-lg transition-all duration-75 ease-out shadow-[inset_-4px_0px_0px_rgba(0,0,0,0.15)]"
            style={{ width: `${progress}%` }}
          />

          {/* Diagonal strips effect */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[repeating-linear-gradient(45deg,transparent,transparent_8px,#000_8px,#000_16px)]" />
        </div>
      </div>

      {/* Label and Percentage bottom row */}
      <div className="w-full flex justify-between items-center px-1 mt-4">
        {/* Custom text loader - wavy CSS bounce for any string length */}
        <div className="font-space text-[10px] font-black uppercase tracking-[0.2em] flex gap-0.5 text-slate-50 dark:text-slate-50">
          {label.split("").map((char, index) => (
            <span
              key={index}
              className="inline-block animate-[bounce_1.4s_infinite_ease-in-out]"
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              {char === " " ? "\u00A0" : char}
            </span>
          ))}
        </div>
        <span className="font-mono font-bold text-brand-orange text-[14px]">{progress}%</span>
      </div>
    </div>
  );
}
